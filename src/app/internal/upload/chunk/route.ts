import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

export const dynamic = 'force-dynamic';

/**
 * Server-side proxy for multipart upload chunks.
 * Running under /internal/upload/chunk so it is NOT intercepted by next.config.mjs /api/:path* rewrites.
 * Eliminates browser CORS 403 Forbidden errors when uploading directly to Cloudflare R2 storage URLs.
 */
export async function PUT(request: NextRequest) {
  const targetUrl = request.headers.get('x-upload-url') || request.nextUrl.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'Missing target upload URL (x-upload-url header)' },
      { status: 400 }
    );
  }

  const contentType = request.headers.get('content-type') || 'application/octet-stream';

  try {
    const chunkBuffer = Buffer.from(await request.arrayBuffer());
    const parsedUrl = new URL(targetUrl);

    const result = await new Promise<{ status: number; etag: string }>((resolve, reject) => {
      const req = https.request(
        {
          hostname: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'PUT',
          headers: {
            'Content-Type': contentType,
            'Content-Length': chunkBuffer.length,
          },
        },
        (res) => {
          const rawEtag = res.headers['etag'] || '';
          const cleanEtag = String(rawEtag).replace(/^["']|["']$/g, '');
          res.resume(); // drain response
          resolve({ status: res.statusCode || 200, etag: cleanEtag });
        }
      );

      req.on('error', reject);
      req.write(chunkBuffer);
      req.end();
    });

    if (result.status >= 200 && result.status < 300) {
      return NextResponse.json({ etag: result.etag }, {
        status: 200,
        headers: {
          ETag: `"${result.etag}"`,
        },
      });
    }

    return NextResponse.json(
      { error: `Storage returned HTTP ${result.status}` },
      { status: result.status }
    );
  } catch (err: any) {
    console.error('Failed to proxy upload chunk:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to proxy upload chunk' },
      { status: 500 }
    );
  }
}
