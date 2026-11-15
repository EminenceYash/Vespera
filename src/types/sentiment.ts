export type SentimentLabel = 'Positive' | 'Neutral' | 'Negative' | 'Mixed';

export type EngineMode = 'hybrid' | 'offline';
export type AnalysisEngineUsed = 'ai' | 'offline';

export interface EmotionScore {
  label: string;
  score: number;
}

export interface AspectSentiment {
  topic: string;
  sentiment: SentimentLabel;
  score: number;
}

export interface SentencePolarity {
  text: string;
  sentiment: SentimentLabel;
  score: number;
}

export interface AnalysisResult {
  sentiment: SentimentLabel;
  score: number;
  confidence: number;
  summary: string;
  emotions: EmotionScore[];
  aspects: AspectSentiment[];
  sentences: SentencePolarity[];
}

export interface HistoryRecord extends AnalysisResult {
  id: string;
  timestamp: string;
  inputText: string;
  engine: AnalysisEngineUsed;
}

export interface PresetSample {
  id: string;
  label: string;
  category: string;
  text: string;
}
