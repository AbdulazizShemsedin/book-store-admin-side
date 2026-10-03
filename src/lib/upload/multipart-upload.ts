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
 * Orchestrates direct browser-to-storage multipart uploads using the TEWBA upload contract:
 * 1. POST /admin/api/upload/init
 * 2. POST /admin/api/upload/get-part (per 5MB chunk)
 * 3. Direct browser PUT to presigned URL
 * 4. POST /admin/api/upload/complete
 */
export async function uploadFileDirectMultipart(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const contentType = getValidContentType(file);
  const totalParts = Math.max(1, Math.ceil(file.size / PART_SIZE_BYTES));

  // 1. Initialize upload session
  const initResponse = await apiClient.post<InitBookUploadResponseBody>(
    '/admin/api/upload/init',
    {
      content_type: contentType,
      expected_parts: totalParts,
    } as InitBookUploadRequestBody,
    { signal: options.signal }
  );

  const { key, upload_id, session_id } = initResponse;
  const activeSessionId = session_id || upload_id;
  const completedParts: Part[] = [];

  // 2. Upload parts sequentially with progress tracking
  for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    if (options.signal?.aborted) {
      throw new Error('Upload aborted by user');
    }

    const start = (partNumber - 1) * PART_SIZE_BYTES;
    const end = Math.min(start + PART_SIZE_BYTES, file.size);
    const chunk = file.slice(start, end);

    // Get presigned URL for this part
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

  // 3. Complete multipart upload
  await apiClient.post(
    '/admin/api/upload/complete',
    {
      session_id: activeSessionId,
      parts: completedParts,
    } as CompleteBookUploadRequestBody,
    { signal: options.signal }
  );

  // 4. Resolve file_id (Centralized isolation boundary for backend gap)
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
 * Backend gap isolation boundary:
 * The current OpenAPI does not specify where file_id is generated after upload completion.
 * When the backend adds an explicit file_id response in complete upload,
 * map it here without changing UI or calling components.
 */
export function resolveFileIdFromUpload(sessionId: string, _key: string): string {
  // If sessionId is already a valid UUID, return it directly;
  // otherwise format or use backend session reference.
  return sessionId;
}
