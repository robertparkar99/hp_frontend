import React from 'react';
import Icon from '../../../../../components/AppIcon';
import { Button} from '../../../../../components/ui/button';

const AssessmentPreviewModal = ({ assessment, isOpen, onClose, onStartAssessment }) => {
  if (!isOpen || !assessment) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Assessment Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Tags */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {assessment.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-md border ${getCategoryColor(assessment.category)}`}>
                {assessment.category}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-md border ${getDifficultyColor(assessment.difficulty)}`}>
                {assessment.difficulty}
              </span>
            </div>
          </div>

          {/* Description */}
          {assessment.description && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Description</h4>
              <p className="text-muted-foreground leading-relaxed">
                {assessment.description}
              </p>
            </div>
          )}

          {/* Assessment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Icon name="HelpCircle" size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-medium text-foreground">{assessment.questionCount}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Icon name="Clock" size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Limit</p>
                  <p className="font-medium text-foreground">{assessment.timeLimit} minutes</p>
                </div>
              </div>
              
              {assessment.passingScore && (
                <div className="flex items-center space-x-3">
                  <Icon name="Target" size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                    <p className="font-medium text-foreground">{assessment.passingScore}%</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {assessment.attempts !== undefined && (
                <div className="flex items-center space-x-3">
                  <Icon name="RotateCcw" size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Attempts</p>
                    <p className="font-medium text-foreground">
                      {assessment.attempts} / {assessment.maxAttempts || 'Unlimited'}
                    </p>
                  </div>
                </div>
              )}
              
              {assessment.deadline && (
                <div className="flex items-center space-x-3">
                  <Icon name="Calendar" size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium text-foreground">
                      {new Date(assessment.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {assessment.bestScore !== undefined && (
                <div className="flex items-center space-x-3">
                  <Icon name="Award" size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Best Score</p>
                    <p className="font-medium text-foreground">{assessment.bestScore}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Learning Objectives */}
          {assessment.learningObjectives && assessment.learningObjectives.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Learning Objectives</h4>
              <ul className="space-y-2">
                {assessment.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {assessment.prerequisites && assessment.prerequisites.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Prerequisites</h4>
              <ul className="space-y-2">
                {assessment.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {assessment.instructions && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-foreground mb-2">Instructions</h4>
              <p className="text-muted-foreground leading-relaxed">
                {assessment.instructions}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {/* <Button 
            variant="default" 
            onClick={() => {
              onStartAssessment(assessment);
              onClose();
            }}
            disabled={assessment.status === 'In Progress' && !assessment.canResume}
          >
            {assessment.status === 'Not Attempted' && 'Start Assessment'}
            {assessment.status === 'In Progress' && 'Continue Assessment'}
            {assessment.status === 'Completed' && 'Retake Assessment'}
            {assessment.status === 'Failed' && 'Retry Assessment'}
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPreviewModal;