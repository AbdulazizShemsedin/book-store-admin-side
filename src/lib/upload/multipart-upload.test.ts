import { describe, it, expect } from 'vitest';
import { getValidContentType, resolveFileIdFromUpload } from './multipart-upload';
import { isAllowedUploadUrl } from './upload-security';

describe('multipart-upload utilities', () => {
  it('detects and validates EPUB content type', () => {
    const file = new File(['mock content'], 'tewba_book.epub', {
      type: 'application/epub+zip',
    });
    expect(getValidContentType(file)).toBe('application/epub+zip');
  });

  it('detects and validates MP3 audiobook content type', () => {
    const file = new File(['mock audio'], 'narration.mp3', {
      type: 'audio/mpeg',
    });
    expect(getValidContentType(file)).toBe('audio/mpeg');
  });

  it('detects image formats (PNG, JPEG, WEBP)', () => {
    const png = new File(['img'], 'cover.png', { type: 'image/png' });
    const jpg = new File(['img'], 'cover.jpg', { type: 'image/jpeg' });
    const webp = new File(['img'], 'cover.webp', { type: 'image/webp' });

    expect(getValidContentType(png)).toBe('image/png');
    expect(getValidContentType(jpg)).toBe('image/jpeg');
    expect(getValidContentType(webp)).toBe('image/webp');
  });

  it('throws an error for unsupported file types', () => {
    const exe = new File(['bad'], 'script.exe', { type: 'application/x-msdownload' });
    expect(() => getValidContentType(exe)).toThrow(/Unsupported file type/);
  });

  it('resolves file_id cleanly at backend gap boundary', () => {
    const resolved = resolveFileIdFromUpload('sess-uuid-999', 'storage-key-1');
    expect(resolved).toBe('sess-uuid-999');
  });
});

describe('SSRF Protection (isAllowedUploadUrl)', () => {
  it('permits authorized Cloudflare R2 presigned URLs', () => {
    expect(
      isAllowedUploadUrl('https://abc123xyz.r2.cloudflarestorage.com/tewba/books/part1?uploadId=1')
    ).toBe(true);
    expect(isAllowedUploadUrl('https://r2.cloudflarestorage.com/tewba/asset')).toBe(true);
  });

  it('permits authorized official TEWBA storage domains', () => {
    expect(isAllowedUploadUrl('https://storage.tewba.et/books/upload')).toBe(true);
    expect(isAllowedUploadUrl('https://tewba.et/assets/part')).toBe(true);
  });

  it('rejects unencrypted HTTP protocol', () => {
    expect(isAllowedUploadUrl('http://abc.r2.cloudflarestorage.com/tewba')).toBe(false);
  });

  it('rejects loopback and localhost addresses', () => {
    expect(isAllowedUploadUrl('https://localhost:8000/internal')).toBe(false);
    expect(isAllowedUploadUrl('https://127.0.0.1/admin')).toBe(false);
    expect(isAllowedUploadUrl('https://127.0.0.1:443/')).toBe(false);
  });

  it('rejects cloud instance metadata (169.254.169.254)', () => {
    expect(isAllowedUploadUrl('https://169.254.169.254/latest/meta-data')).toBe(false);
  });

  it('rejects private internal RFC1918 subnets', () => {
    expect(isAllowedUploadUrl('https://10.0.0.1/internal')).toBe(false);
    expect(isAllowedUploadUrl('https://192.168.1.1/secret')).toBe(false);
    expect(isAllowedUploadUrl('https://172.16.0.5/api')).toBe(false);
  });

  it('rejects unauthorized external hostnames', () => {
    expect(isAllowedUploadUrl('https://attacker-c2.com/exfil')).toBe(false);
    expect(isAllowedUploadUrl('https://evil-storage.com')).toBe(false);
    expect(isAllowedUploadUrl('not-a-valid-url')).toBe(false);
  });
});
