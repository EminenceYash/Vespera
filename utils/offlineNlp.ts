import type {
  AnalysisResult,
  AspectSentiment,
  EmotionScore,
  SentimentLabel,
  SentencePolarity,
} from '../types/sentiment';

// ---------------------------------------------------------------------------
// 1. Lexicons & Multi-Word Phrase Rules
// ---------------------------------------------------------------------------

const POSITIVE_LEXICON: Record<string, number> = {
  // High-intensity praise & excellence
  outstanding: 3.0,
  exceptional: 3.0,
  phenomenal: 3.0,
  extraordinary: 3.0,
  unmatched: 2.9,
  unrivaled: 2.9,
  masterpiece: 3.0,
  breathtaking: 2.9,
  spectacular: 2.9,
  magnificent: 2.9,
  superb: 2.8,
  stellar: 2.8,
  flawless: 2.8,
  transformative: 2.8,
  delightful: 2.8,
  amazing: 2.8,
  fantastic: 2.8,
  wonderful: 2.7,
  excellent: 2.7,
  brilliant: 2.7,
  incredible: 2.7,
  awesome: 2.6,
  marvelous: 2.7,
  terrific: 2.6,
  phenomenally: 2.8,
  love: 2.6,
  loved: 2.6,
  loves: 2.5,
  loving: 2.4,
  adore: 2.7,
  adored: 2.7,
  thrilled: 2.7,
  ecstatic: 2.8,
  delighted: 2.6,
  overjoyed: 2.8,
  heavenly: 2.6,
  blissful: 2.5,
  // Strong product, UX & engineering quality
  seamless: 2.6,
  remarkable: 2.6,
  exceeded: 2.5,
  outperformed: 2.5,
  outpaced: 2.4,
  effortless: 2.4,
  intuitive: 2.3,
  reliable: 2.3,
  reliability: 2.1,
  impressed: 2.3,
  impressive: 2.4,
  responsive: 2.2,
  elegant: 2.2,
  great: 2.2,
  winning: 2.2,
  recommend: 2.2,
  recommended: 2.2,
  grateful: 2.2,
  thankful: 2.1,
  accelerated: 2.2,
  polished: 2.1,
  helpful: 2.1,
  resilient: 2.1,
  appreciated: 2.1,
  praised: 2.1,
  praise: 2.1,
  robust: 2.1,
  streamlined: 2.1,
  attentive: 2.1,
  snappy: 2.1,
  versatile: 2.0,
  durable: 2.1,
  sturdy: 2.0,
  ergonomic: 2.0,
  lightweight: 1.7,
  quiet: 1.6,
  vibrant: 2.0,
  thoughtful: 2.0,
  transparent: 2.0,
  confident: 2.0,
  record: 1.9,
  appreciate: 2.0,
  smooth: 2.0,
  improved: 2.0,
  improves: 1.9,
  improve: 1.7,
  efficient: 2.0,
  efficiency: 1.8,
  pleased: 2.0,
  satisfied: 2.0,
  satisfies: 1.9,
  optimistic: 2.0,
  upbeat: 2.0,
  proactive: 2.0,
  compelling: 2.1,
  insightful: 2.1,
  lucid: 1.9,
  thorough: 1.9,
  articulate: 1.9,
  collaborative: 1.9,
  constructive: 1.9,
  fast: 1.9,
  quick: 1.8,
  instant: 1.9,
  strong: 1.9,
  strength: 1.8,
  strengthened: 2.0,
  growth: 1.9,
  healthy: 1.9,
  encouraging: 1.9,
  promising: 1.9,
  favorable: 1.9,
  improvement: 1.9,
  valuable: 1.9,
  crisp: 1.8,
  expanded: 1.8,
  expanding: 1.8,
  expansion: 1.8,
  momentum: 1.8,
  resolved: 1.9,
  resolve: 1.6,
  stable: 1.8,
  stability: 1.8,
  steady: 1.7,
  clean: 1.7,
  solid: 1.8,
  disciplined: 1.7,
  thank: 1.7,
  thanks: 1.7,
  clear: 1.6,
  clarity: 1.7,
  good: 1.6,
  nice: 1.6,
  enjoy: 2.0,
  enjoyed: 2.1,
  enjoyable: 2.1,
  pleasant: 1.9,
  comfortable: 1.8,
  convenient: 1.9,
  useful: 1.8,
  capable: 1.7,
  accurate: 1.9,
  dependable: 2.1,
  trustworthy: 2.2,
  affordable: 1.9,
  fair: 1.5,
  value: 1.5,
  worthwhile: 2.0,
  satisfactory: 1.4,
  adequate: 1.1,
  // Business & finance positives
  beat: 2.0,
  profitable: 2.2,
  profitability: 2.0,
  accretive: 2.1,
  tailwind: 1.9,
  tailwinds: 2.0,
  surge: 2.0,
  surged: 2.1,
  soared: 2.3,
  rebound: 1.8,
  rebounded: 1.9,
  thriving: 2.3,
  thrive: 2.1,
  breakthrough: 2.4,
  innovation: 1.9,
  innovative: 2.1,
  modern: 1.6,
  intuitive_ui: 2.2,
  helpful_team: 2.1,
  // Consumer / culinary / hospitality positives
  delicious: 2.6,
  tasty: 2.3,
  flavorful: 2.3,
  fresh: 1.9,
  cozy: 2.0,
  welcoming: 2.1,
  spotless: 2.4,
  immaculate: 2.6,
  gorgeous: 2.5,
  beautiful: 2.4,
  stunning: 2.6,
  charming: 2.1,
  prompt: 1.9,
  courteous: 2.1,
  friendly: 2.0,
  generous: 2.0,
  genius: 2.4,
  refreshing: 2.1,
  empowering: 2.1,
  productive: 2.0,
  // Additional coverage
  happy: 2.2,
  glad: 1.9,
  excited: 2.2,
  exciting: 2.1,
  fantastic_job: 2.5,
  bright: 1.8,
  genius_move: 2.3,
  succeed: 2.0,
  succeeded: 2.1,
  success: 2.1,
  successful: 2.2,
  perfect: 2.8,
  perfection: 2.8,
  ideal: 2.1,
  favorite: 2.3,
  favourite: 2.3,
  best: 2.5,
  better: 1.6,
  superior: 2.3,
  polished_feel: 2.0,
  top: 1.5,
  win: 2.0,
  wins: 1.9,
  won: 1.9,
  smoothly: 2.0,
  effortlessly: 2.3,
  seamlessly: 2.5,
  reliably: 2.2,
};

