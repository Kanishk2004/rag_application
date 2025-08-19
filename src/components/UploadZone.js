'use client';

import { useState } from 'react';

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('file');
  const [uploadedSources, setUploadedSources] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files) => {
    setIsUploading(true);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'file');

      try {
        const response = await fetch('/api/ingest', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setUploadedSources(prev => [...prev, {
            name: file.name,
            type: file.type,
            size: file.size,
            chunks: result.chunks
          }]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    setIsUploading(false);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    
    setIsUploading(true);
    
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'text',
          content: textInput,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedSources(prev => [...prev, {
          name: 'Pasted Text',
          type: 'text/plain',
          size: textInput.length,
          chunks: result.chunks
        }]);
        setTextInput('');
      }
    } catch (error) {
      console.error('Error processing text:', error);
    }
    
    setIsUploading(false);
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    setIsUploading(true);
    
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'url',
          content: urlInput,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedSources(prev => [...prev, {
          name: new URL(urlInput).hostname,
          type: 'url',
          url: urlInput,
          chunks: result.chunks
        }]);
        setUrlInput('');
      }
    } catch (error) {
      console.error('Error processing URL:', error);
    }
    
    setIsUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            activeTab === 'file'
              ? 'bg-gray-600 text-white shadow-sm'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Upload Files
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            activeTab === 'text'
              ? 'bg-gray-600 text-white shadow-sm'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
            activeTab === 'url'
              ? 'bg-gray-600 text-white shadow-sm'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Website URL
        </button>
      </div>

      {/* File Upload Tab */}
      {activeTab === 'file' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-900/20'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-700 mb-3 sm:mb-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white mb-2">
            Drag and drop files here, or click to select
          </h3>
          <p className="text-xs text-gray-400 mb-3 sm:mb-4">
            Supports PDF, CSV, TXT, and Markdown files
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.csv,.txt,.md"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Select Files
          </label>
        </div>
      )}

      {/* Text Input Tab */}
      {activeTab === 'text' && (
        <div className="space-y-3 sm:space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your text content here..."
            className="w-full h-32 sm:h-40 px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isUploading}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isUploading ? 'Processing...' : 'Add Text'}
          </button>
        </div>
      )}

      {/* URL Input Tab */}
      {activeTab === 'url' && (
        <div className="space-y-3 sm:space-y-4">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim() || isUploading}
            className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isUploading ? 'Processing...' : 'Add URL'}
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isUploading && (
        <div className="flex items-center justify-center space-x-2 p-3 sm:p-4">
          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-xs sm:text-sm text-gray-400">Processing your content...</span>
        </div>
      )}

      {/* Uploaded Sources List */}
      {uploadedSources.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <h4 className="text-sm font-medium text-white">Uploaded Sources ({uploadedSources.length})</h4>
          <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
            {uploadedSources.map((source, index) => (
              <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-700 rounded-lg">
                <div className="flex-shrink-0">
                  {source.type === 'url' ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate">{source.name}</p>
                  <p className="text-xs text-gray-400">
                    {source.chunks} chunks • {source.type === 'url' ? 'Website' : formatFileSize(source.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
