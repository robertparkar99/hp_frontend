
// "use client";

// import { useState, useEffect } from "react";
// import {
//   Search,
//   Filter,
//   MoreHorizontal,
//   Upload,
//   Download,
//   Eye,
//   Edit,
//   Trash2,
// } from "lucide-react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { AddQuestionDialog } from "../../../content/LMS/questionBank/AddQuestionDialog";
// import { EditQuestionDialog } from "../../../content/LMS/questionBank/EditQuestionDialog";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import { Label } from "@/components/ui/label";

// export default function QuestionBank() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [selectedDifficulty, setSelectedDifficulty] = useState("all");
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [saving, setSaving] = useState(false);

//   // Preview dialog state
//   const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
//   const [previewQuestion, setPreviewQuestion] = useState(null);

//   // Edit dialog state
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [editingQuestion, setEditingQuestion] = useState(null);

//   const handleEditClick = (question) => {
//     setEditingQuestion(question);
//     setEditDialogOpen(true);
//   };

//   // 🔹 API constants
//   const API_BASE = "http://127.0.0.1:8000/lms";
//   const TOKEN = "76|LnoeslSRYnAvDf7kJeg1vif0ylZZsCxNJ2SRKNwX29663c2d";
//   const SUB_INSTITUTE_ID = 1;
//   const USER_ID = 1;

//   // ---------------- FETCH QUESTIONS ----------------
//   useEffect(() => {
//     async function fetchData() {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await fetch(
//           `${API_BASE}/question_chapter_master?type=API&chapter_id=1&standard_id=1&sub_institute_id=${SUB_INSTITUTE_ID}&token=${TOKEN}`
//         );

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log("API Response:", data);

//         setQuestions(
//           (data.data || []).map((q) => ({
//             id: q.id,
//             category: q.chapter_name || "Uncategorized",
//             title: q.question_title,
//             type: q.question_type || "Unknown",
//             // difficulty: "Beginner",
//             tags: [q.subject_name, q.grade_name].filter(Boolean),
//             createdBy: `User ${q.created_by}`,
//             createdDate: q.created_at || "N/A",
//             totalQuestions: 1,
//             usageCount: q.attempt_question || 0,
//             description: q.description || "",
//             points: q.points || 1,
//             status: q.status || 1,
//             grade_id: q.grade_id || "",
//             standard_id: q.standard_id || "",
//             subject_id: q.subject_id || "",
//             chapter_id: q.chapter_id || "",
//             topic_id: q.topic_id || "",
//             pre_grade_topic: q.pre_grade_topic || "",
//             post_grade_topic: q.post_grade_topic || "",
//             cross_curriculum_grade_topic: q.cross_curriculum_grade_topic || "",
//             hint_text: q.hint_text || "",
//             learning_outcome: q.learning_outcome || "",
//           }))
//         );
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError(
//           err instanceof Error ? err.message : "An unknown error occurred"
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   // ---------------- OPEN PREVIEW DIALOG ----------------
//   const handlePreviewClick = (question) => {
//     setPreviewQuestion(question);
//     setPreviewDialogOpen(true);
//   };

//   // ---------------- UPDATE QUESTION ----------------
//   const handleSaveQuestion = async (form) => {
//     if (!editingQuestion) return;

//     setSaving(true);

//     try {
//       const url = new URL(`${API_BASE}/question_master/${editingQuestion.id}`);
//       url.searchParams.append("type", "API");
//       url.searchParams.append("sub_institute_id", SUB_INSTITUTE_ID.toString());
//       url.searchParams.append("user_id", USER_ID.toString());
//       url.searchParams.append("token", TOKEN);

//       console.log("Update URL:", url.toString());
//       console.log("Payload:", form);

//       const res = await fetch(url, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify(form),
//       });

//       const result = await res.json();
//       if (!res.ok) throw new Error(result.message || "Update failed");

//       alert("Question updated successfully! ✅");

//       // 🔹 update local state
//       setQuestions((prev) =>
//         prev.map((q) => (q.id === editingQuestion.id ? { ...q, ...form } : q))
//       );

//       setEditDialogOpen(false);
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ---------------- DELETE QUESTION ----------------
//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure you want to delete this question?")) return;

//     try {
//       const url = `${API_BASE}/question_master/${id}?type=API&sub_institute_id=${SUB_INSTITUTE_ID}&user_id=${USER_ID}&token=${TOKEN}`;

//       console.log("DELETE URL:", url);

//       const response = await fetch(url, {
//         method: "DELETE",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       });

//       const result = await response.json().catch(() => ({}));
//       console.log("Delete Response:", result);

//       if (!response.ok) {
//         throw new Error(result.message || `Failed (status: ${response.status})`);
//       }

//       alert(result.message || "Question deleted successfully!");
//       setQuestions((prev) => prev.filter((q) => q.id !== id));
//     } catch (err) {
//       console.error("Error deleting question:", err);
//       alert(`Failed to delete question! ${err.message}`);
//     }
//   };

//   // ---------------- FILTER QUESTIONS ----------------
//   const filteredQuestions = questions.filter((question) => {
//     const matchesSearch =
//       question.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       question.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (question.tags || []).some((tag) =>
//         tag.toLowerCase().includes(searchQuery.toLowerCase())
//       );

//     const matchesCategory =
//       selectedCategory === "all" ||
//       question.category?.toLowerCase() === selectedCategory.toLowerCase();

//     const matchesDifficulty =
//       selectedDifficulty === "all" ||
//       question.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

//     return matchesSearch && matchesCategory && matchesDifficulty;
//   });

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
//           <p className="text-muted-foreground">
//             Manage and organize assessment questions
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="outline">
//             <Upload className="mr-2 h-4 w-4" />
//             Import
//           </Button>
//           <AddQuestionDialog
//             onQuestionAdded={(question) =>
//               setQuestions((prev) => [...prev, question])
//             }
//           />
//         </div>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search questions, categories, or tags..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//             <Select
//               value={selectedCategory}
//               onValueChange={setSelectedCategory}
//             >
//               <SelectTrigger className="w-48">
//                 <SelectValue placeholder="Category" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Categories</SelectItem>
//                 {Array.from(new Set(questions.map((q) => q.category))).map(
//                   (category) => (
//                     <SelectItem key={category} value={category?.toLowerCase()}>
//                       {category}
//                     </SelectItem>
//                   )
//                 )}
//               </SelectContent>
//             </Select>
//             <Select
//               value={selectedDifficulty}
//               onValueChange={setSelectedDifficulty}
//             >
//               <SelectTrigger className="w-48">
//                 <SelectValue placeholder="Difficulty" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Levels</SelectItem>
//                 {Array.from(new Set(questions.map((q) => q.difficulty))).map(
//                   (difficulty) => (
//                     <SelectItem
//                       key={difficulty}
//                       value={difficulty?.toLowerCase()}
//                     >
//                       {difficulty}
//                     </SelectItem>
//                   )
//                 )}
//               </SelectContent>
//             </Select>
//             {/* <Button variant="outline">
//               <Filter className="mr-2 h-4 w-4" />
//               More Filters
//             </Button> */}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Loading */}
//       {loading && (
//         <div className="flex justify-center items-center h-40">
//           <p className="text-lg">Loading questions...</p>
//         </div>
//       )}

//       {/* Error */}
//       {error && (
//         <div className="bg-destructive/15 text-destructive p-4 rounded-md">
//           <p>Error: {error}</p>
//           <Button
//             variant="outline"
//             className="mt-2"
//             onClick={() => window.location.reload()}
//           >
//             Try Again
//           </Button>
//         </div>
//       )}

//       {/* Questions Grid */}
//       {!loading && !error && (
//         <>
//           {filteredQuestions.length === 0 ? (
//             <div className="flex justify-center items-center h-40">
//               <p className="text-lg text-muted-foreground">
//                 {questions.length === 0
//                   ? "No questions found."
//                   : "No questions match your filters."}
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
//               {filteredQuestions.map((question) => (
//                 <Card
//                   key={question.id}
//                   className="group hover:shadow-md transition-all duration-200"
//                 >
//                   <CardHeader className="pb-3">
//                     <div className="flex items-start justify-between">
//                       <div className="space-y-1">
//                         <Badge variant="secondary" className="text-xs">
//                           {question.category}
//                         </Badge>
//                         <CardTitle className="text-base line-clamp-2">
//                           {question.title}
//                         </CardTitle>
//                       </div>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-8 w-8"
//                           >
//                             <MoreHorizontal className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem
//                             onClick={() => handlePreviewClick(question)}
//                           >
//                             <Eye className="mr-2 h-4 w-4" />
//                             Preview
//                           </DropdownMenuItem>
//                           <DropdownMenuItem onClick={() => handleEditClick(question)}>
//                             <Edit className="mr-2 h-4 w-4" /> Edit
//                           </DropdownMenuItem>

//                           <DropdownMenuItem>
//                             <Download className="mr-2 h-4 w-4" />
//                             Export
//                           </DropdownMenuItem>
//                           <DropdownMenuItem
//                             onClick={() => handleDelete(question.id)}
//                             className="text-destructive"
//                           >
//                             <Trash2 className="mr-2 h-4 w-4" />
//                             Delete
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="pt-0 space-y-3">
//                     <div className="">
//                       {/* <Badge variant="outline" className="text-xs">
//                         {question.type}
//                       </Badge> */}
//                       {/* <Badge variant="outline" className="text-xs">
//                         {question.difficulty}
//                       </Badge> */}
//                       <Badge
//                         variant={
//                           question.status === 1 ? "default" : "secondary"
//                         }
//                         className="text-xs"
//                       >
//                         {question.status === 1 ? "Active" : "Inactive"}
//                       </Badge>
//                     </div>

//                     <div className="flex flex-wrap gap-1">
//                       {(question.tags || []).slice(0, 3).map((tag, index) => (
//                         <Badge
//                           key={index}
//                           variant="outline"
//                           className="text-xs"
//                         >
//                           {tag}
//                         </Badge>
//                       ))}
//                       {(question.tags || []).length > 3 && (
//                         <Badge variant="outline" className="text-xs">
//                           +{(question.tags || []).length - 3} more
//                         </Badge>
//                       )}
//                     </div>

//                     <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
//                       <div className="flex justify-end">
//                         {/* <span>{question.createdBy}</span> */}
//                         <span>{question.createdDate}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         {/* <span>
//                           {question.totalQuestions} question
//                           {question.totalQuestions > 1 ? "s" : ""}
//                         </span>
//                         <span>Used {question.usageCount} times</span> */}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {/* Preview Question Dialog */}
//       <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
//         <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Question Preview</DialogTitle>
//             <DialogDescription>
//               Detailed view of the question data
//             </DialogDescription>
//           </DialogHeader>

//           {previewQuestion && (
//             <div className="space-y-4 py-2">
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium">Title</Label>
//                 <p className="text-base font-semibold">{previewQuestion.title}</p>
//               </div>

//               <Separator />

//               <div className="space-y-2">
//                 <Label className="text-sm font-medium">Description</Label>
//                 <p className="text-sm">{previewQuestion.description || "No description"}</p>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Category</Label>
//                   <p className="text-sm">{previewQuestion.category}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Type</Label>
//                   <p className="text-sm">{previewQuestion.type}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Difficulty</Label>
//                   <p className="text-sm">{previewQuestion.difficulty}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Points</Label>
//                   <p className="text-sm">{previewQuestion.points}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Status</Label>
//                   <p className="text-sm">{previewQuestion.status === 1 ? "Active" : "Inactive"}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Usage Count</Label>
//                   <p className="text-sm">{previewQuestion.usageCount}</p>
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-2">
//                 <Label className="text-sm font-medium">Tags</Label>
//                 <div className="flex flex-wrap gap-1">
//                   {(previewQuestion.tags || []).map((tag, index) => (
//                     <Badge key={index} variant="secondary" className="text-xs">
//                       {tag}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>

//               <Separator />

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Grade ID</Label>
//                   <p className="text-sm">{previewQuestion.grade_id || "N/A"}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Standard ID</Label>
//                   <p className="text-sm">{previewQuestion.standard_id || "N/A"}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Subject ID</Label>
//                   <p className="text-sm">{previewQuestion.subject_id || "N/A"}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Chapter ID</Label>
//                   <p className="text-sm">{previewQuestion.chapter_id || "N/A"}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Topic ID</Label>
//                   <p className="text-sm">{previewQuestion.topic_id || "N/A"}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Created By</Label>
//                   <p className="text-sm">{previewQuestion.createdBy}</p>
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-2">
//                 <Label className="text-sm font-medium">Hint Text</Label>
//                 <p className="text-sm">{previewQuestion.hint_text || "No hint text"}</p>
//               </div>

//               <div className="space-y-2">
//                 <Label className="text-sm font-medium">Learning Outcome</Label>
//                 <p className="text-sm">{previewQuestion.learning_outcome || "No learning outcome"}</p>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Pre-Grade Topic</Label>
//                   <p className="text-sm">{previewQuestion.pre_grade_topic || "N/A"}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium">Post-Grade Topic</Label>
//                   <p className="text-sm">{previewQuestion.post_grade_topic || "N/A"}</p>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label className="text-sm font-medium">Cross-Curriculum Topic</Label>
//                 <p className="text-sm">{previewQuestion.cross_curriculum_grade_topic || "N/A"}</p>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Edit Question Dialog */}
//       {editingQuestion && (
//         <EditQuestionDialog
//           open={editDialogOpen}
//           onOpenChange={setEditDialogOpen}
//           question={editingQuestion}
//           onSave={handleSaveQuestion}
//           saving={saving}
//         />
//       )}
//     </div>
//   );
// }

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

    export default function QuestionBank() {
      const [searchQuery, setSearchQuery] = useState("");
      const [selectedCategory, setSelectedCategory] = useState("all");
      const [selectedDifficulty, setSelectedDifficulty] = useState("all");
      const [questions, setQuestions] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [saving, setSaving] = useState(false);
      const [successMessage, setSuccessMessage] = useState("");

      // Preview dialog state
      const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
      const [previewQuestion, setPreviewQuestion] = useState(null);

      // Edit dialog state
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [editingQuestion, setEditingQuestion] = useState(null);

      const handleEditClick = (question) => {
        setEditingQuestion(question);
        setEditDialogOpen(true);
      };

      // 🔹 API constants
      const API_BASE = "http://127.0.0.1:8000/lms";
      const TOKEN = "76|LnoeslSRYnAvDf7kJeg1vif0ylZZsCxNJ2SRKNwX29663c2d";
      const SUB_INSTITUTE_ID = 1;
      const USER_ID = 1;

      // ---------------- FETCH QUESTIONS ----------------
      useEffect(() => {
        async function fetchData() {
          try {
            setLoading(true);
            setError(null);

            const response = await fetch(
              `${API_BASE}/question_chapter_master?type=API&chapter_id=1&standard_id=1&sub_institute_id=${SUB_INSTITUTE_ID}&token=${TOKEN}`
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
                status: q.status || 1,
                grade_id: q.grade_id || "",
                standard_id: q.standard_id || "",
                subject_id: q.subject_id || "",
                chapter_id: q.chapter_id || "",
                topic_id: q.topic_id || "",
                pre_grade_topic: q.pre_grade_topic || "",
                post_grade_topic: q.post_grade_topic || "",
                cross_curriculum_grade_topic: q.cross_curriculum_grade_topic || "",
                hint_text: q.hint_text || "",
                learning_outcome: q.learning_outcome || "",
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

        fetchData();
      }, []);

      // ---------------- OPEN PREVIEW DIALOG ----------------
      const handlePreviewClick = (question) => {
        setPreviewQuestion(question);
        setPreviewDialogOpen(true);
      };

      // ---------------- UPDATE QUESTION ----------------
      const handleSaveQuestion = async (form) => {
        if (!editingQuestion) return;

        setSaving(true);

        try {
          const url = new URL(`${API_BASE}/question_master/${editingQuestion.id}`);
          url.searchParams.append("type", "API");
          url.searchParams.append("sub_institute_id", SUB_INSTITUTE_ID.toString());
          url.searchParams.append("user_id", USER_ID.toString());
          url.searchParams.append("token", TOKEN);

          console.log("Update URL:", url.toString());
          console.log("Payload:", form);

          const res = await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(form),
          });

          const result = await res.json();
          if (!res.ok) throw new Error(result.message || "Update failed");

          // Show success message
          setSuccessMessage("Question updated successfully! ✅");
          
          // Update the local state with the edited values
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === editingQuestion.id 
                ? { 
                    ...q, 
                    ...form,
                    title: form.question_title || q.title,
                    description: form.description || q.description,
                    points: form.points || q.points,
                    status: form.status || q.status,
                    // Update other fields as needed
                  } 
                : q
            )
          );

          // Close the edit dialog after a short delay
          setTimeout(() => {
            setEditDialogOpen(false);
            setEditingQuestion(null);
            setSuccessMessage("");
          }, 1500);
          
        } catch (err) {
          alert(`Error: ${err.message}`);
        } finally {
          setSaving(false);
        }
      };

      // ---------------- DELETE QUESTION ----------------
      const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this question?")) return;

        try {
          const url = `${API_BASE}/question_master/${id}?type=API&sub_institute_id=${SUB_INSTITUTE_ID}&user_id=${USER_ID}&token=${TOKEN}`;

          console.log("DELETE URL:", url);

          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          const result = await response.json().catch(() => ({}));
          console.log("Delete Response:", result);

          if (!response.ok) {
            throw new Error(result.message || `Failed (status: ${response.status})`);
          }

          // Show success message and update UI immediately
          setSuccessMessage(result.message || "Question deleted successfully!");
          setQuestions((prev) => prev.filter((q) => q.id !== id));
          
          // Clear success message after 2 seconds
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
        setQuestions((prev) => [newQuestion, ...prev]);
        setSuccessMessage("Question added successfully! ✅");
        setTimeout(() => setSuccessMessage(""), 2000);
      };

      // ---------------- FILTER QUESTIONS ----------------
      const filteredQuestions = questions.filter((question) => {
        const matchesSearch =
          question.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          question.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (question.tags || []).some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesCategory =
          selectedCategory === "all" ||
          question.category?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesDifficulty =
          selectedDifficulty === "all" ||
          question.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

        return matchesSearch && matchesCategory && matchesDifficulty;
      });

      // Function to display all properties of a question in the preview
      const renderQuestionProperties = (question) => {
        if (!question) return null;

        return Object.entries(question).map(([key, value]) => {
          if (key.startsWith("_") || typeof value === "function") return null;

          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <div key={key} className="space-y-2">
              <Label className="text-sm font-medium">{formattedKey}</Label>
              <p className="text-sm break-words">
                {Array.isArray(value)
                  ? value.join(", ")
                  : typeof value === "object"
                  ? JSON.stringify(value)
                  : value?.toString() || "N/A"}
              </p>
              <Separator />
            </div>
          );
        });
      };

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
              <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
              <p className="text-muted-foreground">
                Manage and organize assessment questions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <AddQuestionDialog onQuestionAdded={handleQuestionAdded} />
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
                      placeholder="Search questions, categories, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Array.from(new Set(questions.map((q) => q.category))).map(
                      (category) => (
                        <SelectItem key={category} value={category?.toLowerCase()}>
                          {category}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedDifficulty}
                  onValueChange={setSelectedDifficulty}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {Array.from(new Set(questions.map((q) => q.difficulty))).map(
                      (difficulty) => (
                        <SelectItem
                          key={difficulty}
                          value={difficulty?.toLowerCase()}
                        >
                          {difficulty}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Loading */}
          {loading && (
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
          {!loading && !error && (
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
                            <Badge variant="secondary" className="text-xs">
                              {question.category}
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
                              <DropdownMenuItem
                                onClick={() => handlePreviewClick(question)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(question)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(question.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div>
                          <Badge
                            variant={
                              question.status === 1 ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {question.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {(question.tags || []).slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {(question.tags || []).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(question.tags || []).length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-end">
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
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Question Preview - All Data</DialogTitle>
                <DialogDescription>
                  Complete view of all question properties from API response
                </DialogDescription>
              </DialogHeader>

              {previewQuestion && (
                <div className="space-y-4 py-2">
                  {renderQuestionProperties(previewQuestion)}
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
            />
          )}
        </div>
      );
    }
