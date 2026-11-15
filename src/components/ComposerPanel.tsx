import { memo, useState, type KeyboardEvent } from 'react';
import { Eye, PenLine, RotateCcw, ArrowUpRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { AnalysisResult, SentencePolarity, SentimentLabel } from '../types/sentiment';

interface ComposerPanelProps {
  text: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  viewMode: 'compose' | 'annotated';
  onChangeViewMode: (mode: 'compose' | 'annotated') => void;
  activeResult: AnalysisResult | null;
  errorMessage: string | null;
}

function getSentimentUnderlineStyle(sentiment: SentimentLabel): {
  underlineClass: string;
  activeBgClass: string;
  labelColorClass: string;
} {
  switch (sentiment) {
    case 'Positive':
      return {
        underlineClass: 'decoration-[#197A53]',
        activeBgClass: 'bg-[rgba(25,122,83,0.10)]',
        labelColorClass: 'text-[#197A53]',
      };
    case 'Negative':
      return {
        underlineClass: 'decoration-[#C03554]',
        activeBgClass: 'bg-[rgba(192,53,84,0.10)]',
        labelColorClass: 'text-[#C03554]',
      };
    default:
      return {
        underlineClass: 'decoration-[#AD7412]',
        activeBgClass: 'bg-[rgba(173,116,18,0.10)]',
        labelColorClass: 'text-[#AD7412]',
      };
  }
}

export const ComposerPanel = memo(function ComposerPanel({
  text,
  onChangeText,
  onClear,
  onAnalyze,
  isAnalyzing,
  viewMode,
  onChangeViewMode,
  activeResult,
  errorMessage,
}: ComposerPanelProps) {
  const [hoveredSentence, setHoveredSentence] = useState<{
    index: number;
    sentence: SentencePolarity;
  } | null>(null);
  const [bannerImgFailed, setBannerImgFailed] = useState(false);

  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = text.length;
  const hasAnnotatedData = Boolean(activeResult && activeResult.sentences.length > 0);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (trimmed && !isAnalyzing) {
        onAnalyze();
      }
    }
  }

  return (
    <section
      aria-label="Text Composer and Annotated Reader"
      className="flex h-full flex-col overflow-hidden rounded-[14px] border border-[rgba(19,41,32,0.11)] bg-[#FFFDF9]"
    >
      {/* Seamless Editorial Cream & Orchid Botanical Header */}
      <div className="relative h-28 w-full overflow-hidden border-b border-[rgba(19,41,32,0.08)] bg-[#FAF6EE]">
        {!bannerImgFailed ? (
          <motion.img
            initial={{ opacity: 0.7, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            src="/src/assets/images/vespera_cream_header_1794740568414.jpg"
            alt="Warm cream stationery paper with delicate orchid watercolor and forest ink botanical linework"
            referrerPolicy="no-referrer"
            decoding="async"
            onError={() => setBannerImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
        ) : (
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#FAF6EE] via-[#FAF6EE] to-[#F5E6EE]" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#FAF6EE]/95 via-[#FAF6EE]/70 to-transparent"
          aria-hidden="true"
        />
        <div className="relative z-10 flex h-full items-center px-6">
          <div className="max-w-lg">
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-[#13261E] text-balance">
              Editorial Composer
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-[#535E58]">
              Draft or paste customer reviews, support escalations, or executive commentary for clause-level sentiment clarity.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Live Metrics Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(19,41,32,0.08)] bg-[#F2ECE0]/45 px-6 py-3">
        <div
          role="tablist"
          aria-label="Workspace input mode"
          className="inline-flex items-center rounded-[8px] border border-[rgba(19,41,32,0.10)] bg-[#F2ECE0] p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'compose'}
            onClick={() => onChangeViewMode('compose')}
            className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 ${
              viewMode === 'compose'
                ? 'bg-[#FFFDF9] text-[#13261E] shadow-xs'
                : 'text-[#535E58] hover:text-[#13261E]'
            }`}
          >
            <PenLine className="h-3.5 w-3.5" />
            <span>Compose</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'annotated'}
            disabled={!hasAnnotatedData}
            onClick={() => onChangeViewMode('annotated')}
            title={
              hasAnnotatedData
                ? 'Inspect sentence-by-sentence sentiment underlines'
                : 'Analyze text first to inspect sentence annotations'
            }
            className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 disabled:cursor-not-allowed disabled:opacity-45 ${
              viewMode === 'annotated'
                ? 'bg-[#FFFDF9] text-[#13261E] shadow-xs'
                : 'text-[#535E58] hover:text-[#13261E]'
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-[#A84A76]" />
            <span>Annotated View</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 font-mono-tabular text-xs text-[#535E58]">
          <span>{wordCount} words</span>
          <span aria-hidden="true" className="text-[#7F8782]">·</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Main Content Area: Compose vs Annotated Reader */}
      <div className="relative flex-1 p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'compose' ? (
            <motion.div
              key="compose-view"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full flex-col"
            >
              <label htmlFor="vespera-composer-textarea" className="sr-only">
                Input text for sentiment analysis
              </label>
              <textarea
                id="vespera-composer-textarea"
                value={text}
                onChange={(e) => onChangeText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write or paste text here… (e.g., product reviews, support tickets, or quarterly remarks)"
                rows={12}
                className="min-h-[300px] w-full flex-1 resize-y rounded-[8px] border border-[rgba(19,41,32,0.10)] bg-[#FAF6EE]/55 p-4 text-[15px] leading-[1.72] text-[#13261E] placeholder:text-[#7F8782] transition-colors duration-150 focus:border-[#A84A76]/60 focus:bg-[#FFFDF9] focus:outline-none"
              />
            </motion.div>
          ) : (
            <motion.div
              key="annotated-view"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-[300px] flex-col justify-between rounded-[8px] border border-[rgba(19,41,32,0.10)] bg-[#FAF6EE]/60 p-5"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(19,41,32,0.08)] pb-3">
                  <span className="text-xs font-medium text-[#535E58]">
                    Hover or focus any underlined sentence to inspect its polarity
                  </span>
                  <div className="flex items-center gap-4 text-[11px] font-medium text-[#535E58]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-3.5 bg-[#197A53]" aria-hidden="true" />
                      Positive
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-3.5 bg-[#AD7412]" aria-hidden="true" />
                      Neutral / Mixed
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-3.5 bg-[#C03554]" aria-hidden="true" />
                      Negative
                    </span>
                  </div>
                </div>

                <div className="text-[15.5px] leading-[1.9] text-[#13261E]">
                  {activeResult?.sentences.map((sentence, index) => {
                    const styles = getSentimentUnderlineStyle(sentence.sentiment);
                    const isActive = hoveredSentence?.index === index;

                    return (
                      <motion.span
                        key={`${index}-${sentence.text.slice(0, 16)}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.24, delay: Math.min(index * 0.035, 0.24) }}
                      >
                        <span
                          tabIndex={0}
                          onMouseEnter={() => setHoveredSentence({ index, sentence })}
                          onMouseLeave={() => setHoveredSentence(null)}
                          onFocus={() => setHoveredSentence({ index, sentence })}
                          onBlur={() => setHoveredSentence(null)}
                          className={`cursor-pointer rounded-[4px] px-0.5 py-0.5 underline decoration-2 underline-offset-[5px] transition-colors duration-150 focus:outline-none ${
                            styles.underlineClass
                          } ${isActive ? styles.activeBgClass : ''}`}
                        >
                          {sentence.text}
                        </span>{' '}
                      </motion.span>
                    );
                  })}
                </div>
              </div>

              {/* Pinned Non-Clipping Sentence Inspector Bar */}
              <div className="mt-6 flex min-h-[40px] flex-wrap items-center justify-between gap-3 border-t border-[rgba(19,41,32,0.08)] pt-3 text-xs">
                {hoveredSentence ? (
                  <motion.div
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-2 text-[#13261E]"
                  >
                    <span className="font-mono-tabular text-[11px] text-[#535E58]">
                      Sentence {hoveredSentence.index + 1}
                    </span>
                    <span aria-hidden="true" className="text-[#7F8782]">·</span>
                    <span
                      className={`font-semibold ${
                        getSentimentUnderlineStyle(hoveredSentence.sentence.sentiment).labelColorClass
                      }`}
                    >
                      {hoveredSentence.sentence.sentiment}
                    </span>
                    <span aria-hidden="true" className="text-[#7F8782]">·</span>
                    <span className="font-mono-tabular font-semibold text-[#13261E]">
                      {hoveredSentence.sentence.score > 0
                        ? `+${hoveredSentence.sentence.score}`
                        : hoveredSentence.sentence.score}
                    </span>
                  </motion.div>
                ) : (
                  <span className="text-[#7F8782]">
                    {activeResult?.sentences.length ?? 0} sentences segmented and scored
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onChangeViewMode('compose')}
                  className="font-medium text-[#A84A76] hover:underline whitespace-nowrap shrink-0"
                >
                  Edit in Composer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMessage && (
          <p role="alert" className="mt-3 text-xs font-medium text-[#C03554]">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Composer Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(19,41,32,0.08)] bg-[#F2ECE0]/45 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            disabled={!text && !activeResult}
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[rgba(19,41,32,0.12)] bg-[#FFFDF9] px-3.5 text-xs font-medium text-[#535E58] transition-colors duration-150 hover:bg-[#E8E0D0] hover:text-[#13261E] disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono-tabular text-[11px] text-[#7F8782]">
            <span>Shortcut:</span>
            <kbd className="rounded-[4px] border border-[rgba(19,41,32,0.12)] bg-[#FFFDF9] px-1.5 py-0.5 text-[10px] text-[#535E58]">
              Cmd/Ctrl + Enter
            </kbd>
          </span>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!trimmed || isAnalyzing}
          className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#A84A76] px-5 text-xs font-semibold text-[#FFFDF9] transition-all duration-150 hover:bg-[#913D64] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A84A76] whitespace-nowrap shrink-0"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <span>Analyze Text</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </section>
  );
});
