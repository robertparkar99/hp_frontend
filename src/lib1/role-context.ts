import { supabase } from './supabase-client';

export type UserRole = 'user' | 'manager' | 'admin';

export interface RoleContext {
  userId: string;
  role: UserRole;
  permissions: string[];
}

const rolePermissions: Record<UserRole, string[]> = {
  user: [
    'data_retrieval_own',
    'view_own_conversations',
    'submit_feedback',
    'request_escalation'
  ],
  manager: [
    'data_retrieval_own',
    'data_retrieval_team',
    'view_team_conversations',
    'view_reports',
    'submit_feedback',
    'request_escalation',
    'manage_escalations'
  ],
  admin: [
    'data_retrieval_all',
    'view_all_conversations',
    'view_logs',
    'view_metrics',
    'manage_roles',
    'system_access'
  ]
};

export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error);
      return 'user';
    }

    return (data?.role as UserRole) || 'user';
  } catch (err) {
    console.error('Exception fetching user role:', err);
    return 'user';
  }
}

export async function getRoleContext(userId: string): Promise<RoleContext> {
  const role = await getUserRole(userId);

  return {
    userId,
    role,
    permissions: rolePermissions[role]
  };
}

export function hasPermission(context: RoleContext, permission: string): boolean {
  return context.permissions.includes(permission);
}

export function canAccessData(context: RoleContext, queryType: string, targetUserId?: string): boolean {
  if (context.role === 'admin') return true;

  if (queryType === 'team_data' && !context.permissions.includes('data_retrieval_team')) {
    return false;
  }

  if (queryType === 'other_user_data' && targetUserId && targetUserId !== context.userId) {
    if (context.role === 'user') return false;
  }

  return true;
}

export function getDataAccessFilter(context: RoleContext): { field: string; value: string } | null {
  if (context.role === 'admin') return null;

  return {
    field: 'user_id',
    value: context.userId
  };
}

export async function createUserRole(userId: string, role: UserRole = 'user'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role
      });

    return !error;
  } catch (err) {
    console.error('Error creating user role:', err);
    return false;
  }
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole, updated_at: new Date() })
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Error updating user role:', err);
    return false;
  }
}
