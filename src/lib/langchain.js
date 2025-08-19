import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import {
	RunnableSequence,
	RunnablePassthrough,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { searchSimilarDocuments } from './qdrant.js';

// Suppress token counting warnings
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

function suppressTokenWarnings() {
	console.warn = (...args) => {
		const message = args.join(' ');
		if (
			message.includes('Failed to calculate number of tokens') ||
			message.includes('falling back to approximate count')
		) {
			return; // Suppress token counting warnings
		}
		originalConsoleWarn(...args);
	};

	console.error = (...args) => {
		const message = args.join(' ');
		if (
			message.includes('Failed to calculate number of tokens') ||
			message.includes('falling back to approximate count') ||
			message.includes('ECONNRESET')
		) {
			return; // Suppress token counting errors
		}
		originalConsoleError(...args);
	};
}

// Apply suppression
suppressTokenWarnings();

// Initialize ChatOpenAI
const llm = new ChatOpenAI({
	openAIApiKey: process.env.OPENAI_API_KEY,
	modelName: 'gpt-4o-mini',
	temperature: 0.1,
	streaming: true,
	// Disable token counting to prevent network errors
	cache: false,
	maxRetries: 2,
	// Configure request timeout and retries
	timeout: 30000, // 30 seconds
	requestOptions: {
		// Disable automatic token counting
		headers: {
			'User-Agent': 'NotebookLM-Mini/1.0.0',
		},
	},
});

// RAG prompt template
const ragPrompt =
	PromptTemplate.fromTemplate(`You are a helpful AI assistant that answers questions based strictly on the provided context. 

Rules:
1. Only answer based on the information provided in the context below
2. If the context doesn't contain information to answer the question, respond with "I don't know based on the provided sources"
3. Be concise but comprehensive in your answers
4. When possible, mention which source the information comes from
5. Do not make up or infer information not present in the context

Context:
{context}

Question: {question}

Answer:`);

// Format documents for context
function formatDocuments(docs) {
	return docs
		.map((doc, index) => {
			const source = doc.metadata?.source || 'Unknown source';
			const type = doc.metadata?.type || 'document';
			return `Source ${index + 1} (${type}: ${source}):\n${doc.pageContent}\n`;
		})
		.join('\n---\n');
}

// Create the RAG chain
export function createRAGChain() {
	const chain = RunnableSequence.from([
		{
			context: async (input) => {
				const relevantDocs = await searchSimilarDocuments(input.question, 5);
				return formatDocuments(relevantDocs);
			},
			question: new RunnablePassthrough(),
		},
		ragPrompt,
		llm,
		new StringOutputParser(),
	]);

	return chain;
}

// Function to get answer with streaming
export async function getStreamingAnswer(question) {
	try {
		const chain = createRAGChain();
		const stream = await chain.stream({ question });
		return stream;
	} catch (error) {
		console.error('Error getting streaming answer:', error);
		throw error;
	}
}

// Function to get complete answer (non-streaming)
export async function getAnswer(question) {
	try {
		const chain = createRAGChain();
		const answer = await chain.invoke({ question });
		return answer;
	} catch (error) {
		console.error('Error getting answer:', error);
		throw error;
	}
}

// Function to summarize all sources
export async function generateSummary() {
	try {
		console.log('Starting summary generation...');

		// Get some representative documents (we'll search for a broad query)
		const docs = await searchSimilarDocuments(
			'summary main topics content',
			10
		);

		if (docs.length === 0) {
			return 'No sources have been uploaded yet. Please upload some documents first.';
		}

		console.log(`Found ${docs.length} documents for summarization`);

		const summaryPrompt =
			PromptTemplate.fromTemplate(`You are a helpful AI assistant. Please provide a comprehensive summary of the following sources.

Instructions:
1. Identify the main topics and themes across all sources
2. Highlight key insights and important information
3. Organize the summary in a clear, structured way
4. Mention the types of sources and their scope

Sources:
{context}

Please provide a comprehensive summary:`);

		const summaryChain = RunnableSequence.from([
			summaryPrompt,
			llm,
			new StringOutputParser(),
		]);

		const context = formatDocuments(docs);

		// Add retry logic for network issues
		let summary;
		let retries = 3;

		while (retries > 0) {
			try {
				console.log(`Generating summary (${4 - retries}/3 attempts)...`);
				summary = await summaryChain.invoke({ context });
				break;
			} catch (error) {
				retries--;
				if (
					error.message.includes('ECONNRESET') ||
					error.message.includes('fetch failed')
				) {
					console.log(`Network error, retrying... (${retries} attempts left)`);
					if (retries === 0) throw error;
					// Wait before retry
					await new Promise((resolve) => setTimeout(resolve, 2000));
				} else {
					throw error;
				}
			}
		}

		console.log('Summary generated successfully');
		return summary;
	} catch (error) {
		console.error('Error generating summary:', error);
		throw error;
	}
}
