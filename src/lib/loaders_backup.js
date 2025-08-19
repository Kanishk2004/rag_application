import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import pdfParse from 'pdf-parse';
import Papa from 'papaparse';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

// Initialize text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1200,
	chunkOverlap: 200,
	separators: ['\n\n', '\n', ' ', ''],
});

export async function processFile(file, fileBuffer) {
	let content = '';
	const fileName = file.name;
	const fileType = file.type;

	try {
		if (fileType === 'application/pdf') {
			// Process PDF
			const pdfData = await pdfParse(fileBuffer);
			content = pdfData.text;
		} else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
			// Process CSV
			const csvText = fileBuffer.toString('utf-8');
			const parsed = Papa.parse(csvText, { header: true });

			// Convert CSV to readable text
			content = parsed.data
				.map((row) => {
					return Object.entries(row)
						.map(([key, value]) => `${key}: ${value}`)
						.join(', ');
				})
				.join('\n');
		} else if (
			fileType === 'text/plain' ||
			fileType === 'text/markdown' ||
			fileName.endsWith('.txt') ||
			fileName.endsWith('.md')
		) {
			// Process text files
			content = fileBuffer.toString('utf-8');
		} else {
			throw new Error(`Unsupported file type: ${fileType}`);
		}

		// Split into chunks
		const documents = await textSplitter.createDocuments(
			[content],
			[
				{
					source: fileName,
					type: 'file',
					originalType: fileType,
				},
			]
		);

		return documents;
	} catch (error) {
		console.error(`Error processing file ${fileName}:`, error);
		throw error;
	}
}

export async function processText(text) {
	try {
		// Split text into chunks
		const documents = await textSplitter.createDocuments(
			[text],
			[
				{
					source: 'pasted_text',
					type: 'text',
					timestamp: new Date().toISOString(),
				},
			]
		);

		return documents;
	} catch (error) {
		console.error('Error processing text:', error);
		throw error;
	}
}

export async function processUrl(url) {
	try {
		// Fetch the webpage
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch URL: ${response.status}`);
		}

		const html = await response.text();

		// Parse with JSDOM and Readability
		const dom = new JSDOM(html, { url });
		const reader = new Readability(dom.window.document);
		const article = reader.parse();

		if (!article) {
			throw new Error('Could not parse article content from URL');
		}

		const content = article.textContent;

		// Split into chunks
		const documents = await textSplitter.createDocuments(
			[content],
			[
				{
					source: url,
					type: 'url',
					title: article.title || 'Untitled',
					timestamp: new Date().toISOString(),
				},
			]
		);

		return documents;
	} catch (error) {
		console.error('Error processing URL:', error);
		throw error;
	}
}

export async function getAllDocuments() {
	// This would typically query your database/vector store
	// For now, we'll return a placeholder
	try {
		const vectorStore = await import('./qdrant.js').then((m) =>
			m.getVectorStore()
		);
		// Note: Qdrant doesn't have a direct "get all documents" method
		// You might need to implement this differently based on your needs
		return [];
	} catch (error) {
		console.error('Error getting all documents:', error);
		return [];
	}
}
