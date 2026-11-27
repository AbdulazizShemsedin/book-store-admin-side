import { NextRequest, NextResponse } from 'next/server';
import { isAllowedUploadUrl } from '@/lib/upload/upload-security';

export const dynamic = 'force-dynamic';

/**
 * Server-side streaming proxy for book manuscripts (EPUB & PDF).
 * Running under /internal/read/book so it is NOT intercepted by next.config.mjs /api/:path* rewrites.
 * Eliminates browser CORS blocks when streaming files from Cloudflare R2 / S3 storage buckets.
 */
export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'Missing target url parameter' },
      { status: 400 }
    );
  }

  // 1. Defend against Server-Side Request Forgery (SSRF)
  if (!isAllowedUploadUrl(targetUrl)) {
    return NextResponse.json(
      { error: 'Forbidden: Target host is not authorized for reading proxy' },
      { status: 403 }
    );
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'TEWBA-Admin-Reader-Proxy/1.0',
      },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: `Upstream storage responded with HTTP ${upstreamRes.status} (${upstreamRes.statusText})` },
        { status: upstreamRes.status }
      );
    }

    const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstreamRes.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    // Allow browser fetch from any origin on Vercel preview/production
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

    // Stream the binary response body directly to the client
    return new Response(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to stream asset from storage' },
      { status: 502 }
    );
  }
}
