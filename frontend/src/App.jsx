import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Copy, 
  Trash2, 
  Sparkles, 
  History, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const API_URL = 'http://localhost:3000' || '';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  async function handleUpload(file) {
    setError(null);
    setSuccess(null);
    setCaption('');
    setImageUrl(null);
    setCopied(false);

    if (!file) {
      setError('Please select an image file');
      return;
    }

    const maxSizeMB = 5;
    if (file.size / 1024 / 1024 > maxSizeMB) {
      setError(`File size too large. Maximum ${maxSizeMB} MB allowed.`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      // Optimistic preview
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);

      const response = await axios.post(`${API_URL}/api/post`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 80000,
      });

      const data = response.data;
      const postData = data.post;
      
      if (data && postData && postData.caption) {
        setCaption(postData.caption);
        setSuccess('Caption generated successfully!');
        setHistory(h => [
          { 
            image: localUrl, 
            caption: postData.caption, 
            ts: Date.now(),
            id: postData._id 
          }, 
          ...h
        ].slice(0, 8));
      } else {
        throw new Error('No caption returned from server');
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err?.response?.data?.message || 
        err?.message || 
        'Failed to generate caption. Please try again.'
      );
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  }

  const handleCopyCaption = async () => {
    if (caption) {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setSuccess('History cleared');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12"
        >
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CaptionAI
              </h1>
            </div>
            <p className="text-gray-600 max-w-md">
              Upload any image and let AI generate creative, engaging captions automatically.
            </p>
          </div>
          
          <div className="flex gap-3 items-center">
            <button 
              onClick={clearHistory}
              disabled={history.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                    Upload Your Image
                  </h2>
                  <p className="text-gray-600">
                    Supported formats: JPG, PNG, WEBP • Max 5MB
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleUpload(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-purple-100 rounded-full">
                      <Upload className="w-8 h-8 text-purple-600" />
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700 mb-1">
                        Drop your image here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        AI will analyze your image and generate the perfect caption
                      </p>
                    </div>
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                    >
                      Choose File
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Results Card */}
            <AnimatePresence>
              {(imageUrl || error) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* Status Messages */}
                  <div className="px-6 md:px-8 pt-6 md:pt-8">
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 p-4 mb-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <p className="text-red-700 text-sm">{error}</p>
                        </motion.div>
                      )}
                      
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 p-4 mb-4 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <p className="text-green-700 text-sm">{success}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Preview and Caption */}
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                      {/* Image Preview */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img 
                            src={imageUrl} 
                            alt="Upload preview" 
                            className="w-full md:w-64 h-48 md:h-64 rounded-xl object-cover shadow-md"
                          />
                          {loading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Caption Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            AI Generated Caption
                          </h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {loading ? 'Generating...' : 'Ready'}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="relative">
                            <textarea 
                              value={caption}
                              readOnly
                              rows={4}
                              className="w-full p-4 rounded-xl border border-gray-300 resize-none text-gray-700 bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                              placeholder={loading ? "AI is crafting your perfect caption..." : "Your caption will appear here..."}
                            />
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={handleCopyCaption}
                              disabled={!caption || copied}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied ? 'Copied!' : 'Copy Caption'}
                            </button>

                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                              <ImageIcon className="w-4 h-4" />
                              New Image
                            </button>
                          </div>

                          {caption && (
                            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                              💡 <strong>Pro tip:</strong> Use this caption on social media for better engagement. The AI considers visual elements and context to create relevant captions.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-800">Recent Captions</h3>
                {history.length > 0 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full font-medium">
                    {history.length}
                  </span>
                )}
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <History className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Your generated captions will appear here
                    </p>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div
                      key={item.id || item.ts}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 bg-gray-50 hover:bg-purple-50 transition-all group"
                    >
                      <img 
                        src={item.image} 
                        alt="Recent upload" 
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900">
                          {item.caption}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(item.ts).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <button
                            onClick={() => navigator.clipboard.writeText(item.caption)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded transition-all"
                            title="Copy caption"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}