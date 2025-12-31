export interface SanitizationResult {
  isClean: boolean;
  threats: string[];
  cleanedQuery: string;
}

const dangerousPatterns = [
  /(\b(DROP|DELETE|TRUNCATE|ALTER|INSERT|UPDATE|EXEC|EXECUTE|UNION|SELECT\s+\*\s+FROM)\b)/gi,
  /(<script|javascript:|onerror=|onload=)/gi,
  /(--|;|\/\*|\*\/|xp_|sp_)/gi,
  /(\[|{|%|\$|#|\^|&|\||\\)/g,
  /(eval|__proto__|constructor)/gi
];

const sqlInjectionIndicators = [
  /('\s*(or|and)\s*')/gi,
  /(\bor\b\s+\d+\s*=\s*\d+)/gi,
  /(union.*select)/gi,
  /(-{2}|\/\*|\*\/)/g,
  /((;|')\s*-{2})/g
];

const suspiciousKeywords = [
  'password', 'secret', 'token', 'key', 'credential',
  'config', 'private', 'internal', 'admin', 'root'
];

export function sanitizeQuery(query: string): SanitizationResult {
  const threats: string[] = [];
  let cleanedQuery = query;

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      const matches = query.match(pattern);
      if (matches) {
        threats.push(`Dangerous SQL keyword detected: ${matches[0]}`);
      }
    }
  }

  for (const pattern of sqlInjectionIndicators) {
    if (pattern.test(query)) {
      threats.push('SQL injection pattern detected');
    }
  }

  for (const keyword of suspiciousKeywords) {
    if (query.toLowerCase().includes(keyword)) {
      threats.push(`Sensitive keyword detected: ${keyword}`);
    }
  }

  cleanedQuery = cleanedQuery
    .replace(/['";\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    isClean: threats.length === 0,
    threats,
    cleanedQuery
  };
}

export function validateQuerySafety(query: string, role: string): { safe: boolean; reason?: string } {
  const sanitized = sanitizeQuery(query);

  if (!sanitized.isClean) {
    return {
      safe: false,
      reason: `Security concerns: ${sanitized.threats.join(', ')}`
    };
  }

  if (role === 'user' && query.toLowerCase().includes('admin')) {
    return {
      safe: false,
      reason: 'Users cannot query admin-level data'
    };
  }

  return { safe: true };
}
