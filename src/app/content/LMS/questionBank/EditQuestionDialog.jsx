// "use client";

// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Plus, X } from "lucide-react";
// import TiptapEditor from "../../../content/LMS/questionBank/TiptapEditor";

// export function EditQuestionDialog({
//   open,
//   onOpenChange,
//   question,
//   onSave,
//   saving,
//   mapping_type = [],
//   mapping_value = [],
// }) {
//   const [editForm, setEditForm] = useState({
//     question_title: "",
//     description: "",
//     points: 1,
//     questionType: "1",
//     questionMark: 1,
//     multiple_answer: false,
//     show: true,
//     concept: "",
//     subconcept: "",
//     hint_text: "",
//     mappings: [{ mapping_type: "", mapping_value: "", reasons: "" }],
//     answers: [{ text: "", feedback: "", is_correct: false }],
//     syear: new Date().getFullYear(),
//     grade_id: "",
//     standard_id: "",
//     subject_id: "",
//     chapter_id: "",
//     topic_id: "",
//     pre_grade_topic: "",
//     post_grade_topic: "",
//     cross_curriculum_grade_topic: "",
//     learning_outcome: "",
//     status: 1,
//   });

//   // local state for mapping data from API
//   const [mappingTypes, setMappingTypes] = useState([]);
//   const [mappingValues, setMappingValues] = useState([]);
//   const [loading, setLoading] = useState({
//     types: false,
//     values: false
//   });

//   // fetch mapping types
//   useEffect(() => {
//     if (!open) return;
    
//     setLoading(prev => ({...prev, types: true}));
//     fetch(
//       "http://127.0.0.1:8000/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0"
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Mapping Types API Response:", data);
//         // Try different possible response structures
//         const typesData = data?.data || data?.result || data || [];
//         setMappingTypes(Array.isArray(typesData) ? typesData : []);
//       })
//       .catch((err) => console.error("Error fetching mapping types:", err))
//       .finally(() => setLoading(prev => ({...prev, types: false})));
//   }, [open]);

//   // fetch mapping values
//   useEffect(() => {
//     if (!open) return;
    
//     setLoading(prev => ({...prev, values: true}));
//     fetch(
//       "http://127.0.0.1:8000/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1"
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Mapping Values API Response:", data);
//         // Try different possible response structures
//         const valuesData = data?.data || data?.result || data || [];
//         // Filter out parent items (parent_id = 0) and keep only child items
//         const childValues = Array.isArray(valuesData) 
//           ? valuesData.filter(item => item.parent_id !== 0 && item.parent_id !== "0")
//           : [];
//         setMappingValues(childValues);
//       })
//       .catch((err) => console.error("Error fetching mapping values:", err))
//       .finally(() => setLoading(prev => ({...prev, values: false})));
//   }, [open]);

//   // Reset state every time modal opens or question updates
//   useEffect(() => {
//     if (open && question) {
//       console.log("Question data received:", question);
      
//       const {
//         title,
//         description,
//         points,
//         status,
//         questionType,
//         questionMark,
//         multiple_answer,
//         show,
//         concept,
//         subconcept,
//         hint_text,
//         mappings,
//         answers,
//         syear,
//         grade_id,
//         standard_id,
//         subject_id,
//         chapter_id,
//         topic_id,
//         pre_grade_topic,
//         post_grade_topic,
//         cross_curriculum_grade_topic,
//         learning_outcome,
//       } = question;

//       // Handle answers data - check for different possible structures
//       let formattedAnswers = [{ text: "", feedback: "", is_correct: false }];
      
//       if (answers && Array.isArray(answers) && answers.length > 0) {
//         formattedAnswers = answers.map((a) => ({
//           text: a.text || a.option_text || a.answer || "",
//           feedback: a.feedback || a.feedback_text || "",
//           is_correct: a.is_correct !== undefined ? !!a.is_correct : false,
//         }));
//       } else if (question.options) {
//         // If answers are in options format
//         const options = question.options.NEW || question.options || [];
//         formattedAnswers = options.map((opt, index) => ({
//           text: opt || "",
//           feedback: "",
//           is_correct: index === 0, // Default first option as correct if we can't determine
//         }));
//       }

