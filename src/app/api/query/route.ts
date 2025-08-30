import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;
    const backendUrl = `${baseUrl}/api/python/query`;
    
    console.log('🔄 Proxying query request to backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('❌ Backend query failed:', response.status, response.statusText);
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Backend query successful');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Proxy query error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to backend server',
        details: error instanceof Error ? error.message : 'Unknown error',
        backend_url: `${new URL(request.url).origin}/api/python/query`
      },
      { status: 503 }
    );
  }
}