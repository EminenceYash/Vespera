import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const VALID_SENTIMENTS = new Set(['Positive', 'Neutral', 'Negative', 'Mixed']);

const SYSTEM_INSTRUCTION =
  'You are a precision sentiment and text intelligence analyst. Output strictly calibrated JSON matching the schema. Keep summary to one crisp, executive sentence. Score ranges from -100 (strongly negative) to +100 (strongly positive). Confidence ranges from 0 to 100. Emotions must list the top 3 detected emotional tones (0-100 intensity). Aspects must capture 2 to 6 key topics or entities mentioned in the text with individual polarity scores (-100 to +100). Sentences must cover every sentence in the input text in order.';

const RESPONSE_SCHEMA = {
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
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalizeSentimentLabel(
  value: unknown,
  score: number
): 'Positive' | 'Neutral' | 'Negative' | 'Mixed' {
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

function isModelNotFoundError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /404|NOT_FOUND|not found|is not supported/i.test(msg);
}

export async function runServerAnalysis(rawText: string, apiKey: string) {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const contents = `Analyze the following text for sentiment, emotional tone, key aspects/entities, and sentence-level polarity. Preserve exact sentence boundaries from the input text.\n\nTEXT:\n"""\n${rawText}\n"""`;

  const primaryModel = process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';

  let response;
  try {
    response = await ai.models.generateContent({
      model: primaryModel,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: primaryModel.startsWith('gemini-4')
          ? { thinkingLevel: ThinkingLevel.LOW }
          : undefined,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });
  } catch (err) {
    // When deployed externally (e.g., Vercel with a public Google AI key),
    // retry with the public production model alias if the preview alias returns 404.
    if (primaryModel !== 'gemini-2.5-flash' && isModelNotFoundError(err)) {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      });
    } else {
      throw err;
    }
  }

  const rawJson = (response.text ?? '').trim();
  if (!rawJson) {
    throw new Error('Empty response received from analysis service.');
  }

  const parsed = JSON.parse(rawJson);
  const score = clamp(Number(parsed.score), -100, 100);
  const confidence = clamp(Number(parsed.confidence || 82), 1, 100);
  const sentiment = normalizeSentimentLabel(parsed.sentiment, score);

  const emotions =
    Array.isArray(parsed.emotions) && parsed.emotions.length > 0
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

  return {
    sentiment,
    score,
    confidence,
    summary,
    emotions,
    aspects,
    sentences,
  };
}
