export type QueryIntent = 'data_retrieval' | 'action' | 'support' | 'unclear';

interface IntentClassificationResult {
  intent: QueryIntent;
  confidence: number;
  reasoning: string;
}

const intentPatterns: Record<QueryIntent, string[]> = {
  data_retrieval: [
    'how many', 'show me', 'list', 'get', 'count', 'report',
    'analytics', 'statistics', 'summary', 'find', 'search', 'retrieve',
    'display', 'view', 'check', 'fetch'
  ],
  action: [
    'reset', 'update', 'delete', 'remove', 'change', 'modify', 'create',
    'add', 'execute', 'run', 'perform', 'set', 'assign', 'revoke'
  ],
  support: [
    'help', 'issue', 'problem', 'bug', 'error', 'broken', 'not working',
    'crash', 'stuck', 'feedback', 'complaint', 'support', 'escalate',
    'urgent', 'critical', 'need assistance'
  ],
  unclear: []
};

export function classifyIntent(query: string): IntentClassificationResult {
  const lowerQuery = query.toLowerCase();

  const intents = Object.entries(intentPatterns) as [QueryIntent, string[]][];
  let maxMatches = 0;
  let detectedIntent: QueryIntent = 'unclear';

  for (const [intent, patterns] of intents) {
    const matches = patterns.filter(pattern => lowerQuery.includes(pattern)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedIntent = intent;
    }
  }

  const confidence = maxMatches > 0 ? Math.min(0.3 + (maxMatches * 0.2), 0.95) : 0.1;

  const reasoning = maxMatches > 0
    ? `Detected ${maxMatches} pattern(s) matching "${detectedIntent}" intent`
    : 'No clear intent patterns detected; requires context';

  return {
    intent: detectedIntent,
    confidence,
    reasoning
  };
}

export function shouldRouteToAction(intent: QueryIntent): boolean {
  return intent === 'action' || intent === 'support';
}

export function shouldUseFallback(intent: QueryIntent): boolean {
  return intent === 'support' || intent === 'unclear';
}
