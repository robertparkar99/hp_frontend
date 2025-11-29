// src/app/api-handler.ts
import { classifyIntent, shouldRouteToAction, shouldUseFallback } from "@/lib1/intent-classifier";
import { sanitizeQuery, validateQuerySafety } from "@/lib1/sanitizer";
import { parseError, formatErrorResponse, shouldRetry } from "@/lib1/error-handler";
import { getRoleContext, canAccessData, getDataAccessFilter } from "@/lib1/role-context";
import { logEvent, logQuery, logLLMCall, formatDebugTrace } from "@/lib1/observability";
import {
  createConversation,
  getConversationBySessionId,
  saveMessage,
  getConversationHistory,
  updateConversationStatus
} from "@/lib1/conversation-persistence";
import { createEscalation } from "@/lib1/escalation-service";
import { v4 as uuidv4 } from 'uuid';

interface ChatRequest {
  query: string;
  sessionId: string;
  userId?: string;
  role?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  debugMode?: boolean;
}

interface ChatResponse {
  answer: string;
  conversationId?: string;
  intent?: string;
  sql?: string;
  tables_used?: string[];
  insights?: string;
  error?: string;
  recoverable?: boolean;
  suggestion?: string;
  canEscalate?: boolean;
  id?: string;
}

let debugModeEnabled = false;

function enableDebugMode() {
  debugModeEnabled = true;
}

async function generateSQL(query: string, context: Array<{ role: string; content: string }>): Promise<string> {
  const contextPrompt = context.length > 0
    ? `Previous conversation:\n${context.map(c => `${c.role}: ${c.content}`).join('\n')}\n\n`
    : '';

  const prompt = `${contextPrompt}Convert the following natural language query to MySQL SQL:
Query: "${query}"

Database Schema (example - replace with your actual schema):
- users (id, name, email, created_at)
- projects (id, user_id, title, status, updated_at)
- tasks (id, project_id, title, completed, due_date)

Return only the SQL query without explanations.`;

  const startTime = Date.now();
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a SQL expert. Generate only valid MySQL queries.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("SQL GENERATION ERROR:", data);
    throw new Error('Failed to generate SQL');
  }

  const responseTime = Date.now() - startTime;

  if (debugModeEnabled) {
    await logLLMCall('', 'deepseek/deepseek-chat', responseTime, true);
  }

  return data.choices[0].message.content.trim().replace(/```sql\n?|\n?```/g, '');
}

// -----------------------------------------
// REPLACE THE OLD executeSQLQuery FUNCTION
// async function executeSQLQuery(sql: string): Promise<any[]> {
//   const response = await fetch(process.env.DATABASE_API_URL || 'http://localhost:3001/api/query', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${process.env.DATABASE_API_KEY}`
//     },
//     body: JSON.stringify({ query: sql })
//   });

//   if (!response.ok) {
//     throw new Error('Database query failed');
//   }

