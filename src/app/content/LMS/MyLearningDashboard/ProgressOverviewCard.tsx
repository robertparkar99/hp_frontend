import React from 'react';
import { BookOpen, CheckCircle, Award, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Type definitions
interface Trend {
  type: 'up' | 'down' | 'neutral';
  value: string;
}

interface ProgressOverviewCardProps {
  title: string;
  value: number;
  total?: number | null;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  trend?: Trend;
  description?: string;
}

// Icon mapper for ProgressOverviewCard
const ProgressIcon = ({ name, size = 24, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
  const iconProps = { size, color };
  
  switch (name.toLowerCase()) {
    case 'bookopen':
    case 'book-open':
      return <BookOpen {...iconProps} />;
    case 'checkcircle':
    case 'check-circle':
      return <CheckCircle {...iconProps} />;
    case 'award':
      return <Award {...iconProps} />;
    case 'clock':
      return <Clock {...iconProps} />;
    default:
      return <BookOpen {...iconProps} />;
  }
};

const ProgressOverviewCard: React.FC<ProgressOverviewCardProps> = ({ 
  title, 
  value, 
  total, 
  icon, 
  color, 
  trend, 
  description 
}) => {
  const percentage = total && total > 0 ? Math.round((value / total) * 100) : 0;
  
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-destructive/10 text-destructive'
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  };

  const TrendIcon = trend ? trendIcons[trend.type] : null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-elevated transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'primary' ? 'bg-primary/10' :
          color === 'secondary' ? 'bg-secondary/10' :
          color === 'success' ? 'bg-success/10' :
          color === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
        }`}>
          <ProgressIcon name={icon} size={24} />
        </div>
        {trend && TrendIcon && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
            trend.type === 'up' ? 'bg-success/10 text-success' : 
            trend.type === 'down'? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
          }`}>
            <TrendIcon size={12} />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          {total && <span className="text-lg text-muted-foreground">/ {total}</span>}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

export default ProgressOverviewCard;