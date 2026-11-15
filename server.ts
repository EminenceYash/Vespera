import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { runServerAnalysis } from './lib/serverAnalyze.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    });
  });

  app.post('/api/analyze', async (req, res) => {
    const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!rawText) {
      res.status(400).json({ error: 'Input text is required for analysis.' });
      return;
    }

    if (rawText.length > 20000) {
      res.status(400).json({ error: 'Input text exceeds the 20,000-character limit.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        error: 'Server analysis key is not configured.',
        fallbackRecommended: true,
      });
      return;
    }

    try {
      const result = await runServerAnalysis(rawText, apiKey);
      res.json({
        engine: 'ai',
        result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Server analysis request failed.';
      res.status(502).json({
        error: message,
        fallbackRecommended: true,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vespera server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start Vespera server:', err);
  process.exit(1);
});
