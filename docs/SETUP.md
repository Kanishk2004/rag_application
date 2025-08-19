# Quick Setup Guide for NotebookLM Mini

## 🎨 **New Dark Theme & Responsive Design**
- ✨ **Dark Theme**: Modern dark UI that's easy on the eyes
- 📱 **Mobile Responsive**: Optimized for phones, tablets, and desktops
- 🎯 **Touch Friendly**: Larger buttons and improved spacing on mobile

## 1. Prerequisites Check
- ✅ Node.js 18+ installed
- ✅ Dependencies installed (`npm install` completed)
- ✅ Docker Desktop running (for Qdrant)

## 2. Get Your OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

## 3. Environment Setup
1. Create `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=your_actual_openai_api_key_here
QDRANT_URL=http://localhost:6333
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Start Qdrant Database
```bash
docker-compose up -d
```
- Wait for Qdrant to be ready (check http://localhost:6333/dashboard)

## 5. Initialize Vector Store
```bash
npm run setup
```
- This creates the "notebooklm_mini" collection in Qdrant

## 6. Start the Application
```bash
npm run dev
```
- Open http://localhost:3000 in your browser

## 7. Test the Application
1. Go to http://localhost:3000
2. Click "Start Using NotebookLM Mini"
3. Upload a file, paste some text, or add a URL
4. Ask questions about your content in the chat

## 📱 **Responsive Features**

### Mobile (320px - 640px)
- Single column layout
- Collapsible navigation
- Touch-optimized buttons
- Optimized text sizes

### Tablet (640px - 1024px) 
- Improved spacing
- Better content organization
- Enhanced touch targets

### Desktop (1024px+)
- Full two-column layout
- Larger content areas
- Optimal reading experience

## Troubleshooting

### Common Issues:

**"OpenAI API error"**
- Check your API key is correct in `.env.local`
- Ensure you have credits in your OpenAI account

**"Qdrant connection failed"**
- Make sure Docker Desktop is running
- Run `docker-compose up -d` again
- Check Qdrant dashboard at http://localhost:6333/dashboard

**"Collection not found"**
- Run `npm run setup` again to create the collection

**Port 3000 already in use**
- Stop other Next.js apps or change the port:
  ```bash
  npm run dev -- -p 3001
  ```

## File Upload Support
- ✅ PDF files (.pdf)
- ✅ CSV files (.csv) 
- ✅ Text files (.txt)
- ✅ Markdown files (.md)
- ✅ Pasted text content
- ✅ Website URLs

## Features to Try
1. **Multi-source Upload**: Upload multiple different file types
2. **Chat Interface**: Ask questions about your uploaded content
3. **Summarization**: Click "Summarize All" for an overview
4. **Streaming**: Watch responses appear in real-time
5. **Context-aware**: The AI only answers based on your content
6. **Responsive Design**: Try it on different screen sizes!

## 🌟 **Dark Theme Benefits**
- Reduced eye strain in low-light environments
- Better focus on content
- Modern, professional appearance
- Improved battery life on OLED screens

Enjoy using your NotebookLM Mini with the new dark theme! 🚀
