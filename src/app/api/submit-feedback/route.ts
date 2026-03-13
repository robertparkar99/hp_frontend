import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', JSON.stringify(body, null, 2));

    const response = await fetch('http://127.0.0.1:8000/api/evaluation?type=API&token=1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5&sub_institute_id=3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);
    const data = await response.json();
    console.log('Backend response data:', JSON.stringify(data, null, 2));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in submit-feedback API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}