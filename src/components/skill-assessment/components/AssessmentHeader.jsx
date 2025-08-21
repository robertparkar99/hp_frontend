import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AssessmentHeader = ({ onStartAssessment, isStarted, onPauseAssessment }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Skill Assessment</h1>
              <p className="text-lg text-muted-foreground">
                Evaluate your current competency levels and get personalized learning recommendations
              </p>
            </div>
          </div>
          {isStarted && (
            <Button
              variant="outline"
              onClick={onPauseAssessment}
              iconName="Pause"
              iconPosition="left"
            >
              Pause Assessment
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Estimated Time</p>
              <p className="text-sm text-muted-foreground">45-60 minutes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Total Questions</p>
              <p className="text-sm text-muted-foreground">120 questions across 8 skills</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="BookOpen" size={20} className="text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Personalized Results</p>
              <p className="text-sm text-muted-foreground">Custom learning path recommendations</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Assessment Types</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span>Technical knowledge checks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span>Behavioral scenario questions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span>Experience level indicators</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span>Practical application scenarios</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Your Results Will Include</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={16} className="text-primary" />
                  <span>Skill strength analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={16} className="text-primary" />
                  <span>Identified skill gaps</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={16} className="text-primary" />
                  <span>Personalized course recommendations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={16} className="text-primary" />
                  <span>Career development roadmap</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {!isStarted && (
          <div className="text-center">
            <Button
              variant="default"
              size="lg"
              onClick={onStartAssessment}
              iconName="Play"
              iconPosition="left"
              className="px-8"
            >
              Start Assessment
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Your progress will be saved automatically. You can pause and resume anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentHeader;