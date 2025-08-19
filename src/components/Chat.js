'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chat() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage = { role: 'user', content: input };
		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setIsLoading(true);

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: input,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			// Handle streaming response
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let assistantMessage = { role: 'assistant', content: '' };

			setMessages((prev) => [...prev, assistantMessage]);

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6);
						if (data === '[DONE]') {
							setIsLoading(false);
							return;
						}

						try {
							const parsed = JSON.parse(data);
							if (parsed.content) {
								assistantMessage.content += parsed.content;
								setMessages((prev) => {
									const newMessages = [...prev];
									newMessages[newMessages.length - 1] = { ...assistantMessage };
									return newMessages;
								});
							}
						} catch (e) {
							// Ignore parsing errors for partial chunks
						}
					}
				}
			}
		} catch (error) {
			console.error('Error sending message:', error);
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content:
						'Sorry, I encountered an error while processing your question. Please try again.',
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const clearChat = () => {
		setMessages([]);
	};

	const handleSummarize = async () => {
		setIsLoading(true);

		try {
			const response = await fetch('/api/summarize', {
				method: 'POST',
			});

			if (!response.ok) {
				throw new Error('Failed to get summary');
			}

			const result = await response.json();
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: result.summary,
				},
			]);
		} catch (error) {
			console.error('Error getting summary:', error);
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content:
						'Sorry, I encountered an error while generating the summary. Please try again.',
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-[calc(100vh-200px)] sm:h-[calc(100vh-240px)] lg:h-[calc(100vh-280px)]">
			{/* Chat Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-700 bg-gray-750">
				<div className="flex items-center space-x-2 mb-2 sm:mb-0">
					<div className="w-2 h-2 bg-green-500 rounded-full"></div>
					<span className="text-xs sm:text-sm font-medium text-gray-300">
						Ready to chat
					</span>
				</div>
				<div className="flex space-x-2">
					<button
						onClick={handleSummarize}
						disabled={isLoading}
						className="px-2 py-1 sm:px-3 sm:py-1 text-xs font-medium text-blue-400 bg-blue-900/30 rounded-full hover:bg-blue-900/50 transition-colors disabled:opacity-50">
						Summarize All
					</button>
					<button
						onClick={clearChat}
						className="px-2 py-1 sm:px-3 sm:py-1 text-xs font-medium text-gray-400 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
						Clear Chat
					</button>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
				{messages.length === 0 ? (
					<div className="flex items-center justify-center h-full text-center px-4">
						<div>
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
								<svg
									className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<h3 className="text-base sm:text-lg font-medium text-white mb-2">
								Start a conversation
							</h3>
							<p className="text-gray-400 text-sm max-w-sm">
								Upload some sources and ask questions about them. I&apos;ll
								provide answers based on your content.
							</p>
							<div className="mt-4 sm:mt-6 space-y-2">
								<p className="text-xs text-gray-500">Try asking:</p>
								<div className="space-y-1 text-xs text-gray-400">
									<p>&ldquo;What are the main topics covered?&rdquo;</p>
									<p>&ldquo;Can you summarize this document?&rdquo;</p>
									<p>&ldquo;What insights can you extract?&rdquo;</p>
								</div>
							</div>
						</div>
					</div>
				) : (
					<>
						{messages.map((message, index) => (
							<div
								key={index}
								className={`flex ${
									message.role === 'user' ? 'justify-end' : 'justify-start'
								}`}>
								<div
									className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
										message.role === 'user'
											? 'bg-blue-600 text-white'
											: 'bg-gray-700 text-gray-100'
									}`}>
									{message.role === 'assistant' && (
										<div className="flex items-center space-x-2 mb-1">
											<div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
											<span className="text-xs font-medium text-gray-400">
												AI Assistant
											</span>
										</div>
									)}
									<div className="text-xs sm:text-sm whitespace-pre-wrap">
										{message.content}
									</div>
								</div>
							</div>
						))}
						{isLoading && (
							<div className="flex justify-start">
								<div className="bg-gray-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2 max-w-[85%] sm:max-w-[80%]">
									<div className="flex items-center space-x-2 mb-1">
										<div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
										<span className="text-xs font-medium text-gray-400">
											AI Assistant
										</span>
									</div>
									<div className="flex items-center space-x-1">
										<div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
										<div
											className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
											style={{ animationDelay: '0.1s' }}></div>
										<div
											className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
											style={{ animationDelay: '0.2s' }}></div>
									</div>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</>
				)}
			</div>

			{/* Input Form */}
			<div className="border-t border-gray-700 p-3 sm:p-4 bg-gray-800">
				<form onSubmit={handleSubmit} className="flex space-x-2">
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask a question about your sources..."
						disabled={isLoading}
						className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm"
					/>
					<button
						type="submit"
						disabled={!input.trim() || isLoading}
						className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
						{isLoading ? (
							<div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
						) : (
							<svg
								className="w-3 h-3 sm:w-4 sm:h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
								/>
							</svg>
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
