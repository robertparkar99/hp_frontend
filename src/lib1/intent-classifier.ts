// ================= TYPES =================

export type QueryIntent =
  | 'data_retrieval'
  | 'action'
  | 'support'
  | 'CREATE_JOB_DESCRIPTION'
  | 'Course_Recommendation'
  | 'unclear';

interface IntentClassificationResult {
  intent: QueryIntent;
  confidence: number;
  reasoning: string;
}

// ================= INTENT PATTERNS =================
// ⚠️ Order matters: specific intents FIRST

const intentPatterns: Record<QueryIntent, string[]> = {
  CREATE_JOB_DESCRIPTION: [
    'create jd',
    'create job description',
    'generate jd',
    'job description',
    'role description',
    'jd for',
    'jd of'
  ],

  Course_Recommendation: [
    'recommend course',
    'course recommendation',
    'suggest course',
    'course suggestion',
    'course suggest',  // Added: "course suggest" pattern
    'recommend learning path',
    'learning path recommendation',
    'suggest learning path',
    'learning path suggestion'
  ],

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

// ================= CLASSIFIER =================

export function classifyIntent(query: string): IntentClassificationResult {
  const lowerQuery = query.toLowerCase();

  // First check for JOB_ROLE_COMPETENCY patterns (high specificity)
  const competencyPatterns = intentPatterns.JOB_ROLE_COMPETENCY.map(p => p.toLowerCase());
  const competencyMatches = competencyPatterns.filter(pattern =>
    lowerQuery.includes(pattern)
  ).length;

  // Check for follow-up patterns (comparing with previous context)
  const isFollowUpQuery = [
    'senior version',
    'compare this',
    'similar to',
    'what about',
    'instead of',
    'other role',
    'different role'
  ].some(pattern => lowerQuery.includes(pattern));

  // If it's a competency-related query or follow-up
  if (competencyMatches > 0 || (isFollowUpQuery && conversationHistory)) {
    const entities = extractEntities(query);

    // Calculate confidence
    let confidence = 0.5 + competencyMatches * 0.15;
    if (isFollowUpQuery) confidence += 0.2;
    confidence = Math.min(confidence, 0.98);

    const reasoning = competencyMatches > 0
      ? `Detected ${competencyMatches} competency pattern(s) matching "JOB_ROLE_COMPETENCY" intent`
      : 'Follow-up query related to job role competencies';

    return {
      intent: 'JOB_ROLE_COMPETENCY',
      confidence,
      reasoning,
      entities
    };
  }

  // Check for Course_Recommendation patterns
  const coursePatterns = intentPatterns.Course_Recommendation.map(p => p.toLowerCase());
  const courseMatches = coursePatterns.filter(pattern =>
    lowerQuery.includes(pattern)
  ).length;

  if (courseMatches > 0) {
    const entities = extractEntities(query);

    let confidence = 0.5 + courseMatches * 0.15;
    confidence = Math.min(confidence, 0.98);

    return {
      intent: 'Course_Recommendation',
      confidence,
      reasoning: `Detected ${courseMatches} course recommendation pattern(s)`,
      entities
    };
  }

  // Original pattern matching for other intents
  const intents = Object.entries(intentPatterns) as [QueryIntent, string[]][];
  let maxMatches = 0;
  let detectedIntent: QueryIntent = 'unclear';

  for (const [intent, patterns] of intents) {
    if (intent === 'JOB_ROLE_COMPETENCY' || intent === 'Course_Recommendation') continue; // Skip already handled

    const matches = patterns.filter(pattern =>
      lowerQuery.includes(pattern.toLowerCase())
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      detectedIntent = intent;
    }
  }

  const confidence =
    maxMatches > 0
      ? Math.min(0.3 + maxMatches * 0.2, 0.95)
      : 0.1;

  const reasoning =
    maxMatches > 0
      ? `Detected ${maxMatches} pattern(s) matching "${detectedIntent}" intent`
      : 'No clear intent patterns detected; requires context';

  return {
    intent: detectedIntent,
    confidence,
    reasoning
  };
}

// ================= ROUTING HELPERS =================

export function shouldRouteToAction(intent: QueryIntent): boolean {
  // ✅ Explicit handling for JD creation
  if (intent === 'CREATE_JOB_DESCRIPTION') return true;

  return intent === 'action' || intent === 'support';
}

export function shouldUseFallback(intent: QueryIntent): boolean {
  return intent === 'support' || intent === 'unclear';
}
