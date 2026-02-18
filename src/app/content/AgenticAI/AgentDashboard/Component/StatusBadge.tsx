import { Badge } from '@/components/ui/badge';
import { AgentStatus, RunStatus } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AgentStatus | RunStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'error':
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'idle':
      case 'pending':
        return 'bg-muted text-muted-foreground border-border';
      case 'training':
      case 'running':
        return 'bg-info/10 text-info border-info/20';
      default:
        return '';
    }
  };

  return (
    <Badge variant="outline" className={cn(getStatusStyles(), 'capitalize', className)}>
      {status}
    </Badge>
  );
}
