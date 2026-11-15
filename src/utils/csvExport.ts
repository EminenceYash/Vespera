import type { HistoryRecord } from '../types/sentiment';

function escapeCsvField(value: string | number): string {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildRfc4180Csv(records: HistoryRecord[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'Input Text',
    'Sentiment',
    'Polarity Score',
    'Confidence',
    'Dominant Emotion',
    'Key Aspects',
    'Executive Summary',
  ];

  const rows = records.map((record) => {
    const dominantEmotion = record.emotions[0]
      ? `${record.emotions[0].label} (${record.emotions[0].score}%)`
      : 'None';
    const keyAspects = record.aspects
      .map((a) => `${a.topic}: ${a.score >= 0 ? `+${a.score}` : a.score}`)
      .join('; ');

    return [
      record.id,
      record.timestamp,
      record.inputText,
      record.sentiment,
      record.score,
      `${record.confidence}%`,
      dominantEmotion,
      keyAspects || 'General',
      record.summary,
    ]
      .map(escapeCsvField)
      .join(',');
  });

  return [headers.map(escapeCsvField).join(','), ...rows].join('\r\n');
}

export function downloadHistoryCsv(records: HistoryRecord[], filename = 'vespera-sentiment-history.csv'): void {
  if (records.length === 0) return;
  const csvContent = buildRfc4180Csv(records);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
