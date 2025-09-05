import { StorageService } from './storageService';

export interface DisplayFile {
  name: string;
  url: string;
  size: number;
  type: string;
  path: string;
}

export function parseBidAttachments(attachments: any[]): DisplayFile[] {
  if (!attachments || !Array.isArray(attachments)) {
    return [];
  }

  return attachments.map(attachment => {
    // If it's already a proper object
    if (typeof attachment === 'object' && attachment.name && attachment.url) {
      return {
        name: attachment.name,
        url: attachment.url,
        size: attachment.size || 0,
        type: attachment.type || 'application/octet-stream',
        path: attachment.path || ''
      };
    }

    // If it's a string, it may be a JSON-encoded object OR a plain URL/path.
    if (typeof attachment === 'string') {
      try {
        const parsed = JSON.parse(attachment);
        return {
          name: parsed.name || 'Unknown file',
          url: parsed.url || '',
          size: parsed.size || 0,
          type: parsed.type || 'application/octet-stream',
          path: parsed.path || ''
        };
      } catch (error) {
        // Treat the raw string as the URL; use the filename for the label
        const filename = attachment.split('/').pop() || 'Unknown file';
        return {
          name: filename,
          url: attachment,
          size: 0,
          type: 'application/octet-stream',
          path: attachment
        };
      }
    }

    // Fallback
    return {
      name: 'Unknown file',
      url: '',
      size: 0,
      type: 'application/octet-stream',
      path: ''
    };
  });
}

export function getFileDisplayName(file: DisplayFile): string {
  return file.name || file.path.split('/').pop() || 'Unknown file';
}

export function getFileDownloadUrl(file: DisplayFile): string {
  if (file.url) {
    return file.url;
  }
  
  // If we only have a path, construct the URL
  if (file.path) {
    // This would need to be updated with your actual Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucketName = 'bid-attachments';
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${file.path}`;
  }
  
  return '';
}
