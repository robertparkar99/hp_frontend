import React from 'react';

const ProgressIndicator = ({ 
  progress = 0, 
  size = 'default', 
  variant = 'circular',
  showPercentage = true,
  className = '',
  label = '',
  color = 'primary'
}) => {
  const progressValue = Math.min(Math.max(progress, 0), 100);
  
  const sizeClasses = {
    sm: variant === 'circular' ? 'w-12 h-12' : 'h-2',
    default: variant === 'circular' ? 'w-16 h-16' : 'h-3',
    lg: variant === 'circular' ? 'w-20 h-20' : 'h-4'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    warning: 'text-warning'
  };

  if (variant === 'circular') {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressValue / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 50 50"
        >
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-300 ease-out ${colorClasses[color]}`}
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-mono font-medium ${colorClasses[color]}`}>
              {Math.round(progressValue)}%
            </span>
          </div>
        )}
        {label && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
          </div>
        )}
      </div>
    );
  }

  // Linear progress bar
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {showPercentage && (
            <span className="text-sm font-mono text-muted-foreground">
              {Math.round(progressValue)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-muted rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ease-out ${
            color === 'primary' ? 'bg-primary' :
            color === 'secondary' ? 'bg-secondary' :
            color === 'success' ? 'bg-success' :
            color === 'warning' ? 'bg-warning' : 'bg-primary'
          }`}
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;