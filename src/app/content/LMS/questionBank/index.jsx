"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddQuestionDialog } from "../../../content/LMS/questionBank/AddQuestionDialog";
import { EditQuestionDialog } from "../../../content/LMS/questionBank/EditQuestionDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function QuestionBank({ chapter_id, standard_id, subject_id, courseDisplayName}) {
  // Default to 1 if not provided or falsy
  const effectiveChapterId = chapter_id || 1;
  const effectiveStandardId = standard_id || 1;

  console.log("QuestionBank Props:", { chapter_id: effectiveChapterId, standard_id: effectiveStandardId });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMappingType, setSelectedMappingType] = useState("all");
  const [selectedMappingValue, setSelectedMappingValue] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [mappingTypes, setMappingTypes] = useState([]);
  const [mappingValues, setMappingValues] = useState({});
  const [loadingMapping, setLoadingMapping] = useState(false);

  // Preview dialog state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id ,user_profile_name} = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
        user_profile_name:user_profile_name,
      });
    }
  }, []);

  // Fetch mapping types and values
  useEffect(() => {
    if (!sessionData) return;

    const fetchMappingTypes = async () => {
      try {
        setLoadingMapping(true);
        const response = await fetch(
          `${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0&token=${sessionData.token}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Mapping Types Response:", data);

        if (Array.isArray(data)) {
          setMappingTypes(data);

          // Fetch mapping values for all mapping types
          const values = {};
          for (const type of data) {
            const valuesResponse = await fetch(
              `${sessionData.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=${type.id}&token=${sessionData.token}`
            );
            
            if (valuesResponse.ok) {
              const valuesData = await valuesResponse.json();
              if (Array.isArray(valuesData)) {
                values[type.id] = valuesData;
              }
            }
          }
          setMappingValues(values);
        }
      } catch (error) {
        console.error('Error fetching mapping types:', error);
      } finally {
        setLoadingMapping(false);
      }
    };

    fetchMappingTypes();
  }, [sessionData]);

  // ---------------- FETCH QUESTIONS ----------------
  useEffect(() => {
    // Only fetch data when sessionData is available
    if (!sessionData) return;

    fetchData();
  }, [sessionData, effectiveChapterId, effectiveStandardId]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${sessionData.url}/lms/question_chapter_master?type=API&chapter_id=${effectiveChapterId}&standard_id=${effectiveStandardId}&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Check if data is in the expected format
      let questionsData = [];
      if (data.data && Array.isArray(data.data)) {
        questionsData = data.data;
      } else if (Array.isArray(data)) {
        questionsData = data;
      } else if (data.result && Array.isArray(data.result)) {
        questionsData = data.result;
      }

      setQuestions(
        questionsData.map((q) => ({
          id: q.id || q.question_id || "",
          category: q.chapter_name || q.category || "Uncategorized",
          title: q.question_title || q.title || "",
          type: q.question_type || q.type || "Unknown",
          difficulty: q.difficulty || "Beginner",
          tags: [q.subject_name, q.grade_name].filter(Boolean),
          createdBy: `User ${q.created_by || q.user_id || "Unknown"}`,
          createdDate: q.created_at || q.created_date || "N/A",
          totalQuestions: 1,
          usageCount: q.attempt_question || q.usage_count || 0,
          description: q.description || "",
          points: q.points || 1,
          marks: q.marks || q.points || 1,
          status: q.status || 1,
          grade_id: q.grade_id || "",
          grade_name: q.grade_name || "",
          standard_id: q.standard_id || "",
          subject_id: q.subject_id || "",
          subject_name: q.subject_name || "",
          chapter_id: q.chapter_id || "",
          chapter_name: q.chapter_name || "",
          topic_id: q.topic_id || "",
          topic_name: q.topic_name || "",
          pre_grade_topic: q.pre_grade_topic || "",
          post_grade_topic: q.post_grade_topic || "",
          cross_curriculum_grade_topic: q.cross_curriculum_grade_topic || "",
          hint_text: q.hint_text || "",
          learning_outcome: q.learning_outcome || "",
          // Mapping fields - extract from mappings array if available
          mapping_type: q.mapping_type || (q.mappings && q.mappings[0] && q.mappings[0].mappingType) || "",
          mapping_value: q.mapping_value || (q.mappings && q.mappings[0] && q.mappings[0].mappingValue) || "",
          mapping_reason: (q.mappings && q.mappings[0] && q.mappings[0].reason) || "",
          // Answer fields
          answers: q.answers || q.options || [],
          correct_answer: q.correct_answer || q.correct_option || "",
          // keep all original fields
          ...q,
        }))
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setEditDialogOpen(true);
  };

  // ---------------- OPEN PREVIEW DIALOG ----------------
  const handlePreviewClick = (question) => {
    setPreviewQuestion(question);
    setPreviewDialogOpen(true);
  };
  // ---------------- ADD Question ----------------
  const handleAddQuestion = async(id) => {
    fetchData();
  };

  // ---------------- UPDATE QUESTION ----------------
  const handleSaveQuestion = async (form, id) => {
    fetchData();
  };

  // ---------------- DELETE QUESTION ----------------
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this question?") || !sessionData) return;

    try {
      const params = new URLSearchParams({
        type: "API",
        sub_institute_id: sessionData.subInstituteId,
        user_id: sessionData.userId,
        token: sessionData.token
      });

      const url = `${sessionData.url}/lms/question_master/${id}?${params.toString()}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || `Failed (status: ${response.status})`);
      }

      setSuccessMessage(result.message || "Question deleted successfully!");
      setQuestions((prev) => prev.filter((q) => q.id !== id));

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      console.error("Error deleting question:", err);
      alert(`Failed to delete question! ${err.message}`);
    }
  };

  // ---------------- ADD QUESTION ----------------
  const handleQuestionAdded = (newQuestion) => {
    // Add the new question to the beginning of the list
    setQuestions((prev) => [newQuestion, ...prev]);
    setSuccessMessage("Question added successfully! ✅");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  // Helper function to get mapping type name by ID
  const getMappingTypeName = (id) => {
    if (!id || id === "all") return "N/A";
    const type = mappingTypes.find(t => t.id.toString() === id.toString());
    return type ? (type.name || type.title || `Type ${type.id}`) : id;
  };

  // Helper function to get mapping value name by type ID and value ID
  const getMappingValueName = (typeId, valueId) => {
    if (!valueId || valueId === "all") return "N/A";
    const values = mappingValues[typeId] || [];
    const value = values.find(v => v.id.toString() === valueId.toString());
    return value ? (value.name || value.title || `Value ${value.id}`) : valueId;
  };

  // ---------------- FILTER QUESTIONS ----------------
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && question.status === 1) ||
      (selectedStatus === "inactive" && question.status === 0);

    const matchesMapping =
      selectedMappingType === "all" ||
      selectedMappingValue === "all" ||
      (question.mapping_type === selectedMappingType && 
       question.mapping_value === selectedMappingValue);

    return matchesSearch && matchesStatus && matchesMapping;
  });

  // Function to display specific properties of a question in the preview
  const renderQuestionPreview = (question) => {
    if (!question) return null;

    // Get readable mapping type and value names
    const mappingTypeName = getMappingTypeName(question.mapping_type);
    const mappingValueName = getMappingValueName(question.mapping_type, question.mapping_value);

    // Check if answers is an array or needs to be parsed
    let answersArray = [];
    if (Array.isArray(question.answers)) {
      answersArray = question.answers;
    } else if (typeof question.answers === 'string') {
      try {
        // Try to parse as JSON
        answersArray = JSON.parse(question.answers);
      } catch (e) {
        // If parsing fails, treat as a single answer
        answersArray = [question.answers];
      }
    }

    return (
      <div className="space-y-4">
        {/* Question Title */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Question Title</Label>
          <div 
            className="p-3 bg-muted rounded-md"
            dangerouslySetInnerHTML={{
              __html: question.title || "N/A",
            }}
          />
        </div>
        <Separator />

        {/* Description */}
        {question.description && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <div 
                className="p-3 bg-muted rounded-md"
                dangerouslySetInnerHTML={{
                  __html: question.description,
                }}
              />
            </div>
            <Separator />
          </>
        )}

        {/* Mapping Type and Value */}
        {(mappingTypeName !== "N/A" || mappingValueName !== "N/A") && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mapping Type</Label>
                <p className="p-2 bg-muted rounded-md">
                  {mappingTypeName}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mapping Value</Label>
                <p className="p-2 bg-muted rounded-md">
                  {mappingValueName}
                </p>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Marks */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Marks</Label>
          <p className="p-2 bg-muted rounded-md">
            {question.marks || question.points || "N/A"}
          </p>
        </div>
        <Separator />

        {/* Answers */}
        {answersArray.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Answers</Label>
            <div className="space-y-2">
              {answersArray.map((answer, index) => {
                // Handle different answer formats
                let answerText = "";
                let isCorrect = false;
                
                if (typeof answer === 'object') {
                  // If answer is an object with text/option properties
                  answerText = answer.text || answer.option || answer.answer || JSON.stringify(answer);
                  
                  // Check if this is the correct answer
                  if (typeof question.correct_answer === 'object') {
                    isCorrect = JSON.stringify(answer) === JSON.stringify(question.correct_answer);
                  } else {
                    isCorrect = answer.id === question.correct_answer || 
                               answer.option === question.correct_answer ||
                               index.toString() === question.correct_answer;
                  }
                } else {
                  // If answer is a simple string/number
                  answerText = answer;
                  
                  // Check if this is the correct answer
                  isCorrect = answer === question.correct_answer || 
                             index.toString() === question.correct_answer;
                }

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${
                      isCorrect
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-muted border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCorrect && (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: answerText
                        }}
                      />
                      {isCorrect && (
                        <Badge variant="outline" className="ml-auto bg-green-100 text-green-800">
                          Correct
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Correct Answer (if answers array is not available) */}
        {(answersArray.length === 0) && question.correct_answer && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Correct Answer</Label>
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{question.correct_answer}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show loading while session data is being fetched
  if (!sessionData) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-lg">Loading session data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 text-green-800 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground text-sm">
            Manage and organize assessment questions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
         <AddQuestionDialog
 onSave={() => {
   fetchData();
   setSuccessMessage("Question added successfully!");
 }}
 sessionData={sessionData}
 chapter_id={effectiveChapterId}     // ✔ use this
 standard_id={effectiveStandardId}   // ✔ use this
 subject_id={subject_id}             // ✔ use this
 courseDisplayName={courseDisplayName}
/>

        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Mapping Type Filter */}
            <Select
              value={selectedMappingType}
              onValueChange={(value) => {
                setSelectedMappingType(value);
                setSelectedMappingValue("all"); // Reset value when type changes
              }}
              disabled={loadingMapping}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={loadingMapping ? "Loading types..." : "Mapping Type"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mapping Types</SelectItem>
                {mappingTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name || type.title || `Type ${type.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mapping Value Filter */}
            <Select
              value={selectedMappingValue}
              onValueChange={setSelectedMappingValue}
              disabled={selectedMappingType === "all" || loadingMapping}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={loadingMapping ? "Loading values..." : "Mapping Value"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Values</SelectItem>
                {mappingValues[selectedMappingType]?.map((value) => (
                  <SelectItem key={value.id} value={value.id.toString()}>
                    {value.name || value.title || `Value ${value.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {(loading || loadingMapping) && (
        <div className="flex justify-center items-center h-40">
          <p className="text-lg">Loading questions...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <p>Error: {error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Questions Grid */}
      {!loading && !loadingMapping && !error && (
        <>
          {filteredQuestions.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-lg text-muted-foreground">
                {questions.length === 0
                  ? "No questions found."
                  : "No questions match your filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredQuestions.map((question) => (
                <Card
                  key={question.id}
                  className="group hover:shadow-md transition-all duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge 
                          variant={question.status === 1 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {question.status === 1 ? "Active" : "Inactive"}
                        </Badge>
                        <CardTitle
                          className="text-base line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: question.title || "N/A",
                          }}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
   {/* {["ADMIN", "HR"].includes(sessionData.user_profile_name?.toUpperCase()) ? ( */}
                          <DropdownMenuItem
                            onClick={() => handlePreviewClick(question)}
                          >
                           
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
   {/* ):null} */}
      {["ADMIN", "HR"].includes(sessionData.user_profile_name?.toUpperCase()) ? (
                          <DropdownMenuItem
                            onClick={() => handleEditClick(question)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
      ):null} 
         {["ADMIN", "HR"].includes(sessionData.user_profile_name?.toUpperCase()) ? (
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </DropdownMenuItem>
         ):null}
            {["ADMIN", "HR"].includes(sessionData.user_profile_name?.toUpperCase()) ? (
                          <DropdownMenuItem
                            onClick={() => handleDelete(question.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
            ):null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {question.mapping_type && (
                        <Badge variant="outline" className="text-xs">
                          Type: {getMappingTypeName(question.mapping_type)}
                        </Badge>
                      )}
                      {question.mapping_value && (
                        <Badge variant="outline" className="text-xs">
                          Value: {getMappingValueName(question.mapping_type, question.mapping_value)}
                        </Badge>
                      )}
                      {question.subject_name && (
                        <Badge variant="outline" className="text-xs">
                          Subject: {question.subject_name}
                        </Badge>
                      )}
                      {question.grade_name && (
                        <Badge variant="outline" className="text-xs">
                          Grade: {question.grade_name}
                        </Badge>
                      )}
                    </div>

                    <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>{question.type}</span>
                        <span>{question.createdDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview Question Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
            <DialogDescription>
              View question details and correct answers
            </DialogDescription>
          </DialogHeader>

          {previewQuestion && (
            <div className="py-4">
              {renderQuestionPreview(previewQuestion)}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <EditQuestionDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          question={editingQuestion}
          onSave={handleSaveQuestion}
          saving={saving}
          sessionData={sessionData}
        />
      )}
    </div>
  );
}