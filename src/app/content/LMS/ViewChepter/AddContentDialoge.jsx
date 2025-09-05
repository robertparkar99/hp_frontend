// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "../../../../components/ui/dialog";
// import { Button } from "../../../../components/ui/button";

// const AddContentDialog = ({
//   open,
//   onOpenChange,
//   onSave,
//   content,
//   sessionInfo,
//   chapterId,
//   chapterName,
//   standardName,
//   courseDisplayName   
// }) => {
//   // Dynamic mapping fields
//   const [mappings, setMappings] = useState([
//     { mappingType: "", mappingValue: "" },
//   ]);

//   // Mapping options
//   const [mappingTypes, setMappingTypes] = useState([]);
//   const [mappingValues, setMappingValues] = useState({});

//   // Content categories
//   const [categories, setCategories] = useState([]);

//   // Other states
//   const [fileType, setFileType] = useState("");
//   const [file, setFile] = useState(null);
//   const [fileLink, setFileLink] = useState("");
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [prompt, setPrompt] = useState("");
//   const [restrictDate, setRestrictDate] = useState("");
//   const [category, setCategory] = useState("");
//   const [tags, setTags] = useState([]);
//   const [tagInput, setTagInput] = useState("");
//   const [display, setDisplay] = useState(true);
//   const [loading, setLoading] = useState(false);

//   // Fetch mapping types
//   useEffect(() => {
//     console.log("📌 Received chapterId:", chapterId);
//     const fetchMappingTypes = async () => {
//       try {
//         const res = await fetch(
//           `${sessionInfo.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0`
//         );
//         const data = await res.json();
//         setMappingTypes(data || []);
//       } catch (err) {
//         console.error("❌ Failed to fetch mapping types:", err);
//       }
//     };
//     fetchMappingTypes();
//   }, []);

//   // Fetch content categories (based on chapterId)
//   // useEffect(() => {
//   //   const fetchCategories = async () => {
//   //     if (!chapterId) return;
//   //     try {
//   //       const res = await fetch(
//   //         `${sessionInfo.url}/lms/create_content_master?chapter_id=${chapterId}&type=API`
//   //       );
//   //       const data = await res.json();
//   //       setCategories(data?.content_category || []);
//   //       console.log("content_category API Response:", data);
//   //       console.log("📌 content_category data:", data?.content_category);
//   //       console.log("📌 categories chapterId:", chapterId);
//   //     } catch (err) {
//   //       console.error("❌ Failed to fetch categories:", err);
//   //     }
//   //   };
//   //   fetchCategories();
//   // }, [chapterId]);
//   useEffect(() => {
//   const fetchCategories = async () => {
//     if (!chapterId) return;
//     try {
//       const url = `${sessionInfo.url}/create_content_master?chapter_id=${chapterId}&type=API`;
//       console.log("📡 Fetching categories from:", url);

//       const res = await fetch(url);
//       if (!res.ok) {
//         throw new Error(`API returned status ${res.status}`);
//       }

//       const data = await res.json();
//       setCategories(data?.content_category || []);
//       console.log("📌 content_category data:", data?.content_category);
//     } catch (err) {
//       console.error("❌ Failed to fetch categories:", err);
//     }
//   };
//   fetchCategories();
// }, [chapterId, sessionInfo.url]);


//   // Fetch mapping values
//   const fetchMappingValues = async (parentId) => {
//     if (!parentId) return;
//     try {
//       const res = await fetch(
//         `${sessionInfo.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=${parentId}`
//       );
//       const data = await res.json();
//       setMappingValues((prev) => ({ ...prev, [parentId]: data || [] }));
//     } catch (err) {
//       console.error("❌ Failed to fetch mapping values:", err);
//     }
//   };

//   // Prefill when editing
//   useEffect(() => {
//     if (content) {
//       setMappings(content.mappings || [{ mappingType: "", mappingValue: "" }]);
//       setFileType(content.fileType || "");
//       setTitle(content.title || "");
//       setDescription(content.description || "");
//       setPrompt(content.prompt || "");
//       setRestrictDate(content.restrictDate || "");
//       setCategory(content.category || "");
//       setTags(content.tags || []);
//       setDisplay(content.display === 1 || content.display === true);
//       if (content.fileType === "link") {
//         setFileLink(content.file || "");
//       }
//     } else {
//       setMappings([{ mappingType: "", mappingValue: "" }]);
//       setFileType("");
//       setFile(null);
//       setFileLink("");
//       setTitle("");
//       setDescription("");
//       setPrompt("");
//       setRestrictDate("");
//       setCategory("");
//       setTags([]);
//       setDisplay(true);
//     }
//   }, [content]);

