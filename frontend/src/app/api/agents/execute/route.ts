import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { projectId, planId } = await req.json();

    // Fire and forget to Python backend
    fetch('http://127.0.0.1:8000/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, planId }),
    }).catch(err => console.error("Agent Engine execution fetch failed:", err));

    return NextResponse.json({ success: true, message: 'Agent execution triggered' });
  } catch (error) {
    console.error('Error starting execution:', error);
    return NextResponse.json({ success: false, error: 'Failed to start execution' }, { status: 500 });
  }
}
