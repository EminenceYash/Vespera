import { memo, useRef, type ChangeEvent } from 'react';
import { Cpu, Download, Loader2, SlidersHorizontal, Upload } from 'lucide-react';
import type { EngineMode } from '../types/sentiment';

interface TopBarProps {
  onImportBatchFile: (file: File) => void;
  batchProgress: { completed: number; total: number } | null;
  engineMode: EngineMode;
  onChangeEngineMode: (mode: EngineMode) => void;
  aiConfigured: boolean | null;
  historyCount: number;
  onExportCsv: () => void;
}

export const TopBar = memo(function TopBar({
  onImportBatchFile,
  batchProgress,
  engineMode,
  onChangeEngineMode,
  aiConfigured,
  historyCount,
  onExportCsv,
}: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isImporting = batchProgress !== null;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImportBatchFile(file);
    }
    e.target.value = '';
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(19,41,32,0.10)] bg-[#FAF6EE]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        {/* Zone 1: Minimal Botanical Mark & Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[rgba(168,136,78,0.35)] bg-[#FFFDF9]"
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4.5C9.5 7.5 8 10.5 8 13.5C8 16.5 9.8 18.5 12 19.5C14.2 18.5 16 16.5 16 13.5C16 10.5 14.5 7.5 12 4.5Z"
                stroke="#13261E"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="13.5" r="2" fill="#A84A76" />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold tracking-[-0.02em] text-[#13261E] whitespace-nowrap">
            Vespera
          </span>
        </div>

        {/* Zone 2: Batch File Import & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Import .txt or .csv batch file"
          />

          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
            title="Upload a .txt or .csv file to analyze multiple entries in one batch"
            className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[rgba(19,41,32,0.12)] bg-[#FFFDF9] px-3.5 text-xs font-medium text-[#13261E] transition-colors duration-150 hover:border-[#A84A76]/45 hover:bg-[#F5E6EE]/70 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A84A76] whitespace-nowrap shrink-0"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#A84A76]" />
                <span className="font-mono-tabular">
                  Importing {batchProgress.completed}/{batchProgress.total}
                </span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 text-[#A84A76]" />
                <span>Import Batch</span>
                <span className="font-mono-tabular text-[11px] text-[#7F8782]">.txt / .csv</span>
              </>
            )}
          </button>

          <div
            role="group"
            aria-label="Analysis mode"
            className="inline-flex h-9 items-center rounded-[8px] border border-[rgba(19,41,32,0.12)] bg-[#F2ECE0] p-0.5 shrink-0"
          >
            <button
              type="button"
              onClick={() => onChangeEngineMode('hybrid')}
              title={
                aiConfigured === false
                  ? 'AI Mode with automatic local NLP fallback'
                  : 'AI Mode with automatic local NLP fallback'
              }
              className={`inline-flex h-full items-center gap-1.5 rounded-[6px] px-3 text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 ${
                engineMode === 'hybrid'
                  ? 'bg-[#FFFDF9] text-[#13261E] shadow-xs'
                  : 'text-[#535E58] hover:text-[#13261E]'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#A84A76]" />
              <span>AI Mode</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeEngineMode('offline')}
              title="Use deterministic local NLP engine"
              className={`inline-flex h-full items-center gap-1.5 rounded-[6px] px-3 text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 ${
                engineMode === 'offline'
                  ? 'bg-[#FFFDF9] text-[#13261E] shadow-xs'
                  : 'text-[#535E58] hover:text-[#13261E]'
              }`}
            >
              <Cpu className="h-3.5 w-3.5 text-[#535E58]" />
              <span>Local NLP</span>
            </button>
          </div>
        </div>

        {/* Zone 3: Primary Export Utility */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={historyCount === 0}
            className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[rgba(19,41,32,0.14)] bg-[#FFFDF9] px-3.5 text-xs font-semibold text-[#13261E] transition-colors duration-150 hover:bg-[#E8E0D0] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A84A76] whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-[#A84A76]" />
            <span>Export CSV</span>
            <span className="font-mono-tabular text-[11px] text-[#535E58]">({historyCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
});
