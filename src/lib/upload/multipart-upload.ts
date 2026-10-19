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

    // Upload chunk via Next.js proxy in browser to eliminate Cloudflare R2 CORS 403 Forbidden errors
    // Wrapped in an automatic 3-attempt retry loop with exponential backoff for network resilience
    const MAX_CHUNK_RETRIES = 3;
    let attempt = 0;
    let uploadChunkResponse: Response | null = null;
    let lastError: Error | null = null;

    while (attempt < MAX_CHUNK_RETRIES) {
      if (options.signal?.aborted) {
        throw new Error('Upload aborted by user');
      }

      try {
        if (typeof window !== 'undefined') {
          uploadChunkResponse = await fetch('/internal/upload/chunk', {
            method: 'PUT',
            body: chunk,
            headers: {
              'Content-Type': contentType,
              'x-upload-url': partUrlResponse.url,
            },
            signal: options.signal,
          });
        } else {
          uploadChunkResponse = await fetch(partUrlResponse.url, {
            method: 'PUT',
            body: chunk,
            headers: {
              'Content-Type': contentType,
            },
            signal: options.signal,
          });
        }

        if (uploadChunkResponse.ok) {
          break; // Chunk upload succeeded!
        }

        // If client error (4xx other than 429), fail immediately without retrying
        if (uploadChunkResponse.status < 500 && uploadChunkResponse.status !== 429) {
          throw new Error(
            `Failed to upload part ${partNumber} of ${totalParts}: HTTP ${uploadChunkResponse.status}`
          );
        }

        lastError = new Error(
          `Chunk ${partNumber} received HTTP ${uploadChunkResponse.status}`
        );
      } catch (err: unknown) {
        if (options.signal?.aborted) {
          throw new Error('Upload aborted by user');
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }

      attempt++;
      if (attempt < MAX_CHUNK_RETRIES) {
        // Exponential backoff: ~800ms, ~1600ms + random jitter
        const delay = Math.pow(2, attempt) * 400 + Math.random() * 200;
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    if (!uploadChunkResponse || !uploadChunkResponse.ok) {
      throw (
        lastError ||
        new Error(
          `Failed to upload part ${partNumber} of ${totalParts} after ${MAX_CHUNK_RETRIES} attempts`
        )
      );
    }

    // Prefer the proxy's JSON body: intermediaries (e.g. Cloudflare compression) rewrite
    // the ETag header into a weak validator (W/"..."), which S3 rejects as InvalidPart.
    let rawEtag: string | null = null;
    try {
      const bodyJson = await uploadChunkResponse.clone().json();
      if (typeof bodyJson?.etag === 'string') rawEtag = bodyJson.etag;
    } catch {
      // not the proxy (direct S3 PUT), fall back to the header
    }
    rawEtag = rawEtag || uploadChunkResponse.headers.get('ETag');

    const cleanEtag = (rawEtag || '').replace(/^W\//, '').replace(/^["']|["']$/g, '');
    if (!cleanEtag) {
      throw new Error(`Storage did not return an ETag for part ${partNumber} of ${totalParts}`);
    }

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

