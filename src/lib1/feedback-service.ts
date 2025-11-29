import { supabase } from './supabase-client';

export interface Feedback {
  id: string;
  messageId: string;
  conversationId: string;
  rating: 1 | -1;
  feedbackText?: string;
  createdAt: Date;
}

export async function submitFeedback(
  messageId: string,
  conversationId: string,
  rating: 1 | -1,
  feedbackText?: string
): Promise<Feedback | null> {
  try {
    const { data, error } = await supabase
      .from('chatbot_feedback')
      .upsert(
        {
          message_id: messageId,
          conversation_id: conversationId,
          rating,
          feedback_text: feedbackText
        },
        {
          onConflict: 'message_id',
        }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error submitting feedback:', error);
      return null;
    }

    return {
      id: data.id,
      messageId: data.message_id,
      conversationId: data.conversation_id,
      rating: data.rating,
      feedbackText: data.feedback_text,
      createdAt: new Date(data.created_at)
    };
  } catch (err) {
    console.error('Exception submitting feedback:', err);
    return null;
  }
}

export async function getFeedbackStats(conversationId: string): Promise<{ positive: number; negative: number; total: number }> {
  try {
    const { data, error } = await supabase
      .from('chatbot_feedback')
      .select('rating')
      .eq('conversation_id', conversationId);

    if (error) {
      console.error('Error fetching feedback stats:', error);
      return { positive: 0, negative: 0, total: 0 };
    }

    const feedback = data || [];
    const positive = feedback.filter(f => f.rating === 1).length;
    const negative = feedback.filter(f => f.rating === -1).length;

    return {
      positive,
      negative,
      total: feedback.length
    };
  } catch (err) {
    console.error('Exception fetching feedback stats:', err);
    return { positive: 0, negative: 0, total: 0 };
  }
}

export async function getMessageFeedback(messageId: string): Promise<Feedback | null> {
  try {
    const { data, error } = await supabase
      .from('chatbot_feedback')
      .select()
      .eq('message_id', messageId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching message feedback:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      messageId: data.message_id,
      conversationId: data.conversation_id,
      rating: data.rating,
      feedbackText: data.feedback_text,
      createdAt: new Date(data.created_at)
    };
  } catch (err) {
    console.error('Exception fetching message feedback:', err);
    return null;
  }
}

export async function deleteFeedback(feedbackId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_feedback')
      .delete()
      .eq('id', feedbackId);

    return !error;
  } catch (err) {
    console.error('Exception deleting feedback:', err);
    return false;
  }
}
