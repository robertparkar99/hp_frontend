// interface ChatRequest {
//   query: string;
//   sessionId: string;
//   conversationHistory?: Array<{ role: string; content: string }>;
// }

// interface ChatResponse {
//   answer: string;
//   sql?: string;
//   tables_used?: string[];
//   insights?: string;
//   error?: string;
// }

// interface ConversationContext {
//   sessionId: string;
//   userMessage: string;
//   botReply: string;
//   timestamp: Date;
// }

// const conversationMemory: Map<string, ConversationContext[]> = new Map();

// function getConversationContext(sessionId: string, limit: number = 3): ConversationContext[] {
//   const history = conversationMemory.get(sessionId) || [];
//   return history.slice(-limit);
// }

// function saveConversationContext(context: ConversationContext): void {
//   const history = conversationMemory.get(context.sessionId) || [];
//   history.push(context);
//   if (history.length > 10) {
//     history.shift();
//   }
//   conversationMemory.set(context.sessionId, history);
// }

// async function generateSQL(query: string, context: ConversationContext[]): Promise<string> {
//   const contextPrompt = context.length > 0
//     ? `Previous conversation:\n${context.map(c => `User: ${c.userMessage}\nBot: ${c.botReply}`).join('\n')}\n\n`
//     : '';

//   const prompt = `${contextPrompt}Convert the following natural language query to MySQL SQL:
// Query: "${query}"

// Database Schema (example - replace with your actual schema):
// - users (id, name, email, created_at)
// - projects (id, user_id, title, status, updated_at)
// - tasks (id, project_id, title, completed, due_date)

// Return only the SQL query without explanations.`;

//   const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${process.env.LLM_API_KEY}`
//     },
//     body: JSON.stringify({
//       model: 'deepseek-chat',
//       messages: [
//         { role: 'system', content: 'You are a SQL expert. Generate only valid MySQL queries.' },
//         { role: 'user', content: prompt }
//       ],
//       temperature: 0.1
//     })
//   });

//   if (!response.ok) {
//     throw new Error('Failed to generate SQL');
//   }

//   const data = await response.json();
//   return data.choices[0].message.content.trim().replace(/```sql\n?|\n?```/g, '');
// }

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

// async function generateInsights(query: string, sql: string, results: any[]): Promise<string> {
//   const prompt = `User asked: "${query}"

// SQL Query executed:
// ${sql}

// Results (${results.length} rows):
// ${JSON.stringify(results.slice(0, 5), null, 2)}${results.length > 5 ? '\n...(more rows)' : ''}

// Based on these results, provide a clear, conversational answer to the user's question.
// Be concise but informative. If the results are empty, explain that no data was found.`;

//   const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${process.env.LLM_API_KEY}`
//     },
//     body: JSON.stringify({
//       model: 'deepseek-chat',
//       messages: [
//         { role: 'system', content: 'You are a helpful data assistant. Provide clear, conversational insights.' },
//         { role: 'user', content: prompt }
//       ],
//       temperature: 0.7
//     })
//   });

//   if (!response.ok) {
//     throw new Error('Failed to generate insights');
//   }

//   const data = await response.json();
//   return data.choices[0].message.content.trim();
// }

// function extractTablesFromSQL(sql: string): string[] {
//   const tableRegex = /FROM\s+`?(\w+)`?|JOIN\s+`?(\w+)`?/gi;
//   const tables = new Set<string>();
//   let match;

//   while ((match = tableRegex.exec(sql)) !== null) {
//     const tableName = match[1] || match[2];
//     if (tableName) {
//       tables.add(tableName);
//     }
//   }

//   return Array.from(tables);
// }

// function validateSQL(sql: string): boolean {
//   const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
//   const upperSQL = sql.toUpperCase();

//   for (const keyword of dangerousKeywords) {
//     if (upperSQL.includes(keyword)) {
//       return false;
//     }
//   }

//   return true;
// }

// export async function handleChatRequest(request: ChatRequest): Promise<ChatResponse> {
//   try {
//     const context = getConversationContext(request.sessionId);

//     const sql = await generateSQL(request.query, context);

//     if (!validateSQL(sql)) {
//       return {
//         answer: 'I can only help with data retrieval queries (SELECT statements). Modifications to the database are not allowed.',
//         error: 'Invalid SQL operation'
//       };
//     }

//     const results = await executeSQLQuery(sql);

//     const answer = await generateInsights(request.query, sql, results);

//     const tables = extractTablesFromSQL(sql);

