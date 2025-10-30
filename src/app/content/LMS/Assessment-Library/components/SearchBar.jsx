// // import React, { useState } from 'react';
// // import Icon from '../../../../../components/AppIcon';
// // import {Button} from '../../../../../components/ui/button';

// // const SearchBar = ({ searchQuery, onSearchChange, onToggleFilters, isMobile }) => {
// //   const [isFocused, setIsFocused] = useState(false);

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     // Search is handled by onChange, but we can add additional logic here if needed
// //   };

// //   const clearSearch = () => {
// //     onSearchChange('');
// //   };

// //   return (
// //     <div className="flex items-center space-x-3 mb-6">
// //       {/* Search Form */}
// //       <form onSubmit={handleSubmit} className="flex-1">
// //         <div className="relative">
// //           <Icon 
// //             name="Search" 
// //             size={20} 
// //             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
// //           />
// //           <input
// //             type="text"
// //             placeholder="Search assessments by  due date, Course, or Industry..."
// //             value={searchQuery}
// //             onChange={(e) => onSearchChange(e.target.value)}
// //             onFocus={() => setIsFocused(true)}
// //             onBlur={() => setIsFocused(false)}
// //             className={`w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
// //               isFocused ? 'shadow-floating' : 'shadow-soft'
// //             }`}
// //           />
// //           {searchQuery && (
// //             <Button
// //               type="button"
// //               variant="ghost"
// //               size="icon"
// //               onClick={clearSearch}
// //               className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-muted"
// //             >
// //               <Icon name="X" size={16} />
// //             </Button>
// //           )}
// //         </div>
// //       </form>

// //       {/* Filter Toggle Button - Mobile Only */}
// //       {isMobile && (
// //         <Button
// //           variant="outline"
// //           onClick={onToggleFilters}
// //           className="flex-shrink-0"
// //         >
// //           <Icon name="Filter" size={16} className="mr-2" />
// //           Filters
// //         </Button>
// //       )}
// //     </div>
// //   );
// // };

// // export default SearchBar;

// import React, { useState } from "react";
// import Icon from "../../../../../components/AppIcon";
// import { Button } from "../../../../../components/ui/button";

// const skillCategories = [
//   "Cognitive & Thinking",
//   "Compliance & Regulatory",
//   "Digital & Data",
//   "Functional",
//   "Leadership & Management",
//   "Soft",
//   "Technical",
// ];

// const taskCategories = [
//   "Analysis & Problem Solving",
//   "Client/Stakeholder Interaction",
//   "Compliance & Reporting",
//   "Creative/Innovation",
//   "Customer Success & Aftercare",
//   "Documentation & Knowledge Management",
//   "Learning & Development",
//   "Marketing & Outreach",
//   "Planning & Strategy",
//   "Process & Operations Execution",
//   "Procurement & Resource Management",
//   "Quality Assurance & Improvement",
//   "Risk Management & Incident Response",
//   "Supervision & Team Management",
//   "Technology & Systems Administration",
// ];

// const SearchBar = ({ searchQuery, onSearchChange, onToggleFilters, isMobile }) => {
//   const [isFocused, setIsFocused] = useState(false);
//   const [selectedLevel1, setSelectedLevel1] = useState(""); // None selected initially
//   const [selectedCategory, setSelectedCategory] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//   };

//   const clearSearch = () => {
//     onSearchChange("");
//   };

//   const renderLevel2Buttons = () => {
//     if (!selectedLevel1) return null;

//     let categories = [];
//     if (selectedLevel1 === "Skill") categories = skillCategories;
//     else if (selectedLevel1 === "Task") categories = taskCategories;
//     else if (selectedLevel1 === "All") categories = [...skillCategories, ...taskCategories];

//     return (
//       <div className="flex flex-wrap justify-center gap-3 mt-4">
//         {categories.map((cat) => (
//           <Button
//             key={cat}
//             variant={selectedCategory === cat ? "default" : "outline"}
//             onClick={() => setSelectedCategory(cat)}
//             className={`rounded-full text-sm transition px-4 py-2 border 
//               ${
//                 selectedCategory === cat
//                   ? "bg-blue-300 text-white hover:bg-blue-400"
//                   : "bg-transparent text-foreground border-border hover:border-blue-400 hover:text-blue-400"
//               }`}
//           >
//             {cat}
//           </Button>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6 mb-6">
//       {/* Search Bar */}
//       <div className="flex items-center space-x-3">
//         <form onSubmit={handleSubmit} className="flex-1">
//           <div className="relative">
//             <Icon
//               name="Search"
//               size={20}
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
//             />
//             <input
//               type="text"
//               placeholder="Search assessments by due date, Course, or Industry..."
//               value={searchQuery}
//               onChange={(e) => onSearchChange(e.target.value)}
//               onFocus={() => setIsFocused(true)}
//               onBlur={() => setIsFocused(false)}
//               className={`w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
//                 isFocused ? "shadow-floating" : "shadow-soft"
//               }`}
//             />
//             {searchQuery && (
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 onClick={clearSearch}
//                 className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-muted"
//               >
//                 <Icon name="X" size={16} />
//               </Button>
//             )}
//           </div>
//         </form>

//         {/* Filter Button (Mobile Only) */}
//         {isMobile && (
//           <Button variant="outline" onClick={onToggleFilters} className="flex-shrink-0">
//             <Icon name="Filter" size={16} className="mr-2" />
//             Filters
//           </Button>
//         )}
//       </div>

//       {/* Level 1 Buttons (Centered) */}
//       <div className="flex justify-center flex-wrap gap-4">
//         {["All", "Skill", "Task"].map((level) => (
//           <Button
//             key={level}
//             variant={selectedLevel1 === level ? "default" : "outline"}
//             onClick={() =>
//               setSelectedLevel1(selectedLevel1 === level ? "" : level) // Toggle
//             }
//             className={`rounded-full text-sm px-6 py-2 transition border 
//               ${
//                 selectedLevel1 === level
//                   ? "bg-blue-300 text-white hover:bg-blue-400"
//                   : "bg-transparent text-foreground border-border hover:border-blue-400 hover:text-blue-400"
//               }`}
//           >
//             {level}
//           </Button>
//         ))}
//       </div>

//       {/* Level 2 Buttons (Show only after Level 1 selection) */}
//       {renderLevel2Buttons()}
//     </div>
//   );
// };

// export default SearchBar;

import React, { useState, useEffect } from "react";
import Icon from "../../../../../components/AppIcon";
import { Button } from "../../../../../components/ui/button";

