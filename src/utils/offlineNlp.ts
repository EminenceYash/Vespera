import type { AnalysisResult, AspectSentiment, EmotionScore, SentimentLabel, SentencePolarity } from '../types/sentiment';

const POSITIVE_LEXICON: Record<string, number> = {
  outstanding: 3.0,
  exceptional: 3.0,
  phenomenal: 3.0,
  transformative: 2.8,
  delightful: 2.8,
  seamless: 2.6,
  flawless: 2.8,
  remarkable: 2.6,
  excellent: 2.7,
  brilliant: 2.7,
  exceeded: 2.5,
  intuitive: 2.3,
  responsive: 2.2,
  reliable: 2.3,
  fast: 1.9,
  crisp: 1.8,
  clean: 1.7,
  elegant: 2.2,
  polished: 2.1,
  thoughtful: 2.0,
  clear: 1.6,
  helpful: 2.1,
  transparent: 2.0,
  strong: 1.9,
  resilient: 2.1,
  confident: 2.0,
  accelerated: 2.2,
  growth: 1.9,
  expanded: 1.8,
  healthy: 1.9,
  record: 2.0,
  outperformed: 2.5,
  momentum: 1.8,
  love: 2.6,
  loved: 2.6,
  great: 2.2,
  good: 1.6,
  solid: 1.7,
  smooth: 2.0,
  impressed: 2.3,
  appreciated: 2.1,
  appreciate: 2.0,
  grateful: 2.2,
  resolved: 1.8,
  stable: 1.8,
  improved: 2.0,
  improvement: 1.9,
  efficient: 2.0,
  effortless: 2.4,
  streamlined: 2.1,
  winning: 2.2,
  praised: 2.1,
  recommend: 2.2,
  pleased: 2.0,
  satisfied: 2.0,
  satisfactory: 1.4,
  encouraging: 1.9,
  optimistic: 2.0,
  favorable: 1.9,
  robust: 2.1,
  upbeat: 2.0,
  disciplined: 1.7,
  proactive: 2.0,
  attentive: 2.1,
  thank: 1.7,
  thanks: 1.7,
  superb: 2.8,
  stellar: 2.8,
  value: 1.5,
  valuable: 1.9,
};

const NEGATIVE_LEXICON: Record<string, number> = {
  unacceptable: -3.0,
  catastrophic: -3.2,
  broken: -2.8,
  unusable: -3.0,
  terrible: -2.9,
  horrible: -2.9,
  awful: -2.8,
  frustrating: -2.5,
  frustrated: -2.5,
  disappointing: -2.4,
  disappointed: -2.4,
  outage: -2.8,
  downtime: -2.7,
  failed: -2.5,
  failing: -2.5,
  failure: -2.6,
  crash: -2.6,
  crashed: -2.6,
  crashes: -2.6,
  buggy: -2.4,
  clunky: -2.1,
  confusing: -2.0,
  sluggish: -2.1,
  slow: -1.9,
  delayed: -2.0,
  delay: -1.9,
  delays: -2.0,
  expensive: -1.8,
  overpriced: -2.3,
  opaque: -1.9,
  unclear: -1.7,
  ignored: -2.4,
  unresponsive: -2.6,
  escalated: -1.9,
  escalation: -1.9,
  churn: -2.2,
  declined: -2.1,
  decline: -2.0,
  compressed: -1.7,
  compression: -1.8,
  headwind: -1.9,
  headwinds: -2.0,
  cautious: -1.3,
  concern: -1.7,
  concerns: -1.8,
  concerned: -1.7,
  risk: -1.5,
  risks: -1.6,
  bottleneck: -2.0,
  friction: -1.8,
  painful: -2.4,
  poor: -2.2,
  bad: -2.1,
  worse: -2.4,
  worst: -2.9,
  inadequate: -2.3,
  incomplete: -1.8,
  lacking: -1.9,
  missing: -1.7,
  stuck: -2.0,
  blocked: -2.2,
  error: -2.0,
  errors: -2.1,
  problem: -1.8,
  problems: -1.9,
  issue: -1.5,
  issues: -1.7,
  urgent: -1.5,
  urgently: -1.6,
  critical: -1.7,
  critically: -1.9,
  severely: -2.1,
  struggling: -2.0,
  weak: -2.0,
  softness: -1.6,
  missed: -2.0,
  overwhelmed: -2.0,
  tedious: -1.9,
  annoying: -2.1,
  regret: -2.2,
  hate: -2.8,
  unable: -1.8,
  cannot: -1.4,
};

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
  "cannot",
  "haven't",
  "hasn't",
  "shouldn't",
]);

