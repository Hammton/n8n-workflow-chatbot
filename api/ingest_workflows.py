import os
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_openai import AzureOpenAIEmbeddings
import asyncio
import csv # Added import

# Load environment variables from .env file
load_dotenv(dotenv_path='C:\\Users\\HomePC\\n8n workflow chat\\api\\.env') # Ensure .env is loaded from api directory

# --- Configuration from Environment Variables ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
AZURE_OPENAI_EMBEDDING_API_KEY = os.environ.get("AZURE_OPENAI_EMBEDDING_API_KEY")
AZURE_OPENAI_EMBEDDING_ENDPOINT = os.environ.get("AZURE_OPENAI_EMBEDDING_ENDPOINT")

if not all([SUPABASE_URL, SUPABASE_KEY, AZURE_OPENAI_EMBEDDING_API_KEY, AZURE_OPENAI_EMBEDDING_ENDPOINT]):
    print("Error: Missing one or more required environment variables.")
    print("Please ensure SUPABASE_URL, SUPABASE_KEY, AZURE_OPENAI_EMBEDDING_API_KEY, and AZURE_OPENAI_EMBEDDING_ENDPOINT are set in your .env file.")
    exit(1)

# --- Initialize Supabase Client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Initialize Azure OpenAI Embeddings ---
embeddings_model = AzureOpenAIEmbeddings(
    azure_deployment="text-embedding-3-large",
    openai_api_version="2024-02-01",
    azure_endpoint=AZURE_OPENAI_EMBEDDING_ENDPOINT,
    api_key=AZURE_OPENAI_EMBEDDING_API_KEY
)

# --- Load n8n Workflow Data from CSV ---
n8n_workflow_data = []
csv_file_path = "C:\\Users\\HomePC\\n8n workflow chat\\_n8n Templates 3000 - Templates.csv"
try:
    with open(csv_file_path, mode='r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            n8n_workflow_data.append({
                "name": row["name"],
                "description": row["description"],
                "link": row["url"] # Map 'url' from CSV to 'link' in database
            })
    print(f"Successfully loaded {len(n8n_workflow_data)} workflows from CSV.")
except FileNotFoundError:
    print(f"Error: CSV file not found at {csv_file_path}")
    exit(1)
except Exception as e:
    print(f"Error reading CSV file: {e}")
    exit(1)

async def ingest_data():
    print("Starting data ingestion...")
    for i, workflow in enumerate(n8n_workflow_data):
        try:
            print(f"Processing workflow {i+1}/{len(n8n_workflow_data)}")
            
            # Generate embedding for the description
            embedding = embeddings_model.embed_query(workflow["description"])
            
            # Prepare data for insertion
            data_to_insert = {
                "name": workflow["name"],
                "description": workflow["description"],
                "link": workflow["link"],
                "embedding": embedding
            }
            
            # Insert into Supabase
            response = supabase.table("n8n_workflows").insert(data_to_insert).execute()
            
            if response.data:
                print(f"Successfully inserted '{workflow['name']}'.")
            else:
                print(f"Failed to insert '{workflow['name']}'. Response: {response.data}")
                if response.error:
                    print(f"Error details: {response.error}")

        except Exception as e:
            print(f"An error occurred while processing '{workflow['name']}': {e}")
    print("Data ingestion complete.")

if __name__ == "__main__":
    asyncio.run(ingest_data())
