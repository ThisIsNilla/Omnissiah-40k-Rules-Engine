import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function GET() {
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'Hello! Are you working?',
    });
    return new Response(JSON.stringify({ success: true, text }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message || String(error), stack: error.stack }), { status: 200 });
  }
}
