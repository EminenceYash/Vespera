const MAX_BATCH_ITEMS = 25;

const PREFERRED_TEXT_HEADERS = new Set([
  'input text',
  'text',
  'review',
  'reviews',
  'feedback',
  'comment',
  'comments',
  'message',
  'body',
  'content',
  'description',
  'ticket',
  'transcript',
  'note',
  'notes',
  'verbatim',
]);

function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (ch === '\r' && next === '\n') {
      currentRow.push(currentField.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      currentRow.push(currentField.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += ch;
    }
  }

  currentRow.push(currentField.trim());
  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

function extractCsvEntries(content: string): string[] {
  const rows = parseCsvRows(content);
  if (rows.length === 0) return [];

  const firstRow = rows[0];
  let colIndex = firstRow.findIndex((cell) =>
    PREFERRED_TEXT_HEADERS.has(cell.toLowerCase().trim())
  );

  let startRow = 0;
  if (colIndex !== -1) {
    startRow = 1;
  } else {
    // Heuristic: pick the column with the largest average character length (excluding numeric/date-only columns)
    const sampleRows = rows.slice(0, Math.min(rows.length, 10));
    const colCount = Math.max(...sampleRows.map((r) => r.length));
    let bestScore = -1;
    let bestCol = 0;

    for (let c = 0; c < colCount; c++) {
      let totalLen = 0;
      let count = 0;
      for (let r = 0; r < sampleRows.length; r++) {
        const val = sampleRows[r][c] ?? '';
        if (!val) continue;
        // Penalize pure numbers or ISO dates
        if (/^[\d\s.,:%+-]+$/.test(val) || /^\d{4}-\d{2}-\d{2}/.test(val)) continue;
        totalLen += val.length;
        count++;
      }
      const avg = count > 0 ? totalLen / count : 0;
      if (avg > bestScore) {
        bestScore = avg;
        bestCol = c;
      }
    }
    colIndex = bestCol;
    // Skip header if row 0 looks like short column labels and row 1 is longer prose
    if (rows.length > 1 && (rows[0][colIndex]?.length ?? 0) < 24 && (rows[1][colIndex]?.length ?? 0) > 32) {
      startRow = 1;
    }
  }

  const entries: string[] = [];
  for (let r = startRow; r < rows.length && entries.length < MAX_BATCH_ITEMS; r++) {
    const val = (rows[r][colIndex] ?? '').trim();
    if (val.length > 0) {
      entries.push(val);
    }
  }
  return entries;
}

function extractTxtEntries(content: string): string[] {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs.slice(0, MAX_BATCH_ITEMS);
  }

  const lines = normalized
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.slice(0, MAX_BATCH_ITEMS);
}

export async function parseBatchFile(file: File): Promise<{
  entries: string[];
  truncated: boolean;
}> {
  const raw = await file.text();
  const isCsv =
    file.name.toLowerCase().endsWith('.csv') ||
    file.type === 'text/csv';

  const entries = isCsv ? extractCsvEntries(raw) : extractTxtEntries(raw);
  return {
    entries,
    truncated: entries.length >= MAX_BATCH_ITEMS,
  };
}
