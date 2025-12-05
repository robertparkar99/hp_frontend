"use client"
import { useState, useEffect } from "react"
import { Plus, X, CheckCircle, RefreshCw } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import TiptapEditor from "../../../content/LMS/questionBank/TiptapEditor";

export function AddQuestionDialog({ 
    onQuestionAdded, 
    editingQuestion = null, 
    onSave, 
    courseDisplayName,
    chapter_id,
    standard_id,
    subject_id
})
 {
    const [open, setOpen] = useState(false)
    const [mappingTypes, setMappingTypes] = useState([])
    const [mappingValues, setMappingValues] = useState({})
    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [message, setMessage] = useState({ text: "", type: "" })
    const [sessionData, setSessionData] = useState({
        url: "",
        token: "",
        subInstituteId: "",
        userId: "",
        user_profile_name: "",
    })
    const [success, setSuccess] = useState(false)
    const [promptString, setPromptString] = useState(`generate 1 question on ${courseDisplayName || "this course"}`)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        mappings: [{ mappingType: "", mappingValue: "", reason: "" }],
        learningOutcome: "",
        searchSection: "",
        searchStandard: "",
        subject_id: "",
        searchByChapter: "",
        questionType: "1",
        questionMark: 1,
        multipleAnswers: true,
        show: true,
        concept: "",
        subconcept: "",
        hint_text: "",
        // answers: [{ text: "", feedback: "", is_correct: false }],
        answers: [
            { text: "", feedback: "", is_correct: false },
            { text: "", feedback: "", is_correct: false },
            { text: "", feedback: "", is_correct: false },
            { text: "", feedback: "", is_correct: false }
        ],
    })

    // Character limits based on your database schema
    const CHAR_LIMITS = {
        answer: 500,      // Based on the error you're seeing
        feedback: 255,    // Common limit for text fields
        reason: 500,      // Reasonable default
        hint: 500,        // Reasonable default
    };

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const { APP_URL, token, sub_institute_id, user_id, user_profile_name } = JSON.parse(userData);
            setSessionData({
                url: APP_URL,
                token,
                subInstituteId: sub_institute_id,
                userId: user_id,
                user_profile_name: user_profile_name
            });
        }
    }, []);

    useEffect(() => {
        if (editingQuestion) {
            setFormData({
                id: editingQuestion.id,
                title: editingQuestion.title || "",
                description: editingQuestion.description || "",
                mappings: editingQuestion.mappings || [{ mappingType: "", mappingValue: "", reason: "" }],
                learningOutcome: editingQuestion.learning_outcome || "",
                searchSection: editingQuestion.searchSection || "",
                searchStandard: editingQuestion.standard_id || "",
                subject: editingQuestion.subject_id || "",
                searchByChapter: editingQuestion.chapter_id || "",
                questionType: editingQuestion.question_type_id || "",
                questionMark: editingQuestion.points || 1,
                multipleAnswers: editingQuestion.multiple_answer || false,
                show: editingQuestion.status === 1,
                concept: editingQuestion.concept || "",
                subconcept: editingQuestion.subconcept || "",
                hint_text: editingQuestion.hint_text || "",
                answers: editingQuestion.answers || [{ text: "", feedback: "", is_correct: false }],
            });
        }
    }, [editingQuestion]);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setOpen(false);
                setSuccess(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        const fetchMappingTypes = async () => {
            try {
                const response = await fetch(`${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0`)
                const data = await response.json()
                if (Array.isArray(data)) {
                    setMappingTypes(data)

                    const values = {};
                    for (const type of data) {
                        const valuesResponse = await fetch(`${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=${type.id}`)
                        const valuesData = await valuesResponse.json()
                        if (Array.isArray(valuesData)) {
                            values[type.id] = valuesData;
                        }
                    }
                    setMappingValues(values);
                }
            } catch (error) {
                console.error('Error fetching mapping types:', error)
            }
        }
        if (sessionData.url) {
            fetchMappingTypes();
        }
    }, [sessionData.url])

    useEffect(() => {
        if (open) {
            questionFormAI(promptString);
        }
    }, [open]);

    const fetchMappingValues = async (mappingTypeId) => {
        try {
            const response = await fetch(`${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=${mappingTypeId}`)
            const data = await response.json()
            if (Array.isArray(data)) {
                setMappingValues(prev => ({
                    ...prev,
                    [mappingTypeId]: data
                }))
            }
        } catch (error) {
            console.error('Error fetching mapping values:', error)
        }
    }

    const getMappingValueName = (mappingTypeId, mappingValueId) => {
        if (!mappingTypeId || !mappingValueId || !mappingValues[mappingTypeId]) return "";

        const foundValue = mappingValues[mappingTypeId].find(
            val => val.id.toString() === mappingValueId
        );
        return foundValue ? foundValue.name : "";
    };

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleMappingChange = async (index, name, value) => {
        const newMappings = [...formData.mappings]
        newMappings[index] = { ...newMappings[index], [name]: value }
        if (name === "mappingType" && value) {
            if (!mappingValues[value]) {
                await fetchMappingValues(value)
            }
            newMappings[index].mappingValue = ""
        }
        setFormData((prev) => ({ ...prev, mappings: newMappings }))
    }

    const addMapping = () => setFormData((prev) => ({ ...prev, mappings: [...prev.mappings, { mappingType: "", mappingValue: "", reason: "" }] }))
    const removeMapping = (index) => {
        if (formData.mappings.length > 1) {
            setFormData((prev) => ({ ...prev, mappings: prev.mappings.filter((_, i) => i !== index) }))
        }
    }

    const removeAnswer = (index) => {
        if (formData.answers.length > 4) {
            setFormData((prev) => ({ ...prev, answers: prev.answers.filter((_, i) => i !== index) }))
        }
    }

    const addAnswer = () => {
        setFormData((prev) => ({
            ...prev,
            answers: [...prev.answers, { text: "", feedback: "", is_correct: false }],
        }))
    }
    // const addAnswer = () => {
    //   Only allow adding if we have less than 4 answers
    //   if (formData.answers.length < 4) {
    //     setFormData((prev) => ({
    //       ...prev,
    //       answers: [...prev.answers, { text: "", feedback: "", is_correct: false }],
    //     }))
    //   }


    // Truncate text to specified character limit
    const truncateText = (text, limit) => {
        return text.length > limit ? text.substring(0, limit) : text;
    };

    const questionFormAI = async (prompt) => {
        setAiLoading(true);
        try {
            const aiPrompt = `Generate a question with the following format in JSON. Keep answers under ${CHAR_LIMITS.answer} characters and feedback under ${CHAR_LIMITS.feedback} characters:
            {
                "questions": [
                    {
                        "question_title": "Question title here",
                        "description": "Question description here",
                        "mapping_type": "Depth of Knowledge",
                        "mapping_value": "Medium",
                        "reason": "Explanation of why this mapping value was selected"
                    }
                ],
                "answers": [
                    {
                        "answer": "First answer option",
                        "correct_answer": true,
                        "feedback": "Feedback for this answer"
                    },
                        {
                        "answer": "First answer option",
                        "correct_answer": false,
                        "feedback": "Feedback for this answer"
                    },
                    {
                        "answer": "First answer option",
                        "correct_answer": false,
                        "feedback": "Feedback for this answer"
                    },
                    {
                        "answer": "First answer option",
                        "correct_answer": false,
                        "feedback": "Feedback for this answer"
                    }
                ]
            }`;

            const response = await fetch('https://hp.triz.co.in/gemini_chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt + aiPrompt,
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const responseText = await response.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Error parsing JSON response:', parseError);
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        data = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        throw new Error('Invalid JSON format in response');
                    }
                } else {
                    throw new Error('No JSON found in response');
                }
            }

            if (data && data.questions && data.questions.length > 0) {
                const generatedQuestion = data.questions[0];

                const dokMappingType = mappingTypes.find(type =>
                    type.name?.toLowerCase().includes('depth of knowledge') ||
                    type.name?.toLowerCase().includes('dok')
                );

                let mappingValueId = "";
                if (generatedQuestion.mapping_value && dokMappingType && mappingValues[dokMappingType.id]) {
                    const generatedValue = generatedQuestion.mapping_value.toLowerCase();

                    const foundValue = mappingValues[dokMappingType.id].find(value => {
                        if (!value.name) return false;
                        const valueName = value.name.toLowerCase();
                        if (valueName === generatedValue) return true;
                        if (valueName.includes(generatedValue) || generatedValue.includes(valueName)) return true;

                        const difficultyMap = {
                            'easy': ['easy', 'simple', 'basic', 'level 1', '1'],
                            'medium': ['medium', 'moderate', 'intermediate', 'level 2', '2'],
                            'hard': ['hard', 'difficult', 'advanced', 'complex', 'level 3', '3'],
                            'expert': ['expert', 'master', 'professional', 'level 4', '4']
                        };

                        for (const [level, keywords] of Object.entries(difficultyMap)) {
                            if (keywords.some(keyword => generatedValue.includes(keyword))) {
                                return valueName.includes(level);
                            }
                        }

                        return false;
                    });

                    mappingValueId = foundValue ? foundValue.id.toString() : "";

                    if (!mappingValueId && mappingValues[dokMappingType.id].length > 0) {
                        mappingValueId = mappingValues[dokMappingType.id][0].id.toString();
                    }
                }

                // Apply character limits to AI-generated content
                const limitedAnswers = data.answers ? data.answers.map((answer, index) => ({
                    text: truncateText(answer.answer || `Option ${index + 1}`, CHAR_LIMITS.answer),
                    feedback: truncateText(answer.feedback || "", CHAR_LIMITS.feedback),
                    is_correct: answer.correct_answer === true
                })) : [
                    { text: "Option 1", feedback: "", is_correct: true },
                    { text: "Option 2", feedback: "", is_correct: false },
                    { text: "Option 3", feedback: "", is_correct: false },
                    { text: "Option 4", feedback: "", is_correct: false }
                ];

                setFormData(prev => ({
                    ...prev,
                    title: generatedQuestion.question_title || "",
                    description: generatedQuestion.description || "",
                    mappings: [{
                        mappingType: dokMappingType ? dokMappingType.id.toString() : "",
                        mappingValue: mappingValueId,
                        reason: truncateText(generatedQuestion.reason || "", CHAR_LIMITS.reason)
                    }],
                    answers: limitedAnswers
                }));

                setMessage({ text: 'Question generated successfully!', type: 'success' });
            }
        } catch (error) {
            console.error('Error generating question:', error);
            setMessage({ text: `Error generating question: ${error.message}`, type: 'error' });
        } finally {
            setAiLoading(false);
        }
    }

    const handleRefreshQuestion = () => {
        questionFormAI(promptString);
    }

    // const onSubmit = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     setMessage({ text: "", type: "" });

    //     try {
    //         // Create payload with truncated values to prevent data too long errors
    //         const payload = {
    //             type: "API",
    //             sub_institute_id: sessionData.subInstituteId,
    //             user_id: sessionData.userId,
    //             token: sessionData.token,
    //             grade_id: 1,
    //             question_title: truncateText(formData.title, CHAR_LIMITS.answer),
    //             description: truncateText(formData.description, 1000), // Assuming description has a higher limit
    //             learning_outcome: truncateText(formData.learningOutcome, CHAR_LIMITS.answer),
    //             standard_id: formData.searchStandard || 1,
    //             chapter_id: formData.searchByChapter || 1,
    //             subject_id: formData.subject || 1,
    //             question_type_id: formData.questionType,
    //             points: formData.questionMark,
    //             multiple_answer: formData.multipleAnswers ? 1 : 0,
    //             status: formData.show ? 1 : 0,
    //             concept: truncateText(formData.concept || "", CHAR_LIMITS.answer),
    //             subconcept: truncateText(formData.subconcept || "", CHAR_LIMITS.answer),
    //             hint_text: truncateText(formData.hint_text || "", CHAR_LIMITS.hint),
    //         };

    //         // Add mappings with truncated reasons
    //         if (formData.mappings?.length) {
    //             formData.mappings.forEach((map, i) => {
    //                 payload[`mapping_type[${i}]`] = map.mappingType || "";
    //                 payload[`mapping_value[${i}]`] = map.mappingValue || "";
    //                 payload[`reasons[${i}]`] = truncateText(map.reason || "", CHAR_LIMITS.reason);
    //             });
    //         }

    //         // Add answers with truncated text and feedback
    //         if (formData.answers?.length) {
    //             formData.answers.forEach((ans, i) => {
    //                 const truncatedAnswer = truncateText(ans.text, CHAR_LIMITS.answer);
    //                 const truncatedFeedback = truncateText(ans.feedback, CHAR_LIMITS.feedback);

    //                 payload[`options[NEW][${i}]`] = truncatedAnswer || "";
    //                 payload[`feedback[NEW][${i}]`] = truncatedFeedback || "";
    //                 payload[`correct_answer[${i}]`] = ans.is_correct ? 1 : 0;
    //             });
    //         }

    //         if (formData.id) {
    //             payload.id = formData.id;
    //         }

    //         const formDataPayload = new FormData();
    //         Object.entries(payload).forEach(([key, value]) => {
    //             formDataPayload.append(key, value);
    //         });

    //         let url = `${sessionData.url}/lms/question_master`;
    //         let method = 'POST';

    //         if (formData.id) {
    //             url = `${sessionData.url}/lms/question_master/${formData.id}`;
    //             method = 'PUT';
    //         }

    //         const response = await fetch(url, {
    //             method: method,
    //             headers: {
    //                 'Authorization': `Bearer ${sessionData.token}`,
    //             },
    //             body: formDataPayload,
    //         });

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         onSave();

    //         const result = await response.json();
    //         handleSuccess(result);

    //     } catch (error) {
    //         console.error('Error saving question:', error);
    //         setMessage({ text: `Error saving question: ${error.message}`, type: 'error' });
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        // Validate at least 4 answers
        if (formData.answers.length < 4) {
            setMessage({ text: "Please provide at least 4 answer options", type: 'error' });
            return;
        }

        // Validate all feedback fields are filled
        const missingFeedback = formData.answers.some(ans => !ans.feedback.trim());
        if (missingFeedback) {
            setMessage({ text: "Please provide feedback for all answer options", type: 'error' });
            return;
        }

        // Validate at least one correct answer
        const hasCorrectAnswer = formData.answers.some(ans => ans.is_correct);
        if (!hasCorrectAnswer) {
            setMessage({ text: "Please select at least one correct answer", type: 'error' });
            return;
        }

        setLoading(true);

        try {
            // Create payload with truncated values to prevent data too long errors
          const payload = {
    type: "API",
    sub_institute_id: sessionData.subInstituteId,
    user_id: sessionData.userId,
    token: sessionData.token,
    grade_id: 1,

    question_title: truncateText(formData.title, CHAR_LIMITS.answer),
    description: truncateText(formData.description, 1000),
    learning_outcome: truncateText(formData.learningOutcome, CHAR_LIMITS.answer),

    // ★ FIXED HERE ★
    standard_id: standard_id,
    chapter_id: chapter_id,
    subject_id: subject_id,

    question_type_id: formData.questionType,
    points: formData.questionMark,
    multiple_answer: formData.multipleAnswers ? 1 : 0,
    status: formData.show ? 1 : 0,
    concept: truncateText(formData.concept || "", CHAR_LIMITS.answer),
    subconcept: truncateText(formData.subconcept || "", CHAR_LIMITS.answer),
    hint_text: truncateText(formData.hint_text || "", CHAR_LIMITS.hint),
};


            // Add mappings with truncated reasons
            if (formData.mappings?.length) {
                formData.mappings.forEach((map, i) => {
                    payload[`mapping_type[${i}]`] = map.mappingType || "";
                    payload[`mapping_value[${i}]`] = map.mappingValue || "";
                    payload[`reasons[${i}]`] = truncateText(map.reason || "", CHAR_LIMITS.reason);
                });
            }

            // Add answers with truncated text and feedback
            if (formData.answers?.length) {
                formData.answers.forEach((ans, i) => {
                    const truncatedAnswer = truncateText(ans.text, CHAR_LIMITS.answer);
                    const truncatedFeedback = truncateText(ans.feedback, CHAR_LIMITS.feedback);

                    payload[`options[NEW][${i}]`] = truncatedAnswer || "";
                    payload[`feedback[NEW][${i}]`] = truncatedFeedback || "";
                    payload[`correct_answer[${i}]`] = ans.is_correct ? 1 : 0;
                });
            }

            if (formData.id) {
                payload.id = formData.id;
            }

            const formDataPayload = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                formDataPayload.append(key, value);
            });

            let url = `${sessionData.url}/lms/question_master`;
            let method = 'POST';

            if (formData.id) {
                url = `${sessionData.url}/lms/question_master/${formData.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${sessionData.token}`,
                },
                body: formDataPayload,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            onSave();

            const result = await response.json();
            handleSuccess(result);

        } catch (error) {
            console.error('Error saving question:', error);
            setMessage({ text: `Error saving question: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (result) => {
        setMessage({ text: 'Question saved successfully!', type: 'success' })
        setSuccess(true);

        if (result?.data) {
            onQuestionAdded?.(result.data);
        }

        setTimeout(() => {
            setFormData({
                title: "",
                description: "",
                mappings: [{ mappingType: "", mappingValue: "", reason: "" }],
                learningOutcome: "",
                searchSection: "",
                searchStandard: "",
                subject: "",
                searchByChapter: "",
                questionType: "",
                questionMark: 1,
                multipleAnswers: false,
                show: true,
                concept: "",
                subconcept: "",
                hint_text: "",
                // answers: [{ text: "", feedback: "", is_correct: false }],
                answers: [
                    { text: "", feedback: "", is_correct: false },
                    { text: "", feedback: "", is_correct: false },
                    { text: "", feedback: "", is_correct: false },
                    { text: "", feedback: "", is_correct: false }
                ],
            })
        }, 1500);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {["ADMIN", "HR"].includes(sessionData.user_profile_name?.toUpperCase()) ? (
                    <Button className="bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"><Plus className="mr-2 h-4 w-4 " />Create Question</Button>
                ) : null}
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingQuestion ? "Edit Question" : "Create New Question"}</DialogTitle>
                    <DialogDescription>Fill in the fields to {editingQuestion ? "edit" : "create"} a question.</DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold">Question Saved Successfully!</h3>
                        <p className="text-muted-foreground">The question has been added to the database.</p>
                    </div>
                ) : (
                    <>
                        {message.text && (
                            <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Question Title{" "}
                                    <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                                </label>

                                <div className="flex items-center border rounded p-2 mb-2 justify-between bg-gray-50">
                                    <input
                                        type="text"
                                        value={promptString}
                                        onChange={(e) => setPromptString(e.target.value)}
                                        placeholder="Enter your prompt for AI generation..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700" required
                                    />
                                    <RefreshCw
                                        size={18}
                                        className={`cursor-pointer text-gray-500 hover:text-black ${aiLoading ? 'animate-spin' : ''}`}
                                        onClick={handleRefreshQuestion}
                                        disabled={aiLoading}
                                        title="Refresh question with current prompt"
                                    />
                                </div>
                                <TiptapEditor
                                    value={formData.title}
                                    onChange={(content) => handleChange("title", content)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    placeholder="Description"
                                    required
                                />
                            </div>

                            <div>
                                {/* <label className="block text-sm font-medium mb-2">Mapping</label> */}
                                {formData.mappings.map((mapping, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                                        <div>
                                            <label className="block text-sm font-medium">Mapping Type{" "}
                                                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                                            <Select
                                                value={mapping.mappingType}
                                                onValueChange={(val) => handleMappingChange(index, "mappingType", val)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select mapping type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mappingTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                            {type.name || `Type ${type.id}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Mapping Value{" "}
                                                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                                            <Select
                                                key={`mapping-value-${index}-${mapping.mappingValue}`}
                                                value={mapping.mappingValue}
                                                onValueChange={(val) => handleMappingChange(index, "mappingValue", val)}
                                                disabled={!mapping.mappingType}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select value">
                                                        {mapping.mappingValue ? getMappingValueName(mapping.mappingType, mapping.mappingValue) : "Select value"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mapping.mappingType && mappingValues[mapping.mappingType]?.map((val) => (
                                                        <SelectItem key={val.id} value={val.id.toString()}>
                                                            {val.name || `Value ${val.id}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Reason</label>
                                            <Input
                                                value={mapping.reason}
                                                onChange={(e) => handleMappingChange(index, "reason", e.target.value)}
                                                placeholder="Reason"
                                            />
                                            {mapping.reason && mapping.reason.length > CHAR_LIMITS.reason - 50 && (
                                                <p className="text-sm text-amber-600 mt-1">
                                                    {CHAR_LIMITS.reason - mapping.reason.length} characters remaining
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2" >
                                            {index === formData.mappings.length - 1 && (
                                                <Button type="button" size="icon" onClick={addMapping} className="h-10 " style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f5f5f5" }}>
                                                    <Plus className="h-4 w-4 text-black" />
                                                </Button>
                                            )}
                                            {formData.mappings.length > 1 && (
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={() => removeMapping(index)}
                                                    className="h-10 p-3 rounded-lg bg-[#f5f5f5] hover:bg-red-200"
                                                >
                                                    <X className="h-4 w-4 text-black" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Learning Outcome</label>
                                <Input
                                    value={formData.learningOutcome}
                                    onChange={(e) => handleChange("learningOutcome", e.target.value)}
                                    placeholder="Learning outcome"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Question Type{" "}
                                        <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                                    <Select value={formData.questionType} onValueChange={(val) => handleChange("questionType", val)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Question Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Multiple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Question Mark{" "}
                                        <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.questionMark}
                                        onChange={(e) => handleChange("questionMark", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <Checkbox
                                        checked={formData.multipleAnswers}
                                        onCheckedChange={(val) => handleChange("multipleAnswers", val)}
                                    />
                                    <span className="text-sm">Multiple Answers</span>
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <Checkbox
                                        checked={formData.show}
                                        onCheckedChange={(val) => handleChange("show", val)}
                                    />
                                    <span className="text-sm">Show</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Concept</label>
                                    <Input
                                        placeholder="Concept"
                                        value={formData.concept}
                                        onChange={(e) => handleChange("concept", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sub Concept</label>
                                    <Input
                                        placeholder="Sub Concept"
                                        value={formData.subconcept}
                                        onChange={(e) => handleChange("subconcept", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hint</label>
                                    <Input
                                        placeholder="Hint"
                                        value={formData.hint_text}
                                        onChange={(e) => handleChange("hint_text", e.target.value)}
                                    />
                                    {formData.hint_text && formData.hint_text.length > CHAR_LIMITS.hint - 50 && (
                                        <p className="text-sm text-amber-600 mt-1">
                                            {CHAR_LIMITS.hint - formData.hint_text.length} characters remaining
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Answers</label>
                                {formData.answers.map((ans, i) => (
                                    <div key={i} className="flex items-center gap-3 mt-2">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Enter Option"
                                                value={ans.text}
                                                onChange={(e) => {
                                                    const newAnswers = [...formData.answers];
                                                    newAnswers[i].text = e.target.value;
                                                    setFormData((prev) => ({ ...prev, answers: newAnswers }));
                                                }}
                                                required
                                            />
                                            {ans.text.length > CHAR_LIMITS.answer - 50 && (
                                                <p className="text-sm text-amber-600 mt-1">
                                                    {CHAR_LIMITS.answer - ans.text.length} characters remaining
                                                </p>
                                            )}
                                        </div>

                                        {/* <div className="flex-1">
                                            <Input
                                                placeholder="Enter Feedback"
                                                value={ans.feedback || ""}
                                                onChange={(e) => {
                                                    const newAnswers = [...formData.answers];
                                                    newAnswers[i].feedback = e.target.value;
                                                    setFormData((prev) => ({ ...prev, answers: newAnswers }));
                                                }}
                                            />
                                            {ans.feedback && ans.feedback.length > CHAR_LIMITS.feedback - 50 && (
                                                <p className="text-sm text-amber-600 mt-1">
                                                    {CHAR_LIMITS.feedback - ans.feedback.length} characters remaining
                                                </p>
                                            )}
                                        </div> */}
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Enter Feedback"
                                                value={ans.feedback || ""}
                                                onChange={(e) => {
                                                    const newAnswers = [...formData.answers];
                                                    newAnswers[i].feedback = e.target.value;
                                                    setFormData((prev) => ({ ...prev, answers: newAnswers }));
                                                }}
                                                required // Make feedback required
                                            />
                                            {ans.feedback && ans.feedback.length > CHAR_LIMITS.feedback - 50 && (
                                                <p className="text-sm text-amber-600 mt-1">
                                                    {CHAR_LIMITS.feedback - ans.feedback.length} characters remaining
                                                </p>
                                            )}
                                        </div>

                                        {/* In the button section: */}
                                        <div className="flex gap-2">
                                            {i === formData.answers.length - 1 && (
                                                <Button type="button" size="icon" onClick={addAnswer} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#f5f5f5" }}>
                                                    <Plus className="h-4 w-4 text-black" />
                                                </Button>
                                            )}
                                            {formData.answers.length > 4 && ( // Only show remove button if more than 4 answers
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-10 p-3 rounded-lg bg-[#f5f5f5] hover:bg-red-200"
                                                    onClick={() => removeAnswer(i)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {formData.multipleAnswers ? (
                                            <Checkbox
                                                checked={ans.is_correct}
                                                onCheckedChange={(checked) => {
                                                    const newAnswers = [...formData.answers];
                                                    newAnswers[i].is_correct = checked;
                                                    setFormData((prev) => ({ ...prev, answers: newAnswers }));
                                                }}
                                            />
                                        ) : (
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={ans.is_correct}
                                                onChange={() => {
                                                    const newAnswers = formData.answers.map((a, idx) => ({
                                                        ...a,
                                                        is_correct: idx === i,
                                                    }));
                                                    setFormData((prev) => ({ ...prev, answers: newAnswers }));
                                                }}
                                            />
                                        )}

                                        {/* <div className="flex gap-2">
                                            {i === formData.answers.length - 1 && (
                                                <Button type="button" size="icon" onClick={addAnswer}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {formData.answers.length > 1 && (
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={() => removeAnswer(i)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div> */}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button id="cancel" type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button id="submit" type="submit" disabled={loading} className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
                                    {loading ? "Saving..." : (editingQuestion ? "Update" : "Submit ")}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}