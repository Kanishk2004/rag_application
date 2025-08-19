import { NextResponse } from 'next/server';
import { processFile, processText, processUrl } from '../../../lib/loaders.js';
import { addDocuments, initializeVectorStore } from '../../../lib/qdrant.js';

export async function POST(request) {
  try {
    // Initialize vector store if needed
    await initializeVectorStore();

    const contentType = request.headers.get('content-type');
    let documents = [];

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file');
      const type = formData.get('type');

      if (!file || type !== 'file') {
        return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      documents = await processFile(file, buffer);
    } else {
      // Handle JSON data (text or URL)
      const body = await request.json();
      const { type, content } = body;

      if (!type || !content) {
        return NextResponse.json({ error: 'Missing type or content' }, { status: 400 });
      }

      if (type === 'text') {
        documents = await processText(content);
      } else if (type === 'url') {
        documents = await processUrl(content);
      } else {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
      }
    }

    // Add documents to vector store
    const chunksAdded = await addDocuments(documents);

    return NextResponse.json({
      success: true,
      chunks: chunksAdded,
      message: `Successfully processed and added ${chunksAdded} chunks to the knowledge base.`
    });

  } catch (error) {
    console.error('Error in ingest API:', error);
    return NextResponse.json(
      { error: 'Failed to process content', details: error.message },
      { status: 500 }
    );
  }
}
