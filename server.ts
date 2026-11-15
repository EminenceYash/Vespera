import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const VALID_SENTIMENTS = new Set(['Positive', 'Neutral', 'Negative', 'Mixed']);

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalizeSentimentLabel(value: unknown, score: number): 'Positive' | 'Neutral' | 'Negative' | 'Mixed' {
  if (typeof value === 'string' && VALID_SENTIMENTS.has(value)) {
    return value as 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  }
  if (score >= 20) return 'Positive';
  if (score <= -20) return 'Negative';
  return 'Neutral';
}

function splitFallbackSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+(?:[.!?]+|$)/g);
  if (!matches) return [text.trim()].filter(Boolean);
  return matches.map((s) => s.trim()).filter(Boolean);
}

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
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analyze the following text for sentiment, emotional tone, key aspects/entities, and sentence-level polarity. Preserve exact sentence boundaries from the input text.\n\nTEXT:\n"""\n${rawText}\n"""`,
        config: {
          systemInstruction:
            'You are a precision sentiment and text intelligence analyst. Output strictly calibrated JSON matching the schema. Keep summary to one crisp, executive sentence. Score ranges from -100 (strongly negative) to +100 (strongly positive). Confidence ranges from 0 to 100. Emotions must list the top 3 detected emotional tones (0-100 intensity). Aspects must capture 2 to 6 key topics or entities mentioned in the text with individual polarity scores (-100 to +100). Sentences must cover every sentence in the input text in order.',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: {
                type: Type.STRING,
                enum: ['Positive', 'Neutral', 'Negative', 'Mixed'],
                description: 'Overall verdict category.',
              },
              score: {
                type: Type.INTEGER,
                description: 'Overall sentiment polarity score from -100 to 100.',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'Model confidence percentage from 0 to 100.',
              },
              summary: {
                type: Type.STRING,
                description: 'One concise executive sentence summarizing tone and drivers.',
              },
              emotions: {
                type: Type.ARRAY,
                description: 'Top 3 emotional tones detected in the text.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                  },
                  required: ['label', 'score'],
                },
              },
              aspects: {
                type: Type.ARRAY,
                description: 'Key extracted topics, themes, or entities and their sentiment.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    sentiment: {
                      type: Type.STRING,
                      enum: ['Positive', 'Neutral', 'Negative', 'Mixed'],
                    },
                    score: { type: Type.INTEGER },
                  },
                  required: ['topic', 'sentiment', 'score'],
                },
              },
              sentences: {
                type: Type.ARRAY,
                description: 'Sentence-by-sentence polarity breakdown in original order.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    sentiment: {
                      type: Type.STRING,
                      enum: ['Positive', 'Neutral', 'Negative', 'Mixed'],
                    },
                    score: { type: Type.INTEGER },
                  },
                  required: ['text', 'sentiment', 'score'],
                },
              },
            },
            required: ['sentiment', 'score', 'confidence', 'summary', 'emotions', 'aspects', 'sentences'],
          },
        },
      });

      const rawJson = (response.text ?? '').trim();
      if (!rawJson) {
        throw new Error('Empty response received from analysis service.');
      }

      const parsed = JSON.parse(rawJson);
      const score = clamp(Number(parsed.score), -100, 100);
      const confidence = clamp(Number(parsed.confidence || 82), 1, 100);
      const sentiment = normalizeSentimentLabel(parsed.sentiment, score);

      const emotions = Array.isArray(parsed.emotions) && parsed.emotions.length > 0
        ? parsed.emotions.slice(0, 3).map((e: { label?: unknown; score?: unknown }) => ({
            label: typeof e.label === 'string' && e.label.trim() ? e.label.trim() : 'Composure',
            score: clamp(Number(e.score), 5, 100),
          }))
        : [{ label: 'Composure', score: 65 }];

      const aspects = Array.isArray(parsed.aspects)
        ? parsed.aspects.slice(0, 6).map((a: { topic?: unknown; sentiment?: unknown; score?: unknown }) => {
            const aspectScore = clamp(Number(a.score), -100, 100);
            return {
              topic: typeof a.topic === 'string' && a.topic.trim() ? a.topic.trim() : 'Overall Experience',
              sentiment: normalizeSentimentLabel(a.sentiment, aspectScore),
              score: aspectScore,
            };
          })
        : [];

      const fallbackSentences = splitFallbackSentences(rawText);
      const sentences =
        Array.isArray(parsed.sentences) && parsed.sentences.length > 0
          ? parsed.sentences
              .filter((s: { text?: unknown }) => typeof s.text === 'string' && s.text.trim().length > 0)
              .map((s: { text: string; sentiment?: unknown; score?: unknown }) => {
                const sScore = clamp(Number(s.score), -100, 100);
                return {
                  text: s.text.trim(),
                  sentiment: normalizeSentimentLabel(s.sentiment, sScore),
                  score: sScore,
                };
              })
          : fallbackSentences.map((sentenceText) => ({
              text: sentenceText,
              sentiment,
              score,
            }));

      const summary =
        typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
          ? parsed.summary.trim()
          : 'Tone analysis completed across all detected clauses and topics.';

      res.json({
        engine: 'ai',
        result: {
          sentiment,
          score,
          confidence,
          summary,
          emotions,
          aspects,
          sentences,
        },
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
