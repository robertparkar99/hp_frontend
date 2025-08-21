"use client";

import { Task, TaskReply } from '@/components/taskComponent/types/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Calendar,
  User,
  MessageCircle,
  CheckCircle,
  Circle,
  AlertCircle,
  Flag,
  Send
} from 'lucide-react';
import { useState } from 'react';
import { format, isToday, isPast, isFuture } from 'date-fns';

interface TaskCardProps {
  task: any;
  sessionData :any;
  onStatusUpdate: (taskId: string, status: Task['status'], reply?: string) => void;
  employees: any[];
}

export function TaskCard({ task,sessionData, onStatusUpdate, employees }: TaskCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isReplied, setIsReplied] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState<Task['status']>(task.status);

  console.log(task);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'IN-PROGRESS':
        return <Clock className="w-4 h-4 text-blue-500" />;
     default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (task.status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN-PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  // const getPriorityColor = (priority: Task['priority']) => {
  //   switch (priority) {
  //     case 'high':
  //       return 'text-red-500';
  //     case 'medium':
  //       return 'text-yellow-500';
  //     default:
  //       return 'text-green-500';
  //   }
  // };

  const handleReplySubmit = () => {
    if (replyMessage.trim()) {
      onStatusUpdate(task.id, newStatus, replyMessage);
      setReplyMessage('');
      setIsReplying(false);
    }
  };

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-lg border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(task.status)}
              <h3 className="font-semibold text-lg text-gray-900">{task.task_title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">{task.task_description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                 {task.task_type}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="text-black">{task.allocatedUser}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className={`text-orange-600 font-medium`}>
                  {format(task.task_date, 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Created by <span className="text-black">{task.allocatedBy}</span>
            </div>
          </div>
          {task.reply != '' && (
            <div className="mt-4">
              <Separator className="mb-3" />
              <div className="space-y-2 max-h-32 overflow-y-auto">
                  <div key={task.id} className="flex gap-2 text-sm">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {task.allocatedUser || 'Unknown'}
                        </span>
                          <Badge variant="outline" className="text-xs">
                            Status: {task.status}
                          </Badge>
                        
                      </div>
                      <p className="text-gray-600 mt-1">{task.reply ? task.reply : 'No Reply'}</p>
                    </div>
                  </div>
                  </div>
                </div>
          )}
              {/* {task.replies.length > 0 && (
            <div className="mt-4">
              <Separator className="mb-3" />
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {task.replies.slice(-2).map(reply => (
                  <div key={reply.id} className="flex gap-2 text-sm">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {employees.find(emp => emp.id === reply.author)?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {employees.find(emp => emp.id === reply.author)?.name || 'Unknown'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {format(new Date(reply.createdAt), 'MMM dd, HH:mm')}
                        </span>
                        {reply.statusUpdate && (
                          <Badge variant="outline" className="text-xs">
                            Status: {reply.statusUpdate}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{reply.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              {task.replies.length > 2 && (
                <Button variant="ghost" size="sm" className="mt-2 text-xs">
                  View all {task.replies.length} replies
                </Button>
              )}
            </div>
          )} */}
            </div>
      </CardContent>

      <CardFooter className="pt-3">
  {!isReplying ? (
    <div className="flex gap-2 w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsReplying(true)}
        className="flex-1"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Reply & Update
      </Button>
    </div>
  ) : (
    <div className="w-full space-y-3">
      {/* Hidden task_id field */}
      <input type="hidden" name="task_id" value={task.id} />
      
      <div className="flex gap-2">
        <Select value={newStatus} onValueChange={(value: Task['status']) => setNewStatus(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="IN-PROGRESS">IN-PROGRESS</SelectItem>
            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder="Add a reply and update task status..."
        value={replyMessage}
        onChange={(e) => setReplyMessage(e.target.value)}
        className="min-h-[80px]"
      />
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={async () => {
            try {
              // Prepare form data
              const formData = new FormData();
              formData.append('formType', 'single');
              formData.append('task_id', task.id);
              formData.append('status', newStatus);
              formData.append('reply', replyMessage);
              formData.append('action', 'update_task_status');

              // Make API call
              const response = await fetch(
                `${sessionData.url}/lms/lmsActivityStream?type=API&token=${sessionData.token}` +
                `&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}&user_profile_id=${sessionData.userProfile}` +
                `&org_type=${sessionData.orgType}&syear=${sessionData.syear}`,
                {
                  method: 'POST',
                  body: formData
                }
              );

              if (!response.ok) {
                throw new Error('Failed to update task status');
              }

              const result = await response.json();
              // Reset form
              setIsReplying(false);
              setReplyMessage('');
              setNewStatus(task.status);

              // Optional: Show success message
              // toast.success('Task status updated successfully');
            } catch (error) {
              console.error('Error updating task status:', error);
              // Optional: Show error message
              // toast.error('Failed to update task status');
            }
          }} 
          className="flex-1"
          disabled={!task.id}
        >
          <Send className="w-4 h-4 mr-2" />
          Send Reply
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsReplying(false);
            setReplyMessage('');
            setNewStatus(task.status);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  )}
</CardFooter>
    </Card>
  );
}