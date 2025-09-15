// // import React from 'react';
// // import Icon from '../../../components/AppIcon';
// // import Button from '../../../components/ui/Button';
// // import Select from '../../../components/ui/Select';
// // import { Checkbox } from '../../../components/ui/Checkbox';

// // const FilterPanel = ({ 
// //   filters, 
// //   onFiltersChange, 
// //   isOpen, 
// //   onClose, 
// //   isMobile 
// // }) => {
// //   const categoryOptions = [
// //     { value: 'all', label: 'All Categories' },
// //     { value: 'job role', label: 'Job Role' },
// //     { value: 'skill', label: 'Skill' },
// //     { value: 'task', label: 'Task' }
// //   ];

// //   const difficultyOptions = [
// //     { value: 'all', label: 'All Difficulties' },
// //     { value: 'easy', label: 'Easy' },
// //     { value: 'medium', label: 'Medium' },
// //     { value: 'hard', label: 'Hard' }
// //   ];

// //   const statusOptions = [
// //     { value: 'all', label: 'All Status' },
// //     { value: 'not attempted', label: 'Not Attempted' },
// //     { value: 'in progress', label: 'In Progress' },
// //     { value: 'completed', label: 'Completed' },
// //     { value: 'failed', label: 'Failed' }
// //   ];

// //   const sortOptions = [
// //     { value: 'deadline', label: 'Sort by Deadline' },
// //     { value: 'difficulty', label: 'Sort by Difficulty' },
// //     { value: 'duration', label: 'Sort by Duration' },
// //     { value: 'alphabetical', label: 'Sort Alphabetically' }
// //   ];

// //   const handleFilterChange = (key, value) => {
// //     onFiltersChange({ ...filters, [key]: value });
// //   };

// //   const handleCheckboxChange = (key, checked) => {
// //     onFiltersChange({ ...filters, [key]: checked });
// //   };

// //   const clearFilters = () => {
// //     onFiltersChange({
// //       category: 'all',
// //       difficulty: 'all',
// //       status: 'all',
// //       sortBy: 'deadline',
// //       showUrgentOnly: false,
// //       showAvailableOnly: false
// //     });
// //   };

// //   const panelContent = (
// //     <div className="space-y-4 text-sm">
// //       {/* Header */}
// //       <div className="flex items-center justify-between">
// //         <h3 className="font-semibold text-foreground text-base">Filters</h3>
// //         {isMobile && (
// //           <Button variant="ghost" size="icon" onClick={onClose}>
// //             <Icon name="X" size={18} />
// //           </Button>
// //         )}
// //       </div>

// //       {/* Category Filter */}
// //       <Select
// //         label="Category"
// //         options={categoryOptions}
// //         value={filters.category}
// //         onChange={(value) => handleFilterChange('category', value)}
// //       />

// //       {/* Difficulty Filter */}
// //       <Select
// //         label="Difficulty"
// //         options={difficultyOptions}
// //         value={filters.difficulty}
// //         onChange={(value) => handleFilterChange('difficulty', value)}
// //       />

// //       {/* Status Filter */}
// //       <Select
// //         label="Status"
// //         options={statusOptions}
// //         value={filters.status}
// //         onChange={(value) => handleFilterChange('status', value)}
// //       />

// //       {/* Sort Options */}
// //       <Select
// //         label="Sort By"
// //         options={sortOptions}
// //         value={filters.sortBy}
// //         onChange={(value) => handleFilterChange('sortBy', value)}
// //       />

// //       {/* Quick Filters */}
// //       <div className="space-y-2">
// //         <Checkbox
// //           label="Urgent only"
// //           checked={filters.showUrgentOnly}
// //           onChange={(e) => handleCheckboxChange('showUrgentOnly', e.target.checked)}
// //         />
// //         <Checkbox
// //           label="Available only"
// //           checked={filters.showAvailableOnly}
// //           onChange={(e) => handleCheckboxChange('showAvailableOnly', e.target.checked)}
// //         />
// //       </div>

// //       {/* Clear Filters */}
// //       <Button
// //         variant="outline"
// //         fullWidth
// //         size="sm"
// //         onClick={clearFilters}
// //         iconName="RotateCcw"
// //         iconPosition="left"
// //       >
// //         Clear All
// //       </Button>
// //     </div>
// //   );

