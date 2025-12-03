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
  standard_id,
  subject_id,
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
  const [contentType, setContentType] = useState("");
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

  // Validation state
  const [errors, setErrors] = useState({});

  // Fetch mapping types
  useEffect(() => {
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

    if (open) {
      fetchMappingTypes();
    }
  }, [open, sessionInfo.url]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!chapterId) return;
      try {
        const url = `${sessionInfo.url}/lms/create_content_master?chapter_id=${chapterId}&type=API`;
        console.log("add content dialoge chepter Id ", chapterId);
        const res = await fetch(url);
        if (!res.ok) {
          setCategories([]);
          return;
        }
        const data = await res.json();
        setCategories(data?.content_category || []);
      } catch (err) {
        console.error("❌ Failed to fetch categories:", err);
        setCategories([]);
      }
    };

    if (open && chapterId) {
      fetchCategories();
    }
  }, [open, chapterId, sessionInfo.url]);

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

  // Fetch content details for editing
  const fetchContentDetails = async (contentId) => {
    try {
      const url = `${sessionInfo.url}/lms/content_master/${contentId}/edit?type=API&sub_institute_id=${sessionInfo.sub_institute_id || 1}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch content details: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch content details:", err);
      return null;
    }
  };

  // Parse content_mapping_type from API response
  const parseContentMappings = (contentMappingType) => {
    if (!contentMappingType) return [];

    const mappings = [];

    // Handle the case where content_mapping_type is an object with numeric keys
    if (typeof contentMappingType === 'object' && !Array.isArray(contentMappingType)) {
      Object.keys(contentMappingType).forEach(key => {
        const mapping = contentMappingType[key];
        if (mapping && mapping.TYPE_ID && mapping.VALUE_ID) {
          mappings.push({
            mappingType: mapping.TYPE_ID.toString(),
            mappingValue: mapping.VALUE_ID.toString()
          });
        }
      });
    }

    return mappings.length > 0 ? mappings : [{ mappingType: "", mappingValue: "" }];
  };

  // Parse tags from API response - Filter out LMS_ERP for display
  const parseTags = (metaTags) => {
    if (!metaTags) return [];

    let tagsArray = [];

    if (typeof metaTags === "string") {
      try {
        // Try to parse as JSON first
        tagsArray = JSON.parse(metaTags);
      } catch {
        // If not JSON, split by commas
        if (metaTags.includes(",")) {
          tagsArray = metaTags.split(",").map(tag => tag.trim());
        } else if (metaTags.trim() !== "") {
          tagsArray = [metaTags.trim()];
        }
      }
    } else if (Array.isArray(metaTags)) {
      tagsArray = metaTags;
    }

    // Filter out "LMS_ERP" for display - only show user-added tags
    return tagsArray.filter(tag => tag !== "LMS_ERP" && tag.trim() !== "");
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate mapping types - at least one mapping type is required
    const hasValidMapping = mappings.some(mapping => mapping.mappingType && mapping.mappingValue);
    if (!hasValidMapping) {
      newErrors.mappings = "At least one mapping type and value is required";
    }

    // Validate content type
    if (!contentType) {
      newErrors.contentType = "File upload type is required";
    }

    // Validate file or link based on content type
    if (contentType === "link") {
      if (!fileLink.trim()) {
        newErrors.fileLink = "Link is required for link type content";
      } else if (!isValidUrl(fileLink)) {
        newErrors.fileLink = "Please enter a valid URL";
      }
    } else if (contentType && contentType !== "link") {
      if (!file && (!content || !content.filename)) {
        newErrors.file = "File is required for this content type";
      }
    }

    // Validate title
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    // Validate category
    if (!category) {
      newErrors.category = "Content category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Prefill when editing
  useEffect(() => {
    const prefillFormData = async () => {
      if (content && open) {
        let contentData = content;

        // If we have a content ID but not the full content_mapping_type data, fetch it
        if (content.id && !content.content_mapping_type) {
          const detailedContent = await fetchContentDetails(content.id);
          if (detailedContent) {
            // Extract content_data from the API response
            contentData = {
              ...content,
              ...detailedContent.content_data,
              content_mapping_type: detailedContent.content_mapping_type
            };
          }
        }

        // Parse mappings from content_mapping_type
        let contentMappings = parseContentMappings(contentData.content_mapping_type);

        // Fallback to old parsing logic if no mappings found
        if (contentMappings.length === 0 && contentData.mappings) {
          if (typeof contentData.mappings === "string") {
            try {
              contentMappings = JSON.parse(contentData.mappings);
            } catch (e) {
              if (contentData.mappings.includes(":")) {
                contentMappings = contentData.mappings.split(",").map((item) => {
                  const [mappingType, mappingValue] = item.split(":");
                  return { mappingType, mappingValue };
                });
              }
            }
          } else {
            contentMappings = contentData.mappings;
          }
        }

        setMappings(
          contentMappings.length > 0
            ? contentMappings
            : [{ mappingType: "", mappingValue: "" }]
        );

        // Set form fields from content_data
        setContentType(contentData.file_type || "");
        setTitle(contentData.title || "");
        setDescription(contentData.description || "");
        setPrompt(contentData.prompt || "");
        setRestrictDate(contentData.restrict_date || "");

        // Set category - check both possible field names
        const categoryValue = contentData.content_category_id || contentData.content_category || "";
        setCategory(categoryValue);

        // Set file link based on file type
        if (contentData.file_type === "link") {
          setFileLink(contentData.file || contentData.file_link || "");
        } else if (contentData.file) {
          setFileLink(contentData.file);
        }

        // Parse tags - use the parseTags function that filters out LMS_ERP
        const contentTags = parseTags(contentData.meta_tags);
        setTags(contentTags);

        setDisplay(
          contentData.show_hide === "1" ||
          contentData.show_hide === 1 ||
          contentData.show_hide === true
        );

        // Fetch mapping values for each mapping type
        contentMappings.forEach((mapping) => {
          if (mapping.mappingType) {
            fetchMappingValues(mapping.mappingType);
          }
        });
      } else if (open) {
        // reset on add new
        setMappings([{ mappingType: "", mappingValue: "" }]);
        setContentType("");
        setFile(null);
        setFileLink("");
        setTitle("");
        setDescription("");
        setPrompt("");
        setRestrictDate("");
        setCategory("");
        setTags([]);
        setDisplay(true);
        setErrors({});
      }
    };

    prefillFormData();
  }, [content, open, sessionInfo]);

  // Handle mapping change
  const handleChange = async (index, field, value) => {
    const updated = [...mappings];
    updated[index][field] = value;
    if (field === "mappingType") {
      updated[index].mappingValue = "";
      await fetchMappingValues(value);
    }
    setMappings(updated);
    
    // Clear mapping errors when user makes changes
    if (errors.mappings) {
      setErrors(prev => ({ ...prev, mappings: "" }));
    }
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

  // File input accept types
  const getAcceptTypes = () => {
    switch (contentType) {
      case "pdf": return ".pdf";
      case "jpg": return "image/*";
      case "mp4": return "video/*";
      case "mp3": return "audio/*";
      case "html": return ".html,.htm";
      default: return "*/*";
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Build form data
  const buildFormData = () => {
    const formData = new FormData();

    // Add hidden fields
    formData.append("show_hide", display ? "1" : "0");
    formData.append("grade", "1");
    formData.append("standard", String(standard_id));
    console.log("standard_id", standard_id);
    formData.append("subject", String(subject_id));
    console.log("subject_id", subject_id);
    formData.append("chapter", String(chapterId));
    console.log("chapterId", chapterId);

    // Add mappings
    mappings.forEach((map, index) => {
      if (map.mappingType && map.mappingValue) {
        formData.append(`mapping_type[${index}]`, map.mappingType);
        formData.append(`mapping_value[${index}]`, map.mappingValue);
      }
    });

    let finalFileName = "";

    if (contentType === "link") {
      formData.append("file_type", "link");
      formData.append("link", fileLink);
      finalFileName = fileLink;
    } else if (file) {
      formData.append("file_type", contentType);
      formData.append("file", file);
      console.log("📁 Selected file:", file);
      finalFileName = file;
    } else if (content && content.filename) {
      formData.append("file_type", contentType || content.file_type || "");
      formData.append("existing_file", content.filename);
      finalFileName = content.filename;
      console.log("📁 Selected content:", content);
    }

    if (finalFileName) formData.append("filename", finalFileName);

    formData.append("type", "API");
    formData.append("sub_institute_id", sessionInfo?.sub_institute_id || "");
    formData.append("syear", sessionInfo?.syear || 2025);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("prompt", prompt);
    formData.append("restrict_date", restrictDate);
    formData.append("content_category", category);

    // Add meta_tags - include both LMS_ERP and user tags
    const allTags = ["LMS_ERP", ...tags.filter(tag => tag !== "LMS_ERP")];
    formData.append("meta_tags", allTags.join(","));

    formData.append("hid_chapter_id", chapterId || content?.chapter_id || "");
    formData.append("hid_standard_name", standardName || "");
    formData.append("hid_subject_name", courseDisplayName || "");
    formData.append("hid_chapter_name", chapterName || "");
    formData.append("user_id", sessionInfo?.user_id || "");
    formData.append("token", sessionInfo?.token || "");

    return formData;
  };

  // Debug: log all formData
  const logFormData = (formData) => {
    console.log("📦 FormData Preview:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
  };

  // Check if form can be submitted
  const canSubmit = () => {
    const hasValidMapping = mappings.some(mapping => mapping.mappingType && mapping.mappingValue);
    const hasContentType = !!contentType;
    const hasTitle = !!title.trim();
    const hasCategory = !!category;
    
    // Check file/link requirements
    let hasValidFile = true;
    if (contentType === "link") {
      hasValidFile = !!fileLink.trim() && isValidUrl(fileLink);
    } else if (contentType && contentType !== "link") {
      hasValidFile = !!file || !!(content && content.filename);
    }

    return hasValidMapping && hasContentType && hasTitle && hasCategory && hasValidFile;
  };

  // Add handler
  const handleAddContent = async () => {
    if (!validateForm()) {
      alert("Please fill all required fields correctly");
      return;
    }

    try {
      setLoading(true);
      const formData = buildFormData();
      logFormData(formData);

      const apiUrl = `${sessionInfo.url}/lms/content_master`;
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to add content: ${text}`);
      }

      const result = await res.json();
      alert("Content added successfully");

      if (onSave) onSave(result);
      onOpenChange(false);
    } catch (err) {
      console.error("❌ Error adding content:", err);
      alert("Error adding content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit handler
  const handleEditContent = async () => {
    if (!validateForm()) {
      alert("Please fill all required fields correctly");
      return;
    }

    try {
      setLoading(true);
      const formData = buildFormData();
      formData.append("_method", "PUT");
      logFormData(formData);

      const apiUrl = `${sessionInfo.url}/lms/content_master/${content.id}`;
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to edit content: ${text}`);
      }

      const result = await res.json();
      alert("Content updated successfully");

      if (onSave) onSave(result);
      onOpenChange(false);
    } catch (err) {
      console.error("❌ Error editing content:", err);
      alert("Error editing content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (content?.id) {
      handleEditContent();
    } else {
      handleAddContent();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>{content ? "Edit Content" : "Create Content"}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide pr-2">
          <div className="flex flex-col space-y-4">
            {/* Mapping Rows */}
            {mappings.map((map, index) => {
              const availableValues = mappingValues[map.mappingType] || [];
              return (
                <div
                  key={`mapping-${index}`}
                  className="grid grid-cols-12 gap-2 items-end"
                >
                  <div className="col-span-5">
                    <label className="block text-sm font-medium mb-1">
                      Mapping Type{" "}
                      <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
                    </label>
                    <select
                      value={map.mappingType}
                      onChange={(e) =>
                        handleChange(index, "mappingType", e.target.value)
                      }
                      className={`border p-2 rounded w-full ${errors.mappings && !map.mappingType ? 'border-red-500' : ''}`}
                      required
                    >
                      <option value="">Select Mapping Type</option>
                      {mappingTypes.map((type) => (
                        <option key={`type-${type.id}`} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <label className="block text-sm font-medium mb-1">
                      Mapping Value
                      <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                    </label>
                    <select
                      value={map.mappingValue}
                      onChange={(e) =>
                        handleChange(index, "mappingValue", e.target.value)
                      }
                      className={`border p-2 rounded w-full ${errors.mappings && !map.mappingValue ? 'border-red-500' : ''}`}
                      disabled={!map.mappingType}
                      required
                    >
                      <option value="">Select Mapping Value</option>
                      {availableValues.map((val) => (
                        <option key={`val-${val.id}`} value={val.id}>
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
            {errors.mappings && (
              <p className="text-red-500 text-sm -mt-2">{errors.mappings}</p>
            )}

            {/* File Upload Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  File Upload Type{" "}
                  <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                </label>
                <select
                  value={contentType}
                  onChange={(e) => {
                    setContentType(e.target.value);
                    if (errors.contentType) setErrors(prev => ({ ...prev, contentType: "" }));
                  }}
                  className={`border p-2 rounded w-full ${errors.contentType ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="pdf">PDF</option>
                  <option value="jpg">JPG</option>
                  <option value="html">HTML</option>
                  <option value="mp4">Video (MP4)</option>
                  <option value="mp3">Audio (MP3)</option>
                  <option value="link">Link</option>
                </select>
                {errors.contentType && (
                  <p className="text-red-500 text-sm mt-1">{errors.contentType}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {contentType === "link" ? "Enter Link" : "Upload"}
                </label>
                {contentType === "link" ? (
                  <div>
                    <input
                      type="text"
                      value={fileLink}
                      onChange={(e) => {
                        setFileLink(e.target.value);
                        if (errors.fileLink) setErrors(prev => ({ ...prev, fileLink: "" }));
                      }}
                      placeholder="https://example.com/resource"
                      className={`border p-2 rounded w-full ${errors.fileLink ? 'border-red-500' : ''}`}
                    />
                    {errors.fileLink && (
                      <p className="text-red-500 text-sm mt-1">{errors.fileLink}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept={getAcceptTypes()}
                      onChange={(e) => {
                        setFile(e.target.files[0]);
                        if (errors.file) setErrors(prev => ({ ...prev, file: "" }));
                      }}
                      className={`border p-2 rounded w-full ${errors.file ? 'border-red-500' : ''}`}
                    />
                    {errors.file && (
                      <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                    )}
                  </div>
                )}
{                content && content.filename && !file && contentType !== "link" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current file:{" "}
                    <a
                      href={`https://s3-triz.fra1.digitaloceanspaces.com/public/hp_lms_content_file/${content.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      {content.filename}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Title{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
              </label>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
                }}
                className={`border p-2 rounded w-full ${errors.title ? 'border-red-500' : ''}`}
                required
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Restrict Date
                </label>
                <input
                  type="date"
                  placeholder="Restrict Date"
                  value={restrictDate}
                  onChange={(e) => setRestrictDate(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Content Category{" "}
                  <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category) setErrors(prev => ({ ...prev, category: "" }));
                  }}
                  className={`border p-2 rounded w-full ${errors.category ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={`cat-${cat.id}`} value={cat.category_name}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="border p-2 rounded w-full">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map((tag, index) => (
                      <span
                        key={`tag-${index}-${tag}`}
                        className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type and press Enter to add tags"
                    className="w-full outline-none"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={display}
                onChange={(e) => setDisplay(e.target.checked)}
              />
              Display
            </label>

            <div className="flex justify-end gap-2 pt-4 ">
              <Button 
                onClick={handleSave} 
                disabled={loading || !canSubmit()} 
                className="mt-4 mx-auto text-sm px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : content
                    ? "Update"
                    : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContentDialog;