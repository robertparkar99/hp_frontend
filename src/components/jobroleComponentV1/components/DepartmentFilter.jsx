// "use client";
// import React, { useEffect, useState } from "react";
// import Icon from "../../../components/AppIcon";

// const DepartmentFilter = ({ onFilterChange, selectedDepartments }) => {
//   const [expandedDepartments, setExpandedDepartments] = useState([]);
//   const [departmentData, setDepartmentData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [sessionData, setSessionData] = useState({
//     url: localStorage.getItem("url") || "",
//     token: localStorage.getItem("token") || "",
//     subInstituteId: localStorage.getItem("sub_institute_id") || "",
//     orgType: localStorage.getItem("org_type") || "",
//   });

//   // ✅ Fetch departments and their role counts
//   const fetchDepartments = async () => {
//     setLoading(true);
//     try {
//       // 1️⃣ Get all departments
//       const depRes = await fetch(
//         `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=department&searchWord=departments`
//       );
//       const depData = await depRes.json();
//       const departments = depData.searchData || [];

//       // 2️⃣ Get all job roles once
//       const roleRes = await fetch(
//         `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=job_role&searchWord=`
//       );
//       const roleData = await roleRes.json();
//       const allRoles = roleData.searchData || [];

//       // 3️⃣ Map role count to each department
//       const departmentList = departments.map((dept) => {
//         const deptName = dept.name || dept.department_name || dept;
//         const deptId = dept.id || dept.department_id || deptName;

//         const count = allRoles.filter(
//           (role) =>
//             role.department_id === dept.department_id ||
//             role.department === deptName
//         ).length;

//         return {
//           id: `dept-${deptId}`,
//           name: deptName,
//           roleCount: count,
//           subDepartments: [],
//         };
//       });

//       setDepartmentData(departmentList);
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//       alert("Failed to load departments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Fetch sub-departments when expanding
//   const fetchSubDepartments = async (departmentName) => {
//     try {
//       const response = await fetch(
//         `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_department&searchWord=${departmentName}`
//       );
//       const data = await response.json();
//       return (data.searchData || []).map((sub) => ({
//         id: `sub-${sub.sub_department_id}`,
//         name: sub.sub_department_name || sub.name,
//       }));
//     } catch (error) {
//       console.error(`Error fetching sub-departments for ${departmentName}:`, error);
//       return [];
//     }
//   };

//   const handleDepartmentToggle = async (departmentName) => {
//     setExpandedDepartments((prev) =>
//       prev.includes(departmentName)
//         ? prev.filter((name) => name !== departmentName)
//         : [...prev, departmentName]
//     );

//     if (!expandedDepartments.includes(departmentName)) {
//       const subDepartments = await fetchSubDepartments(departmentName);
//       setDepartmentData((prevData) =>
//         prevData.map((dept) =>
//           dept.name === departmentName ? { ...dept, subDepartments } : dept
//         )
//       );
//     }
//   };

//   const handleDepartmentSelect = (departmentName, isSubDepartment = false) => {
//     let updatedSelection = [...selectedDepartments];

//     if (updatedSelection.includes(departmentName)) {
//       updatedSelection = updatedSelection.filter((name) => name !== departmentName);
//     } else {
//       updatedSelection.push(departmentName);
//     }

//     onFilterChange(updatedSelection, isSubDepartment);
//   };

//   useEffect(() => {
//     fetchDepartments();
//   }, []);

//   return (
//     <div className="p-4">
//       <h3 className="font-semibold mb-2">Departments</h3>
//       {loading ? (
//         <p>Loading departments...</p>
//       ) : (
//         <ul className="space-y-2">
//           {departmentData.map((department) => (
//             <li key={department.id}>
//               <div className="flex items-center justify-between cursor-pointer">
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     checked={selectedDepartments.includes(department.name)}
//                     onChange={() => handleDepartmentSelect(department.name)}
//                   />
//                   <span>{department.name}</span>
//                   <span className="text-gray-500 text-sm">
//                     ({department.roleCount})
//                   </span>
//                 </div>
//                 <Icon
//                   name={
//                     expandedDepartments.includes(department.name)
//                       ? "ChevronUp"
//                       : "ChevronDown"
//                   }
//                   onClick={() => handleDepartmentToggle(department.name)}
//                   className="cursor-pointer"
//                 />
//               </div>
//               {expandedDepartments.includes(department.name) &&
//                 department.subDepartments.length > 0 && (
//                   <ul className="ml-6 mt-2 space-y-1">
//                     {department.subDepartments.map((sub) => (
//                       <li key={sub.id} className="flex items-center space-x-2">
//                         <input
//                           type="checkbox"
//                           checked={selectedDepartments.includes(sub.name)}
//                           onChange={() => handleDepartmentSelect(sub.name, true)}
//                         />
//                         <span>{sub.name}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default DepartmentFilter;


