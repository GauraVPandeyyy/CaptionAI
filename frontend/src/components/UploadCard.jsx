import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function UploadCard({ onUpload, loading, fileInputRef }) {
  const [dragOver, setDragOver] = useState(false);

  function handleFile(e) {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (file && onUpload) onUpload(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0] ? e.dataTransfer.files[0] : null;
    if (file && onUpload) onUpload(file);
  }

  return (
    <motion.div whileHover={{ scale: 1.01 }} className="rounded-xl p-6 border bg-white shadow">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-4 p-6 rounded-lg border-2 border-dashed ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'}`}
      >
        <svg className="w-12 h-12 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 10l5-5 5 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 5v12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>

        <div className="text-center">
          <div className="text-lg font-medium">Drag & drop image or</div>
          <div className="text-sm text-gray-500">PNG, JPG, JPEG — max 5MB</div>
        </div>

        <div className="flex gap-2">
          <label className="px-4 py-2 bg-white border rounded-md cursor-pointer text-sm">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {loading ? 'Processing...' : 'Choose Photo'}
          </label>

          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
            onClick={() => { if (fileInputRef && fileInputRef.current) fileInputRef.current.click(); }}
            disabled={loading}
          >Upload</button>
        </div>

      </div>
    </motion.div>
  );
}
