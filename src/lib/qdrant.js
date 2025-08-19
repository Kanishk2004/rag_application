import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';

// Initialize embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: 'text-embedding-3-large',
});

// Initialize Qdrant vector store
let vectorStore = null;

export async function getVectorStore() {
  if (!vectorStore) {
    try {
      // Try to connect to existing collection first
      vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        collectionName: 'notebooklm_mini',
      });
    } catch (error) {
      console.log('Collection does not exist, creating new one...');
      // If collection doesn't exist, create a new vector store
      vectorStore = new QdrantVectorStore(embeddings, {
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        collectionName: 'notebooklm_mini',
      });
    }
  }
  return vectorStore;
}

export async function initializeVectorStore() {
  try {
    // Use getVectorStore which handles both cases
    return await getVectorStore();
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
}

export async function addDocuments(documents) {
  try {
    const store = await getVectorStore();
    await store.addDocuments(documents);
    return documents.length;
  } catch (error) {
    console.error('Error adding documents to vector store:', error);
    throw error;
  }
}

export async function searchSimilarDocuments(query, k = 5) {
  try {
    const store = await getVectorStore();
    const results = await store.similaritySearch(query, k);
    return results;
  } catch (error) {
    console.error('Error searching similar documents:', error);
    throw error;
  }
}
