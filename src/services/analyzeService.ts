import type { AnalysisEngineUsed, AnalysisResult, EngineMode } from '../types/sentiment';
import { analyzeWithOfflineNlp } from '../utils/offlineNlp';

export interface OrchestratedAnalysis {
  result: AnalysisResult;
  engine: AnalysisEngineUsed;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

export async function checkServerHealth(): Promise<{ aiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { aiConfigured: false };
    const data = await res.json();
    return { aiConfigured: Boolean(data?.aiConfigured) };
  } catch {
    return { aiConfigured: false };
  }
}

export async function runHybridAnalysis(
  text: string,
  engineMode: EngineMode
): Promise<OrchestratedAnalysis> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Please enter or load text before analyzing.');
  }

  if (engineMode === 'offline') {
    return {
      result: analyzeWithOfflineNlp(trimmed),
      engine: 'offline',
      fallbackUsed: false,
    };
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: trimmed }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.result) {
      return {
        result: data.result as AnalysisResult,
        engine: 'ai',
        fallbackUsed: false,
      };
    }

    const reason =
      typeof data?.error === 'string' && data.error.trim()
        ? data.error.trim()
        : `Server returned status ${response.status}`;

    return {
      result: analyzeWithOfflineNlp(trimmed),
      engine: 'offline',
      fallbackUsed: true,
      fallbackReason: reason,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Network request unavailable';
    return {
      result: analyzeWithOfflineNlp(trimmed),
      engine: 'offline',
      fallbackUsed: true,
      fallbackReason: reason,
    };
  }
}

export interface BatchItemOutcome extends OrchestratedAnalysis {
  inputText: string;
}

export async function runBatchAnalysis(
  items: string[],
  engineMode: EngineMode,
  onProgress?: (completed: number, total: number) => void
): Promise<BatchItemOutcome[]> {
  const total = items.length;
  if (total === 0) return [];

  if (engineMode === 'offline') {
    const results: BatchItemOutcome[] = items.map((inputText, idx) => {
      onProgress?.(idx + 1, total);
      return {
        inputText,
        result: analyzeWithOfflineNlp(inputText),
        engine: 'offline',
        fallbackUsed: false,
      };
    });
    return results;
  }

  const outcomes: BatchItemOutcome[] = new Array(total);
  let nextIndex = 0;
  let completed = 0;
  const concurrency = Math.min(3, total);

  async function worker() {
    while (nextIndex < total) {
      const current = nextIndex++;
      const text = items[current];
      const analyzed = await runHybridAnalysis(text, engineMode);
      outcomes[current] = {
        inputText: text,
        ...analyzed,
      };
      completed++;
      onProgress?.(completed, total);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return outcomes;
}
