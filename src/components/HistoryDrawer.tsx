import { memo, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Table2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { HistoryRecord, SentimentLabel } from '../types/sentiment';

interface HistoryDrawerProps {
  records: HistoryRecord[];
  activeRecordId: string | null;
  onInspectRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  onExportCsv: () => void;
}

const FILTER_OPTIONS: Array<'All' | SentimentLabel> = ['All', 'Positive', 'Neutral', 'Negative', 'Mixed'];

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatShortTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function getSentimentTextColor(sentiment: SentimentLabel): string {
  switch (sentiment) {
    case 'Positive':
      return 'text-[#197A53]';
    case 'Negative':
      return 'text-[#C03554]';
    case 'Mixed':
      return 'text-[#A84A76]';
    default:
      return 'text-[#AD7412]';
  }
}

interface TrendDatum {
  index: number;
  label: string;
  fullTime: string;
  score: number;
  sentiment: SentimentLabel;
  snippet: string;
  record: HistoryRecord;
}

interface SparklineTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TrendDatum }>;
}

function TrendTooltip({ active, payload }: SparklineTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;

  return (
    <div className="max-w-[260px] rounded-[10px] border border-[rgba(19,41,32,0.14)] bg-[#FFFDF9] p-3 shadow-lg shadow-[#13261E]/10">
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className="font-mono-tabular text-[#535E58]">{datum.fullTime}</span>
        <span className={`font-semibold ${getSentimentTextColor(datum.sentiment)}`}>
          {datum.sentiment}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-mono-tabular text-base font-semibold text-[#13261E]">
          {datum.score > 0 ? `+${datum.score}` : datum.score}
        </span>
        <span className="text-[11px] text-[#7F8782]">polarity</span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#535E58]">
        {datum.snippet}
      </p>
    </div>
  );
}

export const HistoryDrawer = memo(function HistoryDrawer({
  records,
  activeRecordId,
  onInspectRecord,
  onDeleteRecord,
  onClearHistory,
  onExportCsv,
}: HistoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'records' | 'trend'>('records');
  const [sentimentFilter, setSentimentFilter] = useState<'All' | SentimentLabel>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return records.filter((rec) => {
      if (sentimentFilter !== 'All' && rec.sentiment !== sentimentFilter) {
        return false;
      }
      if (!query) return true;
      const inText = rec.inputText.toLowerCase().includes(query);
      const inSummary = rec.summary.toLowerCase().includes(query);
      const inAspects = rec.aspects.some((a) => a.topic.toLowerCase().includes(query));
      const inEmotions = rec.emotions.some((e) => e.label.toLowerCase().includes(query));
      return inText || inSummary || inAspects || inEmotions;
    });
  }, [records, sentimentFilter, searchQuery]);

  // Last 10 sentiment scores ordered chronologically (oldest -> newest)
  const trendData = useMemo<TrendDatum[]>(() => {
    const recentTen = records.slice(0, 10).reverse();
    return recentTen.map((record, i) => ({
      index: i + 1,
      label: `#${i + 1}`,
      fullTime: formatShortTime(record.timestamp),
      score: record.score,
      sentiment: record.sentiment,
      snippet: record.inputText,
      record,
    }));
  }, [records]);

  const trendStats = useMemo(() => {
    if (trendData.length === 0) {
      return { avg: 0, min: 0, max: 0, delta: 0 };
    }
    const scores = trendData.map((d) => d.score);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    const avg = Math.round(sum / scores.length);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const delta = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;
    return { avg, min, max, delta };
  }, [trendData]);

  return (
    <section
      aria-label="Local History and CSV Manager"
      className="overflow-hidden rounded-[14px] border border-[rgba(19,41,32,0.11)] bg-[#FFFDF9]"
    >
      {/* Slim Collapsible Bar Header */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setConfirmClear(false);
        }}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 bg-[#F2ECE0]/70 px-6 py-3.5 text-left transition-colors duration-150 hover:bg-[#E8E0D0]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A84A76]"
      >
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <span className="font-display text-base font-medium text-[#13261E] whitespace-nowrap">
            Saved Analysis History
          </span>
          <span className="font-mono-tabular text-xs text-[#535E58] whitespace-nowrap">
            {records.length} {records.length === 1 ? 'record' : 'records'}
          </span>
          {!isOpen && records[0] && (
            <span className="hidden md:inline truncate max-w-md text-xs text-[#7F8782]">
              · Latest: {records[0].sentiment} ({records[0].score > 0 ? `+${records[0].score}` : records[0].score}) — {records[0].inputText}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#13261E] whitespace-nowrap shrink-0">
          <span>{isOpen ? 'Collapse' : 'Expand History'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4 text-[#535E58]" /> : <ChevronDown className="h-4 w-4 text-[#535E58]" />}
        </span>
      </button>

      {/* Expandable Drawer Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[rgba(19,41,32,0.08)]"
          >
            {/* Primary Drawer View Switcher + Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(19,41,32,0.08)] bg-[#FAF6EE]/70 px-6 py-3.5">
              <div className="flex flex-wrap items-center gap-3">
                {/* Records vs Sentiment History Trend Tab Switcher */}
                <div
                  role="tablist"
                  aria-label="History view mode"
                  className="inline-flex items-center rounded-[8px] border border-[rgba(19,41,32,0.12)] bg-[#F2ECE0] p-0.5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={drawerTab === 'records'}
                    onClick={() => setDrawerTab('records')}
                    className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
                      drawerTab === 'records'
                        ? 'bg-[#FFFDF9] text-[#13261E] shadow-xs'
                        : 'text-[#535E58] hover:text-[#13261E]'
                    }`}
                  >
                    <Table2 className="h-3.5 w-3.5" />
                    <span>Records</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={drawerTab === 'trend'}
                    onClick={() => setDrawerTab('trend')}
                    className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
                      drawerTab === 'trend'
                        ? 'bg-[#FFFDF9] text-[#13261E] shadow-xs'
                        : 'text-[#535E58] hover:text-[#13261E]'
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-[#A84A76]" />
                    <span>Sentiment History Trend</span>
                  </button>
                </div>

                {drawerTab === 'records' && (
                  <>
                    <div
                      role="group"
                      aria-label="Filter history by sentiment"
                      className="inline-flex flex-wrap items-center gap-1 rounded-[8px] border border-[rgba(19,41,32,0.10)] bg-[#F2ECE0] p-0.5"
                    >
                      {FILTER_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSentimentFilter(option)}
                          className={`rounded-[6px] px-2.5 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
                            sentimentFilter === option
                              ? 'bg-[#FFFDF9] text-[#13261E] shadow-xs'
                              : 'text-[#535E58] hover:text-[#13261E]'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7F8782]" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search snippet or topic…"
                        aria-label="Search history snippets"
                        className="h-8 w-52 rounded-[8px] border border-[rgba(19,41,32,0.12)] bg-[#FFFDF9] pl-8 pr-3 text-xs text-[#13261E] placeholder:text-[#7F8782] focus:border-[#A84A76]/60 focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onExportCsv}
                  disabled={records.length === 0}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[rgba(19,41,32,0.12)] bg-[#FFFDF9] px-3 text-xs font-medium text-[#13261E] transition-colors duration-150 hover:bg-[#E8E0D0] disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5 text-[#A84A76]" />
                  <span>Export All to CSV</span>
                </button>

                {records.length > 0 && !confirmClear && (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[rgba(192,53,84,0.24)] bg-[#FFFDF9] px-3 text-xs font-medium text-[#C03554] transition-colors duration-150 hover:bg-[rgba(192,53,84,0.08)] whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear History</span>
                  </button>
                )}

                {confirmClear && (
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onClearHistory();
                        setConfirmClear(false);
                      }}
                      className="inline-flex h-8 items-center rounded-[8px] bg-[#C03554] px-3 text-xs font-semibold text-[#FFFDF9] hover:bg-[#a92d49] whitespace-nowrap shrink-0"
                    >
                      Confirm Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="inline-flex h-8 items-center rounded-[8px] border border-[rgba(19,41,32,0.12)] bg-[#FFFDF9] px-2.5 text-xs font-medium text-[#535E58] hover:text-[#13261E] whitespace-nowrap shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tab View Body */}
            <AnimatePresence mode="wait">
              {drawerTab === 'trend' ? (
                <motion.div
                  key="trend-view"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6"
                >
                  {trendData.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm font-medium text-[#13261E]">
                        No trend data available yet
                      </p>
                      <p className="mt-1 text-xs text-[#535E58]">
                        Analyze or batch-import entries to plot the last 10 sentiment scores over time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Clean Typographic KPI Summary Strip */}
                      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[rgba(19,41,32,0.08)] pb-3.5">
                        <div>
                          <h3 className="font-display text-base font-medium text-[#13261E]">
                            Sentiment History Trend
                          </h3>
                          <p className="mt-0.5 text-xs text-[#535E58]">
                            Chronological polarity sparkline of the last {trendData.length}{' '}
                            {trendData.length === 1 ? 'entry' : 'entries'} (-100 to +100)
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-5 font-mono-tabular text-xs">
                          <div>
                            <span className="text-[#7F8782]">Mean </span>
                            <span className="font-semibold text-[#13261E]">
                              {trendStats.avg > 0 ? `+${trendStats.avg}` : trendStats.avg}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#7F8782]">Range </span>
                            <span className="font-semibold text-[#13261E]">
                              {trendStats.min > 0 ? `+${trendStats.min}` : trendStats.min} to{' '}
                              {trendStats.max > 0 ? `+${trendStats.max}` : trendStats.max}
                            </span>
                          </div>
                          {trendData.length > 1 && (
                            <div>
                              <span className="text-[#7F8782]">Net Shift </span>
                              <span
                                className={`font-semibold ${
                                  trendStats.delta > 0
                                    ? 'text-[#197A53]'
                                    : trendStats.delta < 0
                                    ? 'text-[#C03554]'
                                    : 'text-[#535E58]'
                                }`}
                              >
                                {trendStats.delta > 0 ? `+${trendStats.delta}` : trendStats.delta}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recharts Sparkline Area Chart */}
                      <div className="h-[200px] w-full min-w-0 rounded-[10px] border border-[rgba(19,41,32,0.08)] bg-[#FAF6EE]/65 px-3 pt-4 pb-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={trendData}
                            margin={{ top: 10, right: 16, left: 0, bottom: 4 }}
                          >
                            <defs>
                              <linearGradient id="vesperaOrchidSpark" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A84A76" stopOpacity={0.22} />
                                <stop offset="95%" stopColor="#A84A76" stopOpacity={0.01} />
                              </linearGradient>
                            </defs>
                            <XAxis
                              dataKey="label"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#7F8782', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                              dy={6}
                            />
                            <YAxis
                              domain={[-100, 100]}
                              ticks={[-100, 0, 100]}
                              width={38}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#7F8782', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                            />
                            <ReferenceLine
                              y={0}
                              stroke="rgba(19, 41, 32, 0.18)"
                              strokeDasharray="3 3"
                            />
                            <Tooltip
                              content={<TrendTooltip />}
                              cursor={{ stroke: 'rgba(168, 74, 118, 0.35)', strokeWidth: 1 }}
                            />
                            <Area
                              type="monotone"
                              dataKey="score"
                              stroke="#A84A76"
                              strokeWidth={2.25}
                              fill="url(#vesperaOrchidSpark)"
                              dot={{
                                r: 3.5,
                                fill: '#FFFDF9',
                                stroke: '#A84A76',
                                strokeWidth: 2,
                              }}
                              activeDot={{
                                r: 5.5,
                                fill: '#A84A76',
                                stroke: '#FFFDF9',
                                strokeWidth: 2,
                              }}
                              isAnimationActive={true}
                              animationDuration={450}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Quick Inspect Strip for the Last 10 Points */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#535E58]">
                        <span>Oldest (#1) to Latest (#{trendData.length})</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {trendData.map((item) => (
                            <button
                              key={item.record.id}
                              type="button"
                              onClick={() => onInspectRecord(item.record)}
                              title={`Inspect ${item.label}: ${item.sentiment} (${item.score})`}
                              className={`inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 font-mono-tabular transition-colors ${
                                item.record.id === activeRecordId
                                  ? 'border-[#A84A76] bg-[#F5E6EE] text-[#13261E]'
                                  : 'border-[rgba(19,41,32,0.10)] bg-[#FFFDF9] text-[#535E58] hover:border-[#A84A76]/45 hover:text-[#13261E]'
                              }`}
                            >
                              <span>{item.label}</span>
                              <span className={getSentimentTextColor(item.sentiment)}>
                                {item.score > 0 ? `+${item.score}` : item.score}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="records-view"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  {filteredRecords.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <p className="text-sm font-medium text-[#13261E]">
                        {records.length === 0 ? 'No saved analyses yet' : 'No matching history records'}
                      </p>
                      <p className="mt-1 text-xs text-[#535E58]">
                        {records.length === 0
                          ? 'Analyze text above or import a .txt / .csv batch to persist results automatically.'
                          : 'Adjust your sentiment filter or search query.'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-[rgba(19,41,32,0.08)] bg-[#FAF6EE]/50 text-[11px] font-semibold text-[#535E58]">
                            <th className="py-2.5 pl-6 pr-3 whitespace-nowrap">Timestamp</th>
                            <th className="py-2.5 px-3">Text Snippet</th>
                            <th className="py-2.5 px-3 whitespace-nowrap">Sentiment</th>
                            <th className="py-2.5 px-3 text-right whitespace-nowrap">Score</th>
                            <th className="py-2.5 px-3 whitespace-nowrap">Primary Emotion</th>
                            <th className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(19,41,32,0.06)]">
                          {filteredRecords.map((record, idx) => {
                            const isActive = record.id === activeRecordId;
                            return (
                              <motion.tr
                                key={record.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: Math.min(idx * 0.025, 0.18),
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className={`h-11 transition-colors duration-100 ${
                                  isActive ? 'bg-[#F5E6EE]/65' : 'hover:bg-[#FAF6EE]'
                                }`}
                              >
                                <td className="py-2 pl-6 pr-3 font-mono-tabular text-[11px] text-[#535E58] whitespace-nowrap">
                                  {formatTimestamp(record.timestamp)}
                                </td>
                                <td className="max-w-[360px] truncate py-2 px-3 text-[#13261E]">
                                  {record.inputText}
                                </td>
                                <td className="py-2 px-3 whitespace-nowrap">
                                  <span className={`font-semibold ${getSentimentTextColor(record.sentiment)}`}>
                                    {record.sentiment}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right font-mono-tabular font-semibold text-[#13261E] whitespace-nowrap">
                                  {record.score > 0 ? `+${record.score}` : record.score}
                                </td>
                                <td className="py-2 px-3 text-[#535E58] whitespace-nowrap">
                                  {record.emotions[0]
                                    ? `${record.emotions[0].label} (${record.emotions[0].score}%)`
                                    : 'Neutral'}
                                </td>
                                <td className="py-2 pl-3 pr-6 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => onInspectRecord(record)}
                                      className="inline-flex h-7 items-center gap-1 rounded-[6px] border border-[rgba(19,41,32,0.12)] bg-[#FFFDF9] px-2.5 text-[11px] font-medium text-[#13261E] transition-colors hover:border-[#A84A76]/50 hover:bg-[#F5E6EE]"
                                    >
                                      <span>Inspect</span>
                                      <ArrowUpRight className="h-3 w-3 text-[#A84A76]" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteRecord(record.id)}
                                      aria-label={`Delete record from ${formatTimestamp(record.timestamp)}`}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[#7F8782] transition-colors hover:bg-[rgba(192,53,84,0.10)] hover:text-[#C03554]"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});