const INTENSIFIERS: Record<string, number> = {
  extremely: 1.55,
  incredibly: 1.5,
  remarkably: 1.4,
  exceptionally: 1.5,
  significantly: 1.35,
  substantially: 1.35,
  deeply: 1.4,
  severely: 1.45,
  critically: 1.45,
  very: 1.3,
  really: 1.25,
  quite: 1.15,
  particularly: 1.2,
  especially: 1.25,
  hugely: 1.4,
  totally: 1.35,
  completely: 1.4,
  absolutely: 1.45,
  genuinely: 1.25,
};

const DIMINISHERS: Record<string, number> = {
  slightly: 0.65,
  somewhat: 0.7,
  mildly: 0.65,
  marginally: 0.6,
  moderately: 0.75,
  partially: 0.7,
  a_bit: 0.7,
  occasionally: 0.75,
};

const CONTRAST_MARKERS = new Set([
  'but',
  'however',
  'yet',
  'although',
  'though',
  'nevertheless',
  'nonetheless',
  'whereas',
  'despite',
]);

interface AspectPattern {
  topic: string;
  keywords: RegExp;
}

const ASPECT_PATTERNS: AspectPattern[] = [
  { topic: 'UI Design & UX', keywords: /\b(ui|ux|interface|design|layout|typography|navigation|workflow|dashboard|usability|experience)\b/i },
  { topic: 'Customer Support', keywords: /\b(support|rep|representative|agent|ticket|helpdesk|response|team|account manager|service)\b/i },
  { topic: 'Reliability & Uptime', keywords: /\b(uptime|outage|downtime|reliable|reliability|stability|stable|crash|crashes|bug|bugs|error|errors)\b/i },
  { topic: 'Performance & Speed', keywords: /\b(speed|fast|slow|sluggish|latency|performance|responsive|load|loading|snappy)\b/i },
  { topic: 'Onboarding & Docs', keywords: /\b(onboarding|setup|documentation|docs|training|migration|learning curve|rollout)\b/i },
  { topic: 'Pricing & Billing', keywords: /\b(pricing|price|cost|invoice|billing|tier|plan|expensive|overpriced|subscription|renewal)\b/i },
  { topic: 'Revenue & ARR Growth', keywords: /\b(revenue|arr|growth|bookings|pipeline|retention|expansion|demand|sales|quarter|q[1-4])\b/i },
  { topic: 'Margins & Costs', keywords: /\b(margin|margins|ebitda|operating|cost|costs|spend|efficiency|headwind|guidance|capex)\b/i },
  { topic: 'API & Integrations', keywords: /\b(api|webhook|webhooks|integration|integrations|sdk|sync|export|csv|automation)\b/i },
  { topic: 'Security & Compliance', keywords: /\b(security|sso|soc2|compliance|audit|permissions|access|encryption|privacy)\b/i },
];

const EMOTION_KEYWORDS: Record<string, RegExp> = {
  Satisfaction: /\b(pleased|satisfied|great|love|loved|delightful|seamless|intuitive|smooth|impressed|excellent|recommend|clean)\b/i,
  Frustration: /\b(frustrating|frustrated|annoying|clunky|broken|unacceptable|painful|tedious|stuck|buggy|worst|terrible)\b/i,
  Urgency: /\b(urgent|urgently|immediately|critical|critically|outage|downtime|blocked|escalated|escalation|asap|deadline)\b/i,
  Optimism: /\b(momentum|growth|accelerated|record|outperformed|optimistic|encouraging|promising|bright|expanding|strong)\b/i,
  Skepticism: /\b(cautious|headwind|headwinds|unclear|opaque|concern|concerns|concerned|risk|risks|question|however|but)\b/i,
  Appreciation: /\b(thank|thanks|grateful|appreciated|appreciate|helpful|attentive|proactive|responsive|thoughtful)\b/i,
  Disappointment: /\b(disappointing|disappointed|lacking|missed|declined|worse|incomplete|underwhelming|regret)\b/i,
  Confidence: /\b(confident|resilient|disciplined|robust|reliable|stable|proven|solid|healthy|steady)\b/i,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function scoreToLabel(score: number): SentimentLabel {
  if (score >= 16) return 'Positive';
  if (score <= -16) return 'Negative';
  return 'Neutral';
}

function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const raw = cleaned.match(/[^.!?]+(?:[.!?]+|$)/g);
  if (!raw) return [cleaned];
  return raw.map((s) => s.trim()).filter((s) => s.length > 0);
}

