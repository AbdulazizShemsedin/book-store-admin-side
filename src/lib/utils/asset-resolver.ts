/**
 * Utility to resolve and inspect book asset URLs and formats.
 */

export function resolveAssetUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  const trimmed = pathOrUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tewba.et';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
}

export function getAssetFormat(
  pathOrUrl: string | null | undefined
): 'epub' | 'pdf' | 'audio' | 'image' | 'unknown' {
  if (!pathOrUrl) return 'unknown';
  const clean = pathOrUrl.split('?')[0].toLowerCase();
  if (clean.endsWith('.pdf')) return 'pdf';
  if (clean.endsWith('.epub')) return 'epub';
  if (
    clean.endsWith('.mp3') ||
    clean.endsWith('.m4a') ||
    clean.endsWith('.aac') ||
    clean.endsWith('.ogg')
  ) {
    return 'audio';
  }
  if (
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.png') ||
    clean.endsWith('.webp')
  ) {
    return 'image';
  }
  return 'unknown';
}
