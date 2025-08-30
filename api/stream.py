import os
import json
import asyncio
from http.server import BaseHTTPRequestHandler
from supabase import create_client, Client
from langchain_openai import AzureOpenAIEmbeddings
from langchain_openai import AzureChatOpenAI

# --- Supabase and Azure OpenAI Configuration ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
AZURE_OPENAI_CHAT_API_KEY = os.environ.get("AZURE_OPENAI_CHAT_API_KEY")
AZURE_OPENAI_CHAT_ENDPOINT = os.environ.get("AZURE_OPENAI_CHAT_ENDPOINT")
AZURE_OPENAI_EMBEDDING_API_KEY = os.environ.get("AZURE_OPENAI_EMBEDDING_API_KEY")
AZURE_OPENAI_EMBEDDING_ENDPOINT = os.environ.get("AZURE_OPENAI_EMBEDDING_ENDPOINT")

# --- Supabase Client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def get_workflow_recommendations_stream(query: str):
    """Stream workflow recommendations using direct Supabase calls and Azure OpenAI."""
    try:
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
        
        # Create prompt for the LLM
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
                await asyncio.sleep(0.01)
        
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        
    except Exception as e:
        print(f"Error in streaming: {str(e)}")
        yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            # Set streaming headers
            self.send_response(200)
            self.send_header('Content-type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
            else:
                request_data = {}
            
            query = request_data.get('query', '')
            print(f"Received streaming query: {query}")
            
            if not query:
                error_data = f"data: {json.dumps({'type': 'error', 'data': 'Query parameter is required'})}\n\n"
                self.wfile.write(error_data.encode('utf-8'))
                return
            
            # Stream response
            async def stream_response():
                async for chunk in get_workflow_recommendations_stream(query):
                    self.wfile.write(chunk.encode('utf-8'))
                    self.wfile.flush()
            
            # Run async function
            asyncio.run(stream_response())
            
        except Exception as e:
            print(f"Error in streaming: {str(e)}")
            import traceback
            traceback.print_exc()
            
            error_data = f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"
            self.wfile.write(error_data.encode('utf-8'))