import { apiClient } from '@/lib/api/client';
import {
  InitBookUploadRequestBody,
  InitBookUploadResponseBody,
  GetBookUploadPartURLRequestBody,
  GetBookUploadPartURLResponseBody,
  CompleteBookUploadRequestBody,
  Part,
} from '@/types/api';

const PART_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per part

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export interface UploadResult {
  fileId: string;
  key: string;
  uploadId: string;
  sessionId: string;
  fileName: string;
  fileSize: number;
}

/**
 * Validates allowed MIME types for TEWBA uploads.
 */
export function getValidContentType(file: File): InitBookUploadRequestBody['content_type'] {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type === 'application/epub+zip' || name.endsWith('.epub')) {
    return 'application/epub+zip';
  }
  if (type === 'audio/mpeg' || type === 'audio/mp3' || name.endsWith('.mp3')) {
    return 'audio/mpeg';
  }
  if (type === 'image/png' || name.endsWith('.png')) {
    return 'image/png';
  }
  if (type === 'image/jpeg' || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (type === 'image/webp' || name.endsWith('.webp')) {
    return 'image/webp';
  }

  throw new Error(
    `Unsupported file type "${file.type || name}". Allowed formats: EPUB, MP3, PNG, JPEG, WEBP.`
  );
}

/**
 * Shared chunk execution logic for all multipart uploads.
 */
async function executeUploadSession(
  file: File,
  contentType: string,
  totalParts: number,
  initResponse: { key: string; upload_id: string; session_id?: string },
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { key, upload_id, session_id } = initResponse;
  const activeSessionId = session_id || upload_id;
  const completedParts: Part[] = [];

  // Upload parts sequentially with progress tracking
  for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    if (options.signal?.aborted) {
      throw new Error('Upload aborted by user');
    }

    const start = (partNumber - 1) * PART_SIZE_BYTES;
    const end = Math.min(start + PART_SIZE_BYTES, file.size);
    const chunk = file.slice(start, end);

    // Get presigned URL for this part via POST /admin/api/upload/get-part
    const partUrlResponse = await apiClient.post<GetBookUploadPartURLResponseBody>(
      '/admin/api/upload/get-part',
      {
        key,
        upload_id,
        part_number: partNumber,
      } as GetBookUploadPartURLRequestBody,
      { signal: options.signal }
    );

    // Browser directly PUTs chunk to presigned storage URL
    const uploadChunkResponse = await fetch(partUrlResponse.url, {
      method: 'PUT',
      body: chunk,
      headers: {
        'Content-Type': contentType,
      },
      signal: options.signal,
    });

    if (!uploadChunkResponse.ok) {
      throw new Error(
        `Failed to upload part ${partNumber} of ${totalParts}: HTTP ${uploadChunkResponse.status}`
      );
    }

    // Extract ETag header (strip surrounding quotes if present)
    const rawEtag = uploadChunkResponse.headers.get('ETag') || `part-${partNumber}`;
    const cleanEtag = rawEtag.replace(/^["']|["']$/g, '');

    completedParts.push({
      part_number: partNumber,
      etag: cleanEtag,
    });

    // Notify progress
    if (options.onProgress) {
      const percent = Math.round((partNumber / totalParts) * 100);
      options.onProgress(percent);
    }
  }

  // Complete multipart upload via POST /admin/api/upload/complete
  await apiClient.post(
    '/admin/api/upload/complete',
    {
      session_id: activeSessionId,
      parts: completedParts,
    } as CompleteBookUploadRequestBody,
    { signal: options.signal }
  );

  const fileId = resolveFileIdFromUpload(activeSessionId, key);

  return {
    fileId,
    key,
    uploadId: upload_id,
    sessionId: activeSessionId,
    fileName: file.name,
    fileSize: file.size,
  };
}

/**
 * Uploads a book thumbnail using the documented OpenAPI sequence:
 * 1. POST /admin/api/book/{book_id}/thumbnail
 * 2. POST /admin/api/upload/get-part (per part)
 * 3. PUT chunks to storage URLs
 * 4. POST /admin/api/upload/complete
 */
export async function uploadBookThumbnail(
  bookId: string,
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const contentType = getValidContentType(file);
  const totalParts = Math.max(1, Math.ceil(file.size / PART_SIZE_BYTES));

  const initResponse = await apiClient.post<{ key: string; upload_id: string; session_id?: string }>(
    `/admin/api/book/${bookId}/thumbnail`,
    {
      name: file.name,
      content_type: contentType,
      expected_parts: totalParts,
    },
    { signal: options.signal }
  );

  return executeUploadSession(file, contentType, totalParts, initResponse, options);
}

/**
 * Uploads a book asset (manuscript EPUB or audiobook MP3) using the documented OpenAPI sequence:
 * 1. POST /admin/api/book/{book_id}/asset
 * 2. POST /admin/api/upload/get-part (per part)
 * 3. PUT chunks to storage URLs
 * 4. POST /admin/api/upload/complete
 */
export async function uploadBookAsset(
  bookId: string,
  assetType: 'book' | 'audio',
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const contentType = getValidContentType(file);
  const totalParts = Math.max(1, Math.ceil(file.size / PART_SIZE_BYTES));

  const initResponse = await apiClient.post<{ key: string; upload_id: string; session_id?: string }>(
    `/admin/api/book/${bookId}/asset`,
    {
      asset_type: assetType,
      name: file.name,
      content_type: contentType,
      expected_parts: totalParts,
    },
    { signal: options.signal }
  );

  return executeUploadSession(file, contentType, totalParts, initResponse, options);
}

/**
 * Orchestrates direct browser-to-storage multipart uploads.
 */
export async function uploadFileDirectMultipart(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const contentType = getValidContentType(file);
  const totalParts = Math.max(1, Math.ceil(file.size / PART_SIZE_BYTES));

  try {
    const initResponse = await apiClient.post<{ key: string; upload_id: string; session_id?: string }>(
      '/admin/api/upload/init',
      {
        content_type: contentType,
        expected_parts: totalParts,
      },
      { signal: options.signal }
    );

    return executeUploadSession(file, contentType, totalParts, initResponse, options);
  } catch (err) {
    throw new Error(
      `Direct upload failed: Standalone /admin/api/upload/init is not provided by backend. ` +
      `Uploads must be attached to an existing book via /admin/api/book/{book_id}/thumbnail or /admin/api/book/{book_id}/asset.`
    );
  }
}

/**
 * Backend gap isolation boundary:
 * Resolves file_id from session and key.
 */
export function resolveFileIdFromUpload(sessionId: string, _key: string): string {
  return sessionId;
}

