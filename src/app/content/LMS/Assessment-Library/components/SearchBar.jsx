

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Settings,
  Sparkles,
  Download,
  Upload,
  Loader,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";

/* ---------------------- 🔍 Search Bar with Inline Toolbar ---------------------- */
const SearchBar = ({ searchQuery, onSearchChange, onToggleFilters, isMobile }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedLevel1, setSelectedLevel1] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [skillCategories, setSkillCategories] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // ✅ Load session data
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const { APP_URL, token, sub_institute_id, org_type, user_id } = parsedData;
        let formattedUrl = APP_URL || "";
        if (formattedUrl && !formattedUrl.endsWith("/")) formattedUrl += "/";

        setSessionData({
          url: formattedUrl,
          token: token || "",
          subInstituteId: sub_institute_id || "",
          orgType: org_type || "",
          userId: user_id || "",
        });
        setIsSessionLoaded(true);
      } catch (err) {
        console.error("Error parsing userData:", err);
        setError("Failed to load user data");
        setIsSessionLoaded(true);
      }
    } else {
      setIsSessionLoaded(true);
    }
  }, []);

  const SKILL_API_URL =
    sessionData.url && sessionData.token
      ? `${sessionData.url}search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${encodeURIComponent(sessionData.orgType)}&searchType=skillTaxonomy&searchWord=skillTaxonomy`
      : null;

  const TASK_API_URL =
    sessionData.url && sessionData.token
      ? `${sessionData.url}api/job-role-tasks?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}`
      : null;

  const fetchSkillCategories = async () => {
    if (!SKILL_API_URL) return setError("Skill API URL not available");
    try {
      setLoading(true);
      const response = await fetch(SKILL_API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const categories = data.map((item) => item.category_name).filter(Boolean);
        setSkillCategories(categories);
      } else setSkillCategories([]);
    } catch (err) {
      console.error(err);
      setError("Failed to load skill categories: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskCategories = async () => {
    if (!TASK_API_URL) return setError("Task API URL not available");
    try {
      setLoading(true);
      const response = await fetch(TASK_API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        const categories = [...new Set(data.data.map((item) => item.task_category).filter(Boolean))];
        setTaskCategories(categories);
      } else setTaskCategories([]);
    } catch (err) {
      console.error(err);
      setError("Failed to load task categories: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSessionLoaded || !sessionData.token || !sessionData.url) return;
    if (selectedLevel1 === "Skill" && skillCategories.length === 0) fetchSkillCategories();
    else if (selectedLevel1 === "Task" && taskCategories.length === 0) fetchTaskCategories();
    else if (selectedLevel1 === "All" && (skillCategories.length === 0 || taskCategories.length === 0))
      Promise.all([fetchSkillCategories(), fetchTaskCategories()]);
  }, [selectedLevel1, sessionData, isSessionLoaded]);

  const clearSearch = () => onSearchChange("");
  const handleLevel1Select = (level) =>
    setSelectedLevel1(selectedLevel1 === level ? "" : level);
  const handleCategorySelect = (category) =>
    setSelectedCategory(selectedCategory === category ? "" : category);

  const renderLevel2Buttons = () => {
    if (!selectedLevel1) return null;
    let categories = [];
    if (selectedLevel1 === "Skill") categories = skillCategories;
    else if (selectedLevel1 === "Task") categories = taskCategories;
    else if (selectedLevel1 === "All") categories = [...skillCategories, ...taskCategories];

    if (loading)
      return (
        <div className="flex justify-center mt-4 text-muted-foreground flex items-center">
          <Loader size={16} className="mr-2 animate-spin" /> Loading categories...
        </div>
      );

    if (error)
      return (
        <div className="flex justify-center mt-4 text-destructive text-sm flex items-center">
          <AlertCircle size={16} className="mr-2" /> {error}
        </div>
      );

    if (categories.length === 0)
      return (
        <div className="flex justify-center mt-4 text-muted-foreground text-sm">
          No categories available
        </div>
      );

    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {categories.map((cat, index) => (
          <Button
            key={index}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => handleCategorySelect(cat)}
            className={`rounded-full text-sm transition px-4 py-2 border 
              ${
                selectedCategory === cat
                  ? "bg-blue-300 text-white hover:bg-blue-400"
                  : "bg-transparent text-foreground border-border hover:border-blue-400 hover:text-blue-400"
              }`}
          >
            {cat}
          </Button>
        ))}
      </div>
    );
  };

  if (!isSessionLoaded)
    return (
      <div className="space-y-6 mb-6 flex justify-center items-center text-muted-foreground">
        <Loader size={16} className="mr-2 animate-spin" /> Loading...
      </div>
    );

  return (
    <div className="space-y-6 mb-6">
      {/* 🔝 Search Bar Row with Toolbar in Between */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Search Input */}
        <form className="flex-1 min-w-[260px]">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search assessments by name, date, course, or industry..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                isFocused ? "shadow-floating" : "shadow-soft"
              }`}
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-muted"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </form>

        {/* 🔹 Toolbar Buttons (Inline between Search & Filter) */}
        <div className="flex items-center">
          
          <Button variant="ghost" size="icon" title="Sort by name/date/status">
            <ArrowUpDown size={18} />
          </Button>
          <Button variant="ghost" size="icon" title="Refresh assessment list">
            <RotateCcw size={18} />
          </Button>
          <Button variant="ghost" size="icon" title="Manage fields / display settings">
            <Settings size={18} />
          </Button>
          <Button variant="ghost" size="icon" title="Export assessment data">
            <Download size={18} />
          </Button>
          <Button variant="ghost" size="icon" title="Import assessments from file">
            <Upload size={18} />
          </Button>
        </div>

      </div>

      {/* 🧭 Level 1 Filter Buttons */}
      <div className="flex justify-center flex-wrap gap-4 mt-4">
        {["All", "Skill", "Task"].map((level) => (
          <Button
            key={level}
            variant={selectedLevel1 === level ? "default" : "outline"}
            onClick={() => handleLevel1Select(level)}
            className={`rounded-full text-sm px-6 py-2 transition border 
              ${
                selectedLevel1 === level
                  ? "bg-blue-300 text-white hover:bg-blue-400"
                  : "bg-transparent text-foreground border-border hover:border-blue-400 hover:text-blue-400"
              }`}
            disabled={loading || !sessionData.token}
          >
            {level}
            {loading && selectedLevel1 === level && (
              <Loader size={14} className="ml-2 animate-spin" />
            )}
          </Button>
        ))}
      </div>

      {/* 🧩 Level 2 Category Buttons */}
      {renderLevel2Buttons()}
    </div>
  );
};

export default SearchBar;
