import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ComposerPanel } from './components/ComposerPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ResultsPanel } from './components/ResultsPanel';
import { TopBar } from './components/TopBar';
import { PRESET_SAMPLES } from './data/presets';
import {
  checkServerHealth,
  runBatchAnalysis,
  runHybridAnalysis,
} from './services/analyzeService';
import type {
  AnalysisEngineUsed,
  AnalysisResult,
  EngineMode,
  HistoryRecord,
  PresetSample,
} from './types/sentiment';
import { parseBatchFile } from './utils/batchImport';
import { downloadHistoryCsv } from './utils/csvExport';
import { loadHistory, saveHistory } from './utils/storage';

export default function App() {
  const [history, setHistory] = useState<HistoryRecord[]>(() => loadHistory());
  const [text, setText] = useState<string>('');
  const [engineMode, setEngineMode] = useState<EngineMode>('hybrid');
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [engineUsed, setEngineUsed] = useState<AnalysisEngineUsed | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [viewMode, setViewMode] = useState<'compose' | 'annotated'>('compose');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    checkServerHealth().then((status) => {
      setAiConfigured(status.aiConfigured);
    });
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveHistory(history);
  }, [history]);

  const executeAnalysis = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) {
        setErrorMessage('Please enter or load a passage before analyzing.');
        return;
      }

      setErrorMessage(null);
      setIsAnalyzing(true);

      try {
        const outcome = await runHybridAnalysis(trimmed, engineMode);
        const newRecord: HistoryRecord = {
          ...outcome.result,
          id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          inputText: trimmed,
          engine: outcome.engine,
        };

        setActiveResult(outcome.result);
        setActiveRecordId(newRecord.id);
        setEngineUsed(outcome.engine);
        setFallbackUsed(outcome.fallbackUsed);
        setHistory((prev) => [newRecord, ...prev]);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Unable to complete analysis.');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [engineMode]
  );

  const handleSelectPreset = useCallback(
    (preset: PresetSample) => {
      setText(preset.text);
      setErrorMessage(null);
      setBatchNotice(null);
      setViewMode('compose');
      executeAnalysis(preset.text);
    },
    [executeAnalysis]
  );

  const handleImportBatchFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setBatchNotice(null);

      try {
        const { entries, truncated } = await parseBatchFile(file);
        if (entries.length === 0) {
          setErrorMessage(
            `No analyzable text rows found in "${file.name}". Please upload a non-empty .txt or .csv file.`
          );
          return;
        }

        setIsAnalyzing(true);
        setBatchProgress({ completed: 0, total: entries.length });

        const outcomes = await runBatchAnalysis(entries, engineMode, (completed, total) => {
          setBatchProgress({ completed, total });
        });

        const baseTime = Date.now();
        const newRecords: HistoryRecord[] = outcomes.map((item, idx) => ({
          ...item.result,
          id: `rec-batch-${baseTime}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
          // Preserve ascending chronological timestamps across the batch
          timestamp: new Date(baseTime - (outcomes.length - 1 - idx) * 1000).toISOString(),
          inputText: item.inputText,
          engine: item.engine,
        }));

        // Most recent item first in history table
        const orderedDesc = [...newRecords].reverse();
        const latest = orderedDesc[0];
        const latestOutcome = outcomes[outcomes.length - 1];

        setHistory((prev) => [...orderedDesc, ...prev]);

        if (latest && latestOutcome) {
          setText(latest.inputText);
          setActiveResult({
            sentiment: latest.sentiment,
            score: latest.score,
            confidence: latest.confidence,
            summary: latest.summary,
            emotions: latest.emotions,
            aspects: latest.aspects,
            sentences: latest.sentences,
          });
          setActiveRecordId(latest.id);
          setEngineUsed(latest.engine);
          setFallbackUsed(latestOutcome.fallbackUsed);
          setViewMode('annotated');
        }

        const capSuffix = truncated ? ' (capped at 25 entries)' : '';
        setBatchNotice(
          `Batch imported ${newRecords.length} ${
            newRecords.length === 1 ? 'entry' : 'entries'
          } from ${file.name}${capSuffix}. Expand Saved Analysis History below to inspect or view the trend.`
        );
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Unable to parse and analyze batch file.'
        );
      } finally {
        setBatchProgress(null);
        setIsAnalyzing(false);
      }
    },
    [engineMode]
  );

  const handleChangeText = useCallback((nextText: string) => {
    setText(nextText);
    setErrorMessage((prev) => (prev ? null : prev));
  }, []);

  const handleClear = useCallback(() => {
    setText('');
    setActiveResult(null);
    setActiveRecordId(null);
    setEngineUsed(null);
    setFallbackUsed(false);
    setViewMode('compose');
    setErrorMessage(null);
    setBatchNotice(null);
  }, []);

  const handleInspectRecord = useCallback((record: HistoryRecord) => {
    setText(record.inputText);
    setActiveResult({
      sentiment: record.sentiment,
      score: record.score,
      confidence: record.confidence,
      summary: record.summary,
      emotions: record.emotions,
      aspects: record.aspects,
      sentences: record.sentences,
    });
    setActiveRecordId(record.id);
    setEngineUsed(record.engine);
    setFallbackUsed(false);
    setErrorMessage(null);
    setViewMode('annotated');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    setActiveRecordId((prevId) => (prevId === id ? null : prevId));
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    setActiveRecordId(null);
  }, []);

  const handleExportCsv = useCallback(() => {
    downloadHistoryCsv(history);
  }, [history]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FAF6EE] text-[#13261E]">
        <TopBar
          onImportBatchFile={handleImportBatchFile}
          batchProgress={batchProgress}
          engineMode={engineMode}
          onChangeEngineMode={setEngineMode}
          aiConfigured={aiConfigured}
          historyCount={history.length}
          onExportCsv={handleExportCsv}
        />

        <main className="mx-auto flex max-w-[1380px] flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9">
          <AnimatePresence>
            {batchNotice && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                role="status"
                className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(168,74,118,0.28)] bg-[#F5E6EE]/70 px-5 py-3 text-xs text-[#13261E]"
              >
                <span>{batchNotice}</span>
                <button
                  type="button"
                  onClick={() => setBatchNotice(null)}
                  aria-label="Dismiss batch import notice"
                  className="rounded-[6px] p-1 text-[#535E58] hover:bg-[#FFFDF9] hover:text-[#13261E]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Asymmetric 2-Column Workspace (55% Left / 45% Right on Desktop) */}
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[55fr_45fr]">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <ComposerPanel
                text={text}
                onChangeText={handleChangeText}
                onClear={handleClear}
                onAnalyze={() => executeAnalysis(text)}
                isAnalyzing={isAnalyzing}
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                activeResult={activeResult}
                errorMessage={errorMessage}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <ResultsPanel
                result={activeResult}
                engineUsed={engineUsed}
                fallbackUsed={fallbackUsed}
                isAnalyzing={isAnalyzing}
                presets={PRESET_SAMPLES}
                onQuickPreset={handleSelectPreset}
              />
            </motion.div>
          </div>

          {/* Bottom Collapsible Drawer (Collapsed by default) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <HistoryDrawer
              records={history}
              activeRecordId={activeRecordId}
              onInspectRecord={handleInspectRecord}
              onDeleteRecord={handleDeleteRecord}
              onClearHistory={handleClearHistory}
              onExportCsv={handleExportCsv}
            />
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}
