# NotebookLM Mini - RAG Application

A mini NotebookLM clone built with Next.js, LangChain.js, Qdrant, and OpenAI GPT-4o-mini. Upload documents, ask questions, and get intelligent answers based on your content.

## Features

- **Multi-format Support**: Upload PDFs, CSVs, text files, or paste content directly
- **Web Content**: Extract content from websites using URLs
- **Intelligent Chat**: Ask questions about your uploaded sources
- **Streaming Responses**: Real-time streaming chat responses
- **Document Summarization**: Generate comprehensive summaries of all sources
- **Vector Search**: Powered by Qdrant vector database for semantic similarity search

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **AI/ML**: LangChain.js, OpenAI GPT-4o-mini, text-embedding-3-large
- **Vector Database**: Qdrant
- **Document Processing**: pdf-parse, papaparse, jsdom, @mozilla/readability

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for Qdrant)
- OpenAI API Key

## Quick Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd rag_application
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```bash
# OpenAI API Key - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Qdrant URL - Default for local Docker instance
QDRANT_URL=http://localhost:6333

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Qdrant Database

```bash
docker-compose up -d
```

This will start Qdrant on:
- HTTP API: `http://localhost:6333`
- Dashboard: `http://localhost:6333/dashboard`

### 4. Initialize Qdrant Collection

```bash
npm run setup
```

### 5. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your NotebookLM Mini!

## Project Structure

```
src/
├── app/
│   ├── page.js                 # Landing page
│   ├── app/
│   │   └── page.js            # Main application page
│   └── api/
│       ├── ingest/
│       │   └── route.js       # File/text/URL processing endpoint
│       ├── chat/
│       │   └── route.js       # Chat endpoint with streaming
│       └── summarize/
│           └── route.js       # Summarization endpoint
├── components/
│   ├── UploadZone.js          # File upload and text input component
│   └── Chat.js                # Chat interface component
└── lib/
    ├── qdrant.js              # Qdrant vector store integration
    ├── loaders.js             # Document processing utilities
    └── langchain.js           # LangChain RAG chain setup
```

## API Endpoints

### POST `/api/ingest`

Upload and process documents:

**File Upload:**
```bash
curl -X POST http://localhost:3000/api/ingest 
  -F "file=@document.pdf" 
  -F "type=file"
```

**Text Input:**
```bash
curl -X POST http://localhost:3000/api/ingest 
  -H "Content-Type: application/json" 
  -d '{"type": "text", "content": "Your text content here"}'
```

**URL Processing:**
```bash
curl -X POST http://localhost:3000/api/ingest 
  -H "Content-Type: application/json" 
  -d '{"type": "url", "content": "https://example.com/article"}'
```

### POST `/api/chat`

Chat with your documents (streaming response):

```bash
curl -X POST http://localhost:3000/api/chat 
  -H "Content-Type: application/json" 
  -d '{"message": "What are the main topics in the documents?"}'
```

### POST `/api/summarize`

Generate a summary of all uploaded sources:

```bash
curl -X POST http://localhost:3000/api/summarize
```

## Configuration

### LangChain Settings

- **Chunk Size**: 1200 characters
- **Chunk Overlap**: 200 characters
- **Embedding Model**: text-embedding-3-large
- **Chat Model**: gpt-4o-mini
- **Temperature**: 0.1 (for consistent responses)

### Qdrant Configuration

- **Collection Name**: `notebooklm_mini`
- **Vector Dimension**: 3072 (text-embedding-3-large)
- **Distance Metric**: Cosine similarity

## Usage Examples

1. **Upload a PDF research paper** and ask questions about methodology
2. **Paste meeting notes** and ask for action items
3. **Add a website URL** and ask for a summary
4. **Upload multiple CSV files** and ask for data insights
5. **Use the summarize feature** to get an overview of all sources

## Troubleshooting

### Qdrant Connection Issues

```bash
# Check if Qdrant is running
docker ps

# Restart Qdrant
docker-compose restart

# Check Qdrant logs
docker-compose logs qdrant
```

### OpenAI API Issues

- Verify your API key is correct
- Check your OpenAI account has sufficient credits
- Ensure the API key has proper permissions

### Memory Issues

If you encounter memory issues with large files:
- Reduce chunk size in `src/lib/loaders.js`
- Process files in smaller batches
- Increase Node.js memory limit: `node --max-old-space-size=4096`

## Development

### Adding New File Types

To support additional file types, extend the `processFile` function in `src/lib/loaders.js`:

```javascript
// Example: Add .docx support
import { Document } from 'langchain/document';
import mammoth from 'mammoth'; // npm install mammoth

// In processFile function
else if (fileName.endsWith('.docx')) {
  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  content = result.value;
}
```

### Custom Prompts

Modify the RAG prompt in `src/lib/langchain.js` to change how the AI responds:

```javascript
const ragPrompt = PromptTemplate.fromTemplate(`
Your custom instructions here...

Context: {context}
Question: {question}
Answer:
`);
```

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
OPENAI_API_KEY=your_production_api_key
QDRANT_URL=your_production_qdrant_url
NEXT_PUBLIC_APP_URL=your_production_domain
```

### Qdrant Cloud

For production, consider using [Qdrant Cloud](https://qdrant.tech/cloud/) instead of self-hosting.

### Scaling Considerations

- Use Redis for session management
- Implement rate limiting
- Add user authentication
- Set up monitoring and logging
- Use a CDN for static assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by Google's NotebookLM
- Built with [LangChain.js](https://js.langchain.com/)
- Vector search powered by [Qdrant](https://qdrant.tech/)
- AI responses from [OpenAI](https://openai.com/)