//       setEditForm({
//         question_title: title || "",
//         description: description || "",
//         points: points || 1,
//         status: status !== undefined ? parseInt(status) : 1,
//         questionType: questionType?.toString() || "1",
//         questionMark: questionMark || 1,
//         multiple_answer: multiple_answer !== undefined ? !!multiple_answer : false,
//         show: show !== undefined ? show : true,
//         concept: concept || "",
//         subconcept: subconcept || "",
//         hint_text: hint_text || "",
//         mappings:
//           Array.isArray(mappings) && mappings.length
//             ? mappings.map((m) => ({
//                 mapping_type: m.mapping_type?.toString() || "",
//                 mapping_value: m.mapping_value?.toString() || "",
//                 reasons: m.reasons || "",
//               }))
//             : [{ mapping_type: "", mapping_value: "", reasons: "" }],
//         answers: formattedAnswers,
//         syear: syear || new Date().getFullYear(),
//         grade_id: grade_id || "",
//         standard_id: standard_id || "",
//         subject_id: subject_id || "",
//         chapter_id: chapter_id || "",
//         topic_id: topic_id || "",
//         pre_grade_topic: pre_grade_topic || "",
//         post_grade_topic: post_grade_topic || "",
//         cross_curriculum_grade_topic: cross_curriculum_grade_topic || "",
//         learning_outcome: learning_outcome || "",
//       });
//     }
//   }, [question, open]);

//   const handleChange = (field, value) => {
//     setEditForm((prev) => ({ ...prev, [field]: value }));
//   }

//   const handleMappingChange = (index, field, value) => {
//     const updated = [...editForm.mappings];
//     updated[index][field] = value;
//     if (field === "mapping_type") {
//       updated[index].mapping_value = ""; // reset value when type changes
//     }
//     setEditForm((prev) => ({ ...prev, mappings: updated }));
//   };

//   const addMapping = () =>
//     setEditForm((prev) => ({
//       ...prev,
//       mappings: [
//         ...prev.mappings,
//         { mapping_type: "", mapping_value: "", reasons: "" },
//       ],
//     }));

//   const removeMapping = (index) =>
//     setEditForm((prev) => ({
//       ...prev,
//       mappings: prev.mappings.filter((_, i) => i !== index),
//     }));

//   const addAnswer = () =>
//     setEditForm((prev) => ({
//       ...prev,
//       answers: [
//         ...prev.answers,
//         { text: "", feedback: "", is_correct: false },
//       ],
//     }));

//   const removeAnswer = (index) =>
//     setEditForm((prev) => ({
//       ...prev,
//       answers: prev.answers.filter((_, i) => i !== index),
//     }));

//   const handleSave = () => {
//     const formattedData = {
//       ...editForm,
//       mapping_type: editForm.mappings.map((m) => m.mapping_type),
//       mapping_value: editForm.mappings.map((m) => m.mapping_value),
//       reasons: editForm.mappings.map((m) => m.reasons),
//       options: {
//         NEW: editForm.answers.map((a) => a.text),
//       },
//     };

//     onSave(formattedData);
//   };

//   if (!question) return null;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[1200px] max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Edit Question</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4 py-2">
//           <div>
//             <Label>Title *</Label>
//             <TiptapEditor
//               value={editForm.question_title}
//               onChange={(content) => handleChange("question_title", content)}
//             />
//           </div>

//           <div>
//             <Label>Description</Label>
//             <Textarea
//               value={editForm.description}
//               onChange={(e) => handleChange("description", e.target.value)}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label>Points *</Label>
//               <Input
//                 type="number"
//                 value={editForm.points}
//                 onChange={(e) => handleChange("points", e.target.value)}
//               />
//             </div>
            
//             <div>
//               <Label>Question Mark</Label>
//               <Input
//                 type="number"
//                 value={editForm.questionMark}
//                 onChange={(e) => handleChange("questionMark", e.target.value)}
//               />
//             </div>
//           </div>

