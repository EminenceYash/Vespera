export async function GET(): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return Response.json({
    ok: true,
    aiConfigured: Boolean(apiKey && apiKey.length > 0),
  });
}
