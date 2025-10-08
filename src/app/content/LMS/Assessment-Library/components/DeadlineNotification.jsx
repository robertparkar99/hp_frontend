import React, { useState, useEffect } from 'react';
import Icon from '../../../../../components/AppIcon';
import { Button} from '../../../../../components/ui/button';

const DeadlineNotification = ({ urgentAssessments, onDismiss, onViewAssessment }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (urgentAssessments && urgentAssessments.length > 0) {
      setIsVisible(true);
      
      // Auto-cycle through notifications every 5 seconds
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % urgentAssessments.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [urgentAssessments]);

  if (!isVisible || !urgentAssessments || urgentAssessments.length === 0) {
    return null;
  }

  const currentAssessment = urgentAssessments[currentIndex];
  const timeLeft = new Date(currentAssessment.deadline) - new Date();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  const getTimeLeftText = () => {
    if (daysLeft > 0) {
      return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left`;
    } else {
      return 'Due today';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss(currentAssessment.id);
    }
  };

  return (
    <div className="fixed top-20 right-4 z-40 w-80 max-w-[calc(100vw-2rem)]">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-elevated animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={20} className="text-red-600" />
            <span className="text-sm font-medium text-red-800">Urgent Deadline</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="hover:bg-red-100">
            <Icon name="X" size={16} className="text-red-600" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h4 className="font-semibold text-red-900 line-clamp-2">
            {currentAssessment.title}
          </h4>
          <p className="text-sm text-red-700">
            {getTimeLeftText()}
          </p>
          <p className="text-xs text-red-600">
            Due: {new Date(currentAssessment.deadline).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewAssessment(currentAssessment)}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            View Details
          </Button>
          
          {urgentAssessments.length > 1 && (
            <div className="flex items-center space-x-1">
              {urgentAssessments.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-red-600' : 'bg-red-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeadlineNotification;