"use client";
import React, { useState, useEffect } from "react";
import AssessmentProgress from "./components/AssessmentProgress";
import QuestionCard from "./components/QuestionCard";
import AssessmentComplete from "./components/AssessmentComplete";

const SkillAssessment = ({ assessment }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(1);
  const [assessmentData, setAssessmentData] = useState({
    id: "",
    questions: [],
    sections: [],
    totalMarks: 0,
    totalTime: 0,
    active_exam: "no",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  const [timeLeft, setTimeLeft] = useState(null);

  // 👉 Helper: format JS Date to MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
  const toMySQLDateTime = (date = new Date()) => {
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  // ✅ Load session info
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        const userId = parsed.userId || parsed.user_id || parsed.id || "";

        setSessionData({
          url: parsed.APP_URL || "http://127.0.0.1:8000",
          token: parsed.token || "",
          subInstituteId: parsed.sub_institute_id || "",
          orgType: parsed.orgType || "",
          userId: userId,
        });

        setAssessmentData((prev) => ({
          ...prev,
          id: assessment?.id || parsed.questionpaper_id || "",
        }));
      }
    }
  }, [assessment]);

  // ✅ Fetch assessment data
  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!sessionData.url || !sessionData.subInstituteId || !assessmentData.id) {
        return;
      }

      try {
        const apiUrl = `${sessionData.url}/lms/online_exam?type=API&questionpaper_id=${assessmentData.id}&sub_institute_id=${sessionData.subInstituteId}`;

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            Accept: "application/json",
          },
        });
        const data = await response.json();

        if (!data?.questionpaper_data?.id) {
          setLoading(false);
          return;
        }

        const paperId = data.questionpaper_data.id;

        // ✅ Map Questions
        const mappedQuestions = data.question_arr.map((q, index) => {
          const options =
            data.answer_arr[q.id]?.map((a) => ({
              value: a.id,
              label: a.answer,
              description: a.feedback,
              isCorrect: a.correct_answer === 1,
            })) || [];

          return {
            id: q.id,
            sectionId: "default",
            skillCategory: "Exam",
            skillName: data.questionpaper_data.paper_name,
            skillIcon: "HelpCircle",
            questionNumber: index + 1,
            totalQuestions: data.questionpaper_data.total_ques,
            type: q.multiple_answer === 1 ? "multiple-select" : "multiple-choice",
            title: q.question_title,
            description: q.description,
            hint: q.hint_text,
            marks: q.marks || 1,
            options,
          };
        });

        const totalMarks = data.questionpaper_data.total_marks || 0;
        const totalTime = data.questionpaper_data.time_allowed || 60;
        const examStatus = data.questionpaper_data.active_exam || "no";

        setAssessmentData({
          id: paperId,
          questions: mappedQuestions,
          sections: [
            {
              id: paperId,
              name: data.questionpaper_data.paper_name,
              icon: "FileQuestion",
              totalQuestions: mappedQuestions.length,
              completedQuestions: 0,
              completed: false,
              definition: data.questionpaper_data.paper_desc,
              relatedSkills: [],
            },
          ],
          totalMarks,
          totalTime,
          active_exam: examStatus,
        });

        const savedTime = localStorage.getItem(`timeLeft_${paperId}`);
        if (savedTime && !isNaN(savedTime)) {
          setTimeLeft(parseInt(savedTime, 10));
        } else {
          setTimeLeft(totalTime * 60);
        }

        setLoading(false);
      } catch (error) {
        console.error("🚨 Error fetching assessment:", error);
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [sessionData, assessmentData.id]);

  // ✅ Timer
  useEffect(() => {
    if (isCompleted || timeLeft === null) return;
    if (timeLeft <= 0 && timeLeft !== assessmentData.totalTime * 60) {
      handleSubmitAssessment().then(() => setIsCompleted(true));
      localStorage.removeItem(`timeLeft_${assessmentData.id}`);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newVal = prev - 1;
        if (newVal <= 0) {
          clearInterval(timer);
          handleSubmitAssessment().then(() => setIsCompleted(true));
          localStorage.removeItem(`timeLeft_${assessmentData.id}`);
          return 0;
        }
        localStorage.setItem(`timeLeft_${assessmentData.id}`, newVal);
        return newVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isCompleted, assessmentData.id, assessmentData.totalTime]);

  // ✅ Format time
  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleAnswer = (questionId, selectedAnswer) => {
    const question = assessmentData.questions.find((q) => q.id === questionId);
    if (!question) return;

    const correctOption = question.options.find((o) => o.isCorrect);
    const correctAnswer = correctOption ? correctOption.value : "";

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected: selectedAnswer,
        correct: correctAnswer,
      },
    }));
  };

  const getDisplayAnswer = (storedAnswer) => {
    if (!storedAnswer) return null;
    return storedAnswer.selected;
  };

  // ✅ Submit API — formats start time for MySQL
  const handleSubmitAssessment = async () => {
    try {
      if (isSubmitting) return;
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("type", "API");
      // 🔑 FIX: send MySQL DATETIME, not ISO
      formData.append("hid_session_quiz", toMySQLDateTime(new Date()));
      formData.append("questionpaper_time", String(assessmentData.totalTime));
      formData.append("questionpaper_id", String(assessmentData.id));
      formData.append("sub_institute_id", String(sessionData.subInstituteId));
      formData.append("user_id", String(sessionData.userId));

      Object.entries(answers).forEach(([questionId, data]) => {
        const selected = data.selected;
        const correct = data.correct;

        if (Array.isArray(selected)) {
          selected.forEach((val, idx) =>
            formData.append(
              `answer_multiple[${questionId}][${idx}]`,
              `${val}##${correct === val ? 1 : 0}`
            )
          );
        } else {
          formData.append(
            `answer_single[${questionId}]`,
            `${selected}##${correct === selected ? 1 : 0}`
          );
        }
      });

      const response = await fetch(`${sessionData.url}/lms/online_exam`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionData.token}`,
          Accept: "application/json",
          // NOTE: don't set Content-Type manually for FormData; the browser will add the boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Submit failed (${response.status}) ${text}`);
      }

      const result = await response.json().catch(() => ({}));
      console.log("✅ Submitted:", result);
      return result;
    } catch (error) {
      console.error("❌ Submission error:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuestions = assessmentData?.questions?.length || 0;
  const completedQuestions = Object.keys(answers).length;

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      updateCurrentSection();
    } else {
      // ✅ Last question → submit immediately
      await handleSubmitAssessment();
      setIsCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      updateCurrentSection();
    }
  };

  const updateCurrentSection = () => {
    if (!assessmentData.questions[currentQuestionIndex]) return;
    const currentQuestion = assessmentData.questions[currentQuestionIndex];
    const sectionIndex = assessmentData.sections.findIndex(
      (s) => s.id === currentQuestion.sectionId
    );
    setCurrentSection(sectionIndex + 1);
  };

  if (loading) return <p className="text-center py-8">Loading assessment...</p>;
  if (!assessmentData?.questions?.length)
    return <p className="text-center py-8 text-red-500">No questions found</p>;

  if (isCompleted) {
    return (
      <div>
        <main className="pt-16 pb-24 md:pb-8">
          <div className="container mx-auto px-6 py-8">
            <AssessmentComplete
              questions={assessmentData.questions}
              answers={answers}
              onRetakeAssessment={() => {
                setIsCompleted(false);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setCurrentSection(1);
                setTimeLeft(assessmentData.totalTime * 60);
                localStorage.removeItem(`timeLeft_${assessmentData.id}`);
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <AssessmentProgress
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                completedQuestions={completedQuestions}
                answers={Object.fromEntries(
                  Object.entries(answers).map(([qid, val]) => [
                    qid,
                    getDisplayAnswer(val),
                  ])
                )}
                questions={assessmentData.questions}
                onQuestionClick={(index) => setCurrentQuestionIndex(index)}
                totalMarks={assessmentData.totalMarks}
                totalTime={assessmentData.totalTime}
                timeLeft={formatTime(timeLeft)}
              />
            </div>
            <div className="lg:col-span-8">
              <QuestionCard
                question={assessmentData.questions[currentQuestionIndex]}
                onAnswer={(answer) =>
                  handleAnswer(
                    assessmentData.questions[currentQuestionIndex].id,
                    answer
                  )
                }
                onNext={handleNextQuestion}
                onPrevious={handlePreviousQuestion}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === totalQuestions - 1}
                currentAnswer={getDisplayAnswer(
                  answers[assessmentData.questions[currentQuestionIndex]?.id]
                )}
                totalMarks={assessmentData.totalMarks}
                totalTime={assessmentData.totalTime}
                timeLeft={formatTime(timeLeft)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillAssessment;
