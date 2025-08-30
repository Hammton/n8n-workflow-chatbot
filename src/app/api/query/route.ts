import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '/api/python';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 Proxying query request to backend:', `${BACKEND_URL}/query`);
    
    const response = await fetch(`${BACKEND_URL}/query`, {
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
        backend_url: BACKEND_URL
      },
      { status: 503 }
    );
  }
}