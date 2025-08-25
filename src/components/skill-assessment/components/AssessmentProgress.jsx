import React from "react";
import Icon from "../../../components/AppIcon";
import ProgressIndicator from "../../../components/ui/ProgressIndicator";

const AssessmentProgress = ({
  currentQuestionIndex,
  totalQuestions,
  completedQuestions,
  onQuestionClick,
  answers = {},     // ✅ safe default to avoid undefined
  questions = [],   // ✅ safe default to avoid undefined
  totalMarks,
  totalTime,
  timeLeft
}) => {
  const overallProgress =
    totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Assessment Progress
        </h3>
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
        {/* Summary */}
        <div className="text-sm text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Questions Completed</span>
            <span>
              {completedQuestions}/{totalQuestions}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Current Question</span>
            <span>{currentQuestionIndex + 1}</span>
          </div>
        </div>

        {/* ✅ Marks + Timer Info */}
        <div className="border-t border-border pt-4 text-sm text-muted-foreground">
          <p>
            Total Marks:{" "}
            <span className="font-medium text-foreground">{totalMarks}</span>
          </p>
          <p>
            Total Time:{" "}
            <span className="font-medium text-foreground">{totalTime} mins</span>
          </p>
          <p>
            Time Left:{" "}
            <span className="font-semibold text-destructive">{timeLeft}</span>
          </p>
        </div>

        {/* Questions List */}
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Questions
          </h4>
          <div className="space-y-2">
            {Array.isArray(questions) && questions.length > 0 ? (
              questions.map((q, index) => {
                const isAnswered = !!answers[q.id];
                const isActive = index === currentQuestionIndex;

                // ❌ Prevent skipping if current question not answered
                const canNavigate =
                  isActive || answers[questions[currentQuestionIndex]?.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => canNavigate && onQuestionClick(index)}
                    disabled={!canNavigate}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-smooth
                      ${
                        isActive
                          ? "bg-primary/10 border border-primary/20"
                          : isAnswered
                          ? "bg-success/10 border border-success/20 hover:bg-success/15"
                          : "bg-muted hover:bg-muted/80"
                      }
                      ${!canNavigate ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {/* Number / check icon */}
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium
                        ${
                          isAnswered
                            ? "bg-success text-white"
                            : isActive
                            ? "bg-primary text-white"
                            : "bg-muted-foreground/20 text-muted-foreground"
                        }`}
                    >
                      {isAnswered ? <Icon name="Check" size={12} /> : index + 1}
                    </div>

                    {/* Question title */}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {q.title}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No questions loaded
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentProgress;
