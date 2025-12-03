export interface ErrorContext {
  code: string;
  message: string;
  type: 'database' | 'llm' | 'network' | 'validation' | 'unknown';
  recoverable: boolean;
  suggestion: string;
}

const errorPatterns: Record<string, { type: string; recoverable: boolean; suggestion: string }> = {
  ECONNREFUSED: {
    type: 'database',
    recoverable: true,
    suggestion: 'The database connection failed. Would you like me to retry, or would you prefer to try a simpler query?'
  },
  TIMEOUT: {
    type: 'network',
    recoverable: true,
    suggestion: 'The request took too long. Let me try a more efficient query or show cached results.'
  },
  'Invalid JSON': {
    type: 'validation',
    recoverable: true,
    suggestion: 'The response format was invalid. Could you rephrase your question?'
  },
  'No results': {
    type: 'database',
    recoverable: false,
    suggestion: 'No data found matching your query. Try adjusting your filters or check the table name.'
  },
  'Access denied': {
    type: 'validation',
    recoverable: false,
    suggestion: 'You do not have permission to access this data. Contact your administrator if you need access.'
  },
  'Rate limit': {
    type: 'network',
    recoverable: true,
    suggestion: 'Too many requests. Please wait a moment before trying again.'
  }
};

export function parseError(error: unknown): ErrorContext {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  for (const [pattern, config] of Object.entries(errorPatterns)) {
    if (lowerMessage.includes(pattern.toLowerCase())) {
      return {
        code: pattern,
        message: errorMessage,
        type: config.type as any,
        recoverable: config.recoverable,
        suggestion: config.suggestion
      };
    }
  }

  return {
    code: 'UNKNOWN',
    message: errorMessage,
    type: 'unknown',
    recoverable: false,
    suggestion: 'An unexpected error occurred. Please try rephrasing your question or contact support.'
  };
}

export function shouldRetry(error: ErrorContext): boolean {
  return error.recoverable && ['network', 'database'].includes(error.type);
}

export function formatErrorResponse(error: ErrorContext, attempt: number = 1): string {
  const maxAttempts = 2;
  const willRetry = attempt < maxAttempts && shouldRetry(error);

  let response = error.suggestion;

  if (willRetry) {
    response += ` (Attempt ${attempt}/${maxAttempts})`;
  }

  return response;
}

export function isSecurityError(error: ErrorContext): boolean {
  return error.code === 'Access denied' || error.message.includes('unauthorized') || error.message.includes('forbidden');
}

export function isCriticalError(error: ErrorContext): boolean {
  return error.type === 'database' && !error.recoverable;
}
