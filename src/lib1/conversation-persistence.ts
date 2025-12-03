import { supabaseAdmin } from './supabase-admin';

export interface ConversationSession {
  id: string;
  sessionId: string;
  userId: string;
  role: string;
  title?: string;
  status: 'active' | 'closed' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  messageType: 'user' | 'bot';
  content: string;
  intent?: string;
  sqlQuery?: string;
  tablesUsed?: string[];
  errorDetected?: boolean;
  errorMessage?: string;
  createdAt: Date;
}

export async function createConversation(
  sessionId: string,
  userId: string,
  role: string,
  title?: string
): Promise<ConversationSession | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chatbot_conversations')
      .insert({
        session_id: sessionId,
        user_id: userId,
        role,
        title: title || `Conversation ${new Date().toLocaleDateString()}`,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      role: data.role,
      title: data.title,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (err) {
    console.error('Exception creating conversation:', err);
    return null;
  }
}

export async function getConversationBySessionId(sessionId: string): Promise<ConversationSession | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chatbot_conversations')
      .select()
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      role: data.role,
      title: data.title,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (err) {
    console.error('Exception fetching conversation:', err);
    return null;
  }
}

export async function saveMessage(
  conversationId: string,
  messageType: 'user' | 'bot',
  content: string,
  intent?: string,
  sqlQuery?: string,
  tablesUsed?: string[],
  errorDetected?: boolean,
  errorMessage?: string
): Promise<MessageRecord | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chatbot_messages')
      .insert({
        conversation_id: conversationId,
        message_type: messageType,
        content,
        intent,
        sql_query: sqlQuery,
        tables_used: tablesUsed || [],
        error_detected: errorDetected || false,
        error_message: errorMessage
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }
    console.log('Message ID:', data.id);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      messageType: data.message_type,
      content: data.content,
      intent: data.intent,
      sqlQuery: data.sql_query,
      tablesUsed: data.tables_used,
      errorDetected: data.error_detected,
      errorMessage: data.error_message,
      createdAt: new Date(data.created_at)
    };
  } catch (err) {
    console.error('Exception saving message:', err);
    return null;
  }
}

export async function getConversationHistory(
  conversationId: string,
  limit: number = 50
): Promise<MessageRecord[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chatbot_messages')
      .select()
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }

    return (data || []).map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      messageType: msg.message_type,
      content: msg.content,
      intent: msg.intent,
      sqlQuery: msg.sql_query,
      tablesUsed: msg.tables_used,
      errorDetected: msg.error_detected,
      errorMessage: msg.error_message,
      createdAt: new Date(msg.created_at)
    }));
  } catch (err) {
    console.error('Exception fetching conversation history:', err);
    return [];
  }
}

export async function updateConversationStatus(
  conversationId: string,
  status: 'active' | 'closed' | 'escalated'
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('chatbot_conversations')
      .update({ status, updated_at: new Date() })
      .eq('id', conversationId);

    return !error;
  } catch (err) {
    console.error('Exception updating conversation status:', err);
    return false;
  }
}

export async function closeConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('chatbot_conversations')
      .update({ status: 'closed', closed_at: new Date(), updated_at: new Date() })
      .eq('id', conversationId);

    return !error;
  } catch (err) {
    console.error('Exception closing conversation:', err);
    return false;
  }
}

export async function getRecentConversations(userId: string, limit: number = 10): Promise<ConversationSession[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chatbot_conversations')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent conversations:', error);
      return [];
    }

    return (data || []).map(conv => ({
      id: conv.id,
      sessionId: conv.session_id,
      userId: conv.user_id,
      role: conv.role,
      title: conv.title,
      status: conv.status,
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at)
    }));
  } catch (err) {
    console.error('Exception fetching recent conversations:', err);
    return [];
  }
}