//           <div>
//             <Label>Mappings</Label>
//             {editForm.mappings.map((mapping, index) => (
//               <div
//                 key={index}
//                 className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2"
//               >
//                 <div>
//                   <Label>Type</Label>
//                   <Select
//                     value={mapping.mapping_type}
//                     onValueChange={(val) =>
//                       handleMappingChange(index, "mapping_type", val)
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {loading.types ? (
//                         <SelectItem value="loading" disabled>Loading...</SelectItem>
//                       ) : mappingTypes.length > 0 ? (
//                         mappingTypes.map((type) => (
//                           <SelectItem key={type.id} value={type.id.toString()}>
//                             {type.name || type.title || `Type ${type.id}`}
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <SelectItem value="no-data" disabled>No types available</SelectItem>
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label>Value</Label>
//                   <Select
//                     value={mapping.mapping_value}
//                     onValueChange={(val) =>
//                       handleMappingChange(index, "mapping_value", val)
//                     }
//                     disabled={!mapping.mapping_type}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Value" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {loading.values ? (
//                         <SelectItem value="loading" disabled>Loading...</SelectItem>
//                       ) : mapping.mapping_type ? (
//                         mappingValues
//                           .filter((val) => val.parent_id?.toString() === mapping.mapping_type)
//                           .map((val) => (
//                             <SelectItem key={val.id} value={val.id.toString()}>
//                               {val.name || val.title || `Value ${val.id}`}
//                             </SelectItem>
//                           ))
//                       ) : (
//                         <SelectItem value="select-type-first" disabled>Select a type first</SelectItem>
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label>Reason</Label>
//                   <Input
//                     value={mapping.reasons}
//                     onChange={(e) =>
//                       handleMappingChange(index, "reasons", e.target.value)
//                     }
//                   />
//                 </div>

//                 <div className="flex gap-2 items-end">
//                   {index === editForm.mappings.length - 1 && (
//                     <Button type="button" size="icon" onClick={addMapping}>
//                       <Plus className="h-4 w-4" />
//                     </Button>
//                   )}
//                   {editForm.mappings.length > 1 && (
//                     <Button
//                       type="button"
//                       size="icon"
//                       variant="destructive"
//                       onClick={() => removeMapping(index)}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           <div>
//             <Label>Learning Outcome</Label>
//             <Textarea
//               value={editForm.learning_outcome}
//               onChange={(e) => handleChange("learning_outcome", e.target.value)}
//               placeholder="Enter learning outcome"
//             />
//           </div>

//           {/* All four fields in one line */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <Label>Question Type</Label>
//               <Select
//                 value={editForm.questionType}
//                 onValueChange={(value) => handleChange("questionType", value)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="1">Multiple Choice</SelectItem>
//                   {/* <SelectItem value="2">True/False</SelectItem> */}
                 
//                 </SelectContent>
//               </Select>
//             </div>
            
//             <div>
//               <Label>Question Mark</Label>
//               <Input
//                 type="number"
//                 value={editForm.questionMark}
//                 onChange={(e) => handleChange("questionMark", e.target.value)}
//               />
//             </div>
            
//             <div className="flex items-center space-x-2 pt-6">
//               <Checkbox
//                 id="multiple-answer"
//                 checked={editForm.multiple_answer}
//                 onCheckedChange={(checked) => handleChange("multiple_answer", checked)}
//               />
//               <Label htmlFor="multiple-answer">Multiple Answer</Label>
//             </div>
            
//             <div className="flex items-center space-x-2 pt-6">
//               <Checkbox
//                 id="status"
//                 checked={editForm.status === 1}
//                 onCheckedChange={(checked) => handleChange("status", checked ? 1 : 0)}
//               />
//               <Label htmlFor="status">Active Status</Label>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label>Concept</Label>
//               <Input
//                 value={editForm.concept}
//                 onChange={(e) => handleChange("concept", e.target.value)}
//                 placeholder="Enter concept"
//               />
//             </div>
            
//             <div>
//               <Label>Sub Concept</Label>
//               <Input
//                 value={editForm.subconcept}
//                 onChange={(e) => handleChange("subconcept", e.target.value)}
//                 placeholder="Enter sub concept"
//               />
//             </div>
//           </div>

//           <div>
//             <Label>Hint Text</Label>
//             <Textarea
//               value={editForm.hint_text}
//               onChange={(e) => handleChange("hint_text", e.target.value)}
//               placeholder="Enter hint text"
//             />
//           </div>

//           <div>
//             <Label>Answers</Label>
//             {editForm.answers.map((ans, i) => (
//               <div key={i} className="flex gap-3 items-center mb-2">
//                 <Input
//                   placeholder="Option Text"
//                   value={ans.text}
//                   onChange={(e) => {
//                     const newAnswers = [...editForm.answers];
//                     newAnswers[i].text = e.target.value;
//                     setEditForm((prev) => ({ ...prev, answers: newAnswers }));
//                   }}
//                 />
//                 <Input
//                   placeholder="Feedback"
//                   value={ans.feedback}
//                   onChange={(e) => {
//                     const newAnswers = [...editForm.answers];
//                     newAnswers[i].feedback = e.target.value;
//                     setEditForm((prev) => ({ ...prev, answers: newAnswers }));
//                   }}
//                 />
//                 {editForm.multiple_answer ? (
//                   <Checkbox
//                     checked={ans.is_correct}
//                     onCheckedChange={(checked) => {
//                       const updated = [...editForm.answers];
//                       updated[i].is_correct = !!checked;
//                       setEditForm((prev) => ({ ...prev, answers: updated }));
//                     }}
//                   />
//                 ) : (
//                   <input
//                     type="radio"
//                     name="correctAnswer"
//                     checked={ans.is_correct}
//                     onChange={() => {
//                       const updated = editForm.answers.map((a, idx) => ({
//                         ...a,
//                         is_correct: idx === i,
//                       }));
//                       setEditForm((prev) => ({ ...prev, answers: updated }));
//                     }}
//                   />
//                 )}
//                 <div className="flex gap-2">
//                   {i === editForm.answers.length - 1 && (
//                     <Button type="button" size="icon" onClick={addAnswer}>
//                       <Plus className="h-4 w-4" />
//                     </Button>
//                   )}
//                   {editForm.answers.length > 1 && (
//                     <Button
//                       type="button"
//                       size="icon"
//                       variant="destructive"
//                       onClick={() => removeAnswer(i)}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-center pt-6">
//             <Button onClick={handleSave} disabled={saving}>
//               {saving ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
    answers: [{ text: "", feedback: "", is_correct: false }],
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
  const [mappingTypes, setMappingTypes] = useState([]);
  const [mappingValues, setMappingValues] = useState([]);
  const [loading, setLoading] = useState({
    types: false,
    values: false
  });

  // fetch mapping data from the new API endpoint
  useEffect(() => {
    if (!open || !question) return;
    
    const fetchMappingData = async () => {
      try {
        setLoading({ types: true, values: true });
        
        // Fetch mapping types
        const typesResponse = await fetch(
          "http://127.0.0.1:8000/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0"
        );
        const typesData = await typesResponse.json();
        const formattedTypes = typesData?.data || typesData?.result || typesData || [];
        setMappingTypes(Array.isArray(formattedTypes) ? formattedTypes : []);
        
        // Fetch mapping values and answer data for this specific question
        const questionId = question.id || question.question_id;
        if (questionId) {
          const mappingResponse = await fetch(
            `http://127.0.0.1:8000/lms/question_master/${questionId}/edit?type=API&sub_institute_id=1&user_id=1`
          );
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
            
            // Update the form with the fetched mappings and answers
            setEditForm(prev => ({
              ...prev,
              mappings: formattedMappings.length > 0 ? formattedMappings : prev.mappings,
              answers: formattedAnswers.length > 0 ? formattedAnswers : prev.answers
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching mapping data:", err);
      } finally {
        setLoading({ types: false, values: false });
      }
    };
    
    fetchMappingData();
  }, [open, question]);

  // fetch all mapping values (for dropdown options)
  useEffect(() => {
    if (!open) return;
    
    setLoading(prev => ({...prev, values: true}));
    fetch(
      "http://127.0.0.1:8000/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Mapping Values API Response:", data);
        const valuesData = data?.data || data?.result || data || [];
        // Filter out parent items (parent_id = 0) and keep only child items
        const childValues = Array.isArray(valuesData) 
          ? valuesData.filter(item => item.parent_id !== 0 && item.parent_id !== "0")
          : [];
        setMappingValues(childValues);
      })
      .catch((err) => console.error("Error fetching mapping values:", err))
      .finally(() => setLoading(prev => ({...prev, values: false})));
  }, [open]);

  // Reset state every time modal opens or question updates
  useEffect(() => {
    if (open && question) {
      console.log("Question data received:", question);
      
      const {
        title,
        description,
        points,
        status,
        questionType,
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

      // Only set the form if we haven't already set mappings and answers from the API
      setEditForm(prev => ({
        ...prev,
        question_title: title || "",
        description: description || "",
        points: points || 1,
        status: status !== undefined ? parseInt(status) : 1,
        questionType: questionType?.toString() || "1",
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
        mappings: prev.mappings[0]?.mapping_type ? prev.mappings : [
          { mapping_type: "", mapping_value: "", reasons: "" }
        ],
        answers: prev.answers[0]?.text ? prev.answers : [
          { text: "", feedback: "", is_correct: false }
        ]
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

  const addAnswer = () =>
    setEditForm((prev) => ({
      ...prev,
      answers: [
        ...prev.answers,
        { text: "", feedback: "", is_correct: false },
      ],
    }));

  const removeAnswer = (index) =>
    setEditForm((prev) => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index),
    }));

  const handleSave = () => {
    const formattedData = {
      ...editForm,
      mapping_type: editForm.mappings.map((m) => m.mapping_type),
      mapping_value: editForm.mappings.map((m) => m.mapping_value),
      reasons: editForm.mappings.map((m) => m.reasons),
      options: {
        NEW: editForm.answers.map((a) => a.text),
      },
    };

    onSave(formattedData);
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Title *</Label>
            <TiptapEditor
              value={editForm.question_title}
              onChange={(content) => handleChange("question_title", content)}
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
              <Label>Points *</Label>
              <Input
                type="number"
                value={editForm.points}
                onChange={(e) => handleChange("points", e.target.value)}
              />
            </div>
            
            <div>
              <Label>Question Mark</Label>
              <Input
                type="number"
                value={editForm.questionMark}
                onChange={(e) => handleChange("questionMark", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Mappings</Label>
            {editForm.mappings.map((mapping, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2"
              >
                <div>
                  <Label>Type</Label>
                  <Select
                    value={mapping.mapping_type}
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
                  <Label>Value</Label>
                  <Select
                    value={mapping.mapping_value}
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
                    <Button type="button" size="icon" onClick={addMapping}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {editForm.mappings.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeMapping(index)}
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
              <Label>Question Type</Label>
              <Select
                value={editForm.questionType}
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
              <Label>Question Mark</Label>
              <Input
                type="number"
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
                <Input
                  placeholder="Option Text"
                  value={ans.text}
                  onChange={(e) => {
                    const newAnswers = [...editForm.answers];
                    newAnswers[i].text = e.target.value;
                    setEditForm((prev) => ({ ...prev, answers: newAnswers }));
                  }}
                />
                <Input
                  placeholder="Feedback"
                  value={ans.feedback}
                  onChange={(e) => {
                    const newAnswers = [...editForm.answers];
                    newAnswers[i].feedback = e.target.value;
                    setEditForm((prev) => ({ ...prev, answers: newAnswers }));
                  }}
                />
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
                    <Button type="button" size="icon" onClick={addAnswer}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {editForm.answers.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeAnswer(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}