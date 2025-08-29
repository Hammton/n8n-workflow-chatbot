export interface QueryRequest {
  query: string;
}

export interface WorkflowResponse {
  name: string;
  description: string;
  link: string;
}

export interface QueryResponse {
  result: string;
  source_documents: WorkflowResponse[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  workflows?: WorkflowResponse[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export async function queryWorkflows(request: QueryRequest): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Query failed: ${errorData.error || `HTTP ${response.status}`}`);
  }

  return response.json();
}

export async function* streamWorkflows(request: QueryRequest): AsyncGenerator<{
  type: 'source_documents' | 'content' | 'done';
  data: any;
}> {
  const response = await fetch(`${API_BASE_URL}/query/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Stream failed: HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body reader available');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch (e) {
            console.warn('Failed to parse SSE data:', line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}