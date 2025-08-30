import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import json
import asyncio
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

# --- Langchain and Recommendation Logic ---
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

# --- FastAPI Application ---
app = FastAPI(
    title="n8n Workflow Assistant API",
    description="API for recommending n8n workflows.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class QueryRequest(BaseModel):
    query: str

class StarRequest(BaseModel):
    session_id: str
    user_agent: str = None

# --- API Endpoints ---
@app.post("/query/stream")
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

@app.post("/query")
async def query_workflows_fallback(request: QueryRequest):
    """Fallback non-streaming endpoint."""
    try:
        print(f"Received fallback query: {request.query}")
        
        # Initialize embeddings
        embeddings = AzureOpenAIEmbeddings(
            azure_deployment="text-embedding-3-large",
            openai_api_version="2024-02-01",
            azure_endpoint=AZURE_OPENAI_EMBEDDING_ENDPOINT,
            api_key=AZURE_OPENAI_EMBEDDING_API_KEY
        )
        
        # Generate embedding for the query
        query_embedding = embeddings.embed_query(request.query)
        
        # Search for similar workflows using direct RPC call
        search_results = supabase.rpc('match_workflows', {
            'query_embedding': query_embedding,
            'match_threshold': 0.1,
            'match_count': 5
        }).execute()
        
        # Format the context for the LLM
        context_docs = []
        for result in search_results.data:
            context_docs.append(f"Workflow: {result['name']}\nDescription: {result['description']}")
        
        context = "\n\n".join(context_docs)
        
        # Initialize LLM
        llm = AzureChatOpenAI(
            deployment_name="gpt-4-32k",
            openai_api_version="2024-02-01",
            azure_endpoint=AZURE_OPENAI_CHAT_ENDPOINT,
            api_key=AZURE_OPENAI_CHAT_API_KEY,
            temperature=0.7,
        )
        
        # Create prompt for the LLM (without links)
        prompt = f"""Based on the user's query: "{request.query}"

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
        
        # Get LLM response
        llm_response = llm.invoke(prompt)
        
        # Format response to match expected structure
        return {
            "result": llm_response.content,
            "source_documents": [
                {
                    "name": result['name'],
                    "description": result['description'],
                    "link": result['link']
                }
                for result in search_results.data
            ]
        }
    except Exception as e:
        print(f"Error in query_workflows_fallback: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- Star Counter Endpoints ---
@app.get("/stars/count")
async def get_star_count():
    """Get current star count."""
    try:
        result = supabase.rpc('get_star_count').execute()
        return {"count": result.data}
    except Exception as e:
        print(f"Error getting star count: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stars/add")
async def add_star(request: Request, star_request: StarRequest):
    """Add a star to the counter."""
    try:
        # Get client IP
        client_ip = request.client.host
        if hasattr(request, 'headers'):
            # Check for forwarded IP (if behind proxy)
            forwarded_for = request.headers.get('x-forwarded-for')
            if forwarded_for:
                client_ip = forwarded_for.split(',')[0].strip()
        
        # Add star using database function
        result = supabase.rpc('add_star', {
            'user_ip': client_ip,
            'user_session': star_request.session_id,
            'user_agent_string': star_request.user_agent
        }).execute()
        
        return result.data
        
    except Exception as e:
        print(f"Error adding star: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stars/check/{session_id}")
async def check_user_starred(request: Request, session_id: str):
    """Check if user has already starred."""
    try:
        # Get client IP
        client_ip = request.client.host
        if hasattr(request, 'headers'):
            forwarded_for = request.headers.get('x-forwarded-for')
            if forwarded_for:
                client_ip = forwarded_for.split(',')[0].strip()
        
        # Check if user has starred
        result = supabase.rpc('has_user_starred', {
            'user_ip': client_ip,
            'user_session': session_id
        }).execute()
        
        return {"has_starred": result.data}
        
    except Exception as e:
        print(f"Error checking star status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test database connection
        result = supabase.rpc('get_star_count').execute()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        print(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
