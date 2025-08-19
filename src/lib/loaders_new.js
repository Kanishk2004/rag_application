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
    const chunks = await textSplitter.splitText(content);

    // Convert to documents
    const documents = chunks.map(
      (chunk, index) =>
        new Document({
          pageContent: chunk,
          metadata: {
            source: fileName,
            type: fileType,
            chunk: index,
            totalChunks: chunks.length,
          },
        })
    );

    return documents;
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}

export async function processText(text) {
  try {
    // Split text into chunks
    const chunks = await textSplitter.splitText(text);

    // Convert to documents
    const documents = chunks.map(
      (chunk, index) =>
        new Document({
          pageContent: chunk,
          metadata: {
            source: 'direct_text',
            type: 'text',
            chunk: index,
            totalChunks: chunks.length,
          },
        })
    );

    return documents;
  } catch (error) {
    console.error('Error processing text:', error);
    throw new Error(`Failed to process text: ${error.message}`);
  }
}

export async function processUrl(url) {
  try {
    // Fetch the webpage
    const response = await fetch(url);
    const html = await response.text();

    // Parse with JSDOM and extract readable content
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Could not extract content from URL');
    }

    const content = article.textContent;

    // Split into chunks
    const chunks = await textSplitter.splitText(content);

    // Convert to documents
    const documents = chunks.map(
      (chunk, index) =>
        new Document({
          pageContent: chunk,
          metadata: {
            source: url,
            type: 'url',
            title: article.title,
            chunk: index,
            totalChunks: chunks.length,
          },
        })
    );

    return documents;
  } catch (error) {
    console.error('Error processing URL:', error);
    throw new Error(`Failed to process URL: ${error.message}`);
  }
}
