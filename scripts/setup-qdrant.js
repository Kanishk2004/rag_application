// Setup script to initialize Qdrant collection
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-3-large',
});

async function setupQdrant() {
  try {
    console.log('Setting up Qdrant vector store...');
    
    const vectorStore = new QdrantVectorStore(embeddings, {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      collectionName: 'notebooklm_mini',
    });

    // Add a dummy document to create the collection
    await vectorStore.addDocuments([
      {
        pageContent: 'This is a test document to initialize the collection.',
        metadata: { source: 'setup', type: 'test' }
      }
    ]);

    console.log('✅ Qdrant collection "notebooklm_mini" created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up Qdrant:', error);
    process.exit(1);
  }
}

setupQdrant();
