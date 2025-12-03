

"use client";
import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import { Button } from "../../../components/ui/button";

const AssessmentComplete = ({
  results = {},
  questions = [],
  answers = {},
  onSubmitAssessment,
  isSubmitting = false,
  totalTime = 0, // Total time in minutes
  timeSpent = 0, // Time spent in seconds
  userId = "1", // Default user ID
  questionPaperId = "1", // Default question paper ID
  subInstituteId = "1", // Default institute ID
}) => {
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safeAnswers = answers || {};
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [timeTaken, setTimeTaken] = useState("0:00");
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculate time taken from timeSpent (in seconds)
  useEffect(() => {
    if (timeSpent > 0) {
      const minutes = Math.floor(timeSpent / 60);
      const seconds = timeSpent % 60;
      setTimeTaken(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    } else if (totalTime > 0) {
      // Fallback: use total time if timeSpent is not provided
      setTimeTaken(`${totalTime}:00`);
    }
  }, [timeSpent, totalTime]);

  // Helper function to extract selected answer from stored format
  const getSelectedAnswer = (answerData) => {
    if (!answerData) return null;
    return answerData.selected;
  };

  // Calculate score and performance metrics
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  safeQuestions.forEach((question) => {
    const answerData = safeAnswers[question.id];
    const userAnswer = getSelectedAnswer(answerData);

    if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
      skippedCount++;
      return;
    }

    const correctOption = question.options?.find(opt => opt.isCorrect);
    if (!correctOption) {
      incorrectCount++;
      return;
    }

    const isCorrect = Array.isArray(userAnswer)
      ? userAnswer.includes(correctOption.value)
      : userAnswer === correctOption.value;

    if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  // Calculate score
  const totalMarks = safeQuestions.reduce((acc, q) => {
    const answerData = safeAnswers[q.id];
    const userAnswer = getSelectedAnswer(answerData);
    
    if (userAnswer && q.options) {
      const correctOption = q.options.find((opt) => opt.isCorrect);
      if (correctOption && (
        (Array.isArray(userAnswer) && userAnswer.includes(correctOption.value)) ||
        userAnswer === correctOption.value
      )) {
        return acc + (q.marks || 1);
      }
    }
    return acc;
  }, 0);

  const maxMarks = safeQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
  const scorePercentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;
  const passingScore = 70;
  const passed = scorePercentage >= passingScore;

  // Calculate performance by category
  const categories = {};

  safeQuestions.forEach((question) => {
    const categoryName = question.skillCategory || "Uncategorized";
    if (!categories[categoryName]) {
      categories[categoryName] = {
        name: categoryName,
        correct: 0,
        total: 0,
        questions: [],
        percentage: 0
      };
    }

    const answerData = safeAnswers[question.id];
    const userAnswer = getSelectedAnswer(answerData);
    const correctOption = question.options?.find(opt => opt.isCorrect);

    let isCorrect = false;
    if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '' && correctOption) {
      isCorrect = Array.isArray(userAnswer)
        ? userAnswer.includes(correctOption.value)
        : userAnswer === correctOption.value;
    }

    categories[categoryName].total += 1;
    if (isCorrect) {
      categories[categoryName].correct += 1;
    }

    // Store question with answer info
    categories[categoryName].questions.push({
      ...question,
      userAnswer,
      isCorrect: isCorrect && userAnswer !== undefined && userAnswer !== null && userAnswer !== '',
      correctAnswer: correctOption?.value,
      wasSkipped: userAnswer === undefined || userAnswer === null || userAnswer === ''
    });
  });

  // Calculate percentages
  Object.keys(categories).forEach(categoryName => {
    const category = categories[categoryName];
    category.percentage = category.total > 0
      ? Math.round((category.correct / category.total) * 100)
      : 0;
  });

  const toggleCategory = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const handleSubmitAssessment = async () => {
    try {
      await onSubmitAssessment(); // Just call the function from parent
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error.message || 'Failed to submit assessment.');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full ${passed ? 'bg-success/20' : 'bg-destructive/20'} flex items-center justify-center mx-auto mb-4`}>
          <Icon
            name={passed ? "CheckCircle" : "XCircle"}
            size={32}
            className={passed ? "text-success" : "text-destructive"}
          />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {passed ? "Assessment Passed 🎉" : "Needs Improvement"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {passed
            ? "Congratulations! You've passed the assessment."
            : "Keep practicing to improve your skills."}
        </p>
      </div>

      {/* Success message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center">
            <Icon name="CheckCircle" className="text-success mr-2" />
            <p className="text-success">Assessment submitted successfully!</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {submitError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center">
            <Icon name="AlertCircle" className="text-destructive mr-2" />
            <p className="text-destructive">{submitError}</p>
          </div>
        </div>
      )}

      {/* Score Summary */}
      <div className="bg-muted/50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <div className="text-left">
            <p className="text-lg font-semibold text-foreground">
              Your Score: {scorePercentage}%
            </p>
            <p className="text-sm text-muted-foreground">
              {totalMarks} out of {maxMarks} points
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="rounded p-3 text-center">
            <p className="text-lg font-semibold text-primary">
              {Object.keys(safeAnswers).length}
            </p>
            <p className="text-xs text-muted-foreground">Answered</p>
          </div>
          <div className="rounded p-3 text-center">
            <p className="text-lg font-semibold text-success">
              {correctCount}
            </p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="rounded p-3 text-center">
            <p className="text-lg font-semibold text-destructive">
              {incorrectCount}
            </p>
            <p className="text-xs text-muted-foreground">Incorrect</p>
          </div>
          <div className="rounded p-3 text-center">
            <p className="text-lg font-semibold text-muted-foreground">
              {skippedCount}
            </p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </div>
        </div>

        {/* Performance by Category */}
        <div className="border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Performance</h3>
          <div className="space-y-4">
            {Object.values(categories).map((category, index) => (
              <div key={index} className="border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full p-4 flex justify-between items-center bg-background hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCategory(category.name)}
                >
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({category.correct}/{category.total} questions)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${category.percentage >= 70 ? 'text-success' : 'text-destructive'
                      }`}>
                      {category.percentage}%
                    </span>
                    <Icon
                      name={expandedCategory === category.name ? "ChevronUp" : "ChevronDown"}
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>
                </button>

                {expandedCategory === category.name && (
                  <div className="p-4 bg-background border-t border-border">
                    <div className="space-y-4">
                      {category.questions.map((question, qIndex) => {
                        const userAnswer = question.userAnswer;
                        const isCorrect = question.isCorrect;
                        const wasSkipped = question.wasSkipped;
                        const correctOption = question.options.find(opt => opt.isCorrect);
                        const userSelectedOptions = Array.isArray(userAnswer)
                          ? question.options.filter(opt => userAnswer.includes(opt.value))
                          : question.options.filter(opt => opt.value === userAnswer);

                        return (
                          <div key={qIndex} className="p-4 rounded-lg border border-border">
                            <div className="flex items-start mb-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${wasSkipped ? 'bg-muted' : isCorrect ? 'bg-success/20' : 'bg-destructive/20'
                                }`}>
                                <Icon
                                  name={wasSkipped ? "Minus" : isCorrect ? "Check" : "X"}
                                  size={14}
                                  className={wasSkipped ? "text-muted-foreground" : isCorrect ? "text-success" : "text-destructive"}
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">Question {qIndex + 1}</h4>
                                <p className="text-sm text-foreground mt-1">{question.title}</p>
                                {question.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="ml-9 space-y-3">
                              {/* User's answer */}
                              {!wasSkipped ? (
                                <div>
                                  <p className="text-sm font-medium text-foreground mb-2">Your answer:</p>
                                  <div className="space-y-2">
                                    {userSelectedOptions.length > 0 ? (
                                      userSelectedOptions.map((option, oIndex) => (
                                        <div
                                          key={oIndex}
                                          className={`p-3 rounded border ${isCorrect
                                              ? 'bg-success/10 border-success/20'
                                              : 'bg-destructive/10 border-destructive/20'
                                            }`}
                                        >
                                          <div className="flex items-center">
                                            <Icon
                                              name={isCorrect ? "Check" : "X"}
                                              size={14}
                                              className={`mr-2 ${isCorrect ? "text-success" : "text-destructive"}`}
                                            />
                                            <span className="text-sm">{option.label}</span>
                                          </div>
                                          {option.description && (
                                            <p className="text-xs text-muted-foreground mt-1 ml-6">{option.description}</p>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="p-3 rounded border bg-destructive/10 border-destructive/20">
                                        <p className="text-sm text-destructive">No answer selected</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 rounded border bg-muted/50 border-border">
                                  <p className="text-sm text-muted-foreground">You skipped this question.</p>
                                </div>
                              )}

                              {/* Correct answer (shown if incorrect or skipped) */}
                              {(!isCorrect || wasSkipped) && correctOption && (
                                <div>
                                  <p className="text-sm font-medium text-foreground mb-2">Correct answer:</p>
                                  <div className="p-3 rounded border bg-success/10 border-success/20">
                                    <div className="flex items-center">
                                      <Icon name="Check" size={14} className="text-success mr-2" />
                                      <span className="text-sm">{correctOption.label}</span>
                                    </div>
                                    {correctOption.description && (
                                      <p className="text-xs text-muted-foreground mt-1">{correctOption.description}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <Button 
          variant="primary"
          iconName="Upload"
          onClick={handleSubmitAssessment}
          loading={isSubmitting}
          disabled={isSubmitting || submitSuccess}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Submitting..." :
            submitSuccess ? "Submitted Successfully" : "Submit Assessment"}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentComplete;