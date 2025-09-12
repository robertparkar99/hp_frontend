


"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";

const AddCourseDialog = ({ open, onOpenChange, onSave, course }) => {
  // Input fields
  const [sortOrder, setSortOrder] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayImage, setDisplayImage] = useState(null);
  const [subjectCategory, setSubjectCategory] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectType, setSubjectType] = useState("");
  const [shortName, setShortName] = useState("");
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState(true);

  // Additional fields
  const [standardId, setStandardId] = useState("");

  // Standards data
  const [standards, setStandards] = useState([]);
  const [loadingStandards, setLoadingStandards] = useState(false);

  // Session data
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    sub_institute_id: "",
    user_id: "",
  });

  // Load session info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, user_id } =
        JSON.parse(userData);

      setSessionData({
        url: APP_URL,
        token,
        sub_institute_id,
        user_id,
      });
    }
  }, []);

  // Fetch standards data
  useEffect(() => {
    const fetchStandards = async () => {
      if (!sessionData.sub_institute_id || !sessionData.url) return;
      try {
        setLoadingStandards(true);
        const res = await fetch(
          `${sessionData.url}/table_data?table=standard&filters[sub_institute_id]=${sessionData.sub_institute_id}&order_by[column]=sort_order`
        );
        const data = await res.json();

        console.log("✅ Standards API Response:", data);
        
        // Handle different response formats
        if (data && data.data) {
          setStandards(data.data);
        } else if (Array.isArray(data)) {
          setStandards(data);
        } else {
          console.error("Unexpected API response format:", data);
          setStandards([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch standards:", err);
        setStandards([]);
      } finally {
        setLoadingStandards(false);
      }
    };

    if (open) {
      fetchStandards();
    }
  }, [open, sessionData]);

  // Build form data
  const buildFormData = () => {
    const formData = new FormData();

    // Add all required fields
    formData.append("type", "API");
    formData.append("formType", "course");
    formData.append("subject_id", "0");
    formData.append("allow_grades", "Yes");
     formData.append("allow_content", "Yes");
    formData.append("elective_subject", "No");
    formData.append("add_content", "chapterwise");
    formData.append("status", display ? "1" : "0");

    // Add session fields
    formData.append("sub_institute_id", sessionData.sub_institute_id);
    formData.append("user_id", sessionData.user_id);
    formData.append("token", sessionData.token);

    // Add input fields
    formData.append("sort_order", sortOrder);
    formData.append("display_name", displayName);
    
    if (displayImage) {
      formData.append("display_image", displayImage);
    }
    
    formData.append("subject_category", subjectCategory);
    formData.append("subject_code", subjectCode);
    formData.append("subject_type", subjectType);
    formData.append("short_name", shortName);
    formData.append("standard_id", standardId);

    return formData;
  };

  // Add / Update course
  const handleAddCourse = async () => {
    // Validate required fields
    if (!displayName) {
      alert("Please enter a course name");
      return;
    }
    
    if (!standardId) {
      alert("Please select a standard");
      return;
    }

    try {
      setLoading(true);
      const formData = buildFormData();

      const res = await fetch(`${sessionData.url}/school_setup/master_setup`, {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      console.log("API Response:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        alert("Course added successfully");
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        throw new Error(result.message || "Failed to add course");
      }
      
      // Transform API response to match expected course format
      const courseData = {
        id: result.id || Date.now(),
        subject_id: result.subject_id || 0,
        standard_id: parseInt(standardId) || 0,
        title: result.display_name || displayName,
        description: result.subject_category || subjectCategory,
        thumbnail: result.display_image_url || null,
        contentType: "course",
        category: result.subject_category || subjectCategory,
        difficulty: "beginner",
        short_name: result.short_name || shortName,
        subject_type: result.subject_type || subjectType,
        progress: 0,
        instructor: "Admin",
        isNew: true,
        isMandatory: false,
        // Additional fields from API response
        display_name: result.display_name || displayName,
        subject_category: result.subject_category || subjectCategory,
        subject_code: result.subject_code || subjectCode,
        sort_order: result.sort_order || sortOrder,
        status: result.status || (display ? "1" : "0")
      };
      
      onSave(courseData);
      onOpenChange(false);
    } catch (err) {
      console.error("❌ Error adding course:", err);
      alert("Error adding course: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Populate fields when editing
  useEffect(() => {
    if (course) {
      setSortOrder(course.sort_order || "");
      setDisplayName(course.display_name || course.title || "");
      setSubjectCategory(course.subject_category || course.category || " ");
      setSubjectCode(course.subject_code || "");
      setSubjectType(course.subject_type || "");
      setShortName(course.short_name || "");
      setStandardId(course.standard_id?.toString() || "");
      setDisplay(
        course.status === "1" ||
          course.status === 1 ||
          course.status === true
      );
    } else {
      setSortOrder("");
      setDisplayName("");
      setSubjectCategory("");
      setSubjectCode("");
      setSubjectType("");
      setShortName("");
      setStandardId("");
      setDisplay(true);
    }
    setDisplayImage(null); // Always reset image
  }, [course, open]);

  const handleImageChange = () => {
    if (e.target.files && e.target.files[0]) {
      setDisplayImage(e.target.files[0]);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Add Course"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Name{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <input
                type="text"
                placeholder="Enter course name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            {/* Display Image */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Display Image{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                className="border p-2 rounded w-full"
                accept="image/*"
                required
              />
            </div>

            {/* Short Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Short Name{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> 
              </label>
              <input
                type="text"
                placeholder="Enter short name"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            {/* Course Code */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Code
              </label>
              <input
                type="text"
                placeholder="Enter course code"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            {/* Course Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Type
              </label>
              <input
                type="text"
                placeholder="Enter course type"
                value={subjectType}
                onChange={(e) => setSubjectType(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            {/* Course Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Category
              </label>
              <input
                type="text"
                placeholder="Enter course category"
                value={subjectCategory}
                onChange={(e) => setSubjectCategory(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Type{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span> </label>
              <select
                value={standardId}
                onChange={(e) => setStandardId(e.target.value)}
                className="border p-2 rounded w-full"
                disabled={loadingStandards}
                required
              >
                <option value="">Select Standard</option>
                {standards.map((standard) => (
                  <option key={standard.id} value={standard.id}>
                    {standard.standard_name || standard.name || `Standard ${standard.id}`}
                  </option>
                ))}
              </select>
              {loadingStandards && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading standards...
                </p>
              )}
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Sort Order
              </label>
              <input
                type="number"
                placeholder="Enter sort order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            {/* Display Toggle */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={display}
                  onChange={(e) => setDisplay(e.target.checked)}
                />
                Display
              </label>
            </div>
          </div>

          <Button
            onClick={handleAddCourse}
            className="mt-4 mx-auto px-4 py-2 text-sm"
            disabled={loading || loadingStandards}
          >
            {loading ? "Processing..." : course ? "Update" : "Add"} Course
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;