// //   if (isMobile) {
// //     return (
// //       <>
// //         {/* Backdrop */}
// //         {isOpen && (
// //           <div 
// //             className="fixed inset-0 bg-black/50 z-40"
// //             onClick={onClose}
// //           />
// //         )}

// //         {/* Slide Panel */}
// //         <div
// //           className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${
// //             isOpen ? 'translate-x-0' : 'translate-x-full'
// //           }`}
// //         >
// //           <div className="p-6 h-full overflow-y-auto">{panelContent}</div>
// //         </div>
// //       </>
// //     );
// //   }

// //   // Desktop Sidebar (always visible)
// //   return (
// //     <div className="w-64 border-l border-border bg-background p-4 h-full overflow-y-auto">
// //       {panelContent}
// //     </div>
// //   );
// // };

// // export default FilterPanel;
// import React from 'react';
// import Icon from '../../../components/AppIcon';
// import Button from '../../../components/ui/Button';
// import Select from '../../../components/ui/Select';
// import { Checkbox } from '../../../components/ui/Checkbox';

// const FilterPanel = ({ 
//   filters, 
//   onFiltersChange, 
//   isOpen, 
//   onClose, 
//   isMobile 
// }) => {
//   const categoryOptions = [
//     { value: 'all', label: 'All Categories' },
//     { value: 'job role', label: 'Job Role' },
//     { value: 'skill', label: 'Skill' },
//     { value: 'task', label: 'Task' }
//   ];

//   const difficultyOptions = [
//     { value: 'all', label: 'All Difficulties' },
//     { value: 'easy', label: 'Easy' },
//     { value: 'medium', label: 'Medium' },
//     { value: 'hard', label: 'Hard' }
//   ];

//   const statusOptions = [
//     { value: 'all', label: 'All Status' },
//     { value: 'not attempted', label: 'Not Attempted' },
//     { value: 'in progress', label: 'In Progress' },
//     { value: 'completed', label: 'Completed' },
//     { value: 'failed', label: 'Failed' }
//   ];

//   const sortOptions = [
//     { value: 'deadline', label: 'Sort by Deadline' },
//     { value: 'difficulty', label: 'Sort by Difficulty' },
//     { value: 'duration', label: 'Sort by Duration' },
//     { value: 'alphabetical', label: 'Sort Alphabetically' }
//   ];

//   const handleFilterChange = (key, value) => {
//     onFiltersChange({
//       ...filters,
//       [key]: value
//     });
//   };

//   const handleCheckboxChange = (key, checked) => {
//     onFiltersChange({
//       ...filters,
//       [key]: checked
//     });
//   };

//   const clearFilters = () => {
//     onFiltersChange({
//       category: 'all',
//       difficulty: 'all',
//       status: 'all',
//       sortBy: 'deadline',
//       showUrgentOnly: false,
//       showAvailableOnly: false
//     });
//   };

//   const panelContent = (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-foreground">Filters</h3>
//         {isMobile && (
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <Icon name="X" size={20} />
//           </Button>
//         )}
//       </div>

//       {/* Category Filter */}
//       <div>
//         <Select
//           label="Category"
//           options={categoryOptions}
//           value={filters.category}
//           onChange={(value) => handleFilterChange('category', value)}
//         />
//       </div>

//       {/* Difficulty Filter */}
//       <div>
//         <Select
//           label="Difficulty Level"
//           options={difficultyOptions}
//           value={filters.difficulty}
//           onChange={(value) => handleFilterChange('difficulty', value)}
//         />
//       </div>

//       {/* Status Filter */}
//       <div>
//         <Select
//           label="Completion Status"
//           options={statusOptions}
//           value={filters.status}
//           onChange={(value) => handleFilterChange('status', value)}
//         />
//       </div>

//       {/* Sort Options */}
//       <div>
//         <Select
//           label="Sort By"
//           options={sortOptions}
//           value={filters.sortBy}
//           onChange={(value) => handleFilterChange('sortBy', value)}
//         />
//       </div>

//       {/* Quick Filters */}
//       <div className="space-y-3">
//         <h4 className="text-sm font-medium text-foreground">Quick Filters</h4>

//         <Checkbox
//           label="Show urgent deadlines only"
//           checked={filters.showUrgentOnly}
//           onChange={(e) => handleCheckboxChange('showUrgentOnly', e.target.checked)}
//         />

//         <Checkbox
//           label="Show available assessments only"
//           checked={filters.showAvailableOnly}
//           onChange={(e) => handleCheckboxChange('showAvailableOnly', e.target.checked)}
//         />
//       </div>

