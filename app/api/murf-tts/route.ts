import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = 'en-US-terrell' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }


    // Use the streaming endpoint with proper authentication
    const response = await fetch('https://api.murf.ai/v1/speech/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.MURF_API_KEY!,
      },
      body: JSON.stringify({
        text: text,
        voiceId: voiceId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Murf API request failed: ${response.status} - ${errorText}`);
    }

    // Since this is a streaming response, we need to handle it as a blob
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    return NextResponse.json({
      audioData: base64Audio,
      audioFormat: 'wav',
      success: true
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    );
  }
}