const NEGATIVE_LEXICON: Record<string, number> = {
  // Severe / critical failures
  catastrophic: -3.2,
  catastrophe: -3.1,
  disaster: -3.0,
  disastrous: -3.0,
  unusable: -3.0,
  unacceptable: -3.0,
  atrocious: -3.0,
  abysmal: -3.0,
  appalling: -2.9,
  horrendous: -3.0,
  deplorable: -3.0,
  nightmare: -2.9,
  terrible: -2.9,
  horrible: -2.9,
  worst: -2.9,
  awful: -2.8,
  broken: -2.8,
  hate: -2.8,
  hated: -2.8,
  despise: -2.9,
  outage: -2.8,
  outages: -2.8,
  downtime: -2.7,
  unresponsive: -2.6,
  failure: -2.6,
  crash: -2.6,
  crashed: -2.6,
  crashes: -2.6,
  crashing: -2.6,
  worthless: -2.8,
  useless: -2.7,
  garbage: -2.8,
  trash: -2.8,
  pathetic: -2.7,
  scam: -3.0,
  fraudulent: -3.0,
  // Strong dissatisfaction & defects
  frustrating: -2.5,
  frustrated: -2.5,
  frustration: -2.4,
  failed: -2.5,
  failing: -2.5,
  fail: -2.4,
  fails: -2.4,
  disappointing: -2.4,
  disappointed: -2.4,
  disappointment: -2.4,
  ignored: -2.4,
  ignores: -2.3,
  ignoring: -2.3,
  buggy: -2.4,
  bugs: -2.1,
  bug: -1.9,
  painful: -2.4,
  worse: -2.4,
  overpriced: -2.3,
  inadequate: -2.3,
  defective: -2.5,
  damaged: -2.4,
  damage: -2.2,
  corrupted: -2.6,
  corrupt: -2.5,
  insecure: -2.5,
  vulnerable: -2.1,
  vulnerability: -2.2,
  breach: -2.7,
  churn: -2.2,
  blocked: -2.2,
  blocking: -2.1,
  poor: -2.2,
  poorly: -2.2,
  regret: -2.2,
  annoying: -2.1,
  annoyed: -2.1,
  clunky: -2.1,
  sluggish: -2.1,
  bad: -2.1,
  badly: -2.1,
  declined: -2.1,
  decline: -2.0,
  declining: -2.1,
  errors: -2.1,
  error: -2.0,
  confusing: -2.0,
  confused: -1.9,
  confusion: -1.9,
  delayed: -2.0,
  delay: -1.9,
  delays: -2.0,
  bottleneck: -2.0,
  bottlenecks: -2.0,
  stuck: -2.0,
  struggling: -2.0,
  struggle: -1.9,
  struggled: -2.0,
  weak: -2.0,
  weakness: -2.0,
  missed: -2.0,
  overwhelmed: -2.0,
  headwinds: -2.0,
  headwind: -1.9,
  headache: -2.1,
  headaches: -2.2,
  tedious: -1.9,
  slow: -1.9,
  slowed: -1.9,
  slowing: -1.8,
  opaque: -1.9,
  escalated: -1.9,
  escalation: -1.9,
  lacking: -1.9,
  problems: -1.9,
  problem: -1.8,
  problematic: -2.1,
  expensive: -1.8,
  steep: -1.6,
  pricey: -1.8,
  costly: -1.8,
  incomplete: -1.8,
  friction: -1.8,
  compression: -1.8,
  compressed: -1.7,
  concerns: -1.8,
  concern: -1.7,
  concerned: -1.7,
  concerning: -1.9,
  unable: -1.8,
  unclear: -1.7,
  missing: -1.7,
  issues: -1.7,
  issue: -1.5,
  risks: -1.6,
  risk: -1.5,
  risky: -1.8,
  softness: -1.6,
  softened: -1.6,
  soft: -1.2,
  cautious: -1.3,
  // Additional product, UX, finance & consumer negatives
  unreliable: -2.5,
  unintuitive: -2.3,
  unhelpful: -2.3,
  unfortunate: -1.9,
  unfortunately: -1.8,
  unpleasant: -2.2,
  unpolished: -1.9,
  unstable: -2.4,
  instability: -2.4,
  inconsistent: -2.1,
  inefficient: -2.1,
  ineffective: -2.2,
  impractical: -1.9,
  impatient: -1.7,
  dissatisfied: -2.5,
  disorganized: -2.1,
  dishonest: -2.6,
  misleading: -2.4,
  misled: -2.4,
  fragile: -2.0,
  flimsy: -2.3,
  noisy: -1.9,
  loud: -1.4,
  overheating: -2.3,
  overheat: -2.2,
  bulky: -1.6,
  uncomfortable: -2.1,
  scratched: -2.0,
  leaking: -2.3,
  leak: -2.1,
  stale: -2.1,
  burnt: -2.3,
  bland: -1.9,
  soggy: -2.2,
  musty: -2.1,
  dirty: -2.3,
  filthy: -2.7,
  rude: -2.6,
  dismissive: -2.4,
  hostile: -2.6,
  condescending: -2.5,
  arrogant: -2.3,
  chaotic: -2.3,
  convoluted: -2.1,
  bloated: -2.0,
  verbose: -1.5,
  ambiguous: -1.7,
  vague: -1.7,
  erratic: -2.2,
  glitch: -2.1,
  glitches: -2.2,
  glitchy: -2.3,
  freeze: -2.1,
  freezes: -2.2,
  froze: -2.2,
  lag: -2.0,
  lags: -2.1,
  laggy: -2.2,
  latency: -1.4,
  timeout: -2.1,
  timeouts: -2.2,
  underwhelming: -2.1,
  mediocre: -1.8,
  lackluster: -2.0,
  subpar: -2.2,
  shortfall: -2.1,
  deficit: -2.0,
  contraction: -1.9,
  volatility: -1.7,
  downgrade: -2.0,
  downgraded: -2.1,
  attrition: -1.9,
  cancel: -1.6,
  canceled: -1.8,
  cancelled: -1.8,
  canceling: -1.8,
  refund: -1.6,
  complaint: -2.0,
  complaints: -2.1,
  flaw: -1.9,
  flaws: -2.0,
  flawed: -2.2,
  defect: -2.3,
  defects: -2.3,
  exhausting: -2.0,
  overcomplicated: -2.1,
  complicated: -1.5,
  impossible: -2.3,
  wrong: -2.0,
  broken_link: -2.2,
  sad: -2.0,
  sadly: -1.7,
  angry: -2.5,
  furious: -2.8,
  outraged: -2.8,
  upset: -2.2,
  worried: -1.8,
  worry: -1.7,
  skeptical: -1.6,
  doubt: -1.6,
  doubtful: -1.8,
  reject: -2.0,
  rejected: -2.1,
  stalled: -2.0,
  stalling: -1.9,
  stagnant: -1.9,
  outdated: -1.9,
  obsolete: -2.2,
  expensive_tier: -1.9,
  boring: -1.9,
  dull: -1.8,
  urgent: -1.4,
  urgently: -1.5,
};

interface PhraseRule {
  pattern: RegExp;
  score: number;
  selfNegated?: boolean;
  emotionHint?: 'Satisfaction' | 'Frustration' | 'Urgency' | 'Optimism' | 'Skepticism' | 'Appreciation' | 'Disappointment' | 'Confidence';
}

