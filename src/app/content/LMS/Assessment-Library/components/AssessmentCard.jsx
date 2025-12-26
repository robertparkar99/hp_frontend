

import React from 'react';
import Icon from '../../../../../components/AppIcon';
import { Button } from '../../../../../components/ui/button';

const AssessmentCard = ({
  assessment,
  onStartAssessment,
  onViewDetails,
  onEdit,
  onDelete,
  onPreview,
  onShare,
  onSchedule,
}) => {
  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800 border-gray-200';
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
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const isDeadlineUrgent =
    assessment.deadline &&
    new Date(assessment.deadline) <= new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {assessment.title}
          </h3>
          {/* <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-md border ${getCategoryColor(
                assessment.category
              )}`}
            >
              {assessment.category}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(
                assessment.subject
              )}`}
            >
              {assessment.subject}
            </span>
          </div> */}
        </div>

        {/* Status dot */}
        <div className="flex items-center space-x-2 ml-4">
          <span
            className={`h-[12px] w-[12px] rounded-full ${
              assessment.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Details */}
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

        {assessment.deadline && (
          <div
            className={`flex items-center space-x-2 text-sm ${
              isDeadlineUrgent ? 'text-red-600' : 'text-muted-foreground'
            }`}
          >
            <Icon name="Calendar" size={16} />
            <span>Due: {new Date(assessment.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* 🔹 Actions Toolbar */}
      <div className="flex justify-between items-center pt-3 border-t border-border">
        {/* Left-side: icon actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="View details"
            onClick={() => onViewDetails?.(assessment)}
          >
            <Icon name="Eye" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Edit assessment"
            onClick={() => onEdit?.(assessment)}
          >
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Preview questions"
            onClick={() => onPreview?.(assessment)}
          >
            <Icon name="ListChecks" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Share / Assign"
            onClick={() => onShare?.(assessment)}
          >
            <Icon name="Share2" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Timer / Schedule"
            onClick={() => onSchedule?.(assessment)}
          >
            <Icon name="Clock" size={16} />
          </Button>
       

       
          <Button
            variant="ghost"
            size="icon"
            title="Delete assessment"
            onClick={() => onDelete?.(assessment)}
          >
            <Icon name="Trash2" size={16} className="text-red-600" />
          </Button>
        </div>
      </div>

      {/* 🔹 Separate Start Assessment button */}
      {assessment.status === 'Active' && (
        <div className="mt-4 flex justify-start">
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs rounded-full"
            onClick={() => onStartAssessment?.(assessment)}
            title="Start assessment"
          >
            <Icon name="Play" size={14} />
            Start Assessment
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssessmentCard;
