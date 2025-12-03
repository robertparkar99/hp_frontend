import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';

const QuestionCard = ({ 
  question = {},   // ✅ safe default to avoid undefined
  onAnswer, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast,
  currentAnswer,
  totalMarks,
  totalTime,
  timeLeft
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(currentAnswer || '');
  const [selectedAnswers, setSelectedAnswers] = useState(currentAnswer || []);

  const handleSingleAnswer = (value) => {
    setSelectedAnswer(value);
    onAnswer(value);
  };

  const handleMultipleAnswer = (value, checked) => {
    let newAnswers;
    if (checked) {
      newAnswers = [...selectedAnswers, value];
    } else {
      newAnswers = selectedAnswers.filter(answer => answer !== value);
    }
    setSelectedAnswers(newAnswers);
    onAnswer(newAnswers);
  };

  const handleRatingAnswer = (rating) => {
    setSelectedAnswer(rating);
    onAnswer(rating);
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSingleAnswer(option.value)}
                className={`w-full p-4 text-left rounded-lg border transition-smooth ${
                  selectedAnswer === option.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === option.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {selectedAnswer === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{option.label}</p>
                    {option.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case 'multiple-select':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-smooth"
              >
                <Checkbox
                  checked={selectedAnswers.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleMultipleAnswer(option.value, checked)
                  }
                />
                <div>
                  <p className="font-medium text-foreground">{option.label}</p>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{question.ratingLabels?.low || 'Beginner'}</span>
              <span>{question.ratingLabels?.high || 'Expert'}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingAnswer(rating)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-smooth ${
                    selectedAnswer === rating
                      ? 'border-primary bg-primary text-white'
                      : 'border-muted-foreground/30 hover:border-primary/50 text-muted-foreground hover:text-primary'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Rate your current proficiency level (1 = Beginner, 5 = Expert)
              </p>
            </div>
          </div>
        );

      case 'scenario':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Scenario</h4>
              <p className="text-sm text-muted-foreground">{question.scenario}</p>
            </div>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSingleAnswer(option.value)}
                  className={`w-full p-4 text-left rounded-lg border transition-smooth ${
                    selectedAnswer === option.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        selectedAnswer === option.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {selectedAnswer === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      {/* ✅ Header with Question Info + Timer */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={question.skillIcon} size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">{question.skillCategory}</p>
              <p className="text-xs text-muted-foreground">{question.skillName}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Question {question.questionNumber} of {question.totalQuestions}
          </div>
        </div>

        {/* ✅ Timer Info */}
        <div className="text-right text-sm">
          <p className="text-primary font-medium">Total Marks : {totalMarks}</p>
          <p className="text-muted-foreground">(Total {totalTime} mins)</p>
          <p className="text-foreground mt-1">Time Left:</p>
          <p className="font-semibold text-destructive">{timeLeft}</p>
        </div>
      </div>

      {/* Question Title */}
      <h2 className="text-xl font-semibold text-foreground mb-4">{question.title}</h2>
      {question.description && (
        <p className="text-muted-foreground mb-6">{question.description}</p>
      )}

      {/* Question Body */}
      {renderQuestionContent()}

      {/* Footer */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          iconName="ChevronLeft"
          iconPosition="left"
        >
          Previous
        </Button>

        <div className="flex items-center space-x-4">
          {/* <Button variant="ghost" iconName="Save" iconPosition="left">
            Save Progress
          </Button> */}
          <Button
            variant="default"
            onClick={onNext}
            iconName={isLast ? 'CheckCircle' : 'ChevronRight'}
            iconPosition="right"
            disabled={!selectedAnswer && selectedAnswers.length === 0}
          >
            {isLast ? 'Complete Assessment' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
