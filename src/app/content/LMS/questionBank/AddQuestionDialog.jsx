"use client"
import { useState, useEffect } from "react"
import { Plus, Upload, X, CheckCircle,RefreshCw } from "lucide-react"
import SearchFilters from '../../../../components/searchfileds/SearchFilters2';
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

export function AddQuestionDialog({ onQuestionAdded }) {
    const [open, setOpen] = useState(false)
    const [mappingTypes, setMappingTypes] = useState([])
    const [mappingValues, setMappingValues] = useState([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ text: "", type: "" })
    const [sessionData, setSessionData] = useState({ 
        url: "", 
        token: "", 
        subInstituteId: "", 
        userId: "" 
    })
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
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
        answers: [{ text: "", feedback: "", is_correct: false }],
    })

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const { APP_URL, token, sub_institute_id, user_id } = JSON.parse(userData);
            setSessionData({
                url: APP_URL,
                token,
                subInstituteId: sub_institute_id,
                userId: user_id,
            });
        }
    }, []);

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
                if (Array.isArray(data)) setMappingTypes(data)
            } catch (error) {
                console.error('Error fetching mapping types:', error)
            }
        }
        if (sessionData.url) {
            fetchMappingTypes()
        }
    }, [sessionData.url])

    const fetchMappingValues = async (mappingTypeId) => {
        try {
            const response = await fetch(`${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=${mappingTypeId}``${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=${mappingTypeId}`)
            const data = await response.json()
            if (Array.isArray(data)) setMappingValues(data)
        } catch (error) {
            console.error('Error fetching mapping values:', error)
        }
    }

    const handleChange = (name, value) => {
        // alert(name + " : " + value);
        setFormData((prev) => ({ ...prev, [name]: value }));
}