//       {/* Clear Filters */}
//       <div className="pt-4 border-t border-border">
//         <Button
//           variant="outline"
//           fullWidth
//           onClick={clearFilters}
//           iconName="RotateCcw"
//           iconPosition="left"
//         >
//           Clear All Filters
//         </Button>
//       </div>
//     </div>
//   );

//   if (isMobile) {
//     return (
//       <>
//         {/* Mobile Backdrop */}
//         {isOpen && (
//           <div 
//             className="fixed inset-0 bg-black bg-opacity-50 z-40"
//             onClick={onClose}
//           />
//         )}

//         {/* Mobile Slide Panel */}
//         <div className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-background border-l border-border z-50 transform transition-transform duration-300 ${
//           isOpen ? 'translate-x-0' : 'translate-x-full'
//         }`}>
//           <div className="p-6 h-full overflow-y-auto">
//             {panelContent}
//           </div>
//         </div>
//       </>
//     );
//   }

//   // Desktop Sidebar
//   return (
//     <div className="w-80 bg-background border-l border-border p-6 h-full overflow-y-auto">
//       {panelContent}
//     </div>
//   );
// };

// export default FilterPanel;

import React, { useEffect, useMemo } from 'react';
import Icon from '../../../../../components/AppIcon';
import { Button } from '../../../../../components/ui/button';
import Select from '../../../../../components/ui/Select';
import AssessmentCard from './AssessmentCard';

const FilterPanel = ({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
  isMobile,
  assessments,
  onStartAssessment,
  onViewDetails
}) => {
  useEffect(() => {
    console.log("Assessments data received:", assessments);
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter(item => {
      return (
        (!filters.deadline || item.deadline === filters.deadline) &&
        (!filters.subject || item.subject === filters.subject) &&
        (!filters.category || item.category === filters.category) &&
        (!filters.status || item.status?.toLowerCase() === filters.status?.toLowerCase())
      );
    });
  }, [assessments, filters]);


  const getDueDateOptions = () =>
    [...new Set(assessments.map(a => a.deadline))].filter(Boolean)
      .map(d => ({ value: d, label: new Date(d).toLocaleDateString() }));

  const getCourseOptions = () =>
    [...new Set(assessments.map(a => a.subject))].filter(Boolean)
      .map(s => ({ value: s, label: s }));

  const getIndustryOptions = () =>
    [...new Set(assessments.map(a => a.category))].filter(Boolean)
      .map(c => ({ value: c, label: c }));

  const getStatusOptions = () =>
    [...new Set(assessments.map(a => a.status))].filter(Boolean)
      .map(s => ({ value: s.toLowerCase(), label: s }));

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      deadline: '',
      subject: '',
      category: '',
      status: ''
    });
  };

  const panelContent = (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-base">Filters</h3>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={18} />
          </Button>
        )}
      </div>

      <Select
        label="Due Date"
        options={getDueDateOptions()}
        value={filters.deadline}
        onChange={(value) => handleFilterChange('deadline', value)}
      />
      <Select
        label="Course"
        options={getCourseOptions()}
        value={filters.subject}
        onChange={(value) => handleFilterChange('subject', value)}
      />
      <Select
        label="Industry"
        options={getIndustryOptions()}
        value={filters.category}
        onChange={(value) => handleFilterChange('category', value)}
      />
      <Select
        label="Status"
        options={getStatusOptions()}
        value={filters.status}
        onChange={(value) => handleFilterChange('status', value)}
      />

      <Button
        variant="outline"
        fullWidth
        size="sm"
        onClick={() => {
          // Reset filters to defaults
          onFiltersChange({
            category: 'all',
            difficulty: 'all',
            status: 'all',
            sortBy: 'deadline',
            showAvailableOnly: false,
          });

          // Optional: if you want to reset search query
          if (typeof onClearSearch === 'function') {
            onClearSearch();
          }
        }}
      >
        Clear All
      </Button>

    </div>
  );

  return isMobile ? (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-6 h-full overflow-y-auto">{panelContent}</div>
      </div>
    </>
  ) : isOpen ? (
    <div className="absolute right-4 mt-2 w-64 bg-background border border-border shadow-lg rounded-md p-4 z-50">
      {panelContent}
    </div>
  ) : null;
};

export default FilterPanel;
