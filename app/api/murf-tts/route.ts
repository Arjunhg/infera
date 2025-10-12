import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    const voiceId = 'en-US-terrell'

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('🎤 Generating Murf streaming TTS for text:', text.substring(0, 50) + '...');
    console.log('🔑 Murf API Key exists:', !!process.env.MURF_API_KEY);
    console.log('🎵 Using voice:', voiceId);

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
      console.error('Murf API error:', response.status, errorText);
      throw new Error(`Murf API request failed: ${response.status} - ${errorText}`);
    }

    // Since this is a streaming response, we need to handle it as a blob
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    console.log('✅ Murf TTS generated successfully, audio size:', audioBuffer.byteLength, 'bytes');
    
    return NextResponse.json({
      audioData: base64Audio,
      audioFormat: 'wav',
      success: true
    });
  } catch (error: any) {
    console.error('Murf TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    );
  }
}