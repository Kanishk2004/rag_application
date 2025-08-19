import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import Papa from 'papaparse';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1200,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', ' ', ''],
});

export async function processFile(file, fileBuffer) {
  console.log(`Processing file: ${file.name}, type: ${file.type}`);
  
  let content = '';
  
  try {
    if (file.type === 'application/pdf') {
      // Dynamic import for pdf-parse
      const pdfParse = await import('pdf-parse');
      const parser = pdfParse.default || pdfParse;
      const pdfData = await parser(fileBuffer);
      content = pdfData.text;
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      const csvText = fileBuffer.toString('utf-8');
      const parsed = Papa.parse(csvText, { header: true });
      content = parsed.data
        .map(row => Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(', '))
        .join('\n');
    } else if (
      file.type === 'text/plain' ||
      file.type === 'text/markdown' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md')
    ) {
      content = fileBuffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    const chunks = await textSplitter.splitText(content);
    return chunks.map((chunk, index) => new Document({
      pageContent: chunk,
      metadata: {
        source: file.name,
        type: file.type,
        chunk: index,
        totalChunks: chunks.length,
      },
    }));
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}

export async function processText(text) {
  try {
    const chunks = await textSplitter.splitText(text);
    return chunks.map((chunk, index) => new Document({
      pageContent: chunk,
      metadata: {
        source: 'direct_text',
        type: 'text',
        chunk: index,
        totalChunks: chunks.length,
      },
    }));
  } catch (error) {
    console.error('Error processing text:', error);
    throw new Error(`Failed to process text: ${error.message}`);
  }
}

export async function processUrl(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      throw new Error('Could not extract content from URL');
    }
    
    const chunks = await textSplitter.splitText(article.textContent);
    return chunks.map((chunk, index) => new Document({
      pageContent: chunk,
      metadata: {
        source: url,
        type: 'url',
        title: article.title,
        chunk: index,
        totalChunks: chunks.length,
      },
    }));
  } catch (error) {
    console.error('Error processing URL:', error);
    throw new Error(`Failed to process URL: ${error.message}`);
  }
}
