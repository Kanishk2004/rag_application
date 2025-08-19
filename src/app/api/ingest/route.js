import { NextResponse } from 'next/server';
import { processFile, processText, processUrl } from '../../../lib/loaders.js';
import { addDocuments, initializeVectorStore } from '../../../lib/qdrant.js';

export async function POST(request) {
	try {
		console.log('Starting ingest process...');

		// Check environment variables
		if (!process.env.OPENAI_API_KEY) {
			console.error('Missing OPENAI_API_KEY in environment variables');
			return NextResponse.json(
				{
					error:
						'Missing OpenAI API key. Please set OPENAI_API_KEY in .env.local',
				},
				{ status: 500 }
			);
		}

		// Initialize vector store if needed
		console.log('Initializing vector store...');
		await initializeVectorStore();
		console.log('Vector store initialized successfully');

		const contentType = request.headers.get('content-type');
		let documents = [];

		if (contentType?.includes('multipart/form-data')) {
			console.log('Processing file upload...');
			// Handle file upload
			const formData = await request.formData();
			const file = formData.get('file');
			const type = formData.get('type');

			if (!file || type !== 'file') {
				return NextResponse.json(
					{ error: 'Invalid file upload' },
					{ status: 400 }
				);
			}

			console.log(`Processing file: ${file.name}, type: ${file.type}`);
			const buffer = Buffer.from(await file.arrayBuffer());
			documents = await processFile(file, buffer);
		} else {
			console.log('Processing JSON data...');
			// Handle JSON data (text or URL)
			const body = await request.json();
			const { type, content } = body;

			if (!type || !content) {
				return NextResponse.json(
					{ error: 'Missing type or content' },
					{ status: 400 }
				);
			}

			console.log(`Processing ${type}: ${content.substring(0, 100)}...`);
			if (type === 'text') {
				documents = await processText(content);
			} else if (type === 'url') {
				documents = await processUrl(content);
			} else {
				return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
			}
		}

		console.log(`Generated ${documents.length} document chunks`);

		// Add documents to vector store
		console.log('Adding documents to vector store...');
		const chunksAdded = await addDocuments(documents);
		console.log(`Successfully added ${chunksAdded} chunks to vector store`);

		return NextResponse.json({
			success: true,
			chunks: chunksAdded,
			message: `Successfully processed and added ${chunksAdded} chunks to the knowledge base.`,
		});
	} catch (error) {
		console.error('Error in ingest API:', error);
		console.error('Error stack:', error.stack);
		return NextResponse.json(
			{
				error: 'Failed to process content',
				details: error.message,
				stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
			},
			{ status: 500 }
		);
	}
}
