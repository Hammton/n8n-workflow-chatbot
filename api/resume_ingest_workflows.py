import os
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_openai import AzureOpenAIEmbeddings
import asyncio
import csv
import time

# Load environment variables from .env file
load_dotenv(dotenv_path='C:\\Users\\HomePC\\n8n workflow chat\\api\\.env')

# --- Configuration from Environment Variables ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
AZURE_OPENAI_EMBEDDING_API_KEY = os.environ.get("AZURE_OPENAI_EMBEDDING_API_KEY")
AZURE_OPENAI_EMBEDDING_ENDPOINT = os.environ.get("AZURE_OPENAI_EMBEDDING_ENDPOINT")

if not all([SUPABASE_URL, SUPABASE_KEY, AZURE_OPENAI_EMBEDDING_API_KEY, AZURE_OPENAI_EMBEDDING_ENDPOINT]):
    print("Error: Missing one or more required environment variables.")
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

def get_existing_workflow_names():
    """Get all existing workflow names from the database to avoid duplicates."""
    try:
        response = supabase.table("n8n_workflows").select("name").execute()
        if response.data:
            return set(row["name"] for row in response.data)
        return set()
    except Exception as e:
        print(f"Error fetching existing workflows: {e}")
        return set()

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
                "link": row["url"]
            })
    print(f"Successfully loaded {len(n8n_workflow_data)} workflows from CSV.")
except FileNotFoundError:
    print(f"Error: CSV file not found at {csv_file_path}")
    exit(1)
except Exception as e:
    print(f"Error reading CSV file: {e}")
    exit(1)

async def resume_ingest_data():
    print("Starting resumed data ingestion...")
    
    # Get existing workflow names to avoid duplicates
    print("Checking existing workflows in database...")
    existing_names = get_existing_workflow_names()
    print(f"Found {len(existing_names)} existing workflows in database.")
    
    # Filter out workflows that already exist
    workflows_to_process = [w for w in n8n_workflow_data if w["name"] not in existing_names]
    print(f"Need to process {len(workflows_to_process)} new workflows.")
    
    if not workflows_to_process:
        print("All workflows are already in the database!")
        return
    
    success_count = 0
    error_count = 0
    
    for i, workflow in enumerate(workflows_to_process):
        try:
            print(f"Processing workflow {i+1}/{len(workflows_to_process)}: '{workflow['name'][:50]}...'")
            
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
                success_count += 1
                print(f"✅ Successfully inserted '{workflow['name'][:30]}...'")
            else:
                error_count += 1
                print(f"❌ Failed to insert '{workflow['name'][:30]}...'")
                if hasattr(response, 'error') and response.error:
                    print(f"Error details: {response.error}")

            # Add a small delay to avoid rate limiting
            if i % 10 == 0 and i > 0:
                print(f"Processed {i} workflows, taking a short break...")
                time.sleep(1)

        except Exception as e:
            error_count += 1
            print(f"❌ An error occurred while processing '{workflow['name'][:30]}...': {e}")
            
        # Progress update every 50 items
        if (i + 1) % 50 == 0:
            print(f"Progress: {i+1}/{len(workflows_to_process)} processed. Success: {success_count}, Errors: {error_count}")
    
    print(f"\n🎉 Data ingestion complete!")
    print(f"Total processed: {len(workflows_to_process)}")
    print(f"Successful insertions: {success_count}")
    print(f"Errors: {error_count}")
    
    # Final count check
    final_response = supabase.table("n8n_workflows").select("id").execute()
    if final_response.data:
        print(f"Total workflows in database: {len(final_response.data)}")

if __name__ == "__main__":
    asyncio.run(resume_ingest_data())