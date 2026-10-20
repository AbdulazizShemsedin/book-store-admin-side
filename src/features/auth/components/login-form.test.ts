import { describe, it, expect } from 'vitest';
import { getSafeReturnUrl } from './login-form';

describe('Open Redirect Protection (getSafeReturnUrl)', () => {
  it('allows valid relative paths', () => {
    expect(getSafeReturnUrl('/books')).toBe('/books');
    expect(getSafeReturnUrl('/books/123/edit')).toBe('/books/123/edit');
    expect(getSafeReturnUrl('/reports?period=month')).toBe('/reports?period=month');
    expect(getSafeReturnUrl('/dashboard')).toBe('/dashboard');
  });

  it('falls back to /dashboard for empty or null inputs', () => {
    expect(getSafeReturnUrl(null)).toBe('/dashboard');
    expect(getSafeReturnUrl('')).toBe('/dashboard');
    expect(getSafeReturnUrl('   ')).toBe('/dashboard');
  });

  it('rejects external absolute URLs', () => {
    expect(getSafeReturnUrl('https://evil-attacker.com')).toBe('/dashboard');
    expect(getSafeReturnUrl('http://phishing-site.org/login')).toBe('/dashboard');
    expect(getSafeReturnUrl('ftp://files.com')).toBe('/dashboard');
  });

  it('rejects protocol-relative URLs (//)', () => {
    expect(getSafeReturnUrl('//attacker.com')).toBe('/dashboard');
    expect(getSafeReturnUrl('//evil.com/path')).toBe('/dashboard');
  });

  it('rejects JavaScript and data schemes', () => {
    expect(getSafeReturnUrl('javascript:alert(document.cookie)')).toBe('/dashboard');
    expect(getSafeReturnUrl('data:text/html,<script>alert(1)</script>')).toBe('/dashboard');
  });

  it('rejects backslash directory traversal tricks', () => {
    expect(getSafeReturnUrl('\\\\attacker.com\\payload')).toBe('/dashboard');
    expect(getSafeReturnUrl('/\\attacker.com')).toBe('/dashboard');
  });
});
