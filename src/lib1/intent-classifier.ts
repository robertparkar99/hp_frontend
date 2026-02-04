// ================= TYPES =================

export type QueryIntent =
  | 'data_retrieval'
  | 'action'
  | 'support'
  | 'CREATE_JOB_DESCRIPTION'
  | 'JOB_ROLE_COMPETENCY'
  | 'unclear';

  export interface ExtractedEntities {
  industry?: string;
  jobRole?: string;
  department?: string;
  description?: string;
}

interface IntentClassificationResult {
  intent: QueryIntent;
  confidence: number;
  reasoning: string;
  entities?: ExtractedEntities;
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

  JOB_ROLE_COMPETENCY: [
    // Primary triggers - competency framework
    'generate competency profile',
    'competency profile for',
    'job role responsibilities',
    'skills for',
    'competency framework',
    'CWFKT',
    'critical work function',
    'key tasks',
    // Role exploration patterns
    'what does a',
    'what are the responsibilities of',
    'role requirements',
    // Proficiency and skills
    'proficiency level',
    'skill proficiency',
    'competency levels',
    // Skills mapping
    'skills required for',
    'required skills for',
    // Follow-up patterns
    'senior version of',
    'compare this with',
    'similar roles',
    'advanced role'
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
// ================= ENTITY EXTRACTION =================

export function extractEntities(query: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  const lowerQuery = query.toLowerCase();

  // Extract job role
  const jobRolePatterns = [
    /job[\s-]?role[:\s]+([a-zA-Z ]+)/i,
    /role[:\s]+([a-zA-Z ]+)/i,
    /what does a ([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(?:do|handle|manage)/i,
    /for (?:a )?([a-zA-Z]+(?:\s+[a-zA-Z]+)*) (?:role|position)/i,
    // Handle "competency profile for [job role]" pattern
    /competency[\s-]?profile[\s-]?for[\s-]?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i,
    // Handle "for [job role] in" pattern
    /for[\s-]?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+in[\s-]/i,
  ];

  for (const pattern of jobRolePatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      entities.jobRole = match[1].trim();
      break;
    }
  }

  // Extract industry
  const industryPatterns = [
    /industry[:\s]+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i,
    /(?:in|for|within) the ([a-zA-Z]+(?:\s+[a-zA-Z]+)*) (?:sector|industry|field)/i,
  ];

  for (const pattern of industryPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      entities.industry = match[1].trim();
      break;
    }
  }

  // Extract department
  const departmentPatterns = [
    /department[:\s]+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i,
    /(?:in|for|within) ([a-zA-Z]+(?:\s+[a-zA-Z]+)*) department/i,
  ];

  for (const pattern of departmentPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      entities.department = match[1].trim();
      break;
    }
  }

  return entities;
}

// ================= ENHANCED CLASSIFIER =================

export function classifyIntent(
  query: string,
  conversationHistory?: Array<{ role: string; content: string }>
): IntentClassificationResult {
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

  // Original pattern matching for other intents
  const intents = Object.entries(intentPatterns) as [QueryIntent, string[]][];
  let maxMatches = 0;
  let detectedIntent: QueryIntent = 'unclear';

  for (const [intent, patterns] of intents) {
    if (intent === 'JOB_ROLE_COMPETENCY') continue; // Skip already handled

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

// ================= CLASSIFIER =================

// export function classifyIntent(query: string): IntentClassificationResult {
//   const lowerQuery = query.toLowerCase();

//   const intents = Object.entries(intentPatterns) as [QueryIntent, string[]][];
//   let maxMatches = 0;
//   let detectedIntent: QueryIntent = 'unclear';

//   for (const [intent, patterns] of intents) {
//     const matches = patterns.filter(pattern =>
//       lowerQuery.includes(pattern.toLowerCase())
//     ).length;

//     if (matches > maxMatches) {
//       maxMatches = matches;
//       detectedIntent = intent;
//     }
//   }

//   const confidence =
//     maxMatches > 0
//       ? Math.min(0.3 + maxMatches * 0.2, 0.95)
//       : 0.1;

//   const reasoning =
//     maxMatches > 0
//       ? `Detected ${maxMatches} pattern(s) matching "${detectedIntent}" intent`
//       : 'No clear intent patterns detected; requires context';

//   return {
//     intent: detectedIntent,
//     confidence,
//     reasoning
//   };
// }

// ================= ROUTING HELPERS =================

export function shouldRouteToAction(intent: QueryIntent): boolean {
  // ✅ Explicit handling for JD creation
  if (intent === 'CREATE_JOB_DESCRIPTION') return true;

  return intent === 'action' || intent === 'support';
}

export function shouldUseFallback(intent: QueryIntent): boolean {
  return intent === 'support' || intent === 'unclear';
}