import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const DepartmentFilter = ({ onFilterChange, selectedDepartments }) => {
  const [expandedDepartments, setExpandedDepartments] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE =
    'https://hp.triz.co.in/jobrole_library?type=API&token=798|VOTSJFcrJ4kzWcaHLUEfjNxF240rT6RgJ8WbnxeFfd11d2e2&sub_institute_id=1&org_type=Financial%20Services';

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        const tableData = Array.isArray(data.tableData) ? data.tableData : [];

        // Group by Department and Sub-department
        const departmentMap = {};
        tableData.forEach(item => {
          const deptName = item.department || "N/A";
          const subDeptName = item.sub_department;

          if (!departmentMap[deptName]) {
            departmentMap[deptName] = {
              id: `dept-${deptName}`,
              name: deptName,
              roleCount: 0,
              subDepartments: {}
            };
          }
          departmentMap[deptName].roleCount++;

          if (subDeptName) {
            if (!departmentMap[deptName].subDepartments[subDeptName]) {
              departmentMap[deptName].subDepartments[subDeptName] = {
                id: `sub-${deptName}-${subDeptName}`,
                name: subDeptName,
                roleCount: 0
              };
            }
            departmentMap[deptName].subDepartments[subDeptName].roleCount++;
          }
        });

        const mappedDepartments = Object.values(departmentMap).map(dept => ({
          ...dept,
          subDepartments: Object.values(dept.subDepartments)
        }));

        setDepartmentData(mappedDepartments);
      } catch (err) {
        setDepartmentData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const toggleDepartment = (departmentId) => {
    setExpandedDepartments(prev =>
      prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const handleDepartmentSelect = (departmentId) => {
    const newSelection = selectedDepartments.includes(departmentId)
      ? selectedDepartments.filter(id => id !== departmentId)
      : [...selectedDepartments, departmentId];
    onFilterChange(newSelection);
  };

  const handleRemoveActive = (id) => {
    onFilterChange(selectedDepartments.filter(selId => selId !== id));
  };

  const clearAllFilters = () => onFilterChange([]);

  const getTotalRoles = () => {
    return departmentData.reduce((total, dept) => total + dept.roleCount, 0);
  };

  // Collect active selected names with IDs
  const selectedItems = departmentData.flatMap(dept => {
    const active = [];
    if (selectedDepartments.includes(dept.id)) {
      active.push({ id: dept.id, name: dept.name });
    }
    dept.subDepartments.forEach(sub => {
      if (selectedDepartments.includes(sub.id)) {
        active.push({ id: sub.id, name: sub.name });
      }
    });
    return active;
  });

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filter by Department</h3>
        {selectedDepartments.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:text-primary/80"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Total Roles */}
      <div className="mb-4 p-3 bg-muted rounded-md">
        <div className="flex items-center justify-between text-sm">
          <span>Total Job Roles</span>
          <span className="font-semibold">
            {loading ? 'Loading...' : getTotalRoles()}
          </span>
        </div>
      </div>

      {/* Scrollable Department List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scroll">
        {departmentData.map((department) => (
          <div key={department.id} className="border rounded-md">
            {/* Department Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3 flex-1">
                <button
                  onClick={() => toggleDepartment(department.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon
                    name={expandedDepartments.includes(department.id) ? 'ChevronDown' : 'ChevronRight'}
                    size={16}
                  />
                </button>

                <button
                  onClick={() => handleDepartmentSelect(department.id)}
                  className={`flex items-center space-x-2 flex-1 text-left ${
                    selectedDepartments.includes(department.id)
                      ? 'text-primary font-medium'
                      : 'hover:text-primary'
                  }`}
                >
                  <span>{department.name}</span>
                </button>
              </div>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                {department.roleCount}
              </span>
            </div>

            {/* SubDepartments */}
            {expandedDepartments.includes(department.id) && (
              <div className="border-t border-border bg-muted/50">
                {department.subDepartments.map((subDept) => (
                  <button
                    key={subDept.id}
                    onClick={() => handleDepartmentSelect(subDept.id)}
                    className={`w-full flex items-center justify-between p-3 pl-10 text-sm ${
                      selectedDepartments.includes(subDept.id)
                        ? 'text-primary font-medium bg-primary/5'
                        : 'hover:text-primary hover:bg-muted'
                    }`}
                  >
                    <span>{subDept.name}</span>
                    <span className="text-xs bg-background px-2 py-1 rounded-full">
                      {subDept.roleCount}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Section */}
      {selectedItems.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-md">
          <h4 className="text-sm font-semibold mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full cursor-pointer"
                onClick={() => handleRemoveActive(item.id)}
              >
                {item.name} <Icon name="X" size={12} />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styling */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default DepartmentFilter;
