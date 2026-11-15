import { memo, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, MinusCircle, Split, SlidersHorizontal, Cpu } from 'lucide-react';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import type { AnalysisEngineUsed, AnalysisResult, PresetSample, SentimentLabel } from '../types/sentiment';

interface ResultsPanelProps {
  result: AnalysisResult | null;
  engineUsed: AnalysisEngineUsed | null;
  fallbackUsed: boolean;
  isAnalyzing: boolean;
  presets: PresetSample[];
  onQuickPreset: (preset: PresetSample) => void;
}

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const BENTO_HOVER_EFFECT = {
  scale: 1.009,
  boxShadow: '0 14px 32px -12px rgba(19, 38, 30, 0.13), 0 2px 8px -2px rgba(168, 74, 118, 0.06)',
  transition: { duration: 0.18, ease: EDITORIAL_EASE },
};

function getSentimentMeta(sentiment: SentimentLabel) {
  switch (sentiment) {
    case 'Positive':
      return {
        color: '#197A53',
        softBg: 'rgba(25, 122, 83, 0.10)',
        Icon: CheckCircle2,
      };
    case 'Negative':
      return {
        color: '#C03554',
        softBg: 'rgba(192, 53, 84, 0.10)',
        Icon: AlertTriangle,
      };
    case 'Mixed':
      return {
        color: '#A84A76',
        softBg: '#F5E6EE',
        Icon: Split,
      };
    default:
      return {
        color: '#AD7412',
        softBg: 'rgba(173, 116, 18, 0.10)',
        Icon: MinusCircle,
      };
  }
}

function AnimatedPolarityNumber({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const val = Math.round(latest);
    return val > 0 ? `+${val}` : `${val}`;
  });

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 0.48,
      ease: EDITORIAL_EASE,
    });
    return () => controls.stop();
  }, [count, target]);

  return (
    <motion.span className="font-mono-tabular text-2xl font-semibold tracking-tight text-[#13261E]">
      {rounded}
    </motion.span>
  );
}

function PolarityRing({ score, sentiment }: { score: number; sentiment: SentimentLabel }) {
  const { color } = getSentimentMeta(sentiment);
  const size = 132;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const normalizedProgress = Math.max(0.06, Math.min(1, (score + 100) / 200));
  const strokeDashoffset = circumference * (1 - normalizedProgress);

  return (
    <div className="relative flex h-[132px] w-[132px] shrink-0 items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(19, 41, 32, 0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.52, ease: EDITORIAL_EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <AnimatedPolarityNumber target={score} />
        <span className="mt-0.5 font-mono-tabular text-[11px] text-[#535E58]">polarity</span>
      </div>
    </div>
  );
}

