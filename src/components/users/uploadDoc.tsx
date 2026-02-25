'use client';

import React, { useEffect, useState } from 'react';
import { Download } from "lucide-react";


interface UploadDocType {
  id: number;
  document_type: string;
}

interface SessionDataType {
  subInstituteId?: string;
  userId?: string;
  token?: string;
  url?: string;
}

interface UploadedEntry {
  document_type: string;
  document_title: string;
  filename: string;
}

interface ExistingDoc {
  document_type_id: number;
  document_title: string;
  document_name: string;
}

interface UploadDocProps {
  uploadDoc: UploadDocType[];
  sessionData: SessionDataType;
  clickedID: string;
  documentLists: any[];
}

const UploadDocumentPage: React.FC<UploadDocProps> = ({ uploadDoc, sessionData, clickedID, documentLists }) => {
  // console.log('documentLists',documentLists);
  const [documentType, setDocumentType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedEntry[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);

  useEffect(() => {
    const fetchExistingDocs = async () => {
      try {
        setLoadingDocs(true);
        const res = await fetch(`${sessionData.url}/user/get_user_documents/${clickedID}`, {
          headers: {
            'Authorization': `Bearer ${sessionData.token}`,
          },
        });

        const data = await res.json();
        console.log("📥 Existing documents response:", data);

        if (res.ok && Array.isArray(data.data)) {
          const formattedDocs: UploadedEntry[] = data.data.map((doc: ExistingDoc) => {
            const typeName = uploadDoc.find((d) => d.id === doc.document_type_id)?.document_type || 'Unknown';
            return {
              document_type: typeName,
              document_title: doc.document_title,
              filename: doc.document_name,
            };
          });

          setUploadedDocs(formattedDocs);
        } else {
          console.warn('⚠️ Unexpected response format:', data);
        }
      } catch (error) {
        console.error('❌ Error fetching documents:', error);
      } finally {
        setLoadingDocs(false);
      }
    };

    if (sessionData?.url && sessionData?.token && clickedID) {
      fetchExistingDocs();
    }
  }, [sessionData, clickedID, uploadDoc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title || !documentType) {
      setMessage('All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('type', 'API');
    formData.append('sub_institute_id', sessionData?.subInstituteId || '');
    formData.append('user_id', sessionData?.userId || '');
    formData.append('_token', sessionData?.token || '');
    formData.append('document_type_id', documentType);
    formData.append('document_title', title);
    formData.append('document', file);

    try {
      setUploading(true);
      const res = await fetch(`${sessionData.url}/user/user_document/${clickedID}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const docTypeName =
          uploadDoc.find((d) => String(d.id) === String(documentType))?.document_type || 'Unknown';

        setUploadedDocs((prev) => [
          ...prev,
          {
            document_type: docTypeName,
            document_title: title,
            filename: file.name,
          },
        ]);

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
    <div className="p-3 sm:p-4 md:p-6 w-full max-w-5xl mx-auto bg-white shadow-xl rounded-xl mt-4 sm:mt-6 md:mt-10 border border-gray-200" id="upload-doc-container">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Upload Document</h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 items-end" id="upload-form-fields">
          <div className="flex flex-col" id="doc-type-field">
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              className="h-10 sm:h-12 md:h-[44px] w-full px-3 sm:px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Select</option>
              {uploadDoc.map((type) => (
                <option key={type.id} value={String(type.id)}>
                  {type.document_type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col" id="doc-title-field">
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Document Title</label>
            <input
              type="text"
              id="doc-title-input"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 sm:h-12 md:h-[44px] w-full px-3 sm:px-4 rounded-md border border-gray-300 text-gray-700 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

         <div className="flex flex-col sm:col-span-2 md:col-span-1" id="doc-file-field">
      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">File</label>

      <div className="relative w-full" id="doc-file-input">
        {/* Icon inside input */}
        <Download className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 pointer-events-none" />

        <input
          type="file"
          required
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => console.log(e.target.files?.[0])}
          className="h-10 sm:h-12 md:h-[44px] w-full pl-9 sm:pl-10 px-3 sm:px-4 pt-2 sm:pt-3 rounded-md border border-gray-300 text-gray-700 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition file:hidden"
        />
      </div>

    </div>
        </div>

        <div className="flex justify-center pt-2" id="upload-submit-section">
          <button
            type="submit"
             id="upload-submit-btn"
            disabled={uploading}
            className="px-6 sm:px-8 py-2 rounded-full text-white text-sm sm:text-base font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>

        {message && <p className="text-center text-xs sm:text-sm text-gray-600">{message}</p>}
      </form>

      <div className="mt-6 sm:mt-8 md:mt-10" id="uploaded-docs-section" >
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4" id="docs-table-header">Uploaded Documents</h3>

        {loadingDocs ? (
          <p className="text-xs sm:text-sm text-gray-500">Loading documents...</p>
        ) : documentLists.length > 0 ? (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="min-w-full text-xs sm:text-sm text-left border border-gray-200 shadow-md rounded-md overflow-hidden">
              <thead className="bg-[#D1E7FF] text-black">
                <tr>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b">Document Type</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b">Title</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b">Filename</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {documentLists.map((doc: any, index: any) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b">{doc.document_type}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b">{doc.document_title}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b">
                      <a
                        href={`https://s3-triz.fra1.digitaloceanspaces.com/public/hp_staff_document/${doc.file_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {doc.document_title}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default UploadDocumentPage;