function tokenizeWords(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[“”"()[\]{}:;,!?]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.'-]+|[.'-]+$/g, ''))
    .filter(Boolean);
}

function scoreSentence(sentence: string): { score: number; signalCount: number } {
  const tokens = tokenizeWords(sentence);
  if (tokens.length === 0) return { score: 0, signalCount: 0 };

  let contrastIndex = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (CONTRAST_MARKERS.has(tokens[i])) {
      contrastIndex = i;
      break;
    }
  }

  let rawSum = 0;
  let signalCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const baseLex = POSITIVE_LEXICON[token] ?? NEGATIVE_LEXICON[token];
    if (baseLex === undefined) continue;

    signalCount += 1;
    let weight = baseLex;

    // Look back up to 3 tokens for negation or degree modifiers
    let negated = false;
    let modifier = 1.0;

    for (let j = Math.max(0, i - 3); j < i; j++) {
      const prev = tokens[j];
      if (CONTRAST_MARKERS.has(prev)) {
        // Don't bleed negation across a contrast conjunction
        negated = false;
        modifier = 1.0;
        continue;
      }
      if (NEGATION_WORDS.has(prev)) {
        negated = !negated;
      } else if (INTENSIFIERS[prev]) {
        modifier *= INTENSIFIERS[prev];
      } else if (DIMINISHERS[prev]) {
        modifier *= DIMINISHERS[prev];
      }
    }

    if (negated) {
      // Negating a positive ("not great") yields moderate negative; negating a negative ("not bad") yields mild positive
      weight = weight > 0 ? -weight * 0.78 : Math.abs(weight) * 0.52;
    }

    weight *= modifier;

    // Apply contrast conjunction weighting (post-contrast carries greater pragmatic weight)
    if (contrastIndex !== -1) {
      weight *= i > contrastIndex ? 1.38 : 0.72;
    }

    rawSum += weight;
  }

  // Exclamation emphasis
  const exclamations = (sentence.match(/!/g) || []).length;
  if (exclamations > 0 && rawSum !== 0) {
    rawSum *= 1 + Math.min(exclamations, 2) * 0.1;
  }

  if (signalCount === 0) {
    return { score: 0, signalCount: 0 };
  }

  // Normalize smoothly into -100..+100 using tanh saturation
  const normalizedDensity = rawSum / Math.sqrt(Math.max(1, tokens.length * 0.28));
  const scaled = Math.tanh(normalizedDensity * 0.42) * 100;
  return {
    score: clamp(scaled, -98, 98),
    signalCount,
  };
}

function detectEmotions(text: string, sentences: SentencePolarity[], overallScore: number): EmotionScore[] {
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

  const tokens = tokenizeWords(text);
  for (const [emotion, regex] of Object.entries(EMOTION_KEYWORDS)) {
    const matches = text.match(new RegExp(regex.source, 'gi'));
    if (matches) {
      scores[emotion] += Math.min(72, matches.length * 22);
    }
  }

  // Reinforce from overall polarity & sentence variance
  const posSentences = sentences.filter((s) => s.score >= 20).length;
  const negSentences = sentences.filter((s) => s.score <= -20).length;

  if (overallScore > 25) {
    scores.Satisfaction += Math.round(overallScore * 0.45);
    scores.Confidence += Math.round(overallScore * 0.35);
    scores.Optimism += Math.round(overallScore * 0.28);
  } else if (overallScore < -25) {
    scores.Frustration += Math.round(Math.abs(overallScore) * 0.45);
    scores.Disappointment += Math.round(Math.abs(overallScore) * 0.32);
  }

  if (posSentences > 0 && negSentences > 0) {
    scores.Skepticism += 28;
  }

  if (tokens.length > 0 && Object.values(scores).every((v) => v < 24)) {
    scores.Confidence += 28;
    scores.Skepticism += 18;
  }

  const sorted = Object.entries(scores)
    .map(([label, val]) => ({ label, score: clamp(val, 14, 96) }))
    .sort((a, b) => b.score - a.score);

  return sorted.slice(0, 3);
}

