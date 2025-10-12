import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

export async function POST(request: NextRequest) {
  
  try {
    const { action } = await request.json();
    
    if (action === 'start') {
      const client = new AssemblyAI({
        apiKey: process.env.ASSEMBLYAI_API_KEY!,
      });

      // Create temporary token for browser use (max 10 minutes allowed)
      const token = await client.streaming.createTemporaryToken({
        expires_in_seconds: 600, // 10 minutes (maximum allowed)
      });

      
      return NextResponse.json({
        token: token,
        success: true
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error: any) {
    console.error('❌ AssemblyAI stream error:', error);
    return NextResponse.json(
      { error: 'Failed to create AssemblyAI session', details: error.message },
      { status: 500 }
    );
  }
}
