import React from 'react';
import Icon from '../../../../../components/AppIcon';
import { Button } from '../../../../../components/ui/button';

const AssessmentCard = ({ assessment, onStartAssessment, onViewDetails }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'job role':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'skill':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'task':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { icon: 'CheckCircle', color: 'text-green-600' };
      case 'in progress':
        return { icon: 'Clock', color: 'text-yellow-600' };
      case 'failed':
        return { icon: 'XCircle', color: 'text-red-600' };
      default:
        return { icon: 'Circle', color: 'text-gray-400' };
    }
  };

  const statusInfo = getStatusIcon(assessment.status);
  const isDeadlineUrgent = assessment.deadline && new Date(assessment.deadline) <= new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {assessment.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getCategoryColor(assessment.category)}`}>
              {assessment.category}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(assessment.difficulty)}`}>
              {assessment.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {/* <Button
    variant="ghost"
    size="icon"
    onClick={() => onViewDetails(assessment)}
    className="hover:bg-muted"
  >
    <Icon
      name="Info"
      size={20}
      className="text-black" // stays black, no hover color change
    />
  </Button> */}

          <Icon
            name={statusInfo.icon}
            size={20}
            className={statusInfo.color} // whatever status color you want
          />
        </div>
      </div>

      {/* Assessment Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="HelpCircle" size={16} />
            <span>{assessment.questionCount} Questions</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={16} />
            <span>{assessment.duration} mins</span>
          </div>
        </div>

        {assessment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {assessment.description}
          </p>
        )}

        {/* Progress Bar for In Progress */}
        {assessment.status === 'In Progress' && assessment.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{assessment.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-smooth"
                style={{ width: `${assessment.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Best Score for Completed */}
        {assessment.status === 'Completed' && assessment.bestScore !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Best Score:</span>
            <span className="font-medium text-foreground">{assessment.bestScore}%</span>
          </div>
        )}

        {/* Deadline Warning */}
        {assessment.deadline && (
          <div className={`flex items-center space-x-2 text-sm ${isDeadlineUrgent ? 'text-red-600' : 'text-muted-foreground'}`}>
            <Icon name="Calendar" size={16} />
            <span>Due: {new Date(assessment.deadline).toLocaleDateString()}</span>
            {isDeadlineUrgent && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-md">
                Closed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="default"
          fullWidth
          onClick={() => onStartAssessment(assessment)}
        disabled={assessment.status === 'Closed'}

        >
          {assessment.status !== 'Closed' && 'Start Assessment'}
          {assessment.status === 'Closed' && 'Closed Assessment'}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentCard;