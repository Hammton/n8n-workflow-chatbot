-- Drop the existing function first
DROP FUNCTION IF EXISTS match_workflows(vector, double precision, integer);

-- Create the match_workflows function for vector similarity search
-- This function will be used by LangChain to search for similar workflows

CREATE OR REPLACE FUNCTION match_workflows(
  query_embedding vector(3072),
  match_threshold float DEFAULT 0.1,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  name text,
  description text,
  link text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n8n_workflows.id,
    n8n_workflows.name,
    n8n_workflows.description,
    n8n_workflows.link,
    1 - (n8n_workflows.embedding <=> query_embedding) AS similarity
  FROM n8n_workflows
  WHERE 1 - (n8n_workflows.embedding <=> query_embedding) > match_threshold
  ORDER BY n8n_workflows.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Note: Skipping index creation due to 2000 dimension limit
-- The function will still work, just without index optimization
-- You can create an index later if you switch to a smaller embedding model

-- CREATE INDEX IF NOT EXISTS n8n_workflows_embedding_idx 
-- ON n8n_workflows 
-- USING hnsw (embedding vector_cosine_ops);