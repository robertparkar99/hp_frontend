// import React, { useState } from 'react';
// import Icon from '../../../../../components/AppIcon';
// import {Button} from '../../../../../components/ui/button';

// const SearchBar = ({ searchQuery, onSearchChange, onToggleFilters, isMobile }) => {
//   const [isFocused, setIsFocused] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Search is handled by onChange, but we can add additional logic here if needed
//   };

//   const clearSearch = () => {
//     onSearchChange('');
//   };

//   return (
//     <div className="flex items-center space-x-3 mb-6">
//       {/* Search Form */}
//       <form onSubmit={handleSubmit} className="flex-1">
//         <div className="relative">
//           <Icon 
//             name="Search" 
//             size={20} 
//             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
//           />
//           <input
//             type="text"
//             placeholder="Search assessments by  due date, Course, or Industry..."
//             value={searchQuery}
//             onChange={(e) => onSearchChange(e.target.value)}
//             onFocus={() => setIsFocused(true)}
//             onBlur={() => setIsFocused(false)}
//             className={`w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
//               isFocused ? 'shadow-floating' : 'shadow-soft'
//             }`}
//           />
//           {searchQuery && (
//             <Button
//               type="button"
//               variant="ghost"
//               size="icon"
//               onClick={clearSearch}
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-muted"
//             >
//               <Icon name="X" size={16} />
//             </Button>
//           )}
//         </div>
//       </form>

//       {/* Filter Toggle Button - Mobile Only */}
//       {isMobile && (
//         <Button
//           variant="outline"
//           onClick={onToggleFilters}
//           className="flex-shrink-0"
//         >
//           <Icon name="Filter" size={16} className="mr-2" />
//           Filters
//         </Button>
//       )}
//     </div>
//   );
// };

// export default SearchBar;

import React, { useState } from "react";
import Icon from "../../../../../components/AppIcon";
import { Button } from "../../../../../components/ui/button";

const skillCategories = [
  "Cognitive & Thinking",
  "Compliance & Regulatory",
  "Digital & Data",
  "Functional",
  "Leadership & Management",
  "Soft",
  "Technical",
];

const taskCategories = [
  "Analysis & Problem Solving",
  "Client/Stakeholder Interaction",
  "Compliance & Reporting",
  "Creative/Innovation",
  "Customer Success & Aftercare",
  "Documentation & Knowledge Management",
  "Learning & Development",
  "Marketing & Outreach",
  "Planning & Strategy",
  "Process & Operations Execution",
  "Procurement & Resource Management",
  "Quality Assurance & Improvement",
  "Risk Management & Incident Response",
  "Supervision & Team Management",
  "Technology & Systems Administration",
];

const SearchBar = ({ searchQuery, onSearchChange, onToggleFilters, isMobile }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedLevel1, setSelectedLevel1] = useState(""); // None selected initially
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const clearSearch = () => {
    onSearchChange("");
  };

  const renderLevel2Buttons = () => {
    if (!selectedLevel1) return null;

    let categories = [];
    if (selectedLevel1 === "Skill") categories = skillCategories;
    else if (selectedLevel1 === "Task") categories = taskCategories;
    else if (selectedLevel1 === "All") categories = [...skillCategories, ...taskCategories];

    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
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
              value={searchQuery}
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
            onClick={() =>
              setSelectedLevel1(selectedLevel1 === level ? "" : level) // Toggle
            }
            className={`rounded-full text-sm px-6 py-2 transition border 
              ${
                selectedLevel1 === level
                  ? "bg-blue-300 text-white hover:bg-blue-400"
                  : "bg-transparent text-foreground border-border hover:border-blue-400 hover:text-blue-400"
              }`}
          >
            {level}
          </Button>
        ))}
      </div>

      {/* Level 2 Buttons (Show only after Level 1 selection) */}
      {renderLevel2Buttons()}
    </div>
  );
};

export default SearchBar;

