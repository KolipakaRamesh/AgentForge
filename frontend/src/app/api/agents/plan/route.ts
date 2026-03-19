import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { projectId, requirement } = await req.json();

    // Fire and forget to the Python backend to start planning
    // The Python backend is expected to be running on port 8000
    fetch('http://127.0.0.1:8000/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, requirement }),
    }).catch(err => console.error("Agent Engine fetch failed:", err));

    return NextResponse.json({ success: true, message: 'Agent planning triggered' });
  } catch (error) {
    console.error('Error starting agent planning:', error);
    return NextResponse.json({ success: false, error: 'Failed to start planning' }, { status: 500 });
  }
}
