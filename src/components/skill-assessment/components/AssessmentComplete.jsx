import React from 'react';
import Icon from '../../../components/AppIcon';
import {Button} from '@/components/ui/button';
import ProgressIndicator from '../../../components/ui/ProgressIndicator';

const AssessmentComplete = ({ results, onViewResults, onRetakeAssessment }) => {
  const overallScore = Math.round(
    results.skillScores.reduce((sum, skill) => sum + skill.score, 0) / results.skillScores.length
  );

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Developing';
    return 'Needs Focus';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={40} className="text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Assessment Complete!</h1>
          <p className="text-lg text-muted-foreground">
            Great job! You've completed all {results.totalQuestions} questions across {results.totalSkills} skill areas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <ProgressIndicator 
              progress={overallScore}
              size="lg"
              variant="circular"
              showPercentage={true}
              color={getScoreColor(overallScore)}
            />
            <p className="text-sm font-medium text-foreground mt-2">Overall Score</p>
            <p className="text-xs text-muted-foreground">{getScoreLabel(overallScore)}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{results.strongSkills}</div>
            <p className="text-sm font-medium text-foreground">Strong Skills</p>
            <p className="text-xs text-muted-foreground">80%+ proficiency</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">{results.developingSkills}</div>
            <p className="text-sm font-medium text-foreground">Growth Areas</p>
            <p className="text-xs text-muted-foreground">Recommended focus</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Skill Breakdown</h3>
          <div className="space-y-4">
            {results.skillScores.map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={skill.icon} size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{skill.name}</p>
                    <p className="text-sm text-muted-foreground">{skill.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ProgressIndicator 
                    progress={skill.score}
                    size="sm"
                    variant="linear"
                    showPercentage={false}
                    color={getScoreColor(skill.score)}
                    className="w-24"
                  />
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{skill.score}%</p>
                    <p className="text-xs text-muted-foreground">{getScoreLabel(skill.score)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="BookOpen" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">Personalized Learning Path Ready</h3>
              <p className="text-muted-foreground mb-4">
                Based on your assessment results, we've curated a personalized learning path with 
                {results.recommendedCourses} recommended courses to help you strengthen your skills and advance your career.
              </p>
              <div className="flex flex-wrap gap-2">
                {results.topRecommendations.map((course, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={onViewResults}
            iconName="TrendingUp"
            iconPosition="left"
            className="px-8"
          >
            View Detailed Results & Recommendations
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onRetakeAssessment}
            iconName="RotateCcw"
            iconPosition="left"
          >
            Retake Assessment
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Your results have been saved to your profile. You can access them anytime from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentComplete;