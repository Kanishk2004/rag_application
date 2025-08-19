import Link from 'next/link';
import UploadZone from '../../components/UploadZone';
import Chat from '../../components/Chat';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">NotebookLM Mini</h1>
            <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs font-medium rounded-full">
              Beta
            </span>
          </div>
          <Link 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
          >
            ← <span className="hidden sm:inline">Back to </span>Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
          {/* Left Panel - Upload Zone */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden mb-4 lg:mb-0">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
                Upload Sources
              </h2>
              <p className="text-gray-400 text-sm">
                Add documents, paste text, or provide URLs to get started
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <UploadZone />
            </div>
          </div>

          {/* Right Panel - Chat */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
                Chat with your Sources
              </h2>
              <p className="text-gray-400 text-sm">
                Ask questions about your uploaded content
              </p>
            </div>
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}
