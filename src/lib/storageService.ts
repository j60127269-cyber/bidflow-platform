import { supabase } from './supabase';

const BUCKET_NAME = 'bid-attachments';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
];

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  path: string;
}

export class StorageService {
  static async uploadFile(file: File, contractId: string): Promise<UploadedFile> {
    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error('File type not allowed. Please upload PDF, Word, Excel, PowerPoint, or image files.');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${contractId}/${timestamp}_${file.name}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return {
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        path: fileName
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  }

  static async getFileUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  }
}
