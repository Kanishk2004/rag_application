# Quick Reference

## 🚀 Common Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

### Database Management
```bash
# Start Qdrant database
docker-compose up -d

# View database logs
docker-compose logs qdrant

# Stop database
docker-compose down

# Reset database (removes all data)
docker-compose down -v
```

### Troubleshooting
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env.local
```

## 📋 File Upload Formats

### Supported Files
- **PDFs**: Any PDF document (extracts text content)
- **CSV**: Comma-separated values (processes as structured data)
- **Text**: .txt, .md, .json files
- **URLs**: Web pages (extracts readable content)

### File Size Limits
- **Maximum**: 10MB per file
- **Optimal**: Under 5MB for best performance
- **Chunks**: Text split into ~1200 character segments

## 🔧 Configuration Reference

### Environment Variables (.env.local)
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (defaults shown)
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=notebooklm_mini
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-large
```

### OpenAI Models Available
- **gpt-4o-mini**: Fast, cost-effective (current)
- **gpt-4o**: Higher quality, more expensive
- **gpt-3.5-turbo**: Fastest, most economical

## 🎯 API Endpoints

### POST /api/ingest
**Purpose**: Upload and process documents
```bash
curl -X POST http://localhost:3000/api/ingest \
  -F "file=@document.pdf"
```

### POST /api/chat
**Purpose**: Chat with uploaded documents
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is this document about?"}'
```

### POST /api/summarize
**Purpose**: Generate document summary
```bash
curl -X POST http://localhost:3000/api/summarize
```

## 📱 UI Features

### Upload Zone
- **Tab 1**: File upload with drag & drop
- **Tab 2**: Direct text input
- **Tab 3**: URL content extraction

### Chat Interface
- Real-time streaming responses
- Message history preservation
- Auto-scroll to latest message
- Mobile-optimized layout

## 🐛 Common Issues

### Upload Errors
- Check file size (max 10MB)
- Verify file format is supported
- Ensure Qdrant database is running

### Chat Not Working
- Verify OpenAI API key in .env.local
- Check if documents are uploaded
- Restart development server

### Database Connection
- Run `docker-compose up -d`
- Check if port 6333 is available
- Verify Docker is running

## 📊 Performance Tips

### Optimization
- Upload smaller documents for faster processing
- Use PDF files with selectable text (not scanned images)
- Clear browser cache if UI seems outdated

### Resource Usage
- Qdrant uses ~100MB RAM
- Next.js development: ~200MB RAM
- Production build is more memory efficient

## 🔍 Development Notes

### Code Structure
- `src/app`: Next.js App Router pages
- `src/components`: Reusable React components
- `src/lib`: Utility functions and configurations
- `docs/`: Project documentation
- `tests/`: Example test files

### Key Files
- `loaders.js`: Document processing logic
- `qdrant.js`: Vector database operations
- `langchain.js`: AI model configuration
- `globals.css`: Dark theme styles

---
**Last Updated**: January 20, 2025  
**Version**: 1.0.0