export const ResultsPanel = memo(function ResultsPanel({
  result,
  engineUsed,
  fallbackUsed,
  isAnalyzing,
  presets,
  onQuickPreset,
}: ResultsPanelProps) {
  const [crestImgFailed, setCrestImgFailed] = useState(false);

  if (isAnalyzing) {
    return (
      <section aria-label="Analyzing text" className="flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: EDITORIAL_EASE }}
          className="rounded-[14px] border border-[rgba(19,41,32,0.11)] bg-[#F2ECE0] p-6"
        >
          <div className="flex items-center gap-6">
            <div className="h-[132px] w-[132px] shrink-0 animate-pulse rounded-full bg-[#E8E0D0]" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-[#E8E0D0]" />
              <div className="h-5 w-40 animate-pulse rounded bg-[#E8E0D0]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#E8E0D0]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#E8E0D0]" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.04, ease: EDITORIAL_EASE }}
          className="rounded-[14px] border border-[rgba(19,41,32,0.11)] bg-[#FFFDF9] p-6 space-y-4"
        >
          <div className="h-4 w-36 animate-pulse rounded bg-[#E8E0D0]" />
          <div className="h-3 w-full animate-pulse rounded bg-[#E8E0D0]" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-[#E8E0D0]" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-[#E8E0D0]" />
        </motion.div>
      </section>
    );
  }

  if (!result) {
    return (
      <motion.section
        aria-label="Executive Results Standby"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={BENTO_HOVER_EFFECT}
        transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
        className="flex h-full flex-col justify-between rounded-[14px] border border-[rgba(19,41,32,0.11)] bg-[#F2ECE0] p-6 will-change-transform"
      >
        <div>
          <div className="overflow-hidden rounded-[10px] border border-[rgba(168,136,78,0.28)] bg-[#FAF6EE]">
            {!crestImgFailed ? (
              <motion.img
                initial={{ opacity: 0.7, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.42, ease: EDITORIAL_EASE }}
                src="/src/assets/images/vespera_orchid_emblem_1794740566983.jpg"
                alt="Botanical orchid illustration with deep forest leaves and antique gold linework on warm cream paper"
                referrerPolicy="no-referrer"
                decoding="async"
                onError={() => setCrestImgFailed(true)}
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] w-full flex-col items-center justify-center bg-[#FAF6EE] p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 4.5C9.5 7.5 8 10.5 8 13.5C8 16.5 9.8 18.5 12 19.5C14.2 18.5 16 16.5 16 13.5C16 10.5 14.5 7.5 12 4.5Z"
                    stroke="#13261E"
                    strokeWidth="1.4"
                  />
                  <circle cx="12" cy="13.5" r="2.2" fill="#A84A76" />
                </svg>
              </div>
            )}
          </div>

          <h2 className="mt-5 font-display text-lg font-medium text-[#13261E] text-balance">
            Tone & Polarity Inspection
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#535E58]">
            Analyze any passage to surface overall sentiment polarity, confidence, top emotional signals, and extracted topic scores.
          </p>
        </div>

        <div className="mt-6 border-t border-[rgba(19,41,32,0.08)] pt-4">
          <p className="text-xs font-medium text-[#535E58]">Quick-start with a sample:</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <motion.button
                key={preset.id}
                type="button"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.06 + idx * 0.035, ease: EDITORIAL_EASE }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onQuickPreset(preset)}
                className="inline-flex h-8 items-center rounded-[8px] border border-[rgba(19,41,32,0.12)] bg-[#FFFDF9] px-3 text-xs font-medium text-[#13261E] transition-colors duration-150 hover:border-[#A84A76]/50 hover:bg-[#F5E6EE] whitespace-nowrap shrink-0"
              >
                {preset.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  const verdictMeta = getSentimentMeta(result.sentiment);
  const VerdictIcon = verdictMeta.Icon;
  const resultInstanceKey = `${result.score}-${result.confidence}-${result.summary.slice(0, 20)}`;

  return (
    <section aria-label="Executive Sentiment Results" className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={resultInstanceKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="flex flex-col gap-4"
        >
          {/* Card 1: Radial Polarity Gauge & Core Verdict */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={BENTO_HOVER_EFFECT}
            transition={{ duration: 0.26, ease: EDITORIAL_EASE }}
            className="rounded-[14px] border border-[rgba(19,41,32,0.11)] bg-[#F2ECE0] p-6 will-change-transform"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <PolarityRing score={result.score} sentiment={result.sentiment} />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.04, ease: EDITORIAL_EASE }}
                    className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-xs font-semibold"
                    style={{ backgroundColor: verdictMeta.softBg, color: verdictMeta.color }}
                  >
                    <VerdictIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{result.sentiment}</span>
                  </motion.div>

                  <span className="font-mono-tabular text-xs text-[#535E58]">
                    {result.confidence}% confidence
                  </span>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.06, ease: EDITORIAL_EASE }}
                  className="mt-3 text-sm leading-relaxed text-[#13261E]"
                >
                  {result.summary}
                </motion.p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#535E58]">
                  {engineUsed !== 'offline' ? (
                    <span className="inline-flex items-center gap-1 font-medium text-[#13261E]">
                      <SlidersHorizontal className="h-3 w-3 text-[#A84A76]" />
                      AI Mode
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-[#13261E]">
                      <Cpu className="h-3 w-3 text-[#535E58]" />
                      Local NLP
                    </span>
                  )}
                  {fallbackUsed && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#7F8782]">
                        Offline fallback active
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Dominant Tone & Aspect Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={BENTO_HOVER_EFFECT}
            transition={{ duration: 0.28, delay: 0.05, ease: EDITORIAL_EASE }}
            className="rounded-[14px] border border-[rgba(19,41,32,0.11)] bg-[#FFFDF9] p-6 will-change-transform"
          >
            <div>
              <h2 className="text-xs font-semibold tracking-wide text-[#535E58]">
                Dominant Emotional Tones
              </h2>
              <div className="mt-3.5 space-y-3">
                {result.emotions.slice(0, 3).map((emotion, idx) => (
                  <motion.div
                    key={emotion.label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.22,
                      delay: 0.08 + idx * 0.045,
                      ease: EDITORIAL_EASE,
                    }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#13261E]">{emotion.label}</span>
                      <span className="font-mono-tabular text-[#535E58]">{emotion.score}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2ECE0]">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: Math.max(0.05, Math.min(1, emotion.score / 100)) }}
                        transition={{
                          duration: 0.4,
                          delay: 0.1 + idx * 0.05,
                          ease: EDITORIAL_EASE,
                        }}
                        style={{ transformOrigin: 'left center' }}
                        className={`h-full w-full rounded-full ${
                          idx === 0 ? 'bg-[#A84A76]' : 'bg-[#13261E]/75'
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="my-5 border-t border-[rgba(19,41,32,0.08)]" />

            <div>
              <h2 className="text-xs font-semibold tracking-wide text-[#535E58]">
                Extracted Aspects & Entities
              </h2>
              {result.aspects.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.aspects.map((aspect, idx) => {
                    const meta = getSentimentMeta(aspect.sentiment);
                    return (
                      <motion.div
                        key={aspect.topic}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.22,
                          delay: 0.14 + idx * 0.03,
                          ease: EDITORIAL_EASE,
                        }}
                        whileHover={{ y: -1 }}
                        className="inline-flex items-center gap-2 rounded-[8px] border border-[rgba(19,41,32,0.10)] bg-[#FAF6EE] px-3 py-1.5 text-xs transition-shadow duration-150 hover:shadow-xs"
                      >
                        <span className="font-medium text-[#13261E]">{aspect.topic}</span>
                        <span aria-hidden="true" className="text-[#7F8782]">·</span>
                        <span className="text-[11px] font-medium" style={{ color: meta.color }}>
                          {aspect.sentiment}
                        </span>
                        <span
                          className="font-mono-tabular text-[11px] font-semibold"
                          style={{ color: meta.color }}
                        >
                          {aspect.score > 0 ? `+${aspect.score}` : aspect.score}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2.5 text-xs text-[#7F8782]">
                  No distinct sub-topics isolated in this short passage.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
});