//   const data = await response.json();
//   return data.results || [];
// }
// -----------------------------------------
async function executeSQLQuery(sql: string): Promise<any[]> {
  // Parse simple SQL patterns
  const regex = /SELECT\s+(.+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i;
  const match = sql.match(regex);

  if (!match) throw new Error("Unsupported SQL format for API translation.");

  const table = match[2];
  const whereClause = match[3];

  // Build API params
  const params = new URLSearchParams();
  params.append("table", table);

  // Convert WHERE filters into API filters:
  // Example SQL: WHERE parent_id = 0 AND status = 1
  if (whereClause) {
    const conditions = whereClause.split(/AND/i).map(c => c.trim());
    for (const cond of conditions) {
      const [key, value] = cond.split("=").map(s => s.trim().replace(/['"]/g, ""));
      params.append(`filters[${key}]`, value);
    }
  }

  const url = `https://hp.triz.co.in/table_data?${params.toString()}`;

  console.log("🔥 Translated API URL:", url);

  // Call your real DB API
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) throw new Error("Database API failed");

  const data = await response.json();

  // Your API returns data directly
  return data;
}


async function generateInsights(query: string, sql: string, results: any[]): Promise<string> {
  const prompt = `User asked: "${query}"

SQL Query executed:
${sql}

Results (${results.length} rows):
${JSON.stringify(results.slice(0, 5), null, 2)}${results.length > 5 ? '\n...(more rows)' : ''}

Based on these results, provide a clear, conversational answer to the user's question.
Be concise but informative. If the results are empty, explain that no data was found.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful data assistant. Provide clear, conversational insights.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate insights');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function extractTablesFromSQL(sql: string): string[] {
  const tableRegex = /FROM\s+`?(\w+)`?|JOIN\s+`?(\w+)`?/gi;
  const tables = new Set<string>();
  let match;

  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1] || match[2];
    if (tableName) {
      tables.add(tableName);
    }
  }

  return Array.from(tables);
}

function validateSQL(sql: string): boolean {
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
  const upperSQL = sql.toUpperCase();

  for (const keyword of dangerousKeywords) {
    if (upperSQL.includes(keyword)) {
      return false;
    }
  }

  return true;
}

export async function handleChatRequest(request: ChatRequest): Promise<ChatResponse> {
  if (request.debugMode) {
    enableDebugMode();
  }

  const conversationId = await ensureConversation(request);
  const intent = classifyIntent(request.query);
  let attempt = 0;
  const maxAttempts = 2;

  try {
    if (!request.role) {
      request.role = 'user';
    }

    const anonymousId = request.userId || uuidv4();
    const roleContext = await getRoleContext(anonymousId);

    await saveMessage(conversationId, 'user', request.query, intent.intent);

    const sanitized = sanitizeQuery(request.query);
    if (!sanitized.isClean) {
      const securityError = {
        answer: `Security check flagged concerns: ${sanitized.threats.join(', ')}. Please rephrase your question.`,
        conversationId,
        intent: intent.intent,
        error: 'Security validation failed',
        recoverable: false,
        canEscalate: true
      };
      await saveMessage(conversationId, 'bot', securityError.answer, intent.intent, undefined, undefined, true, 'Security validation failed');
      return securityError;
    }

    const safetyCheck = validateQuerySafety(request.query, request.role);
    if (!safetyCheck.safe) {
      const accessError = {
        answer: safetyCheck.reason || 'You do not have permission to access this data.',
        conversationId,
        intent: intent.intent,
        error: 'Access denied',
        recoverable: false,
        canEscalate: true
      };
      await saveMessage(conversationId, 'bot', accessError.answer, intent.intent, undefined, undefined, true, 'Access denied');
      return accessError;
    }

    if (shouldRouteToAction(intent.intent)) {
      const actionResponse = {
        answer: `I detected this might be a ${intent.intent} request. For actions and support requests, please contact a support representative or escalate this conversation.`,
        conversationId,
        intent: intent.intent,
        error: 'Action routing required',
        recoverable: true,
        suggestion: 'Would you like me to escalate this to a human agent?',
        canEscalate: true
      };
      await saveMessage(conversationId, 'bot', actionResponse.answer, intent.intent);
      return actionResponse;
    }

    const history = request.conversationHistory || [];
    let sql = '';
    let results: any[] = [];
    let answer = '';

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const startTime = Date.now();
        sql = await generateSQL(request.query, history);
        const genTime = Date.now() - startTime;

        if (!validateSQL(sql)) {
          throw new Error('SQL validation failed - contains dangerous keywords');
        }

        results = await executeSQLQuery(sql);
        const execTime = Date.now() - startTime;

        await logQuery(conversationId, 'data_retrieval', sql, execTime, true);

        answer = await generateInsights(request.query, sql, results);

        const tables = extractTablesFromSQL(sql);

        const botMessage = await saveMessage(
          conversationId,
          'bot',
          answer,
          intent.intent,
          sql,
          tables,
          false
        );
        if (!botMessage) {
          throw new Error('Failed to save bot message');
        }

        if (debugModeEnabled) {
          const trace = formatDebugTrace(intent.intent, sql, execTime, results);
          console.log(trace);
        }

        return {
          answer,
          conversationId,
          id: botMessage.id,
          intent: intent.intent,
          sql,
          tables_used: tables,
          insights: `Found ${results.length} result(s)`,
          canEscalate: true
        };
      } catch (error) {
        console.error("🔥 RAW ERROR:", error);
        const errorCtx = parseError(error);
        const retryable = shouldRetry(errorCtx);

        if (!retryable || attempt >= maxAttempts) {
          throw error;
        }

        await logEvent({
          conversationId,
          logLevel: 'warning',
          logType: 'query_retry',
          message: `Retrying query (attempt ${attempt}/${maxAttempts}): ${errorCtx.message}`,
          metadata: { error: errorCtx }
        });
      }
    }

    throw new Error('Max retry attempts exceeded');
  } catch (error) {
    console.error("🔥 RAW ERROR:", error);
    const errorCtx = parseError(error);
    const errorMessage = formatErrorResponse(errorCtx, attempt);

    await logEvent({
      conversationId,
      logLevel: 'error',
      logType: 'request_failure',
      message: errorMessage,
      metadata: { error: errorCtx, intent: intent.intent }
    });

    const botMessage = await saveMessage(
      conversationId,
      'bot',
      errorMessage,
      intent.intent,
      undefined,
      undefined,
      true,
      errorCtx.message
    );
    if (!botMessage) {
      throw new Error('Failed to save bot message');
    }
    //   if (!shouldUseFallback(intent.intent)) {
    //     const errorDetails = `Intent: ${intent.intent}, Confidence: ${intent.confidence}, Reasoning: ${intent.reasoning}`;
    //     const errorMessage = `An unexpected error occurred. Details: ${errorDetails}`;

    //     const botMessage = await saveMessage(
    //         conversationId,
    //         'bot',
    //         errorMessage,
    //         intent.intent,
    //         undefined,
    //         undefined,
    //         true,
    //         errorDetails
    //     );
    //     if (!botMessage) {
    //         throw new Error('Failed to save bot message');
    //     }

    //     return {
    //         answer: errorMessage,
    //         conversationId,
    //         id: botMessage.id,
    //         intent: intent.intent,
    //         error: 'UNKNOWN',
    //         recoverable: false,
    //         suggestion: 'Please contact support with the above details.',
    //         canEscalate: true
    //     };
    // }
    // if (shouldUseFallback(intent.intent)) {
    try {
      const fallbackMessages = request.conversationHistory ? [...request.conversationHistory] : [];
      fallbackMessages.push({ role: 'user', content: request.query });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a friendly assistant. Answer normally in plain English. Maintain conversation context.' },
            ...fallbackMessages
          ]
        })
      });

      const data = await response.json();
      const fallbackAnswer = data.choices?.[0]?.message?.content?.trim() || errorMessage;

      const botMessage = await saveMessage(conversationId, 'bot', fallbackAnswer, intent.intent);
      if (!botMessage) {
        throw new Error('Failed to save bot message');
      }
      return {
        answer: fallbackAnswer,
        conversationId,
        id: botMessage.id,
        intent: intent.intent,
        canEscalate: true
      };
    } catch (fallbackError) {
      console.error('Fallback LLM failed:', fallbackError);
    }
    // }

    return {
      answer: errorMessage,
      conversationId,
      intent: intent.intent,
      error: errorCtx.code,
      recoverable: errorCtx.recoverable,
      suggestion: errorMessage,
      canEscalate: true
    };
  }
}

async function ensureConversation(request: ChatRequest): Promise<string> {
  const existingConv = await getConversationBySessionId(request.sessionId);

  if (existingConv) {
    return existingConv.id;
  }

  const newConv = await createConversation(
    request.sessionId,
    request.userId || uuidv4(),
    request.role || 'user'
  );

  if (!newConv?.id) {
    throw new Error('Failed to create or retrieve a conversation.');
  }

  return newConv.id;
}

export async function handleEscalation(
  conversationId: string,
  userId: string,
  reason: string
): Promise<{ success: boolean; escalationId?: string; message: string }> {
  try {
    const escalation = await createEscalation(conversationId, userId, reason);

    if (!escalation) {
      return {
        success: false,
        message: 'Failed to create escalation. Please try again.'
      };
    }

    await updateConversationStatus(conversationId, 'escalated');

    return {
      success: true,
      escalationId: escalation.id,
      message: 'Your request has been escalated. A support team member will contact you shortly.'
    };
  } catch (err) {
    console.error('Escalation error:', err);
    return {
      success: false,
      message: 'An error occurred during escalation. Please try again.'
    };
  }
}
