import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function middleware(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  const response = NextResponse.next();
  const headers = corsHeaders(request);
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};



