'use client'

import { useState, useCallback } from 'react';
import { Upload, X, Download, FileText, Loader2 } from 'lucide-react';
import { StorageService, UploadedFile } from '@/lib/storageService';

interface FileUploadProps {
  contractId: string;
  onFilesUploaded: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
  onFileDeleted?: (filePath: string) => void;
}

export default function FileUpload({ 
  contractId, 
  onFilesUploaded, 
  existingFiles = [],
  onFileDeleted 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    try {
      for (const file of files) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const uploadedFile = await StorageService.uploadFile(file, contractId);
        uploadedFiles.push(uploadedFile);
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      onFilesUploaded(uploadedFiles);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    try {
      await StorageService.deleteFile(filePath);
      onFileDeleted?.(filePath);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  const handleDownload = (file: UploadedFile) => {
    window.open(file.url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Drag and drop files here, or{' '}
            <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
              browse
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">
            Supported: PDF, Word, Excel, PowerPoint, Images (Max 10MB each)
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-gray-50 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{fileName}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{StorageService.getFileIcon(file.type)}</span>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {StorageService.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {onFileDeleted && (
                    <button
                      onClick={() => handleDeleteFile(file.path)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
