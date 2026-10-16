import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

/**
 * Server-side proxy for GET /admin/api/category.
 * The backend server specifically requires a request body ({}) with Content-Length header,
 * which browser fetch() cannot send on GET requests according to the WHATWG specification.
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization') || '';
  const cookie = request.headers.get('cookie') || '';
  const searchParams = request.nextUrl.searchParams.toString();
  const backendUrl = `https://tewba.et/admin/api/category${searchParams ? `?${searchParams}` : ''}`;

  try {
    const data = await new Promise<{ status: number; text: string }>((resolve, reject) => {
      const headers: Record<string, string | number> = {
        Accept: 'application/json',
        'User-Agent': 'TewbaAdmin/1.0',
      };
      if (cookie) headers['Cookie'] = cookie;
      if (token) headers['Authorization'] = token;

      const req = https.request(
        backendUrl,
        {
          method: 'GET',
          headers,
        },
        (res) => {
          let chunks = '';
          res.on('data', (c) => (chunks += c));
          res.on('end', () => resolve({ status: res.statusCode || 200, text: chunks }));
        }
      );
      req.on('error', reject);
      req.end();
    });

    const parsed = JSON.parse(data.text);
    return NextResponse.json(parsed, { status: data.status });
  } catch (err: any) {
    return NextResponse.json(
      { title: 'Internal Server Error', detail: err.message, status: 500 },
      { status: 500 }
    );
  }
}

/**
 * Forwards POST /admin/api/category to create a category on the live server.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization') || '';
  const cookie = request.headers.get('cookie') || '';
  const body = await request.json();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (cookie) headers['Cookie'] = cookie;
  if (token) headers['Authorization'] = token;

  const response = await fetch('https://tewba.et/admin/api/category', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    try {
      return NextResponse.json(JSON.parse(errorData), { status: response.status });
    } catch {
      return new NextResponse(errorData, { status: response.status });
    }
  }

  const responseText = await response.text();
  try {
    return NextResponse.json(JSON.parse(responseText), { status: response.status });
  } catch {
    return new NextResponse(responseText, { status: response.status });
  }
}