//     saveConversationContext({
//       sessionId: request.sessionId,
//       userMessage: request.query,
//       botReply: answer,
//       timestamp: new Date()
//     });

//     return {
//       answer,
//       sql,
//       tables_used: tables,
//       insights: `Found ${results.length} result(s)`
//     };

//   } catch (error) {
//     console.error('Chat handler error:', error);

//     return {
//       answer: 'I encountered an error processing your request. Please try rephrasing your question or check if the database is accessible.',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     };
//   }
// }


interface ChatRequest {
  query: string;
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  answer: string;
  sql?: string;
  tables_used?: string[];
  insights?: string;
  error?: string;
}

interface ConversationContext {
  sessionId: string;
  userMessage: string;
  botReply: string;
  timestamp: Date;
}

const conversationMemory: Map<string, ConversationContext[]> = new Map();

function getConversationContext(sessionId: string, limit: number = 3): ConversationContext[] {
  const history = conversationMemory.get(sessionId) || [];
  return history.slice(-limit);
}

function saveConversationContext(context: ConversationContext): void {
  const history = conversationMemory.get(context.sessionId) || [];
  history.push(context);
  if (history.length > 10) {
    history.shift();
  }
  conversationMemory.set(context.sessionId, history);
}

async function generateSQL(query: string, context: ConversationContext[]): Promise<string> {
  const contextPrompt = context.length > 0
    ? `Previous conversation:\n${context.map(c => `User: ${c.userMessage}\nBot: ${c.botReply}`).join('\n')}\n\n`
    : '';

  const prompt = `${contextPrompt}Convert the following natural language query to MySQL SQL:
Query: "${query}"

Database Schema (example - replace with your actual schema):
- users (id, name, email, created_at)
- projects (id, user_id, title, status, updated_at)
- tasks (id, project_id, title, completed, due_date)

Return only the SQL query without explanations.`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a SQL expert. Generate only valid MySQL queries.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate SQL');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim().replace(/```sql\n?|\n?```/g, '');
}

async function executeSQLQuery(sql: string): Promise<any[]> {
  const response = await fetch(process.env.DATABASE_API_URL || 'http://localhost:3001/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DATABASE_API_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    throw new Error('Database query failed');
  }

  const data = await response.json();
  return data.results || [];
}

async function generateInsights(query: string, sql: string, results: any[]): Promise<string> {
  const prompt = `User asked: "${query}"

SQL Query executed:
${sql}

Results (${results.length} rows):
${JSON.stringify(results.slice(0, 5), null, 2)}${results.length > 5 ? '\n...(more rows)' : ''}

Based on these results, provide a clear, conversational answer to the user's question.
Be concise but informative. If the results are empty, explain that no data was found.`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
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
  try {
    const context = getConversationContext(request.sessionId);

    const sql = await generateSQL(request.query, context);

    if (!validateSQL(sql)) {
      return {
        answer: 'I can only help with data retrieval queries (SELECT statements). Modifications to the database are not allowed.',
        error: 'Invalid SQL operation'
      };
    }

    const results = await executeSQLQuery(sql);

    const answer = await generateInsights(request.query, sql, results);

    const tables = extractTablesFromSQL(sql);

    saveConversationContext({
      sessionId: request.sessionId,
      userMessage: request.query,
      botReply: answer,
      timestamp: new Date()
    });

    return {
      answer,
      sql,
      tables_used: tables,
      insights: `Found ${results.length} result(s)`
    };

  } catch (error) {
    console.error('Chat handler error:', error);
    try {
      const fallbackPrompt = `
The user's question could not be answered using database queries.

User asked: "${request.query}"

Provide a helpful, conversational answer using general knowledge.
Avoid mentioning databases or SQL failures.
      `;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a friendly assistant. Answer normally in plain English.' },
            { role: 'user', content: fallbackPrompt }
          ]
        })
      });

      const data = await response.json();
      console.log("Fallback LLM response:", data);
      const fallbackAnswer = data.choices?.[0]?.message?.content?.trim() ||
        "I'm here to help! What would you like to know?";

      // Save fallback answer to memory
      saveConversationContext({
        sessionId: request.sessionId,
        userMessage: request.query,
        botReply: fallbackAnswer,
        timestamp: new Date()
      });

      return {
        answer: fallbackAnswer || "I'm here to help!",
        error: String((error as any)?.message || error),
        insights: "Fallback LLM answer used"
      };

    } catch (fallbackError) {
      console.error("Fallback LLM also failed:", fallbackError);
      return {
        answer: 'I encountered an error processing your request. Please try rephrasing your question or check if the database is accessible.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
