import React from 'react';
import { cn } from "@/components/utils/cn";
import Icon from '@/components/AppIcon';
const NavigationProgress = ({ 
  currentStep = 1, 
  totalSteps = 5, 
  steps = [],
  showLabels = true,
  variant = 'default' // 'default', 'compact', 'minimal'
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  const defaultSteps = Array.from({ length: totalSteps }, (_, i) => ({
    id: i + 1,
    label: `Step ${i + 1}`,
    completed: i + 1 < currentStep,
    current: i + 1 === currentStep
  }));

  const progressSteps = steps.length > 0 ? steps : defaultSteps;

  if (variant === 'minimal') {
    return (
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex-1 bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {currentStep} of {totalSteps}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      {showLabels && (
        <div className="flex items-center justify-between">
          {progressSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                step.completed
                  ? 'bg-success border-success text-success-foreground'
                  : step.current
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-background border-border text-muted-foreground'
              }`}>
                {step.completed ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              
              {showLabels && (
                <span className={`text-xs text-center max-w-20 ${
                  step.current
                    ? 'text-foreground font-medium'
                    : step.completed
                    ? 'text-success' :'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavigationProgress;