// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import Icon from '../AppIcon';

// const BreadcrumbNavigation = () => {
//   const location = useLocation();
  
//   const routeLabels = {
//     '/employee-list-profiles': 'Employee List & Profiles',
//     '/skill-library-management': 'Skill Library Management',
//     '/job-role-library': 'Job Role Library',
//     '/courses-management': 'Courses Management',
//     '/quiz-assessment-system': 'Quiz & Assessment System',
//     '/comprehensive-reports-dashboard': 'Comprehensive Reports Dashboard',
//     '/organization-profile-management': 'Organization Details',
//     '/skill-gap-analysis': 'Skill Gap Analysis'
//   };

//   const sectionLabels = {
//     '/employee-list-profiles': 'Organization Management',
//     '/skill-library-management': 'Skill Management',
//     '/job-role-library': 'Skill Management',
//     '/courses-management': 'LMS',
//     '/quiz-assessment-system': 'LMS',
//     '/comprehensive-reports-dashboard': 'Reports',
//     '/organization-profile-management': 'Organization Management',
//     '/skill-gap-analysis': 'Organization Management'
//   };

//   const generateBreadcrumbs = () => {
//     const pathSegments = location.pathname.split('/').filter(segment => segment);
//     const breadcrumbs = [{ label: 'Dashboard', path: '/' }];

//     let currentPath = '';
    
//     pathSegments.forEach((segment, index) => {
//       currentPath += `/${segment}`;
      
//       if (index === 0) {
//         // First segment - main route
//         const sectionLabel = sectionLabels[currentPath];
//         const routeLabel = routeLabels[currentPath];
        
//         if (sectionLabel) {
//           breadcrumbs.push({ label: sectionLabel, path: null });
//         }
//         if (routeLabel) {
//           breadcrumbs.push({ label: routeLabel, path: currentPath });
//         }
//       } else {
//         // Sub-routes (like employee profile sections)
//         if (segment === 'personal-details') {
//           breadcrumbs.push({ label: 'Personal Details', path: currentPath });
//         } else if (segment === 'job-role-skills') {
//           breadcrumbs.push({ label: 'Job Role-Specific Skills', path: currentPath });
//         } else if (segment === 'job-role-tasks') {
//           breadcrumbs.push({ label: 'Job Role-Specific Tasks', path: currentPath });
//         } else if (segment === 'skill-assessment') {
//           breadcrumbs.push({ label: 'Self-Skill Assessment', path: currentPath });
//         } else if (!isNaN(segment)) {
//           // Employee ID
//           breadcrumbs.push({ label: `Employee #${segment}`, path: currentPath });
//         } else {
//           // Generic segment
//           const formattedLabel = segment.split('-').map(word => 
//             word.charAt(0).toUpperCase() + word.slice(1)
//           ).join(' ');
//           breadcrumbs.push({ label: formattedLabel, path: currentPath });
//         }
//       }
//     });

//     return breadcrumbs;
//   };

//   const breadcrumbs = generateBreadcrumbs();

//   if (breadcrumbs.length <= 1) {
//     return null;
//   }

//   return (
//     <nav className="bg-background border-b border-border z-[700]" aria-label="Breadcrumb">
//       <div className="px-6 py-3">
//         <ol className="flex items-center space-x-2 text-sm">
//           {breadcrumbs.map((crumb, index) => (
//             <li key={index} className="flex items-center">
//               {index > 0 && (
//                 <Icon 
//                   name="ChevronRight" 
//                   size={14} 
//                   className="text-muted-foreground mx-2" 
//                 />
//               )}
              
//               {crumb.path && index < breadcrumbs.length - 1 ? (
//                 <Link
//                   to={crumb.path}
//                   className="text-muted-foreground hover:text-foreground transition-micro font-medium"
//                 >
//                   {crumb.label}
//                 </Link>
//               ) : (
//                 <span 
//                   className={`
//                     ${index === breadcrumbs.length - 1 
//                       ? 'text-foreground font-semibold' 
//                       : 'text-muted-foreground'
//                     }
//                   `}
//                 >
//                   {crumb.label}
//                 </span>
//               )}
//             </li>
//           ))}
//         </ol>
//       </div>
//     </nav>
//   );
// };

// export default BreadcrumbNavigation;

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const BreadcrumbNavigation = () => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="text-sm text-muted-foreground mb-4">
      <ol className="flex items-center space-x-2">
        <li>
          <a href="/" className="hover:underline text-primary">Home</a>
        </li>
        {segments.map((segment, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span>/</span>
            <span className="capitalize">{decodeURIComponent(segment)}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;
