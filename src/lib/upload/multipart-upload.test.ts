import { describe, it, expect } from 'vitest';
import { getValidContentType, resolveFileIdFromUpload } from './multipart-upload';

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
