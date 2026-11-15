import { SEEDED_HISTORY } from '../data/presets';
import type { HistoryRecord } from '../types/sentiment';

const STORAGE_KEY = 'vespera_sentiment_history_v1';

export function loadHistory(): HistoryRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEEDED_HISTORY));
      return SEEDED_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as HistoryRecord[];
  } catch {
    return SEEDED_HISTORY;
  }
}

export function saveHistory(records: HistoryRecord[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota errors gracefully
  }
}
