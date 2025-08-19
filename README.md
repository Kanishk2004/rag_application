# NotebookLM Mini Clone 📚🤖

A powerful RAG (Retrieval-Augmented Generation) application built with Next.js that mimics Google's NotebookLM functionality. Upload documents, ask questions, and get AI-powered insights from your knowledge base.

![NotebookLM Mini Clone](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.4.7-000000?logo=nextdotjs)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🔄 Document Processing

- **PDF Documents** - Extract and process text from PDF files
- **CSV Files** - Parse and structure CSV data for querying
- **Text Files** - Direct text document upload (.txt, .md)
- **URL Ingestion** - Extract content from web pages using Readability

### 🧠 AI-Powered Chat

- **Contextual Responses** - AI answers based on your uploaded documents
- **Streaming Chat** - Real-time response streaming for better UX
- **Document Summarization** - Get quick summaries of your knowledge base
- **Source Attribution** - Track which documents inform each response

### 🎨 Modern UI/UX

- **Dark Theme** - Eye-friendly dark interface
- **Fully Responsive** - Optimized for desktop, tablet, and mobile (320px+)
- **Drag & Drop** - Intuitive file upload experience
- **Tab Navigation** - Organized upload interface for different content types

### 🛠 Technical Features

- **Vector Search** - Semantic similarity search using OpenAI embeddings
- **Chunking Strategy** - Smart text splitting with overlap for context preservation
- **Docker Integration** - Containerized Qdrant vector database
- **Environment Configuration** - Flexible setup for different environments

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Vector DB     │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (Qdrant)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │              ┌─────────────────┐              │
        └─────────────►│   OpenAI API    │◄─────────────┘
                       │   (GPT-4o-mini) │
                       └─────────────────┘
```

### Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **AI/ML**: OpenAI GPT-4o-mini, LangChain.js, OpenAI Embeddings
- **Vector Database**: Qdrant (Docker)
- **Document Processing**: pdf-parse, papaparse, jsdom, readability

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Kanishk2004/rag_application.git
   cd rag_application
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the environment template
   cp .env .env.local

   # Add your OpenAI API key to .env.local
   OPENAI_API_KEY=sk-your-openai-api-key-here
   QDRANT_URL=http://localhost:6333
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start Qdrant vector database**

   ```bash
   docker-compose up -d
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. Upload Documents

- **File Upload**: Drag and drop or select PDF, CSV, or text files
- **Direct Text**: Paste text directly into the application
- **URL Import**: Enter a webpage URL to extract and process its content

### 2. Ask Questions

- Once documents are uploaded, use the chat interface
- Ask questions about your uploaded content
- Get AI-powered responses with source attribution

### 3. Document Summarization

- Click "Summarize Documents" to get an overview of your knowledge base
- Useful for understanding large document collections

## 🏗 Project Structure

```
rag_application/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   │   ├── chat/         # Chat completion endpoint
│   │   │   ├── ingest/       # Document upload endpoint
│   │   │   └── summarize/    # Summarization endpoint
│   │   ├── app/              # Main application page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.js         # Root layout
│   │   └── page.js           # Landing page
│   ├── components/            # React components
│   │   ├── Chat.js           # Chat interface
│   │   └── UploadZone.js     # File upload component
│   └── lib/                  # Utility libraries
│       ├── langchain.js      # LangChain configuration
│       ├── loaders.js        # Document processing
│       └── qdrant.js         # Vector database operations
├── public/                    # Static assets
├── docs/                      # Documentation
├── tests/                     # Test files
├── docker-compose.yml         # Docker configuration
└── package.json              # Dependencies
```

## 🔧 Configuration

### Environment Variables

| Variable              | Description         | Required    |
| --------------------- | ------------------- | ----------- |
| `OPENAI_API_KEY`      | Your OpenAI API key | ✅ Yes      |
| `QDRANT_URL`          | Qdrant database URL | ✅ Yes      |
| `NEXT_PUBLIC_APP_URL` | Application URL     | ❌ Optional |

### Qdrant Configuration

The vector database runs in Docker with the following settings:

- **Port**: 6333
- **Collection**: notebooklm_mini
- **Vector Size**: 3072 (text-embedding-3-large)
- **Distance**: Cosine similarity

### Text Processing

- **Chunk Size**: 1200 characters
- **Chunk Overlap**: 200 characters
- **Separators**: Double newline, newline, space

## 🚀 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Environment

1. Set `NODE_ENV=production`
2. Configure production OpenAI API key
3. Use production-ready Qdrant instance
4. Set up proper SSL/TLS termination

## 🧪 API Documentation

### POST /api/ingest

Upload and process documents

```javascript
// File upload
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'file');

// Text input
const response = await fetch('/api/ingest', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ type: 'text', content: 'Your text here' }),
});
```

### POST /api/chat

Chat with your documents

```javascript
const response = await fetch('/api/chat', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ message: 'What is this document about?' }),
});
```

### GET /api/summarize

Get document summary

```javascript
const response = await fetch('/api/summarize');
const { summary } = await response.json();
```

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Document Types

1. Extend the `processFile` function in `src/lib/loaders.js`
2. Add file type detection logic
3. Implement parsing for the new format
4. Update the upload UI to accept the new file type

### Customizing AI Responses

Modify the system prompt in `src/lib/langchain.js`:

```javascript
const systemPrompt = 'Your custom system prompt here...';
```

## 🔍 Troubleshooting

### Common Issues

**Error: Missing OpenAI API key**

- Ensure `OPENAI_API_KEY` is set in `.env.local`
- Verify the API key is valid and has sufficient credits

**Error: Cannot connect to Qdrant**

- Check if Docker is running: `docker ps`
- Start Qdrant: `docker-compose up -d`
- Verify port 6333 is not in use

**Upload fails with 500 error**

- Check server logs in the terminal
- Ensure all environment variables are set
- Verify file format is supported

**Chat responses are slow**

- OpenAI API can be slow during peak times
- Consider upgrading to a paid OpenAI plan
- Check your internet connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## �‍💻 Developer

This project was developed by **Kanishk Chandna**, a passionate full-stack developer specializing in AI-powered applications and modern web technologies.

### 📫 Connect with me:

- **Portfolio**: [https://www.kanishk.codes](https://www.kanishk.codes)
- **LinkedIn**: [https://www.linkedin.com/in/kanishk-chandna-9553931b0/](https://www.linkedin.com/in/kanishk-chandna-9553931b0/)
- **Twitter**: [https://x.com/Kanishk_fr](https://x.com/Kanishk_fr)
- **Email**: [kanishkchandna29@gmail.com](mailto:kanishkchandna29@gmail.com)
- **Phone**: +91 9268815903

### 💼 About

Experienced in building scalable web applications with React/Next.js, Node.js, AI/ML integration, and modern cloud technologies. Always excited to collaborate on innovative projects and contribute to the developer community.

## �📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google NotebookLM** - Inspiration for the UI and functionality
- **OpenAI** - For providing the GPT and embedding APIs
- **LangChain** - For the excellent RAG framework
- **Qdrant** - For the high-performance vector database
- **Vercel** - For Next.js and deployment platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Look through existing [GitHub issues](../../issues)
3. Create a new issue with detailed information

---

**Built with ❤️ using Next.js and AI**

_Transform your documents into an intelligent knowledge base_