//   // Handle mapping change
//   const handleChange = async (index, field, value) => {
//     const updated = [...mappings];
//     updated[index][field] = value;
//     if (field === "mappingType") {
//       updated[index].mappingValue = "";
//       await fetchMappingValues(value);
//     }
//     setMappings(updated);
//   };

//   const handleAddMapping = () => {
//     setMappings([...mappings, { mappingType: "", mappingValue: "" }]);
//   };

//   const handleRemoveMapping = (index) => {
//     const updated = mappings.filter((_, i) => i !== index);
//     setMappings(
//       updated.length ? updated : [{ mappingType: "", mappingValue: "" }]
//     );
//   };

//   // Tags
//   const handleAddTag = (e) => {
//     if (e.key === "Enter" && tagInput.trim()) {
//       setTags([...tags, tagInput.trim()]);
//       setTagInput("");
//       e.preventDefault();
//     }
//   };
//   const handleRemoveTag = (tag) => {
//     setTags(tags.filter((t) => t !== tag));
//   };

//   // Save
//   const handleSave = async () => {
//     try {
//       setLoading(true);
//       const formData = new FormData();
// // Loop through mappings
// mappings.forEach((map, index) => {
//   formData.append("mapping_type[0]", map.mappingType);
//   formData.append("mapping_value[0]", map.mappingValue);
// });
//       // formData.append("mappings", JSON.stringify(mappings));
//       formData.append("fileType", fileType);

//       if (fileType === "link") {
//         formData.append("fileLink", fileLink);
//       } else if (file) {
//         formData.append("file", file);
//       }

//       formData.append("title", title);
//       formData.append("description", description);
//       formData.append("prompt", prompt);
//       formData.append("restrictDate", restrictDate);
//       formData.append("category", category);
//       formData.append("tags", JSON.stringify(tags));
//       formData.append("display", display ? "1" : "0");

//       // Required fields
//       formData.append("hid_chapter_id", chapterId || "");
//       formData.append("hid_grade_id", sessionInfo?.grade_id || "");
//       formData.append("hid_standard_name", standardName || "");
//       formData.append("hid_subject_name", courseDisplayName  || "");
//        formData.append("hid_chapter_name", chapterName || "");
//       formData.append("user_id", sessionInfo?.user_id || "");
//       formData.append("token", sessionInfo?.token || "");

//       // ✅ Debug log required fields only
// console.log("📌 Required Fields:");
// console.log("hid_chapter_id:", chapterId);
// console.log("hid_standard_name:", standardName);
// console.log("hid_subject_name:", courseDisplayName);
// console.log("hid_chapter_name:", chapterName);
// console.log("user_id:", sessionInfo?.user_id);
// console.log("token:", sessionInfo?.token);

//       // ✅ Debug log all values before sending
//       for (let [key, value] of formData.entries()) {
//         console.log(`${key}:`, value);
//       }

//       const apiUrl = `${sessionInfo.url}/lms/content_master`;
//       console.log("📡 Sending POST request to:", apiUrl);

//       const res = await fetch(apiUrl, {
//         method: "POST",
//         body: formData,
//       });

