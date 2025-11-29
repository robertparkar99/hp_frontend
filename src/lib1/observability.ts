import { supabase } from './supabase-client';

export interface LogEntry {
  conversationId?: string;
  logLevel: 'info' | 'warning' | 'error';
  logType: string;
  message: string;
  queryType?: string;
  responseTimeMs?: number;
  metadata?: Record<string, any>;
}

export interface MetricEntry {
  userId?: string;
  metricType: string;
  metricValue: number;
  dimension?: Record<string, any>;
}

let debugMode = false;

export function enableDebugMode() {
  debugMode = true;
  console.log('[DEBUG] Debug mode enabled');
}

export function disableDebugMode() {
  debugMode = false;
}

export async function logEvent(entry: LogEntry): Promise<void> {
  if (debugMode) {
    console.log(`[${entry.logLevel.toUpperCase()}] ${entry.logType}: ${entry.message}`, entry.metadata);
  }

  try {
    const { error } = await supabase
      .from('chatbot_logs')
      .insert({
        conversation_id: entry.conversationId,
        log_level: entry.logLevel,
        log_type: entry.logType,
        message: entry.message,
        query_type: entry.queryType,
        response_time_ms: entry.responseTimeMs,
        metadata: entry.metadata || {}
      });

    if (error && debugMode) {
      console.error('[LOG ERROR]', error);
    }
  } catch (err) {
    if (debugMode) {
      console.error('[LOG EXCEPTION]', err);
    }
  }
}

export async function recordMetric(entry: MetricEntry): Promise<void> {
  if (debugMode) {
    console.log(`[METRIC] ${entry.metricType}: ${entry.metricValue}`, entry.dimension);
  }

  try {
    const { error } = await supabase
      .from('chatbot_metrics')
      .insert({
        user_id: entry.userId,
        metric_type: entry.metricType,
        metric_value: entry.metricValue,
        dimension: entry.dimension || {}
      });

    if (error && debugMode) {
      console.error('[METRIC ERROR]', error);
    }
  } catch (err) {
    if (debugMode) {
      console.error('[METRIC EXCEPTION]', err);
    }
  }
}

export async function logQuery(
  conversationId: string,
  queryType: string,
  sql: string,
  responseTimeMs: number,
  success: boolean
): Promise<void> {
  await logEvent({
    conversationId,
    logLevel: success ? 'info' : 'warning',
    logType: 'query_execution',
    message: `Executed ${queryType} query in ${responseTimeMs}ms`,
    queryType,
    responseTimeMs,
    metadata: { sql, success }
  });
}

export async function logLLMCall(
  conversationId: string,
  model: string,
  responseTimeMs: number,
  success: boolean,
  tokensUsed?: number
): Promise<void> {
  await logEvent({
    conversationId,
    logLevel: success ? 'info' : 'warning',
    logType: 'llm_call',
    message: `LLM call to ${model} completed in ${responseTimeMs}ms`,
    responseTimeMs,
    metadata: { model, tokensUsed, success }
  });
}

export function formatDebugTrace(
  intent: string,
  sql: string,
  responseTime: number,
  result: any
): string {
  return `
[DEBUG TRACE]
Intent: ${intent}
SQL: ${sql}
Response Time: ${responseTime}ms
Result Rows: ${Array.isArray(result) ? result.length : 'N/A'}
`;
}
