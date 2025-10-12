import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLanguage } = await request.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'Texts array is required' }, { status: 400 });
    }

    if (!targetLanguage) {
      return NextResponse.json({ error: 'Target language is required' }, { status: 400 });
    }

    // Call Murf Translation API
    const response = await fetch('https://api.murf.ai/v1/text/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.MURF_API_KEY!,
      },
      body: JSON.stringify({
        target_language: targetLanguage,
        texts: texts,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Murf Translation API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      translations: data.translations,
      metadata: data.metadata,
      success: true
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to translate text', details: error.message },
      { status: 500 }
    );
  }
}
