'use client';

import React, { useState } from 'react';

export default function UploadDocumentPage() {
  const [documentType, setDocumentType] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title || !documentType) {
      setMessage('All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('title', title);
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Document uploaded successfully!');
        setDocumentType('');
        setTitle('');
        setFile(null);
      } else {
        setMessage(data.error || 'Upload failed.');
      }
    } catch (err) {
      setMessage('❌ Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-xl rounded-xl mt-10 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Document</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

          {/* Document Type */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              className="h-[44px] w-full px-4 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Select</option>
              <option value="Resume">Resume</option>
              <option value="Certificate">Certificate</option>
              <option value="License">License</option>
            </select>
          </div>

          {/* Document Title */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Document Title</label>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-[44px] w-full px-4 rounded-md border border-gray-300 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* File Upload */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="h-[44px] w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <p className="text-center text-sm text-gray-600">{message}</p>
        )}
      </form>
    </div>
  );
}
