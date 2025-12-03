import { supabase } from './supabase-client';

export interface Escalation {
  id: string;
  conversationId: string;
  userId: string;
  reason: string;
  status: 'pending' | 'assigned' | 'resolved';
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export async function createEscalation(
  conversationId: string,
  userId: string,
  reason: string
): Promise<Escalation | null> {
  try {
    const { data, error } = await supabase
      .from('chatbot_escalations')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        reason,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating escalation:', error);
      return null;
    }

    return {
      id: data.id,
      conversationId: data.conversation_id,
      userId: data.user_id,
      reason: data.reason,
      status: data.status,
      assignedTo: data.assigned_to,
      createdAt: new Date(data.created_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined
    };
  } catch (err) {
    console.error('Exception creating escalation:', err);
    return null;
  }
}

export async function getEscalation(escalationId: string): Promise<Escalation | null> {
  try {
    const { data, error } = await supabase
      .from('chatbot_escalations')
      .select()
      .eq('id', escalationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching escalation:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      conversationId: data.conversation_id,
      userId: data.user_id,
      reason: data.reason,
      status: data.status,
      assignedTo: data.assigned_to,
      createdAt: new Date(data.created_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined
    };
  } catch (err) {
    console.error('Exception fetching escalation:', err);
    return null;
  }
}

export async function getPendingEscalations(limit: number = 20): Promise<Escalation[]> {
  try {
    const { data, error } = await supabase
      .from('chatbot_escalations')
      .select()
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching escalations:', error);
      return [];
    }

    return (data || []).map(esc => ({
      id: esc.id,
      conversationId: esc.conversation_id,
      userId: esc.user_id,
      reason: esc.reason,
      status: esc.status,
      assignedTo: esc.assigned_to,
      createdAt: new Date(esc.created_at),
      resolvedAt: esc.resolved_at ? new Date(esc.resolved_at) : undefined
    }));
  } catch (err) {
    console.error('Exception fetching escalations:', err);
    return [];
  }
}

export async function assignEscalation(
  escalationId: string,
  assignedToUserId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_escalations')
      .update({ assigned_to: assignedToUserId, status: 'assigned' })
      .eq('id', escalationId);

    return !error;
  } catch (err) {
    console.error('Exception assigning escalation:', err);
    return false;
  }
}

export async function resolveEscalation(escalationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_escalations')
      .update({ status: 'resolved', resolved_at: new Date() })
      .eq('id', escalationId);

    return !error;
  } catch (err) {
    console.error('Exception resolving escalation:', err);
    return false;
  }
}

export async function getUserEscalations(userId: string): Promise<Escalation[]> {
  try {
    const { data, error } = await supabase
      .from('chatbot_escalations')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user escalations:', error);
      return [];
    }

    return (data || []).map(esc => ({
      id: esc.id,
      conversationId: esc.conversation_id,
      userId: esc.user_id,
      reason: esc.reason,
      status: esc.status,
      assignedTo: esc.assigned_to,
      createdAt: new Date(esc.created_at),
      resolvedAt: esc.resolved_at ? new Date(esc.resolved_at) : undefined
    }));
  } catch (err) {
    console.error('Exception fetching user escalations:', err);
    return [];
  }
}
