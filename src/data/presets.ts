import type { HistoryRecord, PresetSample } from '../types/sentiment';

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'saas-review',
    label: 'SaaS Review',
    category: 'Product Feedback',
    text: 'Northstar’s redesigned workflow editor is remarkably intuitive, and our product team cut weekly reporting time in half thanks to the clean typography and instant CSV exports. However, the initial SSO onboarding documentation was confusing, and the enterprise seat pricing feels slightly steep for smaller analytics squads. Overall, the reliability has been stellar and customer support resolved our integration ticket within twenty minutes.',
  },
  {
    id: 'support-ticket',
    label: 'Support Ticket',
    category: 'Customer Escalation',
    text: 'Our production billing webhooks have been failing with 502 errors since 6:00 AM, and three enterprise renewals are currently blocked! This outage is unacceptable for a mission-critical tier and our finance team is extremely frustrated by the lack of status updates. That said, Maya from your account team was attentive and escalated the logs immediately, which we genuinely appreciate.',
  },
  {
    id: 'earnings-call',
    label: 'Earnings Call',
    category: 'Executive Transcript',
    text: 'Third-quarter annual recurring revenue grew 34% year-over-year, reflecting strong enterprise momentum and record net dollar retention across North America. While near-term cloud infrastructure costs created modest gross margin compression, our disciplined R&D investments leave us confident heading into Q4. Customer expansion remains healthy, though we are taking a cautious stance on European SMB budgets.',
  },
];

export const SEEDED_HISTORY: HistoryRecord[] = [
  {
    id: 'rec-seed-01',
    timestamp: '2026-11-15T09:18:00.000Z',
    inputText: PRESET_SAMPLES[0].text,
    engine: 'ai',
    sentiment: 'Positive',
    score: 54,
    confidence: 91,
    summary:
      'Constructively positive review celebrating workflow polish and rapid support while flagging onboarding clarity and enterprise pricing.',
    emotions: [
      { label: 'Satisfaction', score: 82 },
      { label: 'Appreciation', score: 68 },
      { label: 'Skepticism', score: 34 },
    ],
    aspects: [
      { topic: 'UI Design & UX', sentiment: 'Positive', score: 86 },
      { topic: 'Customer Support', sentiment: 'Positive', score: 82 },
      { topic: 'Onboarding & Docs', sentiment: 'Negative', score: -48 },
      { topic: 'Pricing & Billing', sentiment: 'Negative', score: -35 },
    ],
    sentences: [
      {
        text: 'Vespera’s redesigned workflow editor is remarkably intuitive, and our product team cut weekly reporting time in half thanks to the clean typography and instant CSV exports.',
        sentiment: 'Positive',
        score: 84,
      },
      {
        text: 'However, the initial SSO onboarding documentation was confusing, and the enterprise seat pricing feels slightly steep for smaller analytics squads.',
        sentiment: 'Negative',
        score: -42,
      },
      {
        text: 'Overall, the reliability has been stellar and customer support resolved our integration ticket within twenty minutes.',
        sentiment: 'Positive',
        score: 80,
      },
    ],
  },
  {
    id: 'rec-seed-02',
    timestamp: '2026-11-15T08:42:00.000Z',
    inputText: PRESET_SAMPLES[1].text,
    engine: 'ai',
    sentiment: 'Negative',
    score: -58,
    confidence: 94,
    summary:
      'Urgent escalation expressing acute frustration over a production billing outage, tempered slightly by appreciation for an attentive account representative.',
    emotions: [
      { label: 'Urgency', score: 92 },
      { label: 'Frustration', score: 86 },
      { label: 'Appreciation', score: 44 },
    ],
    aspects: [
      { topic: 'Reliability & Uptime', sentiment: 'Negative', score: -90 },
      { topic: 'Pricing & Billing', sentiment: 'Negative', score: -74 },
      { topic: 'Customer Support', sentiment: 'Positive', score: 56 },
    ],
    sentences: [
      {
        text: 'Our production billing webhooks have been failing with 502 errors since 6:00 AM, and three enterprise renewals are currently blocked!',
        sentiment: 'Negative',
        score: -84,
      },
      {
        text: 'This outage is unacceptable for a mission-critical tier and our finance team is extremely frustrated by the lack of status updates.',
        sentiment: 'Negative',
        score: -88,
      },
      {
        text: 'That said, Maya from your account team was attentive and escalated the logs immediately, which we genuinely appreciate.',
        sentiment: 'Positive',
        score: 64,
      },
    ],
  },
  {
    id: 'rec-seed-03',
    timestamp: '2026-11-14T17:05:00.000Z',
    inputText: PRESET_SAMPLES[2].text,
    engine: 'offline',
    sentiment: 'Mixed',
    score: 26,
    confidence: 85,
    summary:
      'Balanced executive commentary highlighting strong 34% ARR momentum alongside measured caution on near-term margin pressure and European SMB demand.',
    emotions: [
      { label: 'Confidence', score: 78 },
      { label: 'Optimism', score: 66 },
      { label: 'Skepticism', score: 48 },
    ],
    aspects: [
      { topic: 'Revenue & ARR Growth', sentiment: 'Positive', score: 80 },
      { topic: 'Margins & Costs', sentiment: 'Negative', score: -40 },
      { topic: 'Guidance & Outlook', sentiment: 'Mixed', score: 18 },
    ],
    sentences: [
      {
        text: 'Third-quarter annual recurring revenue grew 34% year-over-year, reflecting strong enterprise momentum and record net dollar retention across North America.',
        sentiment: 'Positive',
        score: 78,
      },
      {
        text: 'While near-term cloud infrastructure costs created modest gross margin compression, our disciplined R&D investments leave us confident heading into Q4.',
        sentiment: 'Positive',
        score: 28,
      },
      {
        text: 'Customer expansion remains healthy, though we are taking a cautious stance on European SMB budgets.',
        sentiment: 'Mixed',
        score: -14,
      },
    ],
  },
];
