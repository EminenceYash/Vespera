import { runServerAnalysis } from '../lib/serverAnalyze.ts';

export async function POST(request: Request): Promise<Response> {
  let body: { text?: unknown } | null = null;
  try {
    body = (await request.json()) as { text?: unknown };
  } catch {
    return Response.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const rawText = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!rawText) {
    return Response.json({ error: 'Input text is required for analysis.' }, { status: 400 });
  }

  if (rawText.length > 20000) {
    return Response.json(
      { error: 'Input text exceeds the 20,000-character limit.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      {
        error: 'Server analysis key is not configured.',
        fallbackRecommended: true,
      },
      { status: 503 }
    );
  }

  try {
    const result = await runServerAnalysis(rawText, apiKey);
    return Response.json({
      engine: 'ai',
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server analysis request failed.';
    return Response.json(
      {
        error: message,
        fallbackRecommended: true,
      },
      { status: 502 }
    );
  }
}
