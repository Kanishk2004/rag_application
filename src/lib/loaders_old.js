import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import Papa from 'papaparse';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

// Initialize text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1200,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', ' ', ''],
});

// Dynamic import for pdf-parse to avoid potential issues
async function loadPdfParse() {
  try {
    const pdfParse = await import('pdf-parse');
    return pdfParse.default || pdfParse;
  } catch (error) {
    console.error('Error loading pdf-parse:', error);
    throw new Error('PDF processing is not available');
  }
}

export async function processFile(file, fileBuffer) {
  let content = '';
  const fileName = file.name;
  const fileType = file.type;

  console.log(`Processing file: ${fileName}, type: ${fileType}`);

  try {
    if (fileType === 'application/pdf') {
      console.log('Loading PDF parser...');
      const pdfParse = await loadPdfParse();
      console.log('Processing PDF with buffer length:', fileBuffer.length);
      const pdfData = await pdfParse(fileBuffer);
      content = pdfData.text;
      console.log('PDF processed successfully, text length:', content.length);
    } else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
      console.log('Processing CSV file...');
      const csvText = fileBuffer.toString('utf-8');
      const parsed = Papa.parse(csvText, { header: true });

      content = parsed.data
        .map((row) => {
          return Object.entries(row)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        })
        .join('\n');
      console.log('CSV processed successfully, text length:', content.length);
    } else if (
      fileType === 'text/plain' ||
      fileType === 'text/markdown' ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md')
    ) {
      console.log('Processing text file...');
      content = fileBuffer.toString('utf-8');
      console.log('Text file processed successfully, length:', content.length);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (!content || content.trim().length === 0) {
      throw new Error('No content extracted from file');
    }

    console.log('Splitting text into chunks...');
    const chunks = await textSplitter.splitText(content);
    console.log(`Created ${chunks.length} chunks`);

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
  console.log('Processing direct text input, length:', text.length);
  
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('No text content provided');
    }

    const chunks = await textSplitter.splitText(text);
    console.log(`Created ${chunks.length} chunks from text`);

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
  console.log('Processing URL:', url);
  
  try {
    console.log('Fetching webpage...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('HTML fetched, length:', html.length);

    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Could not extract readable content from URL');
    }

    const content = article.textContent;
    console.log('Extracted content length:', content.length);

    if (!content || content.trim().length === 0) {
      throw new Error('No content extracted from URL');
    }

    const chunks = await textSplitter.splitText(content);
    console.log(`Created ${chunks.length} chunks from URL`);

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
