import os
import json
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

def handler(request):
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': ''
        }
    
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Parse request body
        if hasattr(request, 'body'):
            body = request.body
        else:
            body = request.get('body', '')
        
        if isinstance(body, bytes):
            body = body.decode('utf-8')
        
        request_data = json.loads(body)
        query = request_data.get('query', '')
        
        print(f"Received query: {query}")
        
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
        
        # Get LLM response
        llm_response = llm.invoke(prompt)
        
        # Format response
        response_data = {
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
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({'error': str(e)})
        }