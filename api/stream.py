import os
import json
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from supabase import create_client, Client
from langchain_openai import AzureOpenAIEmbeddings
from langchain_openai import AzureChatOpenAI
from dotenv import load_dotenv

load_dotenv()

# --- Supabase and Azure OpenAI Configuration ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
AZURE_OPENAI_CHAT_API_KEY = os.environ.get("AZURE_OPENAI_CHAT_API_KEY")
AZURE_OPENAI_CHAT_ENDPOINT = os.environ.get("AZURE_OPENAI_CHAT_ENDPOINT")
AZURE_OPENAI_EMBEDDING_API_KEY = os.environ.get("AZURE_OPENAI_EMBEDDING_API_KEY")
AZURE_OPENAI_EMBEDDING_ENDPOINT = os.environ.get("AZURE_OPENAI_EMBEDDING_ENDPOINT")

# --- Supabase Client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

async def get_workflow_recommendations_stream(query: str):
    """Stream workflow recommendations using direct Supabase calls and Azure OpenAI."""
    # Initialize embeddings
    embeddings = AzureOpenAIEmbeddings(
        azure_deployment="text-embedding-3-large",
        openai_api_version="2024-02-01",
        azure_endpoint=AZURE_OPENAI_EMBEDDING_ENDPOINT,
        api_key=AZURE_OPENAI_EMBEDDING_API_KEY
    )
    
    # Generate embedding for the query
    query_embedding = embeddings.embed_query(query)
    
    # Search for similar workflows using direct RPC call
    search_results = supabase.rpc('match_workflows', {
        'query_embedding': query_embedding,
        'match_threshold': 0.1,
        'match_count': 5
    }).execute()
    
    # Send source documents first
    source_documents = [
        {
            "name": result['name'],
            "description": result['description'],
            "link": result['link']
        }
        for result in search_results.data
    ]
    
    yield f"data: {json.dumps({'type': 'source_documents', 'data': source_documents})}\n\n"
    
    # Format the context for the LLM
    context_docs = []
    for result in search_results.data:
        context_docs.append(f"Workflow: {result['name']}\nDescription: {result['description']}")
    
    context = "\n\n".join(context_docs)
    
    # Initialize LLM for streaming
    llm = AzureChatOpenAI(
        deployment_name="gpt-4-32k",
        openai_api_version="2024-02-01",
        azure_endpoint=AZURE_OPENAI_CHAT_ENDPOINT,
        api_key=AZURE_OPENAI_CHAT_API_KEY,
        temperature=0.7,
        streaming=True
    )
    
    # Create prompt for the LLM (without links since they're in source_documents)
    prompt = f"""Based on the user's query: "{query}"

Here are the most relevant n8n workflows I found:

{context}

Please provide a helpful response that:
1. Directly answers the user's question
2. For each recommended workflow, include:
   - The workflow name in bold (use **name**)
   - A "Why:" explanation of why this workflow is suitable for their needs
3. Use numbered list format like:
   1. **Workflow Name**
      - **Why:** Explanation of why this workflow fits their needs
4. Keep explanations concise but informative
5. Do NOT include any links or URLs in your response

Response:"""
    
    # Stream LLM response
    async for chunk in llm.astream(prompt):
        if chunk.content:
            yield f"data: {json.dumps({'type': 'content', 'data': chunk.content})}\n\n"
            await asyncio.sleep(0.01)  # Small delay for smooth streaming
    
    yield f"data: {json.dumps({'type': 'done'})}\n\n"

@app.post("/")
async def query_workflows_stream(request: QueryRequest):
    """Stream workflow recommendations."""
    try:
        print(f"Received streaming query: {request.query}")
        return StreamingResponse(
            get_workflow_recommendations_stream(request.query),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    except Exception as e:
        print(f"Error in query_workflows_stream: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))