const PHRASE_RULES: PhraseRule[] = [
  // Self-negated or idiomatic positive phrases
  { pattern: /\b(?:can't|cannot|couldn't)\s+recommend(?:\s+\w+){0,2}\s+enough\b/i, score: 2.9, selfNegated: true, emotionHint: 'Satisfaction' },
  { pattern: /\bworth\s+every\s+penny\b/i, score: 3.0, emotionHint: 'Satisfaction' },
  { pattern: /\bsecond\s+to\s+none\b/i, score: 2.9, emotionHint: 'Confidence' },
  { pattern: /\babove\s+and\s+beyond\b/i, score: 2.8, emotionHint: 'Appreciation' },
  { pattern: /\bexceeded\s+(?:our|my|all)?\s*expectations\b/i, score: 2.8, emotionHint: 'Satisfaction' },
  { pattern: /\bsurpassed\s+(?:our|my|all)?\s*expectations\b/i, score: 2.8, emotionHint: 'Satisfaction' },
  { pattern: /\bhighly\s+recommend\b/i, score: 2.8, emotionHint: 'Satisfaction' },
  { pattern: /\bstrongly\s+recommend\b/i, score: 2.7, emotionHint: 'Confidence' },
  { pattern: /\bworks\s+like\s+a\s+charm\b/i, score: 2.6, emotionHint: 'Satisfaction' },
  { pattern: /\bworked\s+like\s+a\s+charm\b/i, score: 2.6, emotionHint: 'Satisfaction' },
  { pattern: /\bgame[\s-]changer\b/i, score: 2.7, emotionHint: 'Optimism' },
  { pattern: /\bbest[\s-]in[\s-]class\b/i, score: 2.7, emotionHint: 'Confidence' },
  { pattern: /\bblown\s+away\b/i, score: 2.7, emotionHint: 'Satisfaction' },
  { pattern: /\blife[\s-]?saver\b/i, score: 2.6, emotionHint: 'Appreciation' },
  { pattern: /\b(?:five|5)\s+stars\b/i, score: 2.7, emotionHint: 'Satisfaction' },
  { pattern: /\b(?:5\/5|10\/10)\b/i, score: 2.7, emotionHint: 'Satisfaction' },
  { pattern: /\btop[\s-]notch\b/i, score: 2.6, emotionHint: 'Satisfaction' },
  { pattern: /\brock[\s-]solid\b/i, score: 2.5, emotionHint: 'Confidence' },
  { pattern: /\bbreath\s+of\s+fresh\s+air\b/i, score: 2.5, emotionHint: 'Satisfaction' },
  { pattern: /\bcut\s+(?:[\w\s]{1,28}?)\s+in\s+half\b/i, score: 2.5, emotionHint: 'Satisfaction' },
  { pattern: /\bnight\s+and\s+day\b/i, score: 2.2, emotionHint: 'Optimism' },
  { pattern: /\bspot[\s-]on\b/i, score: 2.4, emotionHint: 'Confidence' },
  { pattern: /\bno[\s-]brainer\b/i, score: 2.3, emotionHint: 'Confidence' },
  { pattern: /\bpeace\s+of\s+mind\b/i, score: 2.3, emotionHint: 'Confidence' },
  { pattern: /\bwell\s+worth\b/i, score: 2.3, emotionHint: 'Satisfaction' },
  { pattern: /\bworth\s+the\s+(?:price|money|investment|upgrade|wait)\b/i, score: 2.3, emotionHint: 'Satisfaction' },
  { pattern: /\bahead\s+of\s+schedule\b/i, score: 2.3, emotionHint: 'Optimism' },
  { pattern: /\bunder\s+budget\b/i, score: 2.2, emotionHint: 'Confidence' },
  { pattern: /\bright\s+out\s+of\s+the\s+box\b/i, score: 2.2, emotionHint: 'Satisfaction' },
  { pattern: /\buser[\s-]friendly\b/i, score: 2.2, emotionHint: 'Satisfaction' },
  { pattern: /\beasy\s+to\s+(?:use|navigate|learn|set\s+up|configure|adopt)\b/i, score: 2.1, emotionHint: 'Satisfaction' },
  { pattern: /\bzero\s+(?:issues|problems|downtime|complaints|bugs|errors|friction)\b/i, score: 2.2, selfNegated: true, emotionHint: 'Confidence' },
  { pattern: /\bno\s+(?:issues|problems|downtime|complaints|bugs|errors|friction)\b/i, score: 1.9, selfNegated: true, emotionHint: 'Confidence' },
  { pattern: /\b(?:problem|issue|ticket)\s+resolved\b/i, score: 2.0, emotionHint: 'Appreciation' },
  { pattern: /\bwithin\s+(?:\d+|ten|fifteen|twenty|thirty)\s+minutes\b/i, score: 1.6, emotionHint: 'Appreciation' },
  { pattern: /\bbeat\s+(?:consensus|expectations|estimates|guidance)\b/i, score: 2.4, emotionHint: 'Optimism' },
  { pattern: /\bdouble[\s-]digit\s+growth\b/i, score: 2.3, emotionHint: 'Optimism' },
  { pattern: /\brecord\s+(?:high|revenue|arr|quarter|growth|retention)\b/i, score: 2.4, emotionHint: 'Optimism' },
  { pattern: /\bon[\s-]point\b/i, score: 2.1, emotionHint: 'Satisfaction' },
  { pattern: /\bhands\s+down\b/i, score: 1.9, emotionHint: 'Confidence' },
  { pattern: /\bdoes\s+the\s+job\b/i, score: 1.1, emotionHint: 'Satisfaction' },

  // Critical / negative idioms & self-negated failures
  { pattern: /\bwaste\s+of\s+(?:time|money|effort)\b/i, score: -3.0, emotionHint: 'Frustration' },
  { pattern: /\bnothing\s+short\s+of\s+disastrous\b/i, score: -3.1, emotionHint: 'Frustration' },
  { pattern: /\btrain[\s-]?wreck\b/i, score: -3.0, emotionHint: 'Frustration' },
  { pattern: /\bdeal[\s-]?breaker\b/i, score: -2.9, emotionHint: 'Disappointment' },
  { pattern: /\b(?:complete|total|hot)\s+mess\b/i, score: -2.8, emotionHint: 'Frustration' },
  { pattern: /\bnever\s+again\b/i, score: -2.8, selfNegated: true, emotionHint: 'Disappointment' },
  { pattern: /\bstay\s+away\b/i, score: -2.8, emotionHint: 'Frustration' },
  { pattern: /\bavoid\s+at\s+all\s+costs\b/i, score: -3.0, emotionHint: 'Frustration' },
  { pattern: /\b(?:do\s+not|don't|wouldn't|would\s+not|cannot|can't)\s+recommend\b/i, score: -2.7, selfNegated: true, emotionHint: 'Disappointment' },
  { pattern: /\b(?:one|1)\s+star\b/i, score: -2.8, emotionHint: 'Disappointment' },
  { pattern: /\b(?:1\/5|0\/10)\b/i, score: -2.8, emotionHint: 'Disappointment' },
  { pattern: /\blast\s+straw\b/i, score: -2.8, emotionHint: 'Frustration' },
  { pattern: /\bfinal\s+straw\b/i, score: -2.8, emotionHint: 'Frustration' },
  { pattern: /\b(?:stopped|stops|quit)\s+working\b/i, score: -2.7, emotionHint: 'Frustration' },
  { pattern: /\bno\s+longer\s+(?:works|working|supported|available|responds)\b/i, score: -2.6, selfNegated: true, emotionHint: 'Frustration' },
  { pattern: /\b(?:doesn't|does\s+not|didn't|did\s+not|won't|wouldn't)\s+(?:work|load|open|sync|save|respond)\b/i, score: -2.5, selfNegated: true, emotionHint: 'Frustration' },
  { pattern: /\bnot\s+worth\s+(?:it|the\s+(?:price|money|hassle|time|cost))\b/i, score: -2.6, selfNegated: true, emotionHint: 'Disappointment' },
  { pattern: /\bbait\s+and\s+switch\b/i, score: -2.8, emotionHint: 'Frustration' },
  { pattern: /\bhidden\s+(?:fees|charges|costs)\b/i, score: -2.5, emotionHint: 'Frustration' },
  { pattern: /\bnickeled\s+and\s+dimed\b/i, score: -2.4, emotionHint: 'Frustration' },
  { pattern: /\bdropped\s+the\s+ball\b/i, score: -2.5, emotionHint: 'Disappointment' },
  { pattern: /\bpulling\s+teeth\b/i, score: -2.5, emotionHint: 'Frustration' },
  { pattern: /\bradio\s+silence\b/i, score: -2.4, emotionHint: 'Frustration' },
  { pattern: /\bleft\s+much\s+to\s+be\s+desired\b/i, score: -2.4, emotionHint: 'Disappointment' },
  { pattern: /\bleaves\s+much\s+to\s+be\s+desired\b/i, score: -2.4, emotionHint: 'Disappointment' },
  { pattern: /\bfell\s+short\b/i, score: -2.3, emotionHint: 'Disappointment' },
  { pattern: /\bfalls\s+short\b/i, score: -2.3, emotionHint: 'Disappointment' },
  { pattern: /\bfalling\s+short\b/i, score: -2.3, emotionHint: 'Disappointment' },
  { pattern: /\bmissed\s+the\s+mark\b/i, score: -2.2, emotionHint: 'Disappointment' },
  { pattern: /\bat\s+a\s+standstill\b/i, score: -2.3, emotionHint: 'Urgency' },
  { pattern: /\bred\s+flags?\b/i, score: -2.2, emotionHint: 'Skepticism' },
  { pattern: /\bhalf[\s-]baked\b/i, score: -2.3, emotionHint: 'Disappointment' },
  { pattern: /\bfar\s+from\s+(?:ideal|perfect|intuitive|seamless|ready|acceptable)\b/i, score: -2.1, selfNegated: true, emotionHint: 'Disappointment' },
  { pattern: /\bnowhere\s+near\b/i, score: -2.1, selfNegated: true, emotionHint: 'Disappointment' },
  { pattern: /\bpain\s+points?\b/i, score: -2.0, emotionHint: 'Frustration' },
  { pattern: /\bsteep\s+learning\s+curve\b/i, score: -1.9, emotionHint: 'Frustration' },
  { pattern: /\bhard\s+to\s+(?:use|navigate|learn|understand|configure)\b/i, score: -2.0, emotionHint: 'Frustration' },
  { pattern: /\bdifficult\s+to\s+(?:use|navigate|learn|understand|configure)\b/i, score: -1.9, emotionHint: 'Frustration' },
  { pattern: /\blet\s+down\b/i, score: -2.2, emotionHint: 'Disappointment' },
  { pattern: /\bletdown\b/i, score: -2.2, emotionHint: 'Disappointment' },
  { pattern: /\bback\s+and\s+forth\b/i, score: -1.5, emotionHint: 'Frustration' },
  { pattern: /\bon\s+hold\b/i, score: -1.6, emotionHint: 'Frustration' },
  { pattern: /\b(?:canned|generic|copy[\s-]paste)\s+response\b/i, score: -2.1, emotionHint: 'Frustration' },
  { pattern: /\bmargin\s+compression\b/i, score: -2.0, emotionHint: 'Skepticism' },
  { pattern: /\belevated\s+churn\b/i, score: -2.2, emotionHint: 'Skepticism' },
  { pattern: /\bsoftening\s+demand\b/i, score: -1.9, emotionHint: 'Skepticism' },
  { pattern: /\bmissed\s+(?:guidance|estimates|expectations|targets?)\b/i, score: -2.3, emotionHint: 'Disappointment' },
  { pattern: /\bout\s+of\s+date\b/i, score: -1.7, emotionHint: 'Disappointment' },
  { pattern: /\bsub[\s-]par\b/i, score: -2.2, emotionHint: 'Disappointment' },
  { pattern: /\bsupposed\s+to\s+(?:work|be|help|handle)\b/i, score: -1.8, emotionHint: 'Disappointment' },
  { pattern: /\bnot\s+as\s+advertised\b/i, score: -2.3, selfNegated: true, emotionHint: 'Disappointment' },
  // Hedged / polite critiques
  { pattern: /\bcould\s+be\s+(?:better|faster|clearer|simpler|cleaner|improved)\b/i, score: -1.3, emotionHint: 'Skepticism' },
  { pattern: /\bcould\s+use\s+(?:some\s+)?(?:work|improvement|polish)\b/i, score: -1.3, emotionHint: 'Skepticism' },
  { pattern: /\broom\s+for\s+improvement\b/i, score: -1.2, emotionHint: 'Skepticism' },
  { pattern: /\bwould\s+be\s+nice\s+(?:if|to)\b/i, score: -0.9, emotionHint: 'Skepticism' },
  { pattern: /\bwish\s+(?:it|there|they)\s+(?:had|was|were|would)\b/i, score: -1.1, emotionHint: 'Disappointment' },
  { pattern: /\bhit\s+or\s+miss\b/i, score: -1.3, emotionHint: 'Skepticism' },
  // Non-negating idiomatic connectors (neutralize "not" / "no" before single-token scan)
  { pattern: /\bnot\s+only\b/i, score: 0.4, selfNegated: true },
  { pattern: /\bno\s+wonder\b/i, score: 0.3, selfNegated: true },
];

const EMOJI_POLARITY: Array<[string, number]> = [
  ['❤️', 2.4], ['❤', 2.4], ['😍', 2.6], ['🔥', 2.1], ['👍', 1.9], ['🎉', 2.2],
  ['✨', 1.7], ['💯', 2.4], ['😊', 2.0], ['🙌', 2.2], ['👏', 2.1], ['⭐', 1.8],
  ['🌟', 2.0], ['💚', 2.2], ['✅', 1.5], ['🚀', 2.0],
  ['😡', -2.7], ['🤬', -3.0], ['👎', -2.2], ['💔', -2.4], ['😞', -2.2], ['😢', -2.1],
  ['😭', -2.3], ['😤', -2.2], ['🤢', -2.6], ['💩', -2.8], ['⚠️', -1.4], ['🚨', -1.9],
  ['❌', -1.8], ['😒', -1.9], ['🙄', -1.8],
];

const NEGATION_WORDS = new Set([
  'not',
  'no',
  'never',
  'neither',
  'nor',
  'hardly',
  'barely',
  'scarcely',
  'without',
  'lack',
  'lacks',
  'lacked',
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "don't",
  "doesn't",
  "didn't",
  "won't",
  "wouldn't",
  "couldn't",
  "can't",
  'cannot',
  "haven't",
  "hasn't",
  "hadn't",
  "shouldn't",
  "mustn't",
  "needn't",
  'zero',
  'none',
]);

const INTENSIFIERS: Record<string, number> = {
  extremely: 1.55,
  incredibly: 1.5,
  exceptionally: 1.5,
  remarkably: 1.4,
  dramatically: 1.4,
  substantially: 1.35,
  significantly: 1.35,
  overwhelmingly: 1.45,
  deeply: 1.4,
  utterly: 1.45,
  thoroughly: 1.35,
  vastly: 1.4,
  wildly: 1.35,
  truly: 1.3,
  genuinely: 1.25,
  sincerely: 1.25,
  very: 1.3,
  really: 1.25,
  quite: 1.15,
  particularly: 1.2,
  especially: 1.25,
  hugely: 1.4,
  totally: 1.35,
  completely: 1.4,
  absolutely: 1.45,
  entirely: 1.35,
  severely: 1.45,
  critically: 1.45,
  terribly: 1.4,
  awfully: 1.35,
  painfully: 1.35,
  noticeably: 1.2,
  super: 1.35,
  mega: 1.35,
  ultra: 1.3,
};

const DIMINISHERS: Record<string, number> = {
  slightly: 0.65,
  somewhat: 0.7,
  mildly: 0.65,
  marginally: 0.6,
  moderately: 0.75,
  partially: 0.7,
  partly: 0.7,
  occasionally: 0.75,
  fairly: 0.82,
  relatively: 0.82,
  minor: 0.72,
  subtle: 0.75,
  mostly: 0.9,
  generally: 0.9,
};

const HEDGE_WORDS = new Set([
  'could',
  'would',
  'might',
  'may',
  'perhaps',
  'maybe',
  'possibly',
  'supposedly',
  'apparently',
  'tentatively',
]);

// Words starting with un-/in-/im-/dis- that must NEVER be prefix-flipped
const PREFIX_FLIP_EXCEPTIONS = new Set([
  'understand', 'understood', 'understanding', 'under', 'underway', 'understated',
  'underwrite', 'unit', 'units', 'united', 'union', 'unique', 'universal',
  'universe', 'until', 'unveil', 'unveiled', 'inside', 'insight', 'insights',
  'income', 'incoming', 'increase', 'increased', 'increasing', 'include',
  'included', 'including', 'industry', 'industrial', 'initial', 'initially',
  'initiate', 'initiated', 'input', 'inputs', 'install', 'installed',
  'instance', 'instead', 'instant', 'instantly', 'integrate', 'integrated',
  'integration', 'integrations', 'internal', 'internet', 'interpret', 'invoice',
  'invest', 'invested', 'investment', 'investor', 'impact', 'impacted',
  'implement', 'implemented', 'important', 'importance', 'improve', 'improved',
  'improves', 'improvement', 'impress', 'impressed', 'impressive', 'image',
  'imagine', 'immediate', 'immediately', 'display', 'displayed', 'discuss',
  'discussed', 'discussion', 'discover', 'discovered', 'discovery', 'dispatch',
  'distinct', 'distinction', 'distinguish', 'distribute', 'distributed',
  'distribution', 'district', 'distant', 'distance',
]);

// ---------------------------------------------------------------------------
// 2. Aspect Patterns & Negation-Aware Emotion Keywords
// ---------------------------------------------------------------------------

interface AspectPattern {
  topic: string;
  keywords: RegExp;
}

const ASPECT_PATTERNS: AspectPattern[] = [
  {
    topic: 'UI Design & UX',
    keywords: /\b(ui|ux|interface|design|layout|typography|navigation|workflow|dashboard|usability|experience|theme|visuals|editor|screen|menus?)\b/i,
  },
  {
    topic: 'Customer Support',
    keywords: /\b(support|rep|representative|agent|ticket|tickets|helpdesk|account manager|customer service|service team|care team|staff|waiter|server|host)\b/i,
  },
  {
    topic: 'Reliability & Uptime',
    keywords: /\b(uptime|outage|outages|downtime|reliable|reliability|stability|stable|crash|crashes|crashing|bug|bugs|buggy|error|errors|glitch|glitches|freeze|freezes)\b/i,
  },
  {
    topic: 'Performance & Speed',
    keywords: /\b(speed|fast|slow|sluggish|latency|performance|responsive|load|loading|snappy|lag|laggy|throughput|runtime)\b/i,
  },
  {
    topic: 'Onboarding & Docs',
    keywords: /\b(onboarding|setup|set up|documentation|docs|training|migration|learning curve|rollout|tutorial|guide|walkthrough)\b/i,
  },
  {
    topic: 'Pricing & Billing',
    keywords: /\b(pricing|price|cost|costs|invoice|billing|tier|tiers|plan|plans|expensive|overpriced|affordable|subscription|renewal|fees|fee|charges|refund)\b/i,
  },
  {
    topic: 'Revenue & ARR Growth',
    keywords: /\b(revenue|arr|growth|bookings|pipeline|retention|expansion|demand|sales|q[1-4]|quarterly\s+(?:results|earnings|revenue|growth)|guidance|backlog|conversion)\b/i,
  },
  {
    topic: 'Margins & Costs',
    keywords: /\b(margin|margins|ebitda|operating|spend|efficiency|headwind|headwinds|tailwind|tailwinds|capex|profit|profitability|opex)\b/i,
  },
  {
    topic: 'API & Integrations',
    keywords: /\b(api|apis|webhook|webhooks|integration|integrations|sdk|sync|export|exports|csv|json|automation|connector|connectors)\b/i,
  },
  {
    topic: 'Security & Compliance',
    keywords: /\b(security|sso|soc2|compliance|audit|permissions|access|encryption|privacy|auth|authentication|rbac|gdpr)\b/i,
  },
  {
    topic: 'Product Quality & Build',
    keywords: /\b(quality|build|battery|hardware|material|materials|craftsmanship|durable|durability|flimsy|fragile|speaker|audio|camera|display|keyboard|packaging)\b/i,
  },
  {
    topic: 'Delivery & Logistics',
    keywords: /\b(shipping|delivery|delivered|courier|carrier|tracking|arrived|arrival|package|parcel|transit|dispatch|warehouse)\b/i,
  },
  {
    topic: 'Features & Reporting',
    keywords: /\b(feature|features|functionality|capability|capabilities|reporting|reports|analytics|search|filter|filters|templates|exporting)\b/i,
  },
];

const EMOTION_LEXICON: Record<string, Array<{ words: string[]; polarity: 'pos' | 'neg' | 'neutral' }>> = {
  Satisfaction: [
    {
      words: [
        'pleased', 'satisfied', 'great', 'love', 'loved', 'loves', 'delightful', 'delighted',
        'seamless', 'intuitive', 'smooth', 'impressed', 'impressive', 'excellent', 'recommend',
        'clean', 'amazing', 'fantastic', 'wonderful', 'delicious', 'spotless', 'enjoyed',
      ],
      polarity: 'pos',
    },
  ],
  Frustration: [
    {
      words: [
        'frustrating', 'frustrated', 'frustration', 'annoying', 'annoyed', 'clunky', 'broken',
        'unacceptable', 'painful', 'tedious', 'stuck', 'buggy', 'worst', 'terrible', 'horrible',
        'awful', 'nightmare', 'unusable', 'ignored', 'ignores', 'unresponsive', 'rude',
      ],
      polarity: 'neg',
    },
  ],
  Urgency: [
    {
      words: [
        'urgent', 'urgently', 'immediately', 'critical', 'critically', 'outage', 'outages',
        'downtime', 'blocked', 'blocking', 'escalated', 'escalation', 'asap', 'deadline',
        'emergency', 'standstill', 'halt', 'halted',
      ],
      polarity: 'neg',
    },
  ],
  Optimism: [
    {
      words: [
        'momentum', 'growth', 'accelerated', 'record', 'outperformed', 'outpaced', 'optimistic',
        'encouraging', 'promising', 'bright', 'expanding', 'expansion', 'strong', 'tailwind',
        'tailwinds', 'surged', 'soared', 'rebound', 'thriving', 'breakthrough',
      ],
      polarity: 'pos',
    },
  ],
  Skepticism: [
    {
      words: [
        'cautious', 'headwind', 'headwinds', 'unclear', 'opaque', 'concern', 'concerns',
        'concerned', 'concerning', 'risk', 'risks', 'risky', 'skeptical', 'doubt', 'doubtful',
        'questionable', 'ambiguous', 'vague', 'volatile', 'volatility',
      ],
      polarity: 'neg',
    },
  ],
  Appreciation: [
    {
      words: [
        'thank', 'thanks', 'grateful', 'thankful', 'appreciated', 'appreciate', 'helpful',
        'attentive', 'proactive', 'responsive', 'thoughtful', 'courteous', 'generous', 'resolved',
      ],
      polarity: 'pos',
    },
  ],
  Disappointment: [
    {
      words: [
        'disappointing', 'disappointed', 'disappointment', 'lacking', 'missed', 'declined',
        'worse', 'incomplete', 'underwhelming', 'regret', 'mediocre', 'lackluster', 'subpar',
        'shortfall', 'flimsy', 'letdown',
      ],
      polarity: 'neg',
    },
  ],
  Confidence: [
    {
      words: [
        'confident', 'resilient', 'disciplined', 'robust', 'reliable', 'reliability', 'stable',
        'stability', 'proven', 'solid', 'healthy', 'steady', 'dependable', 'trustworthy', 'accurate',
      ],
      polarity: 'pos',
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. Helper Utilities & Morphological Lookup
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function scoreToLabel(score: number): SentimentLabel {
  if (score >= 15) return 'Positive';
  if (score <= -15) return 'Negative';
  return 'Neutral';
}

function lookupDirectLexicon(word: string): number | undefined {
  return POSITIVE_LEXICON[word] ?? NEGATIVE_LEXICON[word];
}

function lookupWordPolarity(rawToken: string): { score: number; isIntensifierOnly?: boolean } | undefined {
  const token = rawToken.toLowerCase();
  if (!token || token.startsWith('__phrase_')) return undefined;

  const direct = lookupDirectLexicon(token);
  if (direct !== undefined) return { score: direct };

  // Handle common inflections cleanly without false stems
  const candidates: Array<{ stem: string; mult: number }> = [];

  if (token.endsWith('ies') && token.length > 4) {
    candidates.push({ stem: `${token.slice(0, -3)}y`, mult: 1.0 });
  }
  if (token.endsWith('ied') && token.length > 4) {
    candidates.push({ stem: `${token.slice(0, -3)}y`, mult: 1.0 });
  }
  if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) {
    candidates.push({ stem: token.slice(0, -1), mult: 1.0 });
    if (token.endsWith('es') && token.length > 4) {
      candidates.push({ stem: token.slice(0, -2), mult: 1.0 });
    }
  }
  if (token.endsWith('ed') && token.length > 4) {
    candidates.push({ stem: token.slice(0, -2), mult: 1.0 });
    candidates.push({ stem: token.slice(0, -1), mult: 1.0 });
  }
  if (token.endsWith('ing') && token.length > 5) {
    candidates.push({ stem: token.slice(0, -3), mult: 0.96 });
    candidates.push({ stem: `${token.slice(0, -3)}e`, mult: 0.96 });
  }
  if (token.endsWith('ly') && token.length > 4) {
    candidates.push({ stem: token.slice(0, -2), mult: 0.9 });
    if (token.endsWith('ily') && token.length > 5) {
      candidates.push({ stem: `${token.slice(0, -3)}y`, mult: 0.9 });
    }
  }
  if (token.endsWith('ness') && token.length > 6) {
    candidates.push({ stem: token.slice(0, -4), mult: 0.95 });
    if (token.endsWith('iness') && token.length > 7) {
      candidates.push({ stem: `${token.slice(0, -5)}y`, mult: 0.95 });
    }
  }

  for (const { stem, mult } of candidates) {
    const val = lookupDirectLexicon(stem);
    if (val !== undefined) {
      return { score: val * mult };
    }
  }

  // "-less" morphology: flaw -> flawless (+), effort -> effortless (+), hope/use/worth/help -> (-)
  if (token.endsWith('less') && token.length > 6) {
    const base = token.slice(0, -4);
    if (base === 'flaw' || base === 'effort' || base === 'seam' || base === 'pain' || base === 'limit') {
      return { score: 2.3 };
    }
    if (base === 'worth' || base === 'use' || base === 'hope' || base === 'help' || base === 'care' || base === 'clue' || base === 'power' || base === 'end') {
      return { score: -2.3 };
    }
  }

  // Safe negative prefix flipping (un- / dis- + positive root)
  if (!PREFIX_FLIP_EXCEPTIONS.has(token)) {
    if (token.startsWith('un') && token.length >= 6) {
      const root = token.slice(2);
      const posVal = POSITIVE_LEXICON[root];
      if (posVal !== undefined && posVal >= 1.4) {
        return { score: -posVal * 0.88 };
      }
    }
    if (token.startsWith('dis') && token.length >= 7) {
      const root = token.slice(3);
      const posVal = POSITIVE_LEXICON[root];
      if (posVal !== undefined && posVal >= 1.5) {
        return { score: -posVal * 0.85 };
      }
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// 4. Abbreviation-Safe Sentence Splitting
// ---------------------------------------------------------------------------

const PROTECTED_PATTERN = new RegExp(
  [
    'https?:\\/\\/\\S+',
    'www\\.\\S+',
    '[\\w.+-]+@[\\w-]+\\.[\\w.-]+',
    '\\bv?\\d+(?:\\.\\d+)+\\b',
    '(?:\\$|€|£)?\\d+\\.\\d+%?',
    '\\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Mt|Rev|Gen|Col|Capt|Lt|Sgt|vs|etc|approx|est|dept|fig|no|inc|ltd|corp|co|llc|plc|jan|feb|mar|apr|aug|sept|sep|oct|nov|dec)\\.',
    '\\b(?:e\\.g|i\\.e|u\\.s\\.a|u\\.s|u\\.k|a\\.m|p\\.m|et al)\\.',
    '(?:\\b[A-Z]\\.){2,}',
  ].join('|'),
  'gi'
);

function splitSentences(text: string): string[] {
  const paragraphs = text
    .split(/\r?\n+/)
    .map((p) => p.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean);

  const sentences: string[] = [];

  for (const para of paragraphs) {
    const protectedItems: string[] = [];
    let masked = para.replace(PROTECTED_PATTERN, (match) => {
      const token = `\u0000P${protectedItems.length}\u0000`;
      protectedItems.push(match);
      return token;
    });

    // Protect mid-sentence ellipses followed by lowercase
    masked = masked.replace(/\.\.\.(?=\s+[a-z])/g, (match) => {
      const token = `\u0000P${protectedItems.length}\u0000`;
      protectedItems.push(match);
      return token;
    });

    const rawChunks = masked.match(/[^.!?…]+(?:[.!?…]+["'”’)\]]*|$)/g) ?? [masked];

    for (const chunk of rawChunks) {
      const restored = chunk
        .replace(/\u0000P(\d+)\u0000/g, (_m, idx) => protectedItems[Number(idx)] ?? '')
        .trim();
      if (!restored) continue;

      // Avoid stray punctuation-only fragments by attaching to previous sentence
      if (/^["'”’)\].!?…,\s-]+$/.test(restored) && sentences.length > 0) {
        sentences[sentences.length - 1] = `${sentences[sentences.length - 1]}${restored}`;
        continue;
      }
      sentences.push(restored);
    }
  }

  return sentences;
}

// ---------------------------------------------------------------------------
// 5. Clause Segmentation & Pragmatic Weighting
// ---------------------------------------------------------------------------

interface ScoredClause {
  text: string;
  role: 'normal' | 'concessive' | 'focal';
  weightMultiplier: number;
  rawScore: number;
  normalizedScore: number;
  signalCount: number;
  wordCount: number;
  phraseEmotions: string[];
  positiveWordHits: Array<{ word: string; negated: boolean }>;
  tokens: string[];
}

const FRONT_CONCESSION_RE = /^\s*(although|even though|though|while|whereas|despite|in spite of)\b/i;
const MID_CONTRAST_PIVOT_RE = /\b(however|nevertheless|nonetheless|even so|on the other hand|that said|having said that|but|yet)\b|,\s*(though|whereas|while)\b/i;

function splitClauses(sentence: string): Array<{ text: string; role: 'normal' | 'concessive' | 'focal'; weightMultiplier: number }> {
  // First split on strong intra-sentence structural delimiters (; or em-dash)
  const majorSegments = sentence
    .split(/(?:;|—|--|\s-\s)+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const output: Array<{ text: string; role: 'normal' | 'concessive' | 'focal'; weightMultiplier: number }> = [];

  for (const segment of majorSegments) {
    // Check front-loaded concession ("Although X, Y" or "Despite X, Y")
    if (FRONT_CONCESSION_RE.test(segment)) {
      const commaIdx = segment.indexOf(',');
      if (commaIdx > 4 && commaIdx < segment.length - 4) {
        const concessivePart = segment.slice(0, commaIdx).trim();
        const mainPart = segment.slice(commaIdx + 1).trim();
        output.push({ text: concessivePart, role: 'concessive', weightMultiplier: 0.68 });
        // Further check if mainPart itself has a mid contrast pivot
        const subPivot = splitMidContrast(mainPart);
        if (subPivot.length > 1) {
          output.push(...subPivot);
        } else {
          output.push({ text: mainPart, role: 'focal', weightMultiplier: 1.32 });
        }
        continue;
      }
    }

    const pivoted = splitMidContrast(segment);
    output.push(...pivoted);
  }

  return output.length > 0 ? output : [{ text: sentence, role: 'normal', weightMultiplier: 1.0 }];
}

function splitMidContrast(
  segment: string
): Array<{ text: string; role: 'normal' | 'concessive' | 'focal'; weightMultiplier: number }> {
  const match = MID_CONTRAST_PIVOT_RE.exec(segment);
  if (!match || match.index === undefined) {
    return [{ text: segment, role: 'normal', weightMultiplier: 1.0 }];
  }

  const pivotIdx = match.index;
  const pivotText = match[0];

  // If pivot is at the very start ("However, the initial SSO..."), treat whole clause as focal
  if (pivotIdx <= 2) {
    return [{ text: segment, role: 'focal', weightMultiplier: 1.18 }];
  }

  const pre = segment.slice(0, pivotIdx).replace(/,\s*$/, '').trim();
  const post = segment.slice(pivotIdx + pivotText.length).replace(/^[,\s]+/, '').trim();

  const clauses: Array<{ text: string; role: 'normal' | 'concessive' | 'focal'; weightMultiplier: number }> = [];
  if (pre) {
    clauses.push({ text: pre, role: 'concessive', weightMultiplier: 0.72 });
  }
  if (post) {
    // Recursively split if there's another contrast marker further down
    const nested = splitMidContrast(post);
    if (nested.length > 1) {
      clauses.push(...nested);
    } else {
      clauses.push({ text: post, role: 'focal', weightMultiplier: 1.38 });
    }
  }
  return clauses.length > 0 ? clauses : [{ text: segment, role: 'normal', weightMultiplier: 1.0 }];
}

function tokenizeClause(clauseText: string): Array<{ lower: string; raw: string }> {
  return clauseText
    .replace(/[“”"()[\]{}:;,!?]/g, ' ')
    .split(/\s+/)
    .map((raw) => {
      const cleanedRaw = raw.replace(/^[.'-]+|[.'-]+$/g, '');
      return {
        raw: cleanedRaw,
        lower: cleanedRaw.toLowerCase(),
      };
    })
    .filter((t) => t.lower.length > 0);
}

function scoreClause(
  clauseText: string,
  role: 'normal' | 'concessive' | 'focal',
  weightMultiplier: number
): ScoredClause {
  const originalWordCount = Math.max(1, tokenizeClause(clauseText).length);

  // Step A: Replace multi-word phrases & idioms with placeholders so component words aren't double-counted
  let workingText = clauseText;
  const phraseMap = new Map<string, PhraseRule>();
  let phraseCounter = 0;

  for (const rule of PHRASE_RULES) {
    const globalRe = new RegExp(rule.pattern.source, 'gi');
    workingText = workingText.replace(globalRe, () => {
      const key = `__phrase_${phraseCounter++}__`;
      phraseMap.set(key, rule);
      return ` ${key} `;
    });
  }

  // Step B: Emoji & ASCII emoticon scoring
  let emojiSum = 0;
  let emojiHits = 0;
  for (const [emoji, score] of EMOJI_POLARITY) {
    if (workingText.includes(emoji)) {
      const count = workingText.split(emoji).length - 1;
      emojiSum += score * Math.min(count, 2);
      emojiHits += count;
    }
  }
  if (/(?:^|\s)(?::-\)|:\)|:D|:-D)(?:\s|$)/.test(workingText)) {
    emojiSum += 1.7;
    emojiHits += 1;
  }
  if (/(?:^|\s)(?::-\(|:\(|:\/)(?:\s|$)/.test(workingText)) {
    emojiSum -= 1.8;
    emojiHits += 1;
  }

  const tokenObjs = tokenizeClause(workingText);
  const tokens = tokenObjs.map((t) => t.lower);

  let rawSum = emojiSum;
  let signalCount = emojiHits;
  const phraseEmotions: string[] = [];
  const positiveWordHits: Array<{ word: string; negated: boolean }> = [];
  let hedgeCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const rawToken = tokenObjs[i].raw;

    if (HEDGE_WORDS.has(token)) {
      hedgeCount += 1;
    }

    let baseWeight: number | undefined;
    let isSelfNegated = false;

    if (token.startsWith('__phrase_')) {
      const phraseRule = phraseMap.get(token);
      if (phraseRule) {
        baseWeight = phraseRule.score;
        isSelfNegated = Boolean(phraseRule.selfNegated);
        if (phraseRule.emotionHint) {
          phraseEmotions.push(phraseRule.emotionHint);
        }
      }
    } else {
      // Check if an intensifier-only adverb like "severely" or "critically" immediately precedes a polar word
      // If it modifies a polar token ahead, let the ahead token absorb it as an intensifier rather than double-scoring
      if (INTENSIFIERS[token]) {
        const next1 = tokens[i + 1];
        const next2 = tokens[i + 2];
        const nextIsPolar =
          (next1 && (next1.startsWith('__phrase_') || lookupWordPolarity(next1) !== undefined)) ||
          (next2 && (next2.startsWith('__phrase_') || lookupWordPolarity(next2) !== undefined));
        if (nextIsPolar) {
          continue;
        }
      }

      const lookedUp = lookupWordPolarity(token);
      if (lookedUp !== undefined) {
        baseWeight = lookedUp.score;
      }
    }

    if (baseWeight === undefined) continue;

    signalCount += 1;
    let weight = baseWeight;

    // Negation & degree modifier lookback strictly contained inside this clause (up to 3 tokens)
    let negated = false;
    let modifier = 1.0;

    if (!isSelfNegated) {
      for (let j = Math.max(0, i - 3); j < i; j++) {
        const prev = tokens[j];
        if (NEGATION_WORDS.has(prev)) {
          negated = !negated;
        } else if (INTENSIFIERS[prev]) {
          modifier *= INTENSIFIERS[prev];
        } else if (DIMINISHERS[prev]) {
          modifier *= DIMINISHERS[prev];
        }
      }
    } else {
      // Still allow degree intensifiers ("absolutely not worth it")
      for (let j = Math.max(0, i - 2); j < i; j++) {
        const prev = tokens[j];
        if (INTENSIFIERS[prev]) {
          modifier *= INTENSIFIERS[prev];
        } else if (DIMINISHERS[prev]) {
          modifier *= DIMINISHERS[prev];
        }
      }
    }

    if (negated) {
      // Negating a positive ("not great") flips negative; negating a negative ("not bad") yields mild positive
      weight = weight > 0 ? -weight * 0.8 : Math.abs(weight) * 0.56;
    }

    // ALL-CAPS emphasis on real words (len >= 3)
    if (
      !token.startsWith('__phrase_') &&
      rawToken.length >= 3 &&
      rawToken === rawToken.toUpperCase() &&
      /[A-Z]/.test(rawToken)
    ) {
      modifier *= 1.22;
    }

    weight *= modifier;
    rawSum += weight;

    if (!token.startsWith('__phrase_')) {
      positiveWordHits.push({ word: token, negated });
    }
  }

  // Hedging dampening when clause contains modal hedging without extreme polarity
  if (hedgeCount > 0 && Math.abs(rawSum) < 4.0 && rawSum !== 0) {
    rawSum *= 0.86;
  }

  // Exclamation emphasis within clause
  const exclamations = (clauseText.match(/!/g) || []).length;
  if (exclamations > 0 && rawSum !== 0) {
    rawSum *= 1 + Math.min(exclamations, 2) * 0.1;
  }

  const normalizedDensity = rawSum / Math.sqrt(Math.max(1, originalWordCount * 0.30));
  const scaled = signalCount === 0 ? 0 : clamp(Math.tanh(normalizedDensity * 0.37) * 100, -98, 98);

  return {
    text: clauseText,
    role,
    weightMultiplier,
    rawScore: rawSum,
    normalizedScore: scaled,
    signalCount,
    wordCount: originalWordCount,
    phraseEmotions,
    positiveWordHits,
    tokens,
  };
}

function scoreSentenceWithClauses(sentence: string): {
  score: number;
  sentiment: SentimentLabel;
  signalCount: number;
  clauses: ScoredClause[];
} {
  const rawClauses = splitClauses(sentence);
  const scoredClauses = rawClauses.map((c) => scoreClause(c.text, c.role, c.weightMultiplier));

  let weightedRaw = 0;
  let totalWords = 0;
  let totalSignals = 0;

  for (const clause of scoredClauses) {
    weightedRaw += clause.rawScore * clause.weightMultiplier;
    totalWords += clause.wordCount;
    totalSignals += clause.signalCount;
  }

  if (totalSignals === 0) {
    return {
      score: 0,
      sentiment: 'Neutral',
      signalCount: 0,
      clauses: scoredClauses,
    };
  }

  // Question dampening for mild/ambiguous questions (unless strongly angry/exclamatory)
  const trimmed = sentence.trim();
  if (trimmed.endsWith('?') && !trimmed.includes('!') && Math.abs(weightedRaw) < 2.2) {
    weightedRaw *= 0.65;
  }

  const normalizedDensity = weightedRaw / Math.sqrt(Math.max(1, totalWords * 0.29));
  const finalScore = clamp(Math.tanh(normalizedDensity * 0.37) * 100, -98, 98);

  const hasStrongPosClause = scoredClauses.some((c) => c.normalizedScore >= 24);
  const hasStrongNegClause = scoredClauses.some((c) => c.normalizedScore <= -24);

  const sentiment: SentimentLabel =
    hasStrongPosClause && hasStrongNegClause && Math.abs(finalScore) < 38
      ? 'Mixed'
      : scoreToLabel(finalScore);

  return {
    score: finalScore,
    sentiment,
    signalCount: totalSignals,
    clauses: scoredClauses,
  };
}

// ---------------------------------------------------------------------------
// 6. Negation-Aware Emotion Detection
// ---------------------------------------------------------------------------

function detectEmotions(
  allClauses: ScoredClause[],
  sentences: SentencePolarity[],
  overallScore: number
): EmotionScore[] {
  const scores: Record<string, number> = {
    Satisfaction: 12,
    Frustration: 10,
    Urgency: 8,
    Optimism: 10,
    Skepticism: 10,
    Appreciation: 8,
    Disappointment: 8,
    Confidence: 12,
  };

  let totalTokens = 0;

  for (const clause of allClauses) {
    const tokens = clause.tokens;
    totalTokens += tokens.length;

    // Add phrase-level emotion hints directly
    for (const hint of clause.phraseEmotions) {
      if (scores[hint] !== undefined) {
        scores[hint] += 24;
      }
    }

    // Check individual tokens with clause-local negation awareness
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.startsWith('__phrase_')) continue;

      let negated = false;
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (NEGATION_WORDS.has(tokens[j])) {
          negated = !negated;
        }
      }

      for (const [emotion, groups] of Object.entries(EMOTION_LEXICON)) {
        for (const group of groups) {
          if (!group.words.includes(token)) continue;

          if (!negated) {
            scores[emotion] += 22;
          } else {
            // Negated negative emotions ("not frustrated", "no outages") reinforce Confidence/Satisfaction
            if (group.polarity === 'neg') {
              scores.Confidence += 14;
              scores.Satisfaction += 10;
            } else {
              // Negated positive emotions ("not helpful", "not satisfied") signal Disappointment/Frustration
              scores.Disappointment += 16;
              scores.Frustration += 12;
            }
          }
        }
      }
    }
  }

  // Reinforce from overall polarity & sentence conflict
  const posSentences = sentences.filter((s) => s.score >= 20 || s.sentiment === 'Positive').length;
  const negSentences = sentences.filter((s) => s.score <= -20 || s.sentiment === 'Negative').length;
  const mixedSentences = sentences.filter((s) => s.sentiment === 'Mixed').length;

  if (overallScore >= 24) {
    scores.Satisfaction += Math.round(overallScore * 0.44);
    scores.Confidence += Math.round(overallScore * 0.34);
    scores.Optimism += Math.round(overallScore * 0.26);
  } else if (overallScore <= -24) {
    scores.Frustration += Math.round(Math.abs(overallScore) * 0.44);
    scores.Disappointment += Math.round(Math.abs(overallScore) * 0.32);
  }

  if ((posSentences > 0 && negSentences > 0) || mixedSentences > 0) {
    scores.Skepticism += 24;
  }

  if (totalTokens > 0 && Object.values(scores).every((v) => v < 24)) {
    scores.Confidence += 26;
    scores.Skepticism += 16;
  }

  const sorted = Object.entries(scores)
    .map(([label, val]) => ({ label, score: clamp(val, 14, 96) }))
    .sort((a, b) => b.score - a.score);

  return sorted.slice(0, 3);
}

// ---------------------------------------------------------------------------
// 7. Clause-Scoped & Dynamic Aspect Extraction
// ---------------------------------------------------------------------------

interface AspectSubUnit {
  text: string;
  score: number;
  signalCount: number;
}

const STOP_NOUNS = new Set([
  'thing', 'things', 'stuff', 'way', 'time', 'times', 'day', 'days', 'week', 'weeks',
  'month', 'months', 'year', 'years', 'lot', 'lots', 'bit', 'part', 'parts', 'fact',
  'case', 'point', 'reason', 'people', 'person', 'user', 'users', 'team', 'teams',
  'company', 'product', 'service', 'system', 'platform', 'tool', 'software', 'app',
  'everything', 'something', 'anything', 'nothing', 'everyone', 'anyone', 'someone',
  'overall', 'today', 'yesterday', 'tomorrow', 'example', 'question', 'answer',
]);

function splitIntoAspectSubUnits(
  clauses: ScoredClause[],
  sentenceScore: number
): AspectSubUnit[] {
  const units: AspectSubUnit[] = [];

  for (const clause of clauses) {
    // Further divide coordinated sub-clauses (", and ", " and ", ", plus ") ONLY if sub-parts look like independent predicates
    const candidates = clause.text
      .split(/,\s+(?:and|or|plus|while)\s+|\s+\band\s+(?=(?:the|our|their|my|its|it|they|this|that)\b)/i)
      .map((s) => s.trim())
      .filter(Boolean);

    if (candidates.length <= 1) {
      units.push({
        text: clause.text,
        score: clause.signalCount > 0 ? clause.normalizedScore : sentenceScore,
        signalCount: clause.signalCount,
      });
      continue;
    }

    for (const part of candidates) {
      const scoredPart = scoreClause(part, clause.role, 1.0);
      units.push({
        text: part,
        // Inherit enclosing clause/sentence score if coordinated noun list has no local predicate ("UI, onboarding, and API are stellar")
        score:
          scoredPart.signalCount > 0
            ? scoredPart.normalizedScore
            : clause.signalCount > 0
              ? clause.normalizedScore
              : sentenceScore,
        signalCount: Math.max(scoredPart.signalCount, clause.signalCount),
      });
    }
  }

  return units;
}

function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function extractDynamicTopics(subUnits: AspectSubUnit[], existingTopics: Set<string>): AspectSentiment[] {
  const topicBuckets = new Map<string, number[]>();

  // Match "the/our/their/this <noun phrase> is/was/are/were/felt/tasted/looked/seems..."
  const subjectPattern = /\b(?:the|our|their|my|its|this)\s+([a-z][a-z0-9-]{2,18}(?:\s+[a-z][a-z0-9-]{2,18})?)\s+(?:is|are|was|were|feels?|felt|tastes?|tasted|looks?|looked|seems?|seemed|remains?|remained|runs?|ran|works?|worked|smells?|smelled|sounds?|sounded)\b/gi;

  for (const unit of subUnits) {
    if (Math.abs(unit.score) < 16) continue;
    let match: RegExpExecArray | null;
    subjectPattern.lastIndex = 0;

    while ((match = subjectPattern.exec(unit.text)) !== null) {
      const rawPhrase = match[1].trim().toLowerCase();
      const words = rawPhrase.split(/\s+/);
      const lastWord = words[words.length - 1];
      if (STOP_NOUNS.has(lastWord) || STOP_NOUNS.has(rawPhrase)) continue;
      if (lookupWordPolarity(lastWord) !== undefined) continue;

      const label = toTitleCase(rawPhrase);
      const lowerLabel = label.toLowerCase();
      const overlapsKnown = Array.from(existingTopics).some((t) =>
        t.toLowerCase().includes(lowerLabel)
      );
      if (overlapsKnown) continue;

      const bucket = topicBuckets.get(label) ?? [];
      bucket.push(unit.score);
      topicBuckets.set(label, bucket);
    }
  }

  const dynamic: AspectSentiment[] = [];
  for (const [topic, scores] of topicBuckets.entries()) {
    const avg = clamp(scores.reduce((a, b) => a + b, 0) / scores.length, -100, 100);
    dynamic.push({
      topic,
      sentiment: scoreToLabel(avg),
      score: avg,
    });
  }

  return dynamic;
}

function extractAspects(
  sentenceEntries: Array<{ sentence: SentencePolarity; clauses: ScoredClause[] }>
): AspectSentiment[] {
  const allSubUnits: AspectSubUnit[] = [];
  for (const entry of sentenceEntries) {
    allSubUnits.push(...splitIntoAspectSubUnits(entry.clauses, entry.sentence.score));
  }

  const results: AspectSentiment[] = [];
  const matchedTopics = new Set<string>();

  for (const pattern of ASPECT_PATTERNS) {
    const matchingUnits = allSubUnits.filter((u) => pattern.keywords.test(u.text));
    if (matchingUnits.length === 0) continue;

    // Weight units with direct sentiment signals slightly higher than neutral passing mentions
    let weightedSum = 0;
    let weightTotal = 0;
    for (const u of matchingUnits) {
      const w = u.signalCount > 0 ? 1.25 : 0.75;
      weightedSum += u.score * w;
      weightTotal += w;
    }

    const rounded = clamp(weightedSum / Math.max(0.01, weightTotal), -100, 100);
    const hasPos = matchingUnits.some((u) => u.score >= 20);
    const hasNeg = matchingUnits.some((u) => u.score <= -20);
    const sentiment: SentimentLabel =
      hasPos && hasNeg && Math.abs(rounded) < 35 ? 'Mixed' : scoreToLabel(rounded);

    matchedTopics.add(pattern.topic);
    results.push({
      topic: pattern.topic,
      sentiment,
      score: rounded,
    });
  }

  // Supplement with dynamic noun-phrase topics for non-SaaS domains (dining, hospitality, retail, etc.)
  if (results.length < 3) {
    const dynamic = extractDynamicTopics(allSubUnits, matchedTopics);
    results.push(...dynamic);
  }

  if (results.length === 0 && sentenceEntries.length > 0) {
    const overallAvg = clamp(
      sentenceEntries.reduce((sum, s) => sum + s.sentence.score, 0) / sentenceEntries.length,
      -100,
      100
    );
    results.push({
      topic: 'General Tone',
      sentiment: scoreToLabel(overallAvg),
      score: overallAvg,
    });
  }

  return results
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 5);
}

// ---------------------------------------------------------------------------
// 8. Executive Summary Generation
// ---------------------------------------------------------------------------

function buildSummary(
  sentiment: SentimentLabel,
  score: number,
  emotions: EmotionScore[],
  aspects: AspectSentiment[]
): string {
  const primaryEmotion = emotions[0]?.label.toLowerCase() ?? 'measured tone';
  const topPositive = aspects.find((a) => a.score >= 18)?.topic;
  const topNegative = aspects.find((a) => a.score <= -18)?.topic;

  if (sentiment === 'Mixed') {
    if (topPositive && topNegative) {
      return `Balanced yet conflicted tone showing ${primaryEmotion}, pairing clear appreciation for ${topPositive} with friction around ${topNegative}.`;
    }
    return `Mixed sentiment profile marked by ${primaryEmotion}, blending constructive endorsement with notable points of friction.`;
  }

  if (sentiment === 'Positive') {
    const strength = score >= 55 ? 'Decisively positive' : 'Favorable, constructive';
    if (topPositive && topNegative) {
      return `${strength} tone anchored by ${primaryEmotion}, led by praise for ${topPositive} despite minor notes on ${topNegative}.`;
    }
    return topPositive
      ? `${strength} tone anchored by ${primaryEmotion}, led by strong sentiment toward ${topPositive}.`
      : `${strength} communication expressing clear ${primaryEmotion} and conviction.`;
  }

  if (sentiment === 'Negative') {
    const severity = score <= -55 ? 'Critically negative' : 'Unfavorable';
    if (topNegative && topPositive) {
      return `${severity} tone driven by ${primaryEmotion}, centered on ${topNegative} despite isolated praise for ${topPositive}.`;
    }
    return topNegative
      ? `${severity} tone driven by ${primaryEmotion}, centered primarily on ${topNegative}.`
      : `${severity} sentiment profile reflecting heightened ${primaryEmotion} and unresolved dissatisfaction.`;
  }

  return `Measured, matter-of-fact tone led by ${primaryEmotion} without strong positive or negative polarization.`;
}

// ---------------------------------------------------------------------------
// 9. Public Entry Point (Signature Preserved)
// ---------------------------------------------------------------------------

export function analyzeWithOfflineNlp(inputText: string): AnalysisResult {
  const rawSentences = splitSentences(inputText);
  let totalSignals = 0;

  const sentenceEntries: Array<{ sentence: SentencePolarity; clauses: ScoredClause[] }> = [];
  const allClauses: ScoredClause[] = [];

  for (const sentenceText of rawSentences) {
    const { score, sentiment, signalCount, clauses } = scoreSentenceWithClauses(sentenceText);
    totalSignals += signalCount;
    allClauses.push(...clauses);
    sentenceEntries.push({
      sentence: {
        text: sentenceText,
        sentiment,
        score,
      },
      clauses,
    });
  }

  const sentences = sentenceEntries.map((e) => e.sentence);

  if (sentences.length === 0) {
    return {
      sentiment: 'Neutral',
      score: 0,
      confidence: 50,
      summary: 'No analyzable text provided.',
      emotions: [{ label: 'Neutrality', score: 50 }],
      aspects: [],
      sentences: [],
    };
  }

  const weightedSum = sentences.reduce((acc, s, idx) => {
    const positionWeight = idx === sentences.length - 1 && sentences.length > 1 ? 1.12 : 1.0;
    return acc + s.score * positionWeight;
  }, 0);
  const weightDenom = sentences.reduce(
    (acc, _s, idx) => acc + (idx === sentences.length - 1 && sentences.length > 1 ? 1.12 : 1.0),
    0
  );

  const overallScore = clamp(weightedSum / Math.max(1, weightDenom), -100, 100);
  const strongPos =
    sentences.some((s) => s.score >= 25) ||
    allClauses.some((c) => c.normalizedScore >= 28);
  const strongNeg =
    sentences.some((s) => s.score <= -25) ||
    allClauses.some((c) => c.normalizedScore <= -28);

  let overallSentiment: SentimentLabel;
  if (strongPos && strongNeg && Math.abs(overallScore) < 42) {
    overallSentiment = 'Mixed';
  } else {
    overallSentiment = scoreToLabel(overallScore);
  }

  const signalDensity = Math.min(1, totalSignals / Math.max(2, sentences.length * 1.8));
  const agreementBonus = strongPos && strongNeg ? -6 : 10;
  const confidence = clamp(64 + signalDensity * 25 + agreementBonus, 55, 96);

  const emotions = detectEmotions(allClauses, sentences, overallScore);
  const aspects = extractAspects(sentenceEntries);
  const summary = buildSummary(overallSentiment, overallScore, emotions, aspects);

  return {
    sentiment: overallSentiment,
    score: overallScore,
    confidence,
    summary,
    emotions,
    aspects,
    sentences,
  };
}
