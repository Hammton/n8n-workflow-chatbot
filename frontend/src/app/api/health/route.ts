import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    console.log('🔄 Proxying health check to backend:', `${BACKEND_URL}/health`);
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable caching for health checks
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('❌ Backend health check failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Backend health check successful:', data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('❌ Proxy health check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to backend server',
        details: error instanceof Error ? error.message : 'Unknown error',
        backend_url: BACKEND_URL
      },
      { status: 503 }
    );
  }
}