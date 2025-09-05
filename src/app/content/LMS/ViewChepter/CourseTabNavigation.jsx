// import React from 'react';
// import Icon from '../../../../components/AppIcon';
// import { Button } from '../../../../components/ui/button';

// const CourseTabNavigation = ({ activeTab, onTabChange }) => {
//   const tabs = [
//     {
//       id: 'overview',
//       label: 'Overview',
//       icon: 'Info',
//       description: 'Course details and objectives'
//     },
//     {
//       id: 'modules',
//       label: 'Modules',
//       icon: 'List',
//       description: 'Course content and lessons'
//     },
//     {
//       id: 'discussions',
//       label: 'Discussions',
//       icon: 'MessageSquare',
//       description: 'Course forum and Q&A'
//     },
//     {
//       id: 'resources',
//       label: 'Resources',
//       icon: 'Download',
//       description: 'Downloads and materials'
//     }
//   ];

//   return (
//     <div className="border-b border-border bg-card">
//       <div className="flex overflow-x-auto">
//         {tabs.map((tab) => (
//           <Button
//             key={tab.id}
//             variant="ghost"
//             className={`flex-shrink-0 px-6 py-4 rounded-none border-b-2 transition-all duration-200 ${
//               activeTab === tab.id
//                 ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
//             }`}
//             onClick={() => onTabChange(tab.id)}
//           >
//             <div className="flex items-center gap-2">
//               <Icon name={tab.icon} size={18} />
//               <div className="text-left">
//                 <div className="font-medium">{tab.label}</div>
//                 <div className="text-xs opacity-75 hidden sm:block">{tab.description}</div>
//               </div>
//             </div>
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CourseTabNavigation;

import React from "react"
import Icon from "../../../../components/AppIcon"
import { Button } from "../../../../components/ui/button"

const CourseTabNavigation = ({ activeTab, onTabChange, chapters }) => {
  // ✅ Calculate dynamic counts
  const modulesCount = chapters?.length || 0

  // Count all resources across chapters
  const resourcesCount = chapters?.reduce((acc, ch) => {
    return (
      acc +
      Object.values(ch.contents || {}).reduce(
        (sum, arr) => sum + (arr?.length || 0),
        0
      )
    )
  }, 0) || 0

  const tabs = [
    // {
    //   id: "overview",
    //   label: "Overview",
    //   icon: "Info",
    //   description: "Course details and objectives",
    //   count: null, // no count
    // },
    {
      id: "modules",
      label: "Modules",
      icon: "List",
      description: "Course content and lessons",
      count: modulesCount,
    },
    // {
    //   id: "discussions",
    //   label: "Discussions",
    //   icon: "MessageSquare",
    //   description: "Course forum and Q&A",
    //   count: null, // optional, not in your API yet
    // },
    {
      id: "resources",
      label: "Resources",
      icon: "Download",
      description: "Downloads and materials",
      count: resourcesCount,
    },
  ]

  return (
    // <div className="border-b border-border bg-card">
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-card">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
       <Button
            key={tab.id}
            variant="ghost"
            className={`flex-shrink-0 px-6 py-4 rounded-none border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-blue-400 text-blue-400 bg-blue-400/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex items-center gap-2">
              <Icon name={tab.icon} size={18} />
              <div className="text-left">
                <div className="font-medium flex items-center gap-1">
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-1 text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-75 hidden sm:block">
                  {tab.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

export default CourseTabNavigation
