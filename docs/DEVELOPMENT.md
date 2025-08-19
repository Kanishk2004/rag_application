# Development Guide

This document provides detailed information for developers who want to contribute to or extend the NotebookLM Mini Clone project.

## Development Environment Setup

### Prerequisites
- Node.js 18 or higher
- Docker Desktop
- VS Code (recommended)
- Git

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Docker

## Code Structure

### Frontend Components

#### UploadZone.js
Handles file uploads and content ingestion:
- File drag & drop functionality
- URL content extraction
- Direct text input
- Progress feedback

#### Chat.js
Manages the chat interface:
- Message display
- Streaming response handling
- Auto-scrolling
- Loading states

### Backend API Routes

#### /api/ingest
- Processes uploaded files
- Extracts text from various formats
- Chunks text for vector storage
- Adds documents to Qdrant

#### /api/chat
- Handles chat completions
- Retrieves relevant document chunks
- Streams responses from OpenAI

#### /api/summarize
- Generates document summaries
- Provides overview of knowledge base

### Library Functions

#### loaders.js
Document processing utilities:
- `processFile()` - Handle file uploads
- `processText()` - Process direct text input
- `processUrl()` - Extract content from URLs

#### qdrant.js
Vector database operations:
- `getVectorStore()` - Get Qdrant connection
- `addDocuments()` - Store document chunks
- `initializeVectorStore()` - Set up collection

#### langchain.js
LangChain integration:
- Chat model configuration
- Prompt templates
- RAG chain setup

## Adding New Features

### Adding a New Document Type

1. **Update loaders.js**:
```javascript
// Add new file type detection
if (fileType === 'application/your-type') {
  // Add processing logic
  content = await processYourType(fileBuffer);
}
```

2. **Update UploadZone.js**:
```javascript
// Add to accepted file types
accept: {
  'application/your-type': ['.ext'],
  // ... existing types
}
```

3. **Test the new functionality**:
```bash
npm run dev
# Test upload with new file type
```

### Customizing AI Behavior

Modify the system prompt in `src/lib/langchain.js`:

```javascript
const systemPrompt = `
You are an AI assistant specialized in [your domain].
When answering questions, always:
1. Provide accurate information
2. Cite your sources
3. Be helpful and concise
`;
```

### Adding New API Endpoints

1. **Create new route file**:
```javascript
// src/app/api/your-endpoint/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Your logic here
    return NextResponse.json({ data: 'response' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' }, 
      { status: 500 }
    );
  }
}
```

2. **Update the frontend to use the new endpoint**:
```javascript
const response = await fetch('/api/your-endpoint');
const data = await response.json();
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual Testing Checklist
- [ ] File upload works for all supported formats
- [ ] URL ingestion extracts content correctly
- [ ] Chat responses are relevant to uploaded content
- [ ] Streaming works properly
- [ ] Error handling works for invalid inputs
- [ ] Mobile responsiveness works
- [ ] Dark theme is consistent

## Performance Optimization

### Frontend Optimization
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with dynamic imports
- Use React.Suspense for code splitting

### Backend Optimization
- Implement proper caching strategies
- Optimize vector search parameters
- Use connection pooling for database
- Monitor API response times

### Database Optimization
- Monitor Qdrant collection size
- Implement periodic cleanup
- Optimize vector dimensions
- Monitor memory usage

## Deployment

### Development Deployment
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker-compose up -d
```

### Environment Variables
Ensure all required environment variables are set:
- `OPENAI_API_KEY` - OpenAI API key
- `QDRANT_URL` - Qdrant database URL
- `NODE_ENV` - Environment (development/production)

## Debugging

### Common Issues and Solutions

**Vector Store Connection Issues**:
```bash
# Check Qdrant status
docker ps | grep qdrant

# Restart Qdrant
docker-compose restart qdrant
```

**OpenAI API Issues**:
```bash
# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

**Build Issues**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Logging

Add debugging logs throughout the application:

```javascript
// Backend logging
console.log('Processing file:', fileName);
console.error('Error occurred:', error);

// Frontend logging
console.log('Component mounted:', componentName);
console.warn('Performance issue:', performanceData);
```

## Code Quality

### ESLint Configuration
The project uses ESLint for code quality. Run:
```bash
npm run lint
npm run lint:fix
```

### Prettier Configuration
Code formatting is handled by Prettier:
```bash
npm run format
```

### Pre-commit Hooks
Install and configure Husky for pre-commit hooks:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run format"
```

## Contributing Guidelines

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Write tests** for new functionality
5. **Run the test suite**: `npm test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Pull Request Guidelines
- Provide clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Follow the existing code style

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [LangChain.js Documentation](https://js.langchain.com/docs)
- [Qdrant Documentation](https://qdrant.tech/documentation)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
