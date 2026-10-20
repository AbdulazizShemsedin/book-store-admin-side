// Allowed Cloudflare R2 and TEWBA storage host patterns
export const ALLOWED_STORAGE_DOMAINS = [
  'r2.cloudflarestorage.com',
  'storage.tewba.et',
  'tewba.et',
];

/**
 * Validates that an upload target URL points strictly to authorized
 * Cloudflare R2 / S3 storage endpoints over HTTPS and rejects internal/private IPs.
 */
export function isAllowedUploadUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);

    // 1. Must strictly use HTTPS
    if (url.protocol !== 'https:') {
      return false;
    }

    const host = url.hostname.toLowerCase();

    // 2. Reject localhost, private IP subnets, and cloud metadata (169.254.169.254)
    if (
      host === 'localhost' ||
      host.endsWith('.local') ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '169.254.169.254' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return false;
    }

    // 3. Must match whitelisted domains or subdomains (e.g. <account_id>.r2.cloudflarestorage.com)
    return ALLOWED_STORAGE_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}
