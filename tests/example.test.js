// Example test file for the NotebookLM Mini Clone
// You can use this as a starting point for writing tests

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import UploadZone from '../src/components/UploadZone';
import Chat from '../src/components/Chat';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('UploadZone Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders upload tabs correctly', () => {
    render(<UploadZone />);
    
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('Enter Text')).toBeInTheDocument();
    expect(screen.getByText('From URL')).toBeInTheDocument();
  });

  test('handles file upload successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, chunks: 3 })
    });

    render(<UploadZone />);
    
    const fileInput = screen.getByRole('button', { name: /choose file/i });
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [testFile] } });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/ingest', expect.any(Object));
    });
  });

  test('handles text input submission', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, chunks: 1 })
    });

    render(<UploadZone />);
    
    // Switch to text tab
    fireEvent.click(screen.getByText('Enter Text'));
    
    const textArea = screen.getByPlaceholderText(/paste your text/i);
    const submitButton = screen.getByText('Process Text');
    
    fireEvent.change(textArea, { target: { value: 'Test content' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', content: 'Test content' })
      });
    });
  });
});

describe('Chat Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders chat interface correctly', () => {
    render(<Chat />);
    
    expect(screen.getByPlaceholderText(/ask about your documents/i)).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Summarize Documents')).toBeInTheDocument();
  });

  test('sends chat message', async () => {
    // Mock streaming response
    const mockReader = {
      read: jest.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"content": "Test response", "done": false}\n\n')
        })
        .mockResolvedValueOnce({
          done: true,
          value: new TextEncoder().encode('data: {"content": "", "done": true}\n\n')
        })
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      body: { getReader: () => mockReader }
    });

    render(<Chat />);
    
    const input = screen.getByPlaceholderText(/ask about your documents/i);
    const sendButton = screen.getByText('Send');
    
    fireEvent.change(input, { target: { value: 'What is this about?' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What is this about?' })
      });
    });
  });
});

describe('API Routes', () => {
  test('ingest endpoint processes text correctly', async () => {
    const req = {
      json: async () => ({ type: 'text', content: 'Test content' }),
      headers: new Map([['content-type', 'application/json']])
    };

    // Mock the API route function
    // This would require importing the actual API route handler
    // const { POST } = await import('../src/app/api/ingest/route.js');
    // const response = await POST(req);
    // const data = await response.json();
    
    // expect(data.success).toBe(true);
    // expect(data.chunks).toBeGreaterThan(0);
  });
});

// Integration tests
describe('Full Application Flow', () => {
  test('upload document and ask question flow', async () => {
    // Mock successful upload
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, chunks: 3 })
      })
      // Mock successful chat
      .mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"content": "Based on the document", "done": false}\n\n')
              })
              .mockResolvedValueOnce({
                done: true,
                value: new TextEncoder().encode('data: {"content": "", "done": true}\n\n')
              })
          })
        }
      });

    // This would test the full flow from upload to chat
    // render(<App />);
    // ... test upload
    // ... test chat
    // ... verify results
  });
});
