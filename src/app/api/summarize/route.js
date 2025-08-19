import { NextResponse } from 'next/server';
import { generateSummary } from '../../../lib/langchain.js';

export async function POST(request) {
	try {
		const summary = await generateSummary();

		return NextResponse.json({
			success: true,
			summary: summary,
		});
	} catch (error) {
		console.error('Error in summarize API:', error);
		return NextResponse.json(
			{ error: 'Failed to generate summary', details: error.message },
			{ status: 500 }
		);
	}
}
