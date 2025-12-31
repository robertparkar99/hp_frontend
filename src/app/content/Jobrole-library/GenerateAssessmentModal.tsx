"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, ChevronDown, ChevronUp, Plus, X } from "lucide-react";

/* --------------------------------
    TYPES
-------------------------------- */
interface GenerateAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

interface Question {
  id: number;
  question_title?: string;
  question?: string;
  answers: { answer: string; correct_answer: number }[];
  mappingType?: string;
  mappingValue?: string;
  reason?: string;
  domainCategory?: string;
  sourceItem?: { dataset: string; title: string };
  marks?: number;
}

/* --------------------------------
   COMPONENT
-------------------------------- */
export default function GenerateAssessmentModal({
  isOpen,
  onClose,
  data,
}: GenerateAssessmentModalProps) {

  const [currentStep, setCurrentStep] = useState(0);

  const [questionCount, setQuestionCount] = useState<number>(0);
  const [mappings, setMappings] = useState<{ typeId: number; typeName: string; valueId: number; valueName: string; reason: string; questionCount: number; marks: number; domainCategory: string }[]>([{ typeId: 0, typeName: "", valueId: 0, valueName: "", reason: "", questionCount: 15, marks: 1, domainCategory: "" }]);
  const [mappingTypes, setMappingTypes] = useState<{ id: number; name: string }[]>([]);
  const [mappingValuesMap, setMappingValuesMap] = useState<{ [key: number]: { id: number; name: string }[] }>({});
  const [timeLimit, setTimeLimit] = useState<boolean>(false);
  const [timeLimitValue, setTimeLimitValue] = useState<number>(0);
  const [openDate, setOpenDate] = useState<string>("");
  const [closeDate, setCloseDate] = useState<string>("");
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [showScore, setShowScore] = useState<boolean>(false);
  const [showRightAnswer, setShowRightAnswer] = useState<boolean>(false);
  const [assessmentName, setAssessmentName] = useState<string>("");
  const [assessmentDescription, setAssessmentDescription] = useState<string>("");
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([0]);
  const [activeTab, setActiveTab] = useState<TabType>("Questions");
  const [configActiveTab, setConfigActiveTab] = useState<typeof configTabs[number]>("Questions");
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showEdit, setShowEdit] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [questionsSaved, setQuestionsSaved] = useState(false);
  const [questionIds, setQuestionIds] = useState<number[]>([]);
  // const [questionMasterId, setQuestionMasterId] = useState<number | null>(null);

  const [sessionData, setSessionData] = useState<{

    url: string;
    token: string;
    subInstituteId: string;
    orgType: string;
    userId: string;
  } | null>(null);


  // 🔹 Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const { APP_URL, token, sub_institute_id, org_type, user_id } =
          JSON.parse(userData);

        setSessionData({
          url: APP_URL,
          token,
          subInstituteId: String(sub_institute_id),
          orgType: org_type,
          userId: String(user_id),
        });
      } catch (e) {
        console.error("Invalid userData in localStorage", e);
      }
    }
  }, []);

  /* ------------------------------
      ASSESSMENT DATA (MOCK)
   ------------------------------ */
  const [assessmentData, setAssessmentData] = useState({
    jobRole: "Community Care Associate",
    questions: [],
    answerKey: [],
    mapping: []
  });
  const [editedQuestions, setEditedQuestions] = useState(assessmentData.questions);

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");


  const configTabs = ["Questions", "Answer Key"] as const;
  const tabs = ["Questions", "Answer Key", "Mapping", "Final Review"] as const;
  type TabType = (typeof tabs)[number]

  /* ------------------------------
      EFFECTS
   ------------------------------ */
  useEffect(() => {
    if (!sessionData) return;
    const fetchMappingTypes = async () => {
      try {
        const response = await fetch(`${sessionData?.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0&item_type=question&reason=`, {
          headers: {
            'Authorization': `Bearer ${sessionData?.token}`,
          },
        });
        const data = await response.json();
        console.log('Mapping types:', data);
        setMappingTypes(data);
      } catch (error) {
        console.error('Error fetching mapping types:', error);
      }
    };
    if (sessionData?.url && sessionData?.token) {
      fetchMappingTypes();
    }
  }, [sessionData]);

  useEffect(() => {
    if (showEdit) {
      setEditedQuestions([...assessmentData.questions]);
    }
  }, [showEdit]);

  useEffect(() => {
    if (data) {
      console.log("All data from JobDescriptionModal:", JSON.stringify(data, null, 2));
    }
  }, [data]);

  useEffect(() => {
    const total = mappings.reduce((sum, mapping) => sum + mapping.questionCount, 0);
    setQuestionCount(total);
  }, [mappings]);

  useEffect(() => {
    const total = mappings.reduce((sum, mapping) => sum + mapping.questionCount * mapping.marks, 0);
    setTotalMarks(total);
  }, [mappings]);

  /* ------------------------------
     NAVIGATION
  ------------------------------ */
  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  /* ------------------------------
     VALIDATION
  ------------------------------ */
  const isStep0Invalid = !assessmentName;

  const isStep1Invalid = !assessmentName || !assessmentDescription || totalMarks === 0 || questionCount === 0;

  const getDomainCategory = (typeName: string): string => {
    const lower = typeName.toLowerCase();
    if (lower.includes('behaviour')) return 'Behaviour';
    if (lower.includes('attitude')) return 'Attitude';
    if (lower.includes('ability')) return 'Ability';
    if (lower.includes('knowledge')) return 'Knowledge';
    if (lower.includes('skill')) return 'Skill';
    if (lower.includes('task')) return 'Task';
    return '';
  };

  const toggleQuestion = (id: number) => {
    setExpandedQuestions(prev =>
      prev.includes(id)
        ? prev.filter(qId => qId !== id)
        : [...prev, id]
    );
  };

  const fetchMappingValues = async (parentId: number) => {
    if (!sessionData || mappingValuesMap[parentId]) return;
    try {
      const response = await fetch(`${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=${parentId}`, {
        headers: {
          'Authorization': `Bearer ${sessionData.token}`,
        },
      });
      const data = await response.json();
      setMappingValuesMap(prev => ({ ...prev, [parentId]: data }));
    } catch (error) {
      console.error('Error fetching mapping values:', error);
    }
  };

  const fetchMappingReason = async (mappingId: number) => {
    if (!sessionData) return "";
    try {
      const response = await fetch(`${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[id]=${mappingId}`, {
        headers: {
          'Authorization': `Bearer ${sessionData.token}`,
        },
      });
      const data = await response.json();
      return data[0]?.reason || "";
    } catch (error) {
      console.error('Error fetching mapping reason:', error);
      return "";
    }
  };

  const addMapping = () => {
    setMappings(prev => [...prev, { typeId: 0, typeName: "", valueId: 0, valueName: "", reason: "", questionCount: 15, marks: 1, domainCategory: "" }]);
  };

  const updateMapping = (index: number, field: string, value: string | number) => {
    setMappings(prev => prev.map((mapping, i) => {
      if (i === index) {
        if (field === 'typeId') {
          const selectedType = mappingTypes.find(t => t.id === value);
          if (selectedType) {
            fetchMappingValues(selectedType.id);
            // Fetch reason for the selected type
            fetchMappingReason(value as number).then(reason => {
              setMappings(prev => prev.map((m, i) => i === index ? { ...m, reason } : m));
            });
            const domainCat = getDomainCategory(selectedType.name);
            return { ...mapping, typeId: value as number, typeName: selectedType.name, valueId: 0, valueName: "", reason: "", domainCategory: domainCat };
          }
        } else if (field === 'valueId') {
          const selectedValue = (mappingValuesMap[mapping.typeId] || []).find(v => v.id === value);
          return { ...mapping, valueId: value as number, valueName: selectedValue ? selectedValue.name : "" };
        } else if (field === 'reason') {
          return { ...mapping, reason: value as string };
        } else if (field === 'questionCount') {
          return { ...mapping, questionCount: value as number, marks: 1 };
        } else if (field === 'marks') {
          return { ...mapping, marks: value as number };
        }
      }
      return mapping;
    }));
  };

  const removeMapping = (index: number) => {
    setMappings(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  };

  const generateQuestionsWithGemini = async () => {
    console.log("generateQuestionsWithGemini called");
    setLoading(true);
    setError("");

    if (!sessionData) {
      console.log("sessionData is null");
      alert("Session not loaded");
      return;
    }

    console.log("sessionData:", sessionData);

    try {
      console.log("Making fetch to /api/generate-questions");
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: data?.jobRole?.jobrole || "Community Care Associate",
          question_type: "multiple",
          // difficultyLevel: "intermediate",
          questionCount: questionCount,
          mappings: mappings,
          data: data,

        }),
      });

      console.log("Fetch response status:", res.status);
      const result = await res.json();
      console.log("Fetch result:", result);

      if (!Array.isArray(result.questions)) {
        throw new Error("No questions array in response");
      }

      console.log("Generated questions:", result.questions);
      console.log("Generated question ids:", (result.questions as Question[]).map(q => q.id));
      setQuestions(result.questions as Question[]);
      // setQuestionIds((result.questions as Question[]).map(q => q.id).filter(Boolean));
      setQuestionsGenerated(true);
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };


  // const storeQuestions = async (questions: Question[]) => {
  //   if (!sessionData) {
  //     alert("Session not loaded");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const ids: number[] = [];

  //     for (const q of questions) {
  //       const payload = {
  //         token: sessionData.token,
  //         question_type_id: 1,        // MCQ
  //         standard_id: data?.jobRole?.department_id || 2, // department id from jobrole
  //         question_title: q.question_title || q.question,
  //         description: q.reason || "AI generated question",
  //         points: 1,
  //         paper_category: data?.jobRole?.jobrole,
  //         multiple_answer: 1,
  //         sub_institute_id: Number(sessionData.subInstituteId),
  //         answers: q.answers.map((a) => ({
  //           answer: a.answer,
  //           correct_answer: Number(a.correct_answer),
  //         })),
  //       };

  //       const res = await fetch(
  //         `${sessionData.url}/api/ai-generated-assessment/question/store`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             'Authorization': `Bearer ${sessionData.token}`,
  //             "Accept": "application/json",
  //           },
  //           body: JSON.stringify(payload),
  //         }
  //       );

  //       const result = await res.json();

  //       if (!res.ok) {
  //         console.error("Failed question:", payload, result);
  //         throw new Error(result.message || "Question store failed");
  //       }

  //       if (result.id) {
  //         ids.push(result.id);
  //       }

  //       if (result.questionmaster_id && !questionMasterId) {
  //         setQuestionMasterId(result.questionmaster_id);
  //       }

  //     }
  //     // after all questions are stored successfully
  //     setQuestionIds(ids);
  //     setQuestionsSaved(true);
  //     alert("✅ All questions stored successfully");
  //   } catch (err: any) {
  //     console.error(err);
  //     alert("❌ Failed to store questions");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const storeQuestions = async (questions: Question[]) => {
    if (!sessionData) {
      alert("Session not loaded");
      return { questionIds: [] };
    }

    try {
      setLoading(true);

      const ids: number[] = [];

      for (const q of questions) {
        const payload = {
          token: sessionData.token,
          question_type_id: 1,
          standard_id: data?.jobRole?.department_id || 2,
          question_title: q.question_title || q.question,
          description: q.reason || "AI generated question",
          points: 1,
          paper_category: data?.jobRole?.jobrole,
          multiple_answer: 0,
          sub_institute_id: Number(sessionData.subInstituteId),
          answers: q.answers.map((a) => ({
            answer: a.answer,
            correct_answer: Number(a.correct_answer),
          })),
          domainCategory: q.domainCategory,
          sourceItem: q.sourceItem,
          mappingType: q.mappingType,
          mappingValue: q.mappingValue,
          marks: q.marks,
          reason: q.reason,
        };

        const res = await fetch(
          `${sessionData.url}/api/ai-generated-assessment/question/store`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionData.token}`,
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Question store failed");
        }

        if (result?.question_id) {
          const qId = Number(result.question_id);

          // ✅ store each question ONCE
          if (!ids.includes(qId)) {
            ids.push(qId);
          }
        }
      }

      setQuestionIds(ids);
      setQuestionsSaved(true);

      console.log("Stored question IDs:", ids);

      return { questionIds: ids };
    } catch (err) {
      console.error(err);
      alert("Failed to store questions");
      return { questionIds: [] };
    } finally {
      setLoading(false);
    }
  };


  const storeAssessment = async () => {
    console.log("storeAssessment called, questionsSaved:", questionsSaved);
    console.log("questionIds before:", questionIds);
    // console.log("questionMasterId before:", questionMasterId);
    if (!sessionData) {
      alert("Session not loaded");
      return;
    }

    let finalQuestionIds = questionIds;


    // ✅ Ensure questions are stored FIRST
    if (!questionsSaved) {
      console.log("Storing questions...");
      const result = await storeQuestions(questions);
      finalQuestionIds = result.questionIds;

    }

    console.log("finalQuestionIds:", finalQuestionIds);

    // Build mappings object per question
    const questionMappings: { [key: string]: { mapping_type_id: number; mapping_value_id: number; reasons: string }[] } = {};
    let questionIndex = 0;
    mappings.forEach(mapping => {
      for (let i = 0; i < mapping.questionCount && questionIndex < finalQuestionIds.length; i++) {
        const qId = finalQuestionIds[questionIndex].toString();
        if (!questionMappings[qId]) {
          questionMappings[qId] = [];
        }
        questionMappings[qId].push({
          mapping_type_id: mapping.typeId,
          mapping_value_id: mapping.valueId,
          reasons: mapping.reason
        });
        questionIndex++;
      }
    });

    const payload = {
      grade_id: 1,
      standard_id: data?.jobRole?.department_id || 2,
      subject_id: 3,
      paper_name: assessmentName,
      paper_desc: assessmentDescription,
      open_date: openDate,
      close_date: closeDate,
      timelimit_enable: timeLimit ? 1 : 0,
      time_allowed: timeLimitValue,
      total_marks: totalMarks,
      total_ques: questionCount,

      // ✅ ONLY question_ids
      question_ids: finalQuestionIds.join(","),

      shuffle_question: shuffleQuestions ? 1 : 0,
      attempt_allowed: 1,
      show_feedback: showFeedback ? 1 : 0,
      show_hide: 1,
      result_show_ans: showRightAnswer ? 1 : 0,
      created_by: Number(sessionData.userId),
      sub_institute_id: Number(sessionData.subInstituteId),
      exam_type: "online",
      mappings: questionMappings,
    };
    console.log("Assessment payload question_ids:", finalQuestionIds.join(','));
    // console.log("Assessment payload questionmaster_id:", finalQuestionMasterId);
    console.log("Full assessment store payload:", payload);
    alert("Assessment Store Payload:\n" + JSON.stringify(payload, null, 2));

    try {
      setLoading(true);
      const res = await fetch(
        `${sessionData.url}/api/ai-generated-assessment/assessment/store`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (res.ok) {
        alert("Assessment saved successfully");
        onClose();
      } else {
        alert(result.message || "Failed to save assessment");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving assessment");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------
       STEPS
    ------------------------------ */
  const steps = [
    {
      title: `Assessment Preview – ${data?.jobRole?.jobrole || "Community Care Associate"}`,
      content: (
        <div className="space-y-4">
          {/* ASSESSMENT SETTINGS */}
          <div className="rounded-lg border bg-gray-50 p-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Mapping Settings</h3>
            <div className="space-y-2">
              {/* MAPPING SETTINGS */}
              <div>
                {/* <h4 className="text-md font-semibold text-gray-800 mb-4">Mapping Settings</h4> */}
                <div className="space-y-4">
                  {mappings.map((mapping, index) => (
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-700">
                        <span>Mapping Type</span>
                        <span>Mapping Value</span>
                        <span className="col-span-2">Reason</span>
                        {/* <span>Domain Category</span> */}
                        <span>Questions</span>
                        <span>Marks</span>
                        <span></span>
                      </div>
                      <div className="grid grid-cols-8 gap-4 items-center">
                        <select
                          value={mapping.typeId}
                          onChange={(e) => updateMapping(index, 'typeId', Number(e.target.value))}
                          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={0}>Select Type</option>
                          {mappingTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                        <select
                          value={mapping.valueId}
                          onChange={(e) => updateMapping(index, 'valueId', Number(e.target.value))}
                          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={0}>Select Value</option>
                          {(mappingValuesMap[mapping.typeId] || []).map(val => (
                            <option key={val.id} value={val.id}>{val.name}</option>
                          ))}
                        </select>
                        <textarea
                          value={mapping.reason}
                          readOnly
                          placeholder="Reason will be loaded when mapping value is selected"
                          rows={2}
                          className="col-span-2 p-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none"
                        />
                        {/* <input
                          value={mapping.domainCategory}
                          readOnly
                          placeholder="Domain Category"
                          className="p-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none"
                        /> */}
                        <input
                          type="number"
                          value={mapping.questionCount}
                          onChange={(e) => updateMapping(index, 'questionCount', Number(e.target.value))}
                          min="1"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={mapping.marks}
                          readOnly
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          {mappings.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={() => removeMapping(index)}
                              className="h-10 p-3 rounded-lg bg-[#f5f5f5] hover:bg-red-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {index === mappings.length - 1 && (
                            <Button
                              type="button"
                              size="icon"

                              onClick={addMapping}
                              // className="px-2 py-1 text-black bg-[#f5f5f5] rounded hover:bg-gray-100"
                              style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f5f5f5" }}
                            >
                              <Plus className="h-4 w-4 text-black" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            {error && <div className="text-red-500 mr-4">{error}</div>}
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={generateQuestionsWithGemini}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Question(AI)"}
            </Button>
          </div>

          <div className="border-b mb-4">
            <div className="flex gap-6 text-sm font-medium text-gray-500">
              {configTabs.map((tab) => {
                const isActive = configActiveTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setConfigActiveTab(tab)}
                    className={`relative pb-2 transition-colors
          ${isActive ? "text-blue-600" : "hover:text-gray-700"}
        `}
                  >
                    {tab}

                    {isActive && (
                      <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-blue-600 rounded" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Job Role: {data?.jobRole?.jobrole || "Community Care Associate"}
          </div>

          {configActiveTab === "Questions" && (
            <div>
              {questions && questions.length > 0 ? questions.map((question, index) => (
                <div key={question.id || index} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Q{question.id || index + 1}</span>
                      <span className="text-gray-700">{question.question_title || question.question || 'No question text'}</span>
                    </div>
                    {expandedQuestions.includes(question.id) ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                    }
                  </div>

                  {expandedQuestions.includes(question.id) && (
                    <div className="p-4 border-t">
                      <div className="space-y-3">


                        <select
                          value={userAnswers[question.id] || ''}
                          onChange={(e) =>
                            setUserAnswers(prev => ({
                              ...prev,
                              [question.id]: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select answer</option>

                          {question.answers &&
                            Array.isArray(question.answers) &&
                            question.answers.map((answer, idx: number) => {
                              const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D

                              return (
                                <option key={idx} value={answer.answer}>
                                  {optionLabel}. {answer.answer}
                                </option>
                              );
                            })}
                        </select>

                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Mapping Type:</span> {question.mappingType}
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Mapping Value:</span> {question.mappingValue}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Reason:</span> {question.reason}
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Domain Category:</span> {question.domainCategory}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center text-gray-500 py-8">
                  No questions available. Click "Generate Question(AI)" to create questions.
                </div>
              )}
            </div>
          )}

          {configActiveTab === "Answer Key" && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-700">Questions</th>
                    {/* <th className="text-left p-3 font-medium text-gray-700">Your Answer</th> */}
                    <th className="text-left p-3 font-medium text-gray-700">Correct Answer</th>
                    {/* <th className="text-left p-3 font-medium text-gray-700">Status</th> */}
                    {/* <th className="text-left p-3 font-medium text-gray-700">Rationale</th> */}
                  </tr>
                </thead>
                <tbody>
                  {questions && questions.length > 0 ? questions.map((question, index) => {
                    const userAnswer = userAnswers[question.id];
                    const correctAnswerObj = question.answers?.find((a) => a.correct_answer == 1);
                    const correctAnswer = correctAnswerObj?.answer || '';
                    const isCorrect = userAnswer === correctAnswer;
                    return (
                      <tr key={question.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">Q{question.id}</td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-800 font-medium">
                              {correctAnswerObj ? String.fromCharCode(65 + question.answers.indexOf(correctAnswerObj)) : '?'}
                            </div>
                            <span>{correctAnswer}</span>
                          </div>
                        </td>

                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-500 py-8">
                        No questions available. Click "Generate Question(AI)" to create questions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}


        </div>
      ),
    },

    {
      title: `Generate AI Assessment – ${data?.jobRole?.jobrole || "Community Care Associate"}`,
      content: (
        <div className="space-y-6">
          {/* ASSESSMENT BASIC INFO */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    value={assessmentName}
                    onChange={(e) => setAssessmentName(e.target.value)}
                    placeholder="Enter assessment name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Description
                  </label>
                  <textarea
                    value={assessmentDescription}
                    onChange={(e) => setAssessmentDescription(e.target.value)}
                    placeholder="Enter assessment description"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions (Calculated from Mappings)
                  </label>
                  <input
                    type="number"
                    value={questionCount}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* ASSESSMENT TIMING AND ACCESS */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Timing & Access</h3>
            <div className="space-y-4">
              {/* TIME LIMIT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.checked)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm">Enable Time Limit </span>
                  </label>
                  <label className="text-sm font-medium text-gray-700">Allowed Time (mins):</label>
                  <input
                    type="number"
                    value={timeLimitValue}
                    onChange={(e) => setTimeLimitValue(Math.max(0, Number(e.target.value)))}
                    placeholder="Minutes"
                    min="0"
                    className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ASSESSMENT DATES */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Dates
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Open Date</label>
                    <input
                      type="date"
                      value={openDate}
                      onChange={(e) => setOpenDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Close Date</label>
                    <input
                      type="date"
                      value={closeDate}
                      onChange={(e) => setCloseDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ASSESSMENT OPTIONS */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Display Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Shuffle Questions", state: shuffleQuestions, setter: setShuffleQuestions },
                { label: "Show Feedback", state: showFeedback, setter: setShowFeedback },
                { label: "Show Score", state: showScore, setter: setShowScore },
                { label: "Show Right Answer after Result", state: showRightAnswer, setter: setShowRightAnswer },
              ].map((option) => (
                <label key={option.label} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={option.state}
                    onChange={(e) => option.setter(e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: `Generate AI Assessment – ${data?.jobRole?.jobrole || "Community Care Associate"}`,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Assessment Summary</h3>
          <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Assessment ready to generate</p>
              <p className="text-sm text-green-700 mt-1">
                Preview all sections and confirm to generate the final assessment.
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3">Assessment Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Assessment Name</p>
                <p className="font-medium">{assessmentName || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-600">Job Role</p>
                <p className="font-medium">{data?.jobRole?.jobrole || "Community Care Associate"}</p>
              </div>
              <div>
                <p className="text-gray-600">Questions</p>
                <p className="font-medium">{questionCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Marks</p>
                <p className="font-medium">{totalMarks || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-600">Time Limit</p>
                <p className="font-medium">{timeLimit ? `${timeLimitValue} minutes` : "None"}</p>
              </div>
              <div>
                <p className="text-gray-600">Open Date</p>
                <p className="font-medium">{openDate || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-600">Close Date</p>
                <p className="font-medium">{closeDate || "Not set"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Description</p>
                <p className="font-medium">{assessmentDescription || "Not set"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Options</p>
                <p className="font-medium">
                  Shuffle: {shuffleQuestions ? "Yes" : "No"}, Feedback: {showFeedback ? "Yes" : "No"}, Score: {showScore ? "Yes" : "No"}, Answers: {showRightAnswer ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {steps[currentStep].title}
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-3" />

        {steps[currentStep].content}

        {/* FOOTER */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={prev}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex gap-3">

            {currentStep < steps.length - 1 ? (
              <div className="flex gap-3">

                {currentStep === 0 &&
                  questionsGenerated &&
                  !questionsSaved && (
                    <Button
                      variant="outline"
                    disabled={loading}
                    onClick={() => storeQuestions(questions)}
                  >
                    {loading ? "Saving..." : "Save Question"}
                  </Button>
                  )}
                <Button
                  onClick={next}
                  disabled={currentStep === 1 && isStep1Invalid}
                >
                  Next
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                  <Button
                  className="bg-blue-600 hover:bg-blue-700"
                    onClick={storeAssessment}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save to Assessment Library"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