function extractAspects(sentences: SentencePolarity[]): AspectSentiment[] {
  const results: AspectSentiment[] = [];

  for (const pattern of ASPECT_PATTERNS) {
    const matchingSentences = sentences.filter((s) => pattern.keywords.test(s.text));
    if (matchingSentences.length === 0) continue;

    const avgScore =
      matchingSentences.reduce((sum, s) => sum + s.score, 0) / matchingSentences.length;
    const rounded = clamp(avgScore, -100, 100);

    const hasPos = matchingSentences.some((s) => s.score >= 20);
    const hasNeg = matchingSentences.some((s) => s.score <= -20);
    const sentiment: SentimentLabel =
      hasPos && hasNeg && Math.abs(rounded) < 35 ? 'Mixed' : scoreToLabel(rounded);

    results.push({
      topic: pattern.topic,
      sentiment,
      score: rounded,
    });
  }

  if (results.length === 0 && sentences.length > 0) {
    const overallAvg = clamp(
      sentences.reduce((sum, s) => sum + s.score, 0) / sentences.length,
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

function buildSummary(
  sentiment: SentimentLabel,
  emotions: EmotionScore[],
  aspects: AspectSentiment[]
): string {
  const primaryEmotion = emotions[0]?.label.toLowerCase() ?? 'measured tone';
  const topPositive = aspects.find((a) => a.score >= 20)?.topic;
  const topNegative = aspects.find((a) => a.score <= -20)?.topic;

  if (sentiment === 'Mixed') {
    if (topPositive && topNegative) {
      return `Balanced yet conflicted tone showing ${primaryEmotion}, pairing clear appreciation for ${topPositive} with friction around ${topNegative}.`;
    }
    return `Mixed sentiment profile marked by ${primaryEmotion}, blending constructive endorsement with notable points of friction.`;
  }

  if (sentiment === 'Positive') {
    return topPositive
      ? `Decisively positive tone anchored by ${primaryEmotion}, led by strong sentiment toward ${topPositive}.`
      : `Predominantly positive communication expressing clear ${primaryEmotion} and constructive conviction.`;
  }

  if (sentiment === 'Negative') {
    return topNegative
      ? `Critically negative tone driven by ${primaryEmotion}, centered primarily on ${topNegative}.`
      : `Unfavorable sentiment profile reflecting heightened ${primaryEmotion} and unresolved dissatisfaction.`;
  }

  return `Measured, matter-of-fact tone led by ${primaryEmotion} without strong positive or negative polarization.`;
}

export function analyzeWithOfflineNlp(inputText: string): AnalysisResult {
  const rawSentences = splitSentences(inputText);
  let totalSignals = 0;

  const sentences: SentencePolarity[] = rawSentences.map((sentenceText) => {
    const { score, signalCount } = scoreSentence(sentenceText);
    totalSignals += signalCount;
    return {
      text: sentenceText,
      sentiment: scoreToLabel(score),
      score,
    };
  });

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
    // Slightly emphasize closing statement
    const positionWeight = idx === sentences.length - 1 && sentences.length > 1 ? 1.15 : 1.0;
    return acc + s.score * positionWeight;
  }, 0);
  const weightDenom = sentences.reduce(
    (acc, _s, idx) => acc + (idx === sentences.length - 1 && sentences.length > 1 ? 1.15 : 1.0),
    0
  );

  const overallScore = clamp(weightedSum / Math.max(1, weightDenom), -100, 100);
  const strongPos = sentences.some((s) => s.score >= 28);
  const strongNeg = sentences.some((s) => s.score <= -28);

  let overallSentiment: SentimentLabel;
  if (strongPos && strongNeg && Math.abs(overallScore) < 42) {
    overallSentiment = 'Mixed';
  } else {
    overallSentiment = scoreToLabel(overallScore);
  }

  const signalDensity = Math.min(1, totalSignals / Math.max(2, sentences.length * 1.8));
  const agreementBonus = strongPos && strongNeg ? -8 : 10;
  const confidence = clamp(62 + signalDensity * 26 + agreementBonus, 55, 95);

  const emotions = detectEmotions(inputText, sentences, overallScore);
  const aspects = extractAspects(sentences);
  const summary = buildSummary(overallSentiment, emotions, aspects);

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