const SearchBar = ({ searchQuery, onSearchChange, onToggleFilters, isMobile }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedLevel1, setSelectedLevel1] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [skillCategories, setSkillCategories] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // ✅ Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const { APP_URL, token, sub_institute_id, org_type, user_id } = parsedData;
        
        // Ensure URL has proper format (add trailing slash if missing)
        let formattedUrl = APP_URL || '';
        if (formattedUrl && !formattedUrl.endsWith('/')) {
          formattedUrl += '/';
        }

        setSessionData({
          url: formattedUrl,
          token: token || '',
          subInstituteId: sub_institute_id || '',
          orgType: org_type || '',
          userId: user_id || '',
        });
        setIsSessionLoaded(true);
      } catch (err) {
        console.error("Error parsing userData from localStorage:", err);
        setError("Failed to load user data");
        setIsSessionLoaded(true);
      }
    } else {
      setIsSessionLoaded(true);
    }
  }, []);

  // API URLs - constructed after sessionData is loaded
  const SKILL_API_URL = sessionData.url && sessionData.token 
    ? `${sessionData.url}search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${encodeURIComponent(sessionData.orgType)}&searchType=skillTaxonomy&searchWord=skillTaxonomy`
    : null;

  const TASK_API_URL = sessionData.url && sessionData.token
    ? `${sessionData.url}api/job-role-tasks?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}`
    : null;

  // Fetch skill categories
  const fetchSkillCategories = async () => {
    if (!SKILL_API_URL) {
      setError("Skill API URL not available");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate URL format
      if (!SKILL_API_URL.startsWith('http')) {
        throw new Error(`Invalid API URL: ${SKILL_API_URL}`);
      }

      const response = await fetch(SKILL_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract category names from the API response
      if (Array.isArray(data)) {
        const categories = data.map(item => item.category_name).filter(Boolean);
        setSkillCategories(categories);
      } else {
        console.warn("Unexpected API response format for skills:", data);
        setSkillCategories([]);
      }
    } catch (err) {
      console.error("Error fetching skill categories:", err);
      setError("Failed to load skill categories: " + err.message);
      setSkillCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch task categories
  const fetchTaskCategories = async () => {
    if (!TASK_API_URL) {
      setError("Task API URL not available");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate URL format
      if (!TASK_API_URL.startsWith('http')) {
        throw new Error(`Invalid API URL: ${TASK_API_URL}`);
      }

      const response = await fetch(TASK_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract task categories from the API response
      if (data && Array.isArray(data.data)) {
        const categories = data.data.map(item => item.task_category).filter(Boolean);
        // Remove duplicates
        const uniqueCategories = [...new Set(categories)];
        setTaskCategories(uniqueCategories);
      } else {
        console.warn("Unexpected API response format for tasks:", data);
        setTaskCategories([]);
      }
    } catch (err) {
      console.error("Error fetching task categories:", err);
      setError("Failed to load task categories: " + err.message);
      setTaskCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories when selectedLevel1 changes and sessionData is available
  useEffect(() => {
    if (!isSessionLoaded || !sessionData.token || !sessionData.url) {
      return; // Wait for session data to be loaded
    }

    if (selectedLevel1 === "Skill" && skillCategories.length === 0) {
      fetchSkillCategories();
    } else if (selectedLevel1 === "Task" && taskCategories.length === 0) {
      fetchTaskCategories();
    } else if (selectedLevel1 === "All" && (skillCategories.length === 0 || taskCategories.length === 0)) {
      Promise.all([fetchSkillCategories(), fetchTaskCategories()]);
    }
  }, [selectedLevel1, sessionData, isSessionLoaded]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const clearSearch = () => {
    onSearchChange("");
  };

  const handleLevel1Select = (level) => {
    if (selectedLevel1 === level) {
      // Deselect if same level is clicked again
      setSelectedLevel1("");
      setSelectedCategory("");
    } else {
      setSelectedLevel1(level);
      setSelectedCategory("");
    }
  };

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      // Deselect if same category is clicked again
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
      // You can add additional logic here to filter assessments based on the selected category
    }
  };

  const renderLevel2Buttons = () => {
    if (!selectedLevel1) return null;

    let categories = [];
    if (selectedLevel1 === "Skill") categories = skillCategories;
    else if (selectedLevel1 === "Task") categories = taskCategories;
    else if (selectedLevel1 === "All") categories = [...skillCategories, ...taskCategories];

    if (loading) {
      return (
        <div className="flex justify-center mt-4">
          <div className="text-muted-foreground flex items-center">
            <Icon name="Loader" size={16} className="mr-2 animate-spin" />
            Loading categories...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center mt-4">
          <div className="text-destructive text-sm flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-2" />
            {error}
          </div>
        </div>
      );
    }

    if (categories.length === 0 && !loading) {
      return (
        <div className="flex justify-center mt-4">
          <div className="text-muted-foreground text-sm">No categories available</div>
        </div>
      );
    }

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

  // Show loading if session data is not yet loaded
  if (!isSessionLoaded) {
    return (
      <div className="space-y-6 mb-6">
        <div className="flex items-center space-x-3">
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <Icon
                name="Search"
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Loading..."
                disabled
                className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg text-sm text-muted-foreground"
              />
            </div>
          </form>
          {isMobile && (
            <Button variant="outline" disabled className="flex-shrink-0">
              <Icon name="Filter" size={16} className="mr-2" />
              Filters
            </Button>
          )}
        </div>
        <div className="flex justify-center">
          <div className="text-muted-foreground flex items-center">
            <Icon name="Loader" size={16} className="mr-2 animate-spin" />
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            <Icon
              name="Search"
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search assessments by due date, Course, or Industry..."
              value={searchQuery || ""} // ✅ Fix: Ensure value is never undefined
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
                <Icon name="X" size={16} />
              </Button>
            )}
          </div>
        </form>

        {/* Filter Button (Mobile Only) */}
        {isMobile && (
          <Button variant="outline" onClick={onToggleFilters} className="flex-shrink-0">
            <Icon name="Filter" size={16} className="mr-2" />
            Filters
          </Button>
        )}
      </div>

      {/* Level 1 Buttons (Centered) */}
      <div className="flex justify-center flex-wrap gap-4">
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
              <Icon name="Loader" size={14} className="ml-2 animate-spin" />
            )}
          </Button>
        ))}
      </div>

      {/* Level 2 Buttons (Show only after Level 1 selection) */}
      {renderLevel2Buttons()}
    </div>
  );
};

export default SearchBar;

