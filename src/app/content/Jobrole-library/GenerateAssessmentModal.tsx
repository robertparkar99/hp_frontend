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

/* --------------------------------
   COMPONENT
-------------------------------- */
export default function GenerateAssessmentModal({
  isOpen,
  onClose,
  data,
}: GenerateAssessmentModalProps) {

  const [currentStep, setCurrentStep] = useState(0);

  const [questionCount, setQuestionCount] = useState<number>(15);
  const [mappings, setMappings] = useState<{ typeId: number; typeName: string; valueId: number; valueName: string; reason: string; questionCount: number; marks: number }[]>([{ typeId: 0, typeName: "", valueId: 0, valueName: "", reason: "", questionCount: 15, marks: 0 }]);
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
    questions: [
      {
        id: 1,
        text: "A client shows signs of discomfort during daily care. What is the MOST appropriate action?",
        options: [
          "Ignore minor complaints",
          "Immediately report and document the observation",
          "Continue routine tasks",
          "Ask another client for advice"
        ],
        correctAnswer: "Immediately report and document the observation",
        cwf: "Perform stakeholder engagement",
        keyTask: "Build rapport and professional relationships with clients",
        rationale: "Reporting discomfort ensures patient safety and compliance with care protocols."
      },
      {
        id: 2,
        text: "When assembling wine and drape, what is the key consideration?",
        options: [
          "Speed over accuracy",
          "Adhere to control procedures",
          "Personal preference",
          "Client suggestions"
        ],
        correctAnswer: "Adhere to control procedures",
        cwf: "Support department administration",
        keyTask: "Adhere to control procedures",
        rationale: "Control procedures ensure accuracy and safety in assembly tasks."
      },
      {
        id: 3,
        text: "What is essential for data integration in community care?",
        options: [
          "Manual recording only",
          "Adherence to activity and action plans",
          "Personal judgment",
          "Informal notes"
        ],
        correctAnswer: "Adherence to activity and action plans",
        cwf: "Data integration",
        keyTask: "Ensure data accuracy and compliance",
        rationale: "Activity and action plans provide structured data integration for effective care."
      }
    ],
    answerKey: [
      { question: "Q1", answer: "B", rationale: "Reporting discomfort ensures patient safety and compliance with care protocols." },
      { question: "Q2", answer: "B", rationale: "Control procedures ensure accuracy and safety in assembly tasks." },
      { question: "Q3", answer: "B", rationale: "Activity and action plans provide structured data integration for effective care." }
    ],
    mapping: [
      { cwf: "Perform stakeholder engagement", description: "Support department administration and stakeholder engagement.", keyTasks: ["Build rapport and professional relationships with clients"] },
      { cwf: "Support department administration", description: "Adhere to control procedures", keyTasks: ["Adhere to control procedures"] },
      { cwf: "Data integration", description: "Ensure data accuracy and compliance", keyTasks: ["Ensure data accuracy and compliance"] }
    ]
  });
  const [editedQuestions, setEditedQuestions] = useState(assessmentData.questions);



  const configTabs = ["Questions", "Answer Key", "Mapping"] as const;
  const tabs = ["Questions", "Answer Key", "Mapping", "Final Review"] as const;
  type TabType = (typeof tabs)[number]

  /* ------------------------------
      EFFECTS
   ------------------------------ */
  useEffect(() => {
    if (!sessionData) return;
    const fetchMappingTypes = async () => {
      try {
        const response = await fetch(`${sessionData?.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0`, {
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

  const addMapping = () => {
    setMappings(prev => [...prev, { typeId: 0, typeName: "", valueId: 0, valueName: "", reason: "", questionCount: 15, marks: 0 }]);
  };

  const updateMapping = (index: number, field: string, value: string | number) => {
    setMappings(prev => prev.map((mapping, i) => {
      if (i === index) {
        if (field === 'typeId') {
          const selectedType = mappingTypes.find(t => t.id === value);
          if (selectedType) {
            fetchMappingValues(selectedType.id);
            return { ...mapping, typeId: value as number, typeName: selectedType.name, valueId: 0, valueName: "" };
          }
        } else if (field === 'valueId') {
          const selectedValue = (mappingValuesMap[mapping.typeId] || []).find(v => v.id === value);
          return { ...mapping, valueId: value as number, valueName: selectedValue ? selectedValue.name : "" };
        } else if (field === 'reason') {
          return { ...mapping, reason: value as string };
        } else if (field === 'questionCount') {
          return { ...mapping, questionCount: value as number };
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
                      <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-700">
                        <span>Mapping Type</span>
                        <span>Mapping Value</span>
                        <span className="col-span-2">Reason</span>
                        <span>Questions</span>
                        <span>Marks</span>
                        <span></span>
                      </div>
                      <div className="grid grid-cols-7 gap-4 items-center">
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
                          onChange={(e) => updateMapping(index, 'reason', e.target.value)}
                          placeholder="Enter reason"
                          rows={2}
                          className="col-span-2 p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                          onChange={(e) => updateMapping(index, 'marks', Number(e.target.value))}
                          min="0"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {assessmentData.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Q{question.id}</span>
                      <span className="text-gray-700">{question.text.substring(0, 60)}...</span>
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
                          onChange={(e) => setUserAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select answer</option>
                          {question.options.map((option, idx) => (
                            <option key={idx} value={option}>
                              {String.fromCharCode(65 + idx)}. {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">CWF:</span> {question.cwf}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Key Task:</span> {question.keyTask}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {configActiveTab === "Answer Key" && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-700">Questions</th>
                    <th className="text-left p-3 font-medium text-gray-700">Your Answer</th>
                    <th className="text-left p-3 font-medium text-gray-700">Correct Answer</th>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentData.questions.map((question, index) => {
                    const userAnswer = userAnswers[question.id];
                    const correctAnswer = question.correctAnswer;
                    const isCorrect = userAnswer === correctAnswer;
                    return (
                      <tr key={question.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">Q{question.id}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-medium">
                              {userAnswer ? String.fromCharCode(65 + question.options.findIndex(opt => opt === userAnswer)) : '?'}
                            </div>
                            <span>{userAnswer || 'Not answered'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-800 font-medium">
                              {String.fromCharCode(65 + question.options.findIndex(opt => opt === correctAnswer))}
                            </div>
                            <span>{correctAnswer}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {userAnswer ? (
                            isCorrect ? (
                              <span className="text-green-600 font-medium">Correct</span>
                            ) : (
                              <span className="text-red-600 font-medium">Incorrect</span>
                            )
                          ) : (
                            <span className="text-gray-500">Not answered</span>
                          )}
                        </td>
                        <td className="p-3">{question.rationale}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {configActiveTab === "Mapping" && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-700">Critical Work Functions</th>
                    <th className="text-left p-3 font-medium text-gray-700">Key Tasks</th>
                    <th className="text-left p-3 font-medium text-gray-700">Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const grouped = assessmentData.questions.reduce((acc, q) => {
                      if (!acc[q.cwf]) acc[q.cwf] = {};
                      if (!acc[q.cwf][q.keyTask]) acc[q.cwf][q.keyTask] = [];
                      acc[q.cwf][q.keyTask].push(q.id);
                      return acc;
                    }, {} as { [cwf: string]: { [keyTask: string]: number[] } });
                    return Object.entries(grouped).map(([cwf, keyTasks]) =>
                      Object.entries(keyTasks).map(([keyTask, questionIds], index) => (
                        <tr key={`${cwf}-${keyTask}`} className="border-b hover:bg-gray-50">
                          {index === 0 && <td rowSpan={Object.keys(keyTasks).length} className="p-3 font-medium">{cwf}</td>}
                          <td className="p-3">{keyTask}</td>
                          <td className="p-3">{questionIds.map(id => `Q${id}`).join(', ')}</td>
                        </tr>
                      ))
                    );
                  })()}
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
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Math.max(1, Number(e.target.value)))}
                    placeholder="Enter number of questions"
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Math.max(0, Number(e.target.value)))}
                    placeholder="Enter total marks"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ASSESSMENT SETTINGS */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment Settings</h3>
            <div className="space-y-4">
              {/* MAPPING SETTINGS */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Mapping Settings</h4>
                <div className="space-y-4">
                  {mappings.map((mapping, index) => (
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-700">
                        <span>Mapping Type</span>
                        <span>Mapping Value</span>
                        <span className="col-span-2">Reason</span>
                        <span>Number of Questions</span>
                        <span>Marks</span>
                        <span></span>
                      </div>
                      <div className="grid grid-cols-7 gap-4 items-center">
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
                          onChange={(e) => updateMapping(index, 'reason', e.target.value)}
                          placeholder="Enter reason"
                          rows={2}
                          className="col-span-2 p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                          onChange={(e) => updateMapping(index, 'marks', Number(e.target.value))}
                          min="0"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {/* {currentStep === 2 && !showEdit && (
              <Button
                variant="outline"
                onClick={() => setShowEdit(true)}
              >
                Edit Assessment
              </Button>
            )} */}
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={next}
                disabled={currentStep === 1 && isStep1Invalid}
              >
                Next
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("Save to Assessment Library");
                    onClose();
                  }}
                >
                  Save to Assessment Library
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    console.log("Generate Assessment");
                    onClose();
                  }}
                >
                  Generate Assessment
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