//     const handleChange = (field, value) =>{
// alert(value);
//     setEditForm((prev) => ({ ...prev, [field]: value }));

    const handleMappingChange = async (index, name, value) => {
        const newMappings = [...formData.mappings]
        newMappings[index] = { ...newMappings[index], [name]: value }
        if (name === "mappingType" && value) {
            await fetchMappingValues(value)
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
        if (formData.answers.length > 1) {
            setFormData((prev) => ({ ...prev, answers: prev.answers.filter((_, i) => i !== index) }))
        }
    }

    const addAnswer = () => {
        setFormData((prev) => ({
            ...prev,
            answers: [...prev.answers, { text: "", feedback: "", is_correct: false }],
        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });
          console.log("Payload check:", {
  concept: formData.concept,
  subconcept: formData.subconcept,
    hint_text: formData.hint_text,
  
});

        try {
            const formDataPayload = new FormData();

            // 🔹 Add fixed/session fields
            formDataPayload.append("type", "API");
            formDataPayload.append("sub_institute_id", sessionData.subInstituteId);
            formDataPayload.append("user_id", sessionData.userId);
            formDataPayload.append("token", sessionData.token);

            formDataPayload.append("grade_id", 1);

            // 🔹 Form fields
            formDataPayload.append("question_title", formData.title);
            formDataPayload.append('description', formData.description);
            formDataPayload.append('learning_outcome', formData.learningOutcome);

            formDataPayload.append('standard_id', formData.searchStandard || 1);
            formDataPayload.append('chapter_id', formData.searchByChapter || 1);
            formDataPayload.append('subject_id', formData.subject || 1);

            formDataPayload.append('question_type_id', formData.questionType);
            formDataPayload.append('points', formData.questionMark);
            formDataPayload.append('multiple_answer', formData.multipleAnswers ? 1 : 0);
            formDataPayload.append('status', formData.show ? 1 : 0);
            formDataPayload.append('concept', formData.concept || "");
            formDataPayload.append('subconcept', formData.subconcept || "");
            formDataPayload.append('hint_text', formData.hint_text || "");

            // 🔹 Mappings
            if (formData.mappings?.length) {
                formData.mappings.forEach((map, i) => {
                    formDataPayload.append(`mapping_type[${i}]`, map.mappingType || "");
                    formDataPayload.append(`mapping_value[${i}]`, map.mappingValue || "");
                    formDataPayload.append(`reasons[${i}]`, map.reason || "");
                });
            }

            // 🔹 Answers
            if (formData.answers?.length) {
                formData.answers.forEach((ans, i) => {
                    formDataPayload.append(`options[NEW][${i}]`, ans.text || "");
                    formDataPayload.append(`feedback[NEW][${i}]`, ans.feedback || "");
                    formDataPayload.append(`correct_answer[${i}]`, ans.is_correct ? 1 : 0);
                });
            }

            const response = await fetch(`${sessionData.url}/lms/question_master`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionData.token}`,
                },
                body: formDataPayload,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

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

        // 🔹 Use API response instead of formData
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
                answers: [{ text: "", feedback: "", is_correct: false }],
            })
        }, 1500);
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Add Question</Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>Fill in the fields to create a new question.</DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold">Question Saved Successfully!</h3>
                        <p className="text-muted-foreground">Redirecting to questions page...</p>
                    </div>
                ) : (
                    <>
                        {message.text && (
                            <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-6">
                            {/* Question Title with Tiptap Editor */}
                            {/* <div>
                                <label className="block text-sm font-medium mb-2">Question Title</label>
                               
                                    <TiptapEditor
                                  value={formData.title}
                                  onChange={(content) =>handleChange("title", content)} // ✅ no .target
                                />
                            </div> */}
                             <div>
                               <label className="block text-sm font-medium mb-2">Question Title</label>

                               {/* ✅ Box like your image */}
                               <div className="flex items-center border rounded p-2 mb-2 justify-between">
                                   <span className="text-sm text-gray-700">
                                       get 1 question for standard '6' and subject 'Science' and chapter 'The Wonderful World of Science'
                                     </span>
                                     <RefreshCw
                                         size={18}
                                         className="cursor-pointer text-gray-500 hover:text-black"
                                         onClick={() => console.log("Refresh clicked")}
                                     />
                                 </div>
                                 <TiptapEditor
                                     value={formData.title}
                                     onChange={(content) => handleChange("title", content)}
                                 />
                             </div>


                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium">Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    placeholder="Description"
                                    required
                                />
                            </div>

                            {/* Mapping */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Mapping</label>
                                {formData.mappings.map((mapping, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                                        <div>
                                            <label className="block text-sm font-medium">Mapping Type</label>
                                            <Select value={mapping.mappingType} onValueChange={(val) => handleMappingChange(index, "mappingType", val)}>
                                                <SelectTrigger><SelectValue placeholder="Select mapping type" /></SelectTrigger>
                                                <SelectContent>
                                                    {mappingTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>{type.name || `Type ${type.id}`}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Mapping Value</label>
                                            <Select
                                                value={mapping.mappingValue}
                                                onValueChange={(val) => handleMappingChange(index, "mappingValue", val)}
                                                disabled={!mapping.mappingType}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Select value" /></SelectTrigger>
                                                <SelectContent>
                                                    {mappingValues.map((val) => (
                                                        <SelectItem key={val.id} value={val.id.toString()}>{val.name || `Value ${val.id}`}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Reason</label>
                                            <Input value={mapping.reason} onChange={(e) => handleMappingChange(index, "reason", e.target.value)} placeholder="Reason" />
                                        </div>
                                        <div className="flex gap-2">
                                            {index === formData.mappings.length - 1 && (
                                                <Button type="button" size="icon" onClick={addMapping} className="h-10"><Plus className="h-4 w-4" /></Button>
                                            )}
                                            {formData.mappings.length > 1 && (
                                                <Button type="button" size="icon" variant="destructive" onClick={() => removeMapping(index)} className="h-10">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Learning Outcome */}
                            <div>
                                <label className="block text-sm font-medium">Learning Outcome</label>
                                <Input value={formData.learningOutcome} onChange={(e) => handleChange("learningOutcome", e.target.value)} placeholder="Learning outcome" />
                            </div>

                            {/* Search Filters */}
                            <SearchFilters formData={formData} onFormChange={handleChange} showSearchButton={true} />

                            {/* Question Type */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Question Type</label>
                                    <Select value={formData.questionType} onValueChange={(val) => handleChange("questionType", val)} required>
                                        <SelectTrigger><SelectValue placeholder="Question Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Multiple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Question Mark</label>
                                    <Input type="number" min="1" value={formData.questionMark} onChange={(e) => handleChange("questionMark", e.target.value)} required />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <Checkbox checked={formData.multipleAnswers} onCheckedChange={(val) => handleChange("multipleAnswers", val)} />
                                    <span className="text-sm">Multiple Answers</span>
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <Checkbox checked={formData.show} onCheckedChange={(val) => handleChange("show", val)} />
                                    <span className="text-sm">Show</span>
                                </div>
                            </div>

                            {/* Concept */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input placeholder="Concept" value={formData.concept} onChange={(e) => handleChange("concept", e.target.value)} />
                                <Input placeholder="Sub Concept" value={formData.subconcept} onChange={(e) => handleChange("subconcept", e.target.value)} />
                            </div>

                            {/* Hint */}
                            <Input placeholder="Hint" value={formData.hint_text} onChange={(e) => handleChange("hint_text", e.target.value)} />

                            {/* Answers */}
                            <div>
                                <label className="block text-sm font-medium">Answers</label>
                                {formData.answers.map((ans, i) => (
                                    <div key={i} className="flex items-center gap-3 mt-2">
                                        {/* Option */}
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

                                        {/* Feedback */}
                                        <Input
                                            placeholder="Enter Feedback"
                                            value={ans.feedback || ""}
                                            onChange={(e) => {
                                                const newAnswers = [...formData.answers];
                                                newAnswers[i].feedback = e.target.value;
                                                setFormData((prev) => ({ ...prev, answers: newAnswers }));
                                            }}
                                        />

                                        {/* Correct Selector */}
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

                                        {/* Add / Remove buttons */}
                                        <div className="flex gap-2">
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
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Save */}
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Question"}</Button>
                            </div>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}  
