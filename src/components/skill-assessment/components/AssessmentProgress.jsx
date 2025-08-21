import React from 'react';
import Icon from '../../../components/AppIcon';
import ProgressIndicator from '../../../components/ui/ProgressIndicator';

const AssessmentProgress = ({ 
  currentSection, 
  totalSections, 
  completedQuestions, 
  totalQuestions,
  sections,
  onSectionClick 
}) => {
  const overallProgress = (completedQuestions / totalQuestions) * 100;
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Assessment Progress</h3>
        <ProgressIndicator 
          progress={overallProgress}
          size="lg"
          variant="circular"
          showPercentage={true}
          color="primary"
          label="Overall Progress"
        />
      </div>

      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Questions Completed</span>
            <span>{completedQuestions}/{totalQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Section</span>
            <span>{currentSection}/{totalSections}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Sections</h4>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-smooth ${
                  index + 1 === currentSection
                    ? 'bg-primary/10 border border-primary/20'
                    : section.completed
                    ? 'bg-success/10 border border-success/20 hover:bg-success/15' :'bg-muted hover:bg-muted/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    section.completed
                      ? 'bg-success text-white'
                      : index + 1 === currentSection
                      ? 'bg-primary text-white' :'bg-muted-foreground/20 text-muted-foreground'
                  }`}>
                    {section.completed ? (
                      <Icon name="Check" size={12} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{section.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.completedQuestions}/{section.totalQuestions} questions
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((section.completedQuestions / section.totalQuestions) * 100)}%
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={16} />
            <span>Estimated time remaining: {Math.ceil((totalQuestions - completedQuestions) * 1.5)} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentProgress;