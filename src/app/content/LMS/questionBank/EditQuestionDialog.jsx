"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import TiptapEditor from "../../../content/LMS/questionBank/TiptapEditor";

export function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSave,
  saving,
  mapping_type = [],
  mapping_value = [],
}) {
  const [editForm, setEditForm] = useState({
    question_title: "",
    description: "",
    points: 1,
    questionType: "1",
    questionMark: 1,
    multiple_answer: false,
    show: true,
    concept: "",
    subconcept: "",
    hint_text: "",
    mappings: [{ mapping_type: "", mapping_value: "", reasons: "" }],
    // answers: [{ text: "", feedback: "", is_correct: false }],
    answers: [
      { text: "", feedback: "", is_correct: false },
      { text: "", feedback: "", is_correct: false },
      { text: "", feedback: "", is_correct: false },
      { text: "", feedback: "", is_correct: false }
    ],
    syear: new Date().getFullYear(),
    grade_id: "",
    standard_id: "",
    subject_id: "",
    chapter_id: "",
    topic_id: "",
    pre_grade_topic: "",
    post_grade_topic: "",
    cross_curriculum_grade_topic: "",
    learning_outcome: "",
    status: 1,
  });

  // local state for mapping data from API
  const [sessionData, setSessionData] = useState({});
  const [mappingTypes, setMappingTypes] = useState([]);
  const [mappingValues, setMappingValues] = useState([]);
  const [loading, setLoading] = useState({
    types: false,
    values: false
  });
  const [error, setError] = useState("");
  const [saveing, setSaving] = useState("false");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { APP_URL, token, sub_institute_id, user_id } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, user_id });
      }
    }
  }, []);

  // fetch mapping data from the new API endpoint
  // useEffect(() => {
  //   if (!open || !question) return;
    
  //   const fetchMappingData = async () => {
  //     try {
  //       setLoading({ types: true, values: true });
  //       setError("");
        
  //       // Fetch mapping types
  //       const typesResponse = await fetch(
  //         `${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0`
  //       );
        
  //       if (!typesResponse.ok) {
  //         throw new Error(`Failed to fetch mapping types: ${typesResponse.status}`);
  //       }
        
  //       const typesData = await typesResponse.json();
  //       const formattedTypes = typesData?.data || typesData?.result || typesData || [];
  //       setMappingTypes(Array.isArray(formattedTypes) ? formattedTypes : []);
        
  //       // Fetch mapping values and answer data for this specific question
  //       const questionId = question.id || question.question_id;
  //       if (questionId && sessionData.url && sessionData.token) {
  //         // First try the specific question endpoint
  //         try {
  //           const mappingResponse = await fetch(
  //             `${sessionData.url}/lms/question_master/${questionId}/edit?type=API&sub_institute_id=${sessionData.sub_institute_id}&user_id=${sessionData.user_id || 1}&token=${sessionData.token}`
  //           );
            
  //           if (mappingResponse.ok) {
  //             const mappingData = await mappingResponse.json();
              
  //             // Process the question_mapping_data from the API response
  //             if (mappingData && mappingData.question_mapping_data) {
  //               const mappingEntries = Object.entries(mappingData.question_mapping_data);
  //               const formattedMappings = mappingEntries.map(([key, value]) => ({
  //                 mapping_type: value.TYPE_ID?.toString() || "",
  //                 mapping_value: value.VALUE_ID?.toString() || "",
  //                 reasons: value.REASONS || ""
  //               }));
                
  //               // Process the answer_data from the API response
  //               let formattedAnswers = [];
  //               if (mappingData.answer_data && Array.isArray(mappingData.answer_data)) {
  //                 formattedAnswers = mappingData.answer_data.map((answer) => ({
  //                   text: answer.answer || "",
  //                   feedback: answer.feedback || "",
  //                   is_correct: answer.correct_answer === 1 || answer.correct_answer === true,
  //                 }));
  //               }
                
  //               // Update the form with the fetched mappings and answers
  //               setEditForm(prev => ({
  //                 ...prev,
  //                 mappings: formattedMappings.length > 0 ? formattedMappings : prev.mappings,
  //                 answers: formattedAnswers.length > 0 ? formattedAnswers : prev.answers
  //               }));
  //             }
  //           } else if (mappingResponse.status === 404) {
  //             console.warn("Edit endpoint not found, using question data directly");
  //             // If the edit endpoint doesn't exist, use the question data we already have
  //             if (question.mappings && Array.isArray(question.mappings)) {
  //               setEditForm(prev => ({
  //                 ...prev,
  //                 mappings: question.mappings
  //               }));
  //             }
  //             if (question.answers && Array.isArray(question.answers)) {
  //               setEditForm(prev => ({
  //                 ...prev,
  //                 answers: question.answers
  //               }));
  //             }
  //           }
  //         } catch (err) {
  //           console.error("Error fetching question-specific data:", err);
  //           // Fallback to using the question data we already have
  //           if (question.mappings && Array.isArray(question.mappings)) {
  //             setEditForm(prev => ({
  //               ...prev,
  //               mappings: question.mappings
  //             }));
  //           }
  //           if (question.answers && Array.isArray(question.answers)) {
  //             setEditForm(prev => ({
  //               ...prev,
  //               answers: question.answers
  //             }));
  //           }
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error fetching mapping data:", err);
  //       setError(`Failed to load question data: ${err.message}`);
  //     } finally {
  //       setLoading({ types: false, values: false });
  //     }
  //   };
    
  //   if (sessionData.url) {
  //     fetchMappingData();
  //   }
  // }, [open, question, sessionData]);
  useEffect(() => {
    if (!open || !question) return;
    
    const fetchMappingData = async () => {
      try {
        setLoading({ types: true, values: true });
        setError("");
        
        // Fetch mapping types
        const typesResponse = await fetch(
          `${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0`
        );
        
        if (!typesResponse.ok) {
          throw new Error(`Failed to fetch mapping types: ${typesResponse.status}`);
        }
        
        const typesData = await typesResponse.json();
        const formattedTypes = typesData?.data || typesData?.result || typesData || [];
        setMappingTypes(Array.isArray(formattedTypes) ? formattedTypes : []);
        
        // Fetch mapping values and answer data for this specific question
        const questionId = question.id || question.question_id;
        if (questionId && sessionData.url && sessionData.token) {
          // First try the specific question endpoint
          try {
            const mappingResponse = await fetch(
              `${sessionData.url}/lms/question_master/${questionId}/edit?type=API&sub_institute_id=${sessionData.sub_institute_id}&user_id=${sessionData.user_id || 1}&token=${sessionData.token}`
            );
            
            if (mappingResponse.ok) {
              const mappingData = await mappingResponse.json();
              
              // Process the question_mapping_data from the API response
              if (mappingData && mappingData.question_mapping_data) {
                const mappingEntries = Object.entries(mappingData.question_mapping_data);
                const formattedMappings = mappingEntries.map(([key, value]) => ({
                  mapping_type: value.TYPE_ID?.toString() || "",
                  mapping_value: value.VALUE_ID?.toString() || "",
                  reasons: value.REASONS || ""
                }));
                
                // Process the answer_data from the API response
                let formattedAnswers = [];
                if (mappingData.answer_data && Array.isArray(mappingData.answer_data)) {
                  formattedAnswers = mappingData.answer_data.map((answer) => ({
                    text: answer.answer || "",
                    feedback: answer.feedback || "",
                    is_correct: answer.correct_answer === 1 || answer.correct_answer === true,
                  }));
                }
                
                // Ensure at least 4 answers
                while (formattedAnswers.length < 4) {
                  formattedAnswers.push({ text: "", feedback: "", is_correct: false });
                }
                
                // Update the form with the fetched mappings and answers
                setEditForm(prev => ({
                  ...prev,
                  mappings: formattedMappings.length > 0 ? formattedMappings : prev.mappings,
                  answers: formattedAnswers
                }));
              }
            } else if (mappingResponse.status === 404) {
              console.warn("Edit endpoint not found, using question data directly");
              // If the edit endpoint doesn't exist, use the question data we already have
              let answers = [];
              if (question.answers && Array.isArray(question.answers)) {
                answers = [...question.answers];
                // Ensure at least 4 answers
                while (answers.length < 4) {
                  answers.push({ text: "", feedback: "", is_correct: false });
                }
              } else {
                answers = [
                  { text: "", feedback: "", is_correct: false },
                  { text: "", feedback: "", is_correct: false },
                  { text: "", feedback: "", is_correct: false },
                  { text: "", feedback: "", is_correct: false }
                ];
              }
              
              setEditForm(prev => ({
                ...prev,
                mappings: question.mappings && Array.isArray(question.mappings) ? question.mappings : prev.mappings,
                answers: answers
              }));
            }
          } catch (err) {
            console.error("Error fetching question-specific data:", err);
            // Fallback to using the question data we already have
            let answers = [];
            if (question.answers && Array.isArray(question.answers)) {
              answers = [...question.answers];
              // Ensure at least 4 answers
              while (answers.length < 4) {
                answers.push({ text: "", feedback: "", is_correct: false });
              }
            } else {
              answers = [
                { text: "", feedback: "", is_correct: false },
                { text: "", feedback: "", is_correct: false },
                { text: "", feedback: "", is_correct: false },
                { text: "", feedback: "", is_correct: false }
              ];
            }
            
            setEditForm(prev => ({
              ...prev,
              mappings: question.mappings && Array.isArray(question.mappings) ? question.mappings : prev.mappings,
              answers: answers
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching mapping data:", err);
        setError(`Failed to load question data: ${err.message}`);
      } finally {
        setLoading({ types: false, values: false });
      }
    };
    
    if (sessionData.url) {
      fetchMappingData();
    }
  }, [open, question, sessionData]);


  // fetch all mapping values (for dropdown options)
  useEffect(() => {
    if (!open || !sessionData.url) return;
    
    setLoading(prev => ({...prev, values: true}));
    fetch(
      `${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch mapping values: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Mapping Values API Response:", data);
        const valuesData = data?.data || data?.result || data || [];
        // Filter out parent items (parent_id = 0) and keep only child items
        const childValues = Array.isArray(valuesData) 
          ? valuesData.filter(item => item.parent_id !== 0 && item.parent_id !== "0")
          : [];
        setMappingValues(childValues);
      })
      .catch((err) => {
        console.error("Error fetching mapping values:", err);
        setError(`Failed to load mapping values: ${err.message}`);
      })
      .finally(() => setLoading(prev => ({...prev, values: false})));
  }, [open, sessionData.url]);

  // Reset state every time modal opens or question updates
  useEffect(() => {
    if (open && question) {
      console.log("Question data received:", question);
      setError("");
      
      const {
        title,
        description,
        points,
        status,
        question_type_id,
        questionMark,
        multiple_answer,
        show,
        concept,
        subconcept,
        hint_text,
        syear,
        grade_id,
        standard_id,
        subject_id,
        chapter_id,
        topic_id,
        pre_grade_topic,
        post_grade_topic,
        cross_curriculum_grade_topic,
        learning_outcome,
      } = question;

 // Process answers to ensure at least 4
      let answers = [];
      if (question.answers && Array.isArray(question.answers)) {
        answers = [...question.answers];
        // Ensure at least 4 answers
        while (answers.length < 4) {
          answers.push({ text: "", feedback: "", is_correct: false });
        }
      } else {
        answers = [
          { text: "", feedback: "", is_correct: false },
          { text: "", feedback: "", is_correct: false },
          { text: "", feedback: "", is_correct: false },
          { text: "", feedback: "", is_correct: false }
        ];
      }

      // Only set the form if we haven't already set mappings and answers from the API
      setEditForm(prev => ({
        ...prev,
        question_title: title || "",
        description: description || "",
        points: points || 1,
        status: status !== undefined ? parseInt(status) : 1,
        questionType: question_type_id?.toString() || "1",
        questionMark: questionMark || 1,
        multiple_answer: multiple_answer !== undefined ? !!multiple_answer : false,
        show: show !== undefined ? show : true,
        concept: concept || "",
        subconcept: subconcept || "",
        hint_text: hint_text || "",
        syear: syear || new Date().getFullYear(),
        grade_id: grade_id || "",
        standard_id: standard_id || "",
        subject_id: subject_id || "",
        chapter_id: chapter_id || "",
        topic_id: topic_id || "",
        pre_grade_topic: pre_grade_topic || "",
        post_grade_topic: post_grade_topic || "",
        cross_curriculum_grade_topic: cross_curriculum_grade_topic || "",
        learning_outcome: learning_outcome || "",
        // Don't override mappings and answers if they were already set from the API
        mappings: prev.mappings[0]?.mapping_type ? prev.mappings : (
          question.mappings && Array.isArray(question.mappings) ? question.mappings : [
            { mapping_type: "", mapping_value: "", reasons: "" }
          ]
        ),
        // answers: prev.answers[0]?.text ? prev.answers : (
        //   question.answers && Array.isArray(question.answers) ? question.answers : [
        //     { text: "", feedback: "", is_correct: false }
        //   ]
        // )
         answers: answers
      }));
    }
  }, [question, open]);

  const handleChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  const handleMappingChange = (index, field, value) => {
    const updated = [...editForm.mappings];
    updated[index][field] = value;
    if (field === "mapping_type") {
      updated[index].mapping_value = ""; // reset value when type changes
    }
    setEditForm((prev) => ({ ...prev, mappings: updated }));
  };

  const addMapping = () =>
    setEditForm((prev) => ({
      ...prev,
      mappings: [
        ...prev.mappings,
        { mapping_type: "", mapping_value: "", reasons: "" },
      ],
    }));

  const removeMapping = (index) =>
    setEditForm((prev) => ({
      ...prev,
      mappings: prev.mappings.filter((_, i) => i !== index),
    }));

  // const addAnswer = () =>
  //   setEditForm((prev) => ({
  //     ...prev,
  //     answers: [
  //       ...prev.answers,
  //       { text: "", feedback: "", is_correct: false },
  //     ],
  //   }));

  // const removeAnswer = (index) =>
  //   setEditForm((prev) => ({
  //     ...prev,
  //     answers: prev.answers.filter((_, i) => i !== index),
  //   }));

const addAnswer = () =>
    setEditForm((prev) => ({
      ...prev,
      answers: [
        ...prev.answers,
        { text: "", feedback: "", is_correct: false },
      ],
    }));

  const removeAnswer = (index) => {
    // Only allow removal if we have more than 4 answers
    if (editForm.answers.length > 4) {
      setEditForm((prev) => ({
        ...prev,
        answers: prev.answers.filter((_, i) => i !== index),
      }));
    }
  };


  const handleSave = async () => {
  if (!sessionData.token) {
    setError("Authentication token is missing. Please refresh the page.");
    return;
  }
  
    // Validate at least 4 answers
    if (editForm.answers.length < 4) {
      setError("Please provide at least 4 answer options");
      return;
    }

    // Validate all feedback fields are filled
    const missingFeedback = editForm.answers.some(ans => !ans.feedback.trim());
    if (missingFeedback) {
      setError("Please provide feedback for all answer options");
      return;
    }

    // Validate at least one correct answer
    const hasCorrectAnswer = editForm.answers.some(ans => ans.is_correct);
    if (!hasCorrectAnswer) {
      setError("Please select at least one correct answer");
      return;
    }

   

  // Prepare the data for submission
  const questionId = question.id || question.question_id;

  // Create FormData for submission
  const formData = new FormData();

  formData.append("type", "API");
  formData.append("token", sessionData.token);
  formData.append("sub_institute_id", sessionData.sub_institute_id);
  formData.append("user_id", sessionData.user_id || 1);

  // Add question data
  formData.append("id", questionId);
  formData.append("question_title", editForm.question_title);
  formData.append("description", editForm.description);
  // formData.append("points", editForm.points);
  formData.append("points", editForm.questionMark || editForm.points || 0);
  formData.append("question_type_id", editForm.questionType);
  formData.append("questionMark", editForm.questionMark);
  formData.append("multiple_answer", editForm.multiple_answer ? 1 : 0);
  formData.append("status", editForm.status);
  formData.append("concept", editForm.concept);
  formData.append("subconcept", editForm.subconcept);
  formData.append("hint_text", editForm.hint_text);
  formData.append("learning_outcome", editForm.learning_outcome);

  // Add standard curriculum data if available
  if (editForm.standard_id) formData.append("standard_id", editForm.standard_id);
  if (editForm.subject_id) formData.append("subject_id", editForm.subject_id);
  if (editForm.chapter_id) formData.append("chapter_id", editForm.chapter_id);
  if (editForm.grade_id) formData.append("grade_id", editForm.grade_id);
  if (editForm.syear) formData.append("syear", editForm.syear);


  // Add mappings
  editForm.mappings.forEach((mapping, index) => {
    formData.append(`mapping_type[${index}]`, mapping.mapping_type);
    formData.append(`mapping_value[${index}]`, mapping.mapping_value);
    formData.append(`reasons[${index}]`, mapping.reasons);
  });

  // Add answers with proper truncation to prevent database errors
  editForm.answers.forEach((answer, index) => {
    const truncatedAnswer = answer.text.substring(0, 500);
    const truncatedFeedback = answer.feedback.substring(0, 255);

    formData.append(`options[NEW][${index}]`, truncatedAnswer);
    formData.append(`feedback[NEW][${index}]`, truncatedFeedback);
    formData.append(`correct_answer[${index}]`, answer.is_correct ? 1 : 0);
  });

  // Debug: print FormData values
  console.log("FormData entries:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const url = `${sessionData.url}/lms/question_master/${questionId}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-HTTP-Method-Override": "PUT", // only if API requires
      },
      body: formData, // direct FormData
    });

    const result = await res.json();
    console.log("Save response:", result);
    if (res.ok) {
      alert("✅ Question updated successfully!");
      onSave?.(result); // call parent handler if needed
      onOpenChange(false); // close modal after save
    } else {
      alert(`❌ Failed to update question: ${result.message || "Unknown error"}`);
    }
  } 
  catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    setSaving(false);
  }
};


  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 py-2">
          <div>
            <Label>Title{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> </Label>
            <TiptapEditor
              value={editForm.question_title}
              onChange={(content) => handleChange("question_title", content)}required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={editForm.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Points{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> </Label>
              <Input
                type="number"
                value={editForm.points}
                required
                onChange={(e) => handleChange("points", e.target.value)}
              />
            </div>
            
            <div>
              <Label>Question Mark
                {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </Label>
              <Input
                type="number"
                required
                value={editForm.questionMark}
                onChange={(e) => handleChange("questionMark", e.target.value)}
              />
            </div>
          </div>

          <div>
            {/* <Label>Mappings{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> </Label> */}
            {editForm.mappings.map((mapping, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2"
              >
                <div>
                  <Label>Mapping Type{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> </Label>
                  <Select
                    value={mapping.mapping_type}
                    required
                    onValueChange={(val) =>
                      handleMappingChange(index, "mapping_type", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading.types ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : mappingTypes.length > 0 ? (
                        mappingTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name || type.title || `Type ${type.id}`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>No types available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Mapping Value
                    {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
                  </Label>
                  <Select
                    value={mapping.mapping_value}
                    required
                    onValueChange={(val) =>
                      handleMappingChange(index, "mapping_value", val)
                    }
                    disabled={!mapping.mapping_type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Value" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading.values ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : mapping.mapping_type ? (
                        mappingValues
                          .filter((val) => val.parent_id?.toString() === mapping.mapping_type)
                          .map((val) => (
                            <SelectItem key={val.id} value={val.id.toString()}>
                              {val.name || val.title || `Value ${val.id}`}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="select-type-first" disabled>Select a type first</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Reason</Label>
                  <Input
                    value={mapping.reasons}
                    onChange={(e) =>
                      handleMappingChange(index, "reasons", e.target.value)
                    }
                  />
                </div>

                <div className="flex gap-2 items-end">
                  {index === editForm.mappings.length - 1 && (
                    <Button type="button" size="icon" onClick={addMapping} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f5f5f5" }}>
                      <Plus className="h-4 w-4 text-black" />
                    </Button>
                  )}
                  {editForm.mappings.length > 1 && (
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
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <Label>Learning Outcome</Label>
            <Textarea
              value={editForm.learning_outcome}
              onChange={(e) => handleChange("learning_outcome", e.target.value)}
              placeholder="Enter learning outcome"
            />
          </div>

          {/* All four fields in one line */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Question Type{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> </Label>
              <Select
                value={editForm.questionType}
                required
                onValueChange={(value) => handleChange("questionType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Multiple Choice</SelectItem>
                  {/* <SelectItem value="2">True/False</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Question Mark
                {" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </Label>
              <Input
                type="number"
                required
                value={editForm.questionMark}
                onChange={(e) => handleChange("questionMark", e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="multiple-answer"
                checked={editForm.multiple_answer}
                onCheckedChange={(checked) => handleChange("multiple_answer", checked)}
              />
              <Label htmlFor="multiple-answer">Multiple Answer</Label>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="status"
                checked={editForm.status === 1}
                onCheckedChange={(checked) => handleChange("status", checked ? 1 : 0)}
              />
              <Label htmlFor="status">Active Status</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Concept</Label>
              <Input
                value={editForm.concept}
                onChange={(e) => handleChange("concept", e.target.value)}
                placeholder="Enter concept"
              />
            </div>
            
            <div>
              <Label>Sub Concept</Label>
              <Input
                value={editForm.subconcept}
                onChange={(e) => handleChange("subconcept", e.target.value)}
                placeholder="Enter sub concept"
              />
            </div>
          </div>

          <div>
            <Label>Hint Text</Label>
            <Textarea
              value={editForm.hint_text}
              onChange={(e) => handleChange("hint_text", e.target.value)}
              placeholder="Enter hint text"
            />
          </div>

          <div>
            <Label>Answers</Label>
            {editForm.answers.map((ans, i) => (
              <div key={i} className="flex gap-3 items-center mb-2">
                <div className="flex-1">
                  <Input
                    placeholder="Option Text"
                    value={ans.text}
                    onChange={(e) => {
                      const newAnswers = [...editForm.answers];
                      newAnswers[i].text = e.target.value;
                      setEditForm((prev) => ({ ...prev, answers: newAnswers }));
                    }}
                  />
                  {ans.text.length > 400 && (
                    <p className="text-sm text-amber-600 mt-1">
                      {500 - ans.text.length} characters remaining
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="Feedback"
                    value={ans.feedback}
                    onChange={(e) => {
                      const newAnswers = [...editForm.answers];
                      newAnswers[i].feedback = e.target.value;
                      setEditForm((prev) => ({ ...prev, answers: newAnswers }));
                    }}
                    className="h-20"
                  />
                  <div className="flex justify-between mt-1">
                    {ans.feedback && ans.feedback.length > 250 && (
                      <p className="text-sm text-amber-600">
                        {ans.feedback.length}/255 characters
                      </p>
                    )}
                    {ans.feedback && ans.feedback.length > 255 && (
                      <p className="text-sm text-red-600 font-medium">
                        Exceeds database limit! Will be truncated.
                      </p>
                    )}
                  </div>
                </div>
                {editForm.multiple_answer ? (
                  <Checkbox
                    checked={ans.is_correct}
                    onCheckedChange={(checked) => {
                      const updated = [...editForm.answers];
                      updated[i].is_correct = !!checked;
                      setEditForm((prev) => ({ ...prev, answers: updated }));
                    }}
                  />
                ) : (
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={ans.is_correct}
                    onChange={() => {
                      const updated = editForm.answers.map((a, idx) => ({
                        ...a,
                        is_correct: idx === i,
                      }));
                      setEditForm((prev) => ({ ...prev, answers: updated }));
                    }}
                  />
                )}
                <div className="flex gap-2">
                  {i === editForm.answers.length - 1 && (
                    <Button type="button" size="icon" onClick={addAnswer} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f5f5f5" }}>
                      <Plus className="h-4 w-4 text-black" />
                    </Button>
                  )}
                  {editForm.answers.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeAnswer(i)}
                      className="h-10 p-3 rounded-lg bg-[#f5f5f5] hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-6">
            <Button id="update" onClick={handleSave} disabled={saving} className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
              {saving ? "Saving..." : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
