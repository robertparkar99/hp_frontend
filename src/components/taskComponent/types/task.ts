export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  role: string;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  completedAt?: string;
  category: string;
  tags: string[];
  replies: TaskReply[];
}

export interface TaskReply {
  id: string;
  taskId: string;
  message: string;
  author: string;
  createdAt: string;
  statusUpdate?: 'pending' | 'in-progress' | 'completed' | 'overdue';
}