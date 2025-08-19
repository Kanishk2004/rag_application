# API Documentation

This document describes all the API endpoints available in the NotebookLM Mini Clone application.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: Your deployed URL

## Authentication
Currently, no authentication is required for API endpoints. All endpoints are publicly accessible.

---

## Endpoints

### 1. Document Ingestion

#### `POST /api/ingest`

Uploads and processes documents for the knowledge base.

**Content Types Supported:**
- `multipart/form-data` (for file uploads)
- `application/json` (for text and URL content)

**File Upload Request:**
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'file');

fetch('/api/ingest', {
  method: 'POST',
  body: formData
});
```

**Text Content Request:**
```javascript
fetch('/api/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'text',
    content: 'Your text content here...'
  })
});
```

**URL Content Request:**
```javascript
fetch('/api/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'url',
    content: 'https://example.com/article'
  })
});
```

**Response Format:**
```javascript
{
  "success": true,
  "chunks": 5,
  "message": "Successfully processed and added 5 chunks to the knowledge base."
}
```

**Error Response:**
```javascript
{
  "error": "Failed to process content",
  "details": "Specific error message"
}
```

**Supported File Types:**
- **PDF**: `.pdf` files
- **CSV**: `.csv` files  
- **Text**: `.txt`, `.md` files
- **URLs**: Any valid HTTP/HTTPS URL

---

### 2. Chat Interface

#### `POST /api/chat`

Sends a message and receives an AI response based on the knowledge base.

**Request:**
```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'What is this document about?'
  })
});
```

**Request Body:**
```javascript
{
  "message": "string" // Required: The user's question
}
```

**Response:**
The response is a **streaming response** using Server-Sent Events (SSE).

**Streaming Response Format:**
```
data: {"content": "This", "done": false}

data: {"content": " document", "done": false}

data: {"content": " discusses...", "done": false}

data: {"content": "", "done": true}
```

**JavaScript Example (Streaming):**
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: 'Your question here' })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.content) {
        // Append content to your UI
        console.log(data.content);
      }
      if (data.done) {
        // Response complete
        break;
      }
    }
  }
}
```

**Error Response:**
```javascript
{
  "error": "Error message",
  "details": "Specific error details"
}
```

---

### 3. Document Summarization

#### `GET /api/summarize`

Generates a comprehensive summary of all documents in the knowledge base.

**Request:**
```javascript
fetch('/api/summarize', {
  method: 'GET'
});
```

**Response:**
```javascript
{
  "summary": "This knowledge base contains information about...",
  "documentCount": 3,
  "chunkCount": 15
}
```

**Error Response:**
```javascript
{
  "error": "No documents found in knowledge base"
}
```

---

## Error Handling

All endpoints follow consistent error handling patterns:

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid input)
- `500` - Internal Server Error

### Error Response Format
```javascript
{
  "error": "Brief error description",
  "details": "Detailed error message",
  "stack": "Error stack trace (development only)"
}
```

### Common Errors

**Missing OpenAI API Key:**
```javascript
{
  "error": "Missing OpenAI API key. Please set OPENAI_API_KEY in .env.local"
}
```

**Unsupported File Type:**
```javascript
{
  "error": "Failed to process file",
  "details": "Unsupported file type: application/unknown"
}
```

**Vector Database Connection Error:**
```javascript
{
  "error": "Failed to initialize vector store",
  "details": "Connection to Qdrant failed"
}
```

---

## Rate Limits

Currently, there are no rate limits implemented, but consider implementing them for production use:

- **Recommended**: 100 requests per minute per IP
- **File uploads**: 10 files per minute per IP
- **Chat requests**: 50 messages per minute per IP

---

## Request/Response Examples

### Complete File Upload Flow

**1. Upload a PDF file:**
```javascript
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);
formData.append('type', 'file');

try {
  const response = await fetch('/api/ingest', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log(`Processed ${result.chunks} chunks`);
} catch (error) {
  console.error('Upload failed:', error);
}
```

**2. Ask a question:**
```javascript
const askQuestion = async (question) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: question })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            fullResponse += data.content;
            // Update UI with streaming content
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
  }

  return fullResponse;
};

// Usage
const answer = await askQuestion('What are the main topics in the uploaded documents?');
console.log(answer);
```

**3. Get a summary:**
```javascript
const getSummary = async () => {
  try {
    const response = await fetch('/api/summarize');
    const data = await response.json();
    
    console.log('Summary:', data.summary);
    console.log(`Based on ${data.documentCount} documents`);
  } catch (error) {
    console.error('Failed to get summary:', error);
  }
};

await getSummary();
```

---

## Development Notes

### Adding Custom Headers
```javascript
// Enable CORS for development
const response = new Response(data, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
});
```

### Monitoring and Logging
All API endpoints log relevant information:

```javascript
// Request logging
console.log(`${method} ${pathname} - ${userAgent}`);

// Performance logging
console.log(`Processing completed in ${duration}ms`);

// Error logging
console.error(`API Error: ${error.message}`, { 
  endpoint: pathname, 
  method, 
  error: error.stack 
});
```

### Testing API Endpoints

**Using curl:**
```bash
# Test file upload
curl -X POST \
  -F "file=@test.pdf" \
  -F "type=file" \
  http://localhost:3000/api/ingest

# Test text input
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"text","content":"Test content"}' \
  http://localhost:3000/api/ingest

# Test chat
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"What is this about?"}' \
  http://localhost:3000/api/chat

# Test summary
curl http://localhost:3000/api/summarize
```

This API documentation should help you integrate with and extend the NotebookLM Mini Clone application.
