# Integration Testing Guide

## Backend Testing

### 1. Health Check
```bash
curl http://127.0.0.1:8000/health
```
Expected response:
```json
{\"status\": \"ok\", \"data_loaded\": true}
```

### 2. Search API Test
```bash
curl -X POST http://127.0.0.1:8000/search \\n  -H \"Content-Type: application/json\" \\n  -d '{
    \"query\": \"slack integration\",
    \"model\": \"gpt-4o\",
    \"temperature\": 0.7,
    \"topP\": 0.9
  }'
```

### 3. Streaming API Test
```bash
curl -X POST http://127.0.0.1:8000/stream \\n  -H \"Content-Type: application/json\" \\n  -d '{
    \"query\": \"email automation\",
    \"model\": \"gpt-4o\",
    \"temperature\": 0.7,
    \"topP\": 0.9
  }'
```

## Frontend Testing

### 1. Start Servers
```bash
# Terminal 1: Backend
uvicorn api:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Manual Testing Checklist
- [ ] Frontend loads at http://localhost:3000
- [ ] Welcome message displays
- [ ] Chat input is functional
- [ ] Can send messages
- [ ] Streaming responses work
- [ ] Workflow recommendations display
- [ ] Copy functionality works
- [ ] Mobile responsive design
- [ ] Error handling works
- [ ] Health check connection status

### 3. Sample Test Queries
- \"How do I integrate Slack with Google Sheets?\"
- \"Show me workflows for social media automation\"
- \"I need to process emails automatically\"
- \"Create a workflow for data synchronization\"
- \"Automate customer support tickets\"

## Troubleshooting

### Common Issues
1. **Connection refused**: Check if backend is running on port 8000
2. **CORS errors**: Verify CORS middleware includes localhost:3000
3. **Data not loaded**: Check if Excel file exists and Azure OpenAI keys are valid
4. **Streaming not working**: Verify browser supports Server-Sent Events

### Environment Variables
Backend (.env):
```
AZURE_OPENAI_CHAT_API_KEY=...
AZURE_OPENAI_CHAT_ENDPOINT=...
AZURE_OPENAI_EMBEDDING_API_KEY=...
AZURE_OPENAI_EMBEDDING_ENDPOINT=...
EXCEL_FILE_PATH=_n8n Templates 3000.xlsx
EXCEL_SHEET_NAME=Templates
```

Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```