//       console.log("🔎 Raw response:", res);

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Failed to save content (status ${res.status}): ${text}`);
//       }

//       const result = await res.json();
//       console.log("✅ Server response:", result);

//       onSave(result);
//       onOpenChange(false);
//     } catch (err) {
//       console.error("❌ Error saving content:", err);
//       alert("Error saving content: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-3xl w-full">
//         <DialogHeader>
//           <DialogTitle>{content ? "Edit Content" : "Add Content"}</DialogTitle>
//         </DialogHeader>
//         <div className="max-h-[70vh] overflow-y-auto scrollbar-hide pr-2">
//           <div className="flex flex-col space-y-4">
//             {/* ✅ Mapping Rows */}
//             {mappings.map((map, index) => {
//               const availableValues = mappingValues[map.mappingType] || [];
//               return (
//                 <div key={index} className="grid grid-cols-12 gap-2 items-end">
//                   <div className="col-span-5">
//                     <label className="block text-sm font-medium mb-1">
//                       Mapping Type
//                     </label>
//                     <select
//                       value={map.mappingType}
//                       onChange={(e) =>
//                         handleChange(index, "mappingType", e.target.value)
//                       }
//                       className="border p-2 rounded w-full"
//                     >
//                       <option value="">Select Mapping Type</option>
//                       {mappingTypes.map((type) => (
//                         <option key={type.id} value={type.id}>
//                           {type.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="col-span-5">
//                     <label className="block text-sm font-medium mb-1">
//                       Mapping Value
//                     </label>
//                     <select
//                       value={map.mappingValue}
//                       onChange={(e) =>
//                         handleChange(index, "mappingValue", e.target.value)
//                       }
//                       className="border p-2 rounded w-full"
//                       disabled={!map.mappingType}
//                     >
//                       <option value="">Select Mapping Value</option>
//                       {availableValues.map((val) => (
//                         <option key={val.id} value={val.id}>
//                           {val.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="col-span-2 flex justify-center">
//                     {index === 0 ? (
//                       <Button
//                         type="button"
//                         size="sm"
//                         variant="outline"
//                         className="h-8 w-8 p-0"
//                         onClick={handleAddMapping}
//                       >
//                         +
//                       </Button>
//                     ) : (
//                       <Button
//                         type="button"
//                         size="sm"
//                         variant="destructive"
//                         className="h-8 w-8 p-0"
//                         onClick={() => handleRemoveMapping(index)}
//                       >
//                         -
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}

//             {/* File Upload Section */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   File Upload Type
//                 </label>
//                 <select
//                   value={fileType}
//                   onChange={(e) => setFileType(e.target.value)}
//                   className="border p-2 rounded w-full"
//                 >
//                   <option value="">Select Type</option>
//                   <option value="pdf">PDF</option>
//                   <option value="jpg">JPG</option>
//                   <option value="html">HTML</option>
//                   <option value="video">Video</option>
//                   <option value="link">Link</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   {fileType === "link" ? "Enter Link" : "Upload"}
//                 </label>
//                 {fileType === "link" ? (
//                   <input
//                     type="text"
//                     value={fileLink}
//                     onChange={(e) => setFileLink(e.target.value)}
//                     placeholder="https://example.com/resource"
//                     className="border p-2 rounded w-full"
//                   />
//                 ) : (
//                   <input
//                     type="file"
//                     accept={fileType === "jpg" ? ".jpg" : undefined}
//                     onChange={(e) => setFile(e.target.files[0])}
//                     className="border p-2 rounded w-full"
//                   />
//                 )}
//               </div>
//             </div>

//             <input
//               type="text"
//               placeholder="Title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="border p-2 rounded w-full"
//             />
//             <textarea
//               placeholder="Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="border p-2 rounded w-full"
//             />
//             <textarea
//               placeholder="Prompt"
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               className="border p-2 rounded w-full"
//             />

//             {/* Restrict Date & Category */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Restrict Date
//                 </label>
//                 <input
//                   type="date"
//                   value={restrictDate}
//                   onChange={(e) => setRestrictDate(e.target.value)}
//                   className="border p-2 rounded w-full"
//                 />
//               </div>
//               {/* <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Select Content Category
//                 </label>
//                 <select
//                   value={category}
//                   onChange={(e) => setCategory(e.target.value)}
//                   className="border p-2 rounded w-full"
//                 >
//                   <option value="">--Select--</option>
//                   {content_category.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div> */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Select Content Category
//                 </label>
//                 <select
//                   value={category}
//                   onChange={(e) => setCategory(e.target.value)}
//                   className="border p-2 rounded w-full"
//                 >
//                   <option value="">--Select--</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.category_name} {/* ✅ corrected field */}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Tags & Display */}
//             <div className="flex items-center justify-between">
//               <div className="flex flex-wrap items-center gap-2 border p-2 rounded w-full">
//                 {tags.map((tag, idx) => (
//                   <span
//                     key={idx}
//                     className="px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center"
//                   >
//                     {tag}
//                     <button
//                       onClick={() => handleRemoveTag(tag)}
//                       className="ml-2 text-red-500"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//                 <input
//                   type="text"
//                   placeholder="add tags"
//                   value={tagInput}
//                   onChange={(e) => setTagInput(e.target.value)}
//                   onKeyDown={handleAddTag}
//                   className="flex-grow outline-none"
//                 />
//               </div>
//               <div className="ml-4">
//                 <label className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     checked={display}
//                     onChange={(e) => setDisplay(e.target.checked)}
//                   />
//                   <span>Display</span>
//                 </label>
//               </div>
//             </div>

//             <Button onClick={handleSave} disabled={loading}>
//               {loading ? "Saving..." : content ? "Update Content" : "Add Content"}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddContentDialog;


"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";

const AddContentDialog = ({
  open,
  onOpenChange,
  onSave,
  content,
  sessionInfo,
  chapterId,
  chapterName,
  standardName,
  courseDisplayName,
}) => {
  // Dynamic mapping fields
  const [mappings, setMappings] = useState([
    { mappingType: "", mappingValue: "" },
  ]);

  // Mapping options
  const [mappingTypes, setMappingTypes] = useState([]);
  const [mappingValues, setMappingValues] = useState({});

  // Content categories
  const [categories, setCategories] = useState([]);

  // Other states
  const [fileType, setFileType] = useState("");
  const [file, setFile] = useState(null);
  const [fileLink, setFileLink] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [restrictDate, setRestrictDate] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [display, setDisplay] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch mapping types
  useEffect(() => {
    console.log("📌 Received chapterId:", chapterId);
    const fetchMappingTypes = async () => {
      try {
        const res = await fetch(
          `${sessionInfo.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=0`
        );
        const data = await res.json();
        setMappingTypes(data || []);
      } catch (err) {
        console.error("❌ Failed to fetch mapping types:", err);
      }
    };
    fetchMappingTypes();
  }, []);

  // Fetch categories when dropdown is clicked
  const handleCategoryFocus = async () => {
    if (categories.length === 0 && chapterId) {
      await fetchCategories();
    }
  };

  // Your fetchCategories function (robust version)
  const fetchCategories = async () => {
    if (!chapterId) return;
    try {
      const url = `${sessionInfo.url}/lms/create_content_master?chapter_id=${chapterId}&type=API`;
      console.log("📡 Fetching categories:", url);

      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ API returned non-OK status:", res.status, text);
        setCategories([]);
        return;
      }

      const data = await res.json();
      setCategories(data?.content_category || []);
      console.log("📌 content_category data:", data?.content_category);
    } catch (err) {
      console.error("❌ Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  // Fetch mapping values
  const fetchMappingValues = async (parentId) => {
    if (!parentId) return;
    try {
      const res = await fetch(
        `${sessionInfo.url}/table_data?table=lms_mapping_type&filters[status]=1&filters[globally]=1&filters[parent_id]=${parentId}`
      );
      const data = await res.json();
      setMappingValues((prev) => ({ ...prev, [parentId]: data || [] }));
    } catch (err) {
      console.error("❌ Failed to fetch mapping values:", err);
    }
  };

  // Prefill when editing
  useEffect(() => {
    if (content) {
      setMappings(content.mappings || [{ mappingType: "", mappingValue: "" }]);
      setFileType(content.fileType || "");
      setTitle(content.title || "");
      setDescription(content.description || "");
      setPrompt(content.prompt || "");
      setRestrictDate(content.restrictDate || "");
      setCategory(content.category || "");
      setTags(content.tags || []);
      setDisplay(content.display === 1 || content.display === true);
      if (content.fileType === "link") {
        setFileLink(content.file || "");
      }
    } else {
      setMappings([{ mappingType: "", mappingValue: "" }]);
      setFileType("");
      setFile(null);
      setFileLink("");
      setTitle("");
      setDescription("");
      setPrompt("");
      setRestrictDate("");
      setCategory("");
      setTags([]);
      setDisplay(true);
    }
  }, [content]);

  // Handle mapping change
  const handleChange = async (index, field, value) => {
    const updated = [...mappings];
    updated[index][field] = value;
    if (field === "mappingType") {
      updated[index].mappingValue = "";
      await fetchMappingValues(value);
    }
    setMappings(updated);
  };

  const handleAddMapping = () => {
    setMappings([...mappings, { mappingType: "", mappingValue: "" }]);
  };

  const handleRemoveMapping = (index) => {
    const updated = mappings.filter((_, i) => i !== index);
    setMappings(
      updated.length ? updated : [{ mappingType: "", mappingValue: "" }]
    );
  };

  // Tags
  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      e.preventDefault();
    }
  };
  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Save
  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      // ✅ Loop through mappings with correct index
      // mappings.forEach((map, index) => {
      //   formData.append(`mapping_type[${index}]`, map.mappingType);
      //   formData.append(`mapping_value[${index}]`, map.mappingValue);
      // });

      formData.append("mapping_type[0]", mappings[0]?.mappingType || "");
      formData.append("mapping_value[0]", mappings[0]?.mappingValue || "");

      formData.append("fileType", fileType);

      if (fileType === "link") {
        formData.append("link", fileLink);
      } else if (file) {
        formData.append("file", file);
      }

      formData.append("title", title);
      formData.append("description", description);
      formData.append("prompt", prompt);
      formData.append("restrict_date", restrictDate);
      formData.append("content_category", category);
      formData.append("meta_tags", JSON.stringify(tags));
      formData.append("show_hide", display ? "1" : "0");

      // ✅ Required fields
      formData.append("hid_chapter_id", chapterId || "");
      formData.append("hid_standard_name", standardName || "");
      formData.append("hid_subject_name", courseDisplayName || "");
      formData.append("hid_chapter_name", chapterName || "");
      formData.append("user_id", sessionInfo?.user_id || "");
      formData.append("token", sessionInfo?.token || "");

      // ✅ Debug log required fields only
      console.log("📌 Required Fields:");
      console.log("hid_chapter_id:", chapterId);
      console.log("hid_standard_name:", standardName);
      console.log("hid_subject_name:", courseDisplayName);
      console.log("hid_chapter_name:", chapterName);
      console.log("user_id:", sessionInfo?.user_id);
      console.log("token:", sessionInfo?.token);

      // ✅ Debug log all values before sending
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const apiUrl = `${sessionInfo.url}/lms/content_master`;
      console.log("📡 Sending POST request to:", apiUrl);

      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      console.log("🔎 Raw response:", res);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to save content (status ${res.status}): ${text}`
        );
      }

      const result = await res.json();
      console.log("✅ Server response:", result);

      onSave(result);
      onOpenChange(false);
    } catch (err) {
      console.error("❌ Error saving content:", err);
      alert("Error saving content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>{content ? "Edit Content" : "Add Content"}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide pr-2">
          <div className="flex flex-col space-y-4">
            {/* ✅ Mapping Rows */}
            {mappings.map((map, index) => {
              const availableValues = mappingValues[map.mappingType] || [];
              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium mb-1">
                      Mapping Type
                    </label>
                    <select
                      value={map.mappingType}
                      onChange={(e) =>
                        handleChange(index, "mappingType", e.target.value)
                      }
                      className="border p-2 rounded w-full"
                    >
                      <option value="">Select Mapping Type</option>
                      {mappingTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <label className="block text-sm font-medium mb-1">
                      Mapping Value
                    </label>
                    <select
                      value={map.mappingValue}
                      onChange={(e) =>
                        handleChange(index, "mappingValue", e.target.value)
                      }
                      className="border p-2 rounded w-full"
                      disabled={!map.mappingType}
                    >
                      <option value="">Select Mapping Value</option>
                      {availableValues.map((val) => (
                        <option key={val.id} value={val.id}>
                          {val.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {index === 0 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={handleAddMapping}
                      >
                        +
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemoveMapping(index)}
                      >
                        -
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* File Upload Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  File Upload Type
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select Type</option>
                  <option value="pdf">PDF</option>
                  <option value="jpg">JPG</option>
                  <option value="html">HTML</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {fileType === "link" ? "Enter Link" : "Upload"}
                </label>
                {fileType === "link" ? (
                  <input
                    type="text"
                    value={fileLink}
                    onChange={(e) => setFileLink(e.target.value)}
                    placeholder="https://example.com/resource"
                    className="border p-2 rounded w-full"
                  />
                ) : (
                  <input
                    type="file"
                    accept={fileType === "jpg" ? ".jpg" : undefined}
                    onChange={(e) => setFile(e.target.files[0])}
                    className="border p-2 rounded w-full"
                  />
                )}
              </div>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <textarea
              placeholder="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border p-2 rounded w-full"
            />

            {/* Restrict Date & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Restrict Date
                </label>
                <input
                  type="date"
                  value={restrictDate}
                  onChange={(e) => setRestrictDate(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium mb-1">
                  Select Content Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">--Select--</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div> */}
              <div>
                <label className="block text-sm font-medium mb-1">Select Content Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onFocus={handleCategoryFocus} // fetch categories on focus
                  className="border p-2 rounded w-full"
                >
                  <option value="">--Select--</option>
                  {/* {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))} */}
                  {(categories || []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}


                </select>
              </div>
            </div>

            {/* Tags & Display */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 border p-2 rounded w-full">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="add tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-grow outline-none"
                />
              </div>
              <div className="ml-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={display}
                    onChange={(e) => setDisplay(e.target.checked)}
                  />
                  <span>Display</span>
                </label>
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : content ? "Update Content" : "Add Content"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContentDialog;
