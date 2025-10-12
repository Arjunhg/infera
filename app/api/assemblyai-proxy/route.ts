import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Placeholder endpoint - not currently in use
  return new Response(
    JSON.stringify({
      message: 'AssemblyAI proxy endpoint placeholder',
      status: 'not implemented'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}