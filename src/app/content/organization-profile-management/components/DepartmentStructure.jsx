// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import Icon from '@/components/AppIcon';
// import Loading from '@/components/utils/loading';

// const DepartmentStructure = ({ onSave, loading = false }) => {
//   const [departments, setDepartments] = useState([]);
//   const [newDepartment, setNewDepartment] = useState({ name: '' });
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [sessionData, setSessionData] = useState({
//     url: '',
//     token: '',
//     subInstituteId: '',
//     orgType: '',
//     userId: '',
//   });
//   const [isLoading, setIsLoading] = useState(true);

//   // ✅ Load session data from localStorage
//   useEffect(() => {
//     const userData = localStorage.getItem('userData');
//     if (userData) {
//       const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
//       setSessionData({
//         url: APP_URL,
//         token,
//         subInstituteId: sub_institute_id,
//         orgType: org_type,
//         userId: user_id,
//       });
//     }
//   }, []);

//   // ✅ Fetch departments + subdepartments
//   useEffect(() => {
//     if (sessionData.url && sessionData.token) {
//       fetchData();
//     }
//   }, [sessionData.url, sessionData.token]);

//   const fetchData = async () => {
//     try {
//       setIsLoading(true);

//       const deptRes = await fetch(
//         `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}&group_by=department&order_by[direction]=desc`
//       );
//       const subDeptRes = await fetch(
//         `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}&group_by=sub_department&order_by[direction]=desc`
//       );

//       if (!deptRes.ok || !subDeptRes.ok) throw new Error('Network error');

//       const deptData = await deptRes.json();
//       const subDeptData = await subDeptRes.json();

//       const merged = deptData.map((dept) => ({
//         id: dept.department_id || dept.department,
//         name: dept.department,
//         employees: dept.total_employees || 0,
//         subdepartments: subDeptData
//           .filter((sub) => sub.department === dept.department)
//           .map((sub) => ({
//             id: sub.sub_department_id || sub.sub_department,
//             name: sub.sub_department,
//             employees: sub.total_employees || 0,
//           })),
//       }));

//       setDepartments(merged);

//       console.log('📌 Current Departments from API:', merged);
//     } catch (err) {
//       console.error('Error fetching department data:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ Import departments into DB
//  const handleImportDepartments = async () => {
//   try {
//     setIsLoading(true);
//     await fetchData(); // get latest

//     for (const dept of departments) {
//       const formData = new FormData();
//       formData.append("type", "API");
//       formData.append("sub_institute_id", sessionData.subInstituteId);
//       formData.append("token", sessionData.token);
//       formData.append("formType", "import");
//       formData.append("user_id", sessionData.userId);

//       // ✅ department with key
//       formData.append(`department[${dept.name}]`, dept.name);

//       // ✅ subdepartments nested under department
//       if (dept.subdepartments?.length > 0) {
//         dept.subdepartments.forEach((sub, i) => {
//           formData.append(`sub_department[${dept.name}][${i}]`, sub.name);
//         });
//       }

//       // Debug payload
//       console.group(`📤 Importing ${dept.name}`);
//       for (let [key, value] of formData.entries()) {
//         console.log(key, "➡️", value);
//       }
//       console.groupEnd();

//       const res = await fetch(`${sessionData.url}/hrms/add_department`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         const errText = await res.text();
//         throw new Error(`Import failed for ${dept.name}: ${errText}`);
//       }
//     }

//     alert("✅ All departments & sub-departments imported successfully!");
//     fetchData();
//   } catch (error) {
//     console.error("Error importing departments:", error);
//     alert("❌ Failed to import departments");
//   } finally {
//     setIsLoading(false);
//   }
// };

//   // ✅ Add new department manually
//   const handleAddDepartment = async () => {
//     if (!newDepartment.name.trim()) return;

//     try {
//       const formData = new FormData();
//       formData.append('type', 'API');
//       formData.append('sub_institute_id', sessionData.subInstituteId);
//       formData.append('token', sessionData.token);
//       formData.append('formType', 'add department');
//       formData.append('user_id', sessionData.userId);
//       formData.append('department', newDepartment.name.trim());

//       const res = await fetch(`${sessionData.url}/hrms/add_department`, {
//         method: 'POST',
//         body: formData,
//       });

//       if (!res.ok) throw new Error('Failed to add department');

//       const newDeptObj = {
//         id: Date.now(),
//         name: newDepartment.name.trim(),
//         employees: 0,
//         subdepartments: [],
//       };
//       setDepartments((prev) => [newDeptObj, ...prev]);

//       setNewDepartment({ name: '' });
//       setShowAddForm(false);
//       alert('Department successfully added ✅');
//     } catch (error) {
//       console.error('Error adding department:', error);
//     }
//   };

//   const handleSave = () => {
//     onSave?.(departments);
//   };

//   if (isLoading) return <Loading />;

//   return (
//     <div className="bg-card border border-border rounded-lg p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-semibold text-foreground">Department Structure</h3>

//         <div className="flex items-center gap-3">
//           <Button variant="outline" size="sm" onClick={handleImportDepartments}>
//             Import
//           </Button>
//           <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
//             Add Department
//           </Button>
//         </div>
//       </div>

//       {/* Add Department Form */}
//       {showAddForm && (
//         <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
//           <h4 className="text-sm font-medium text-foreground mb-3">Add New Department</h4>
//           <Input
//             value={newDepartment.name}
//             onChange={(e) => setNewDepartment({ name: e.target.value })}
//             placeholder="Department Name"
//           />
//           <div className="flex justify-end space-x-3 mt-4">
//             <Button id="cancel" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
//               Cancel
//             </Button>
//             <Button
//               size="sm"
//               id="submit"
//               onClick={handleAddDepartment}
//               className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
//             >
//               Submit
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Department List */}
//       <div className="space-y-4">
//         {departments.map((department) => (
//           <div key={department.id} className="border border-border rounded-lg p-4">
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center space-x-3">
//                 <Icon name="Building2" size={20} className="text-blue-400" />
//                 <div>
//                   <h4 className="font-medium text-foreground">{department.name}</h4>
//                   <p className="text-sm text-muted-foreground">
//                     {department.employees} employees
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {department.subdepartments?.length > 0 && (
//               <div className="pl-6 border-l-2 border-border">
//                 <h5 className="text-sm font-medium text-muted-foreground mb-2">
//                   Sub-departments
//                 </h5>
//                 <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
//                   {department.subdepartments.map((sub) => (
//                     <div
//                       key={sub.id}
//                       className="flex items-center justify-between p-2 bg-muted rounded"
//                     >
//                       <div className="flex items-center space-x-2">
//                         <Icon name="Users" size={16} className="text-muted-foreground" />
//                         <span className="text-sm text-foreground">{sub.name}</span>
//                       </div>
//                       <div className="text-xs text-muted-foreground">
//                         {sub.employees} employees
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Footer */}
//       <div className="flex justify-end space-x-3 mt-6">
//         <Button variant="outline">Cancel</Button>
//         <Button
//           onClick={handleSave}
//           loading={loading}
//           className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
//         >
//           Save Structure
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default DepartmentStructure;


'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/AppIcon';
import Loading from '@/components/utils/loading';
import {
  Search,
  FileUp,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Eye,
  Edit,
  Plus,
  UserPlus,
  BarChart3,
  ShieldCheck,
  Building2,
  Users,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react';

const DepartmentStructure = ({ onSave, loading = false }) => {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState({ name: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // ✅ Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);

  // ✅ Fetch departments + subdepartments
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchData();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const deptRes = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}&group_by=department&order_by[direction]=desc`
      );
      const subDeptRes = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}&group_by=sub_department&order_by[direction]=desc`
      );

      if (!deptRes.ok || !subDeptRes.ok) throw new Error('Network error');

      const deptData = await deptRes.json();
      const subDeptData = await subDeptRes.json();

      const merged = deptData.map((dept) => ({
        id: dept.department_id || dept.department,
        name: dept.department,
        employees: dept.total_employees || 0,
        subdepartments: subDeptData
          .filter((sub) => sub.department === dept.department)
          .map((sub) => ({
            id: sub.sub_department_id || sub.sub_department,
            name: sub.sub_department,
            employees: sub.total_employees || 0,
          })),
      }));

      setDepartments(merged);

      console.log('📌 Current Departments from API:', merged);
    } catch (err) {
      console.error('Error fetching department data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Import departments into DB
  const handleImportDepartments = async () => {
    try {
      setIsLoading(true);
      await fetchData(); // get latest

      for (const dept of departments) {
        const formData = new FormData();
        formData.append("type", "API");
        formData.append("sub_institute_id", sessionData.subInstituteId);
        formData.append("token", sessionData.token);
        formData.append("formType", "import");
        formData.append("user_id", sessionData.userId);

        // ✅ department with key
        formData.append(`department[${dept.name}]`, dept.name);

        // ✅ subdepartments nested under department
        if (dept.subdepartments?.length > 0) {
          dept.subdepartments.forEach((sub, i) => {
            formData.append(`sub_department[${dept.name}][${i}]`, sub.name);
          });
        }

        // Debug payload
        console.group(`📤 Importing ${dept.name}`);
        for (let [key, value] of formData.entries()) {
          console.log(key, "➡️", value);
        }
        console.groupEnd();

        const res = await fetch(`${sessionData.url}/hrms/add_department`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Import failed for ${dept.name}: ${errText}`);
        }
      }

      alert("✅ All departments & sub-departments imported successfully!");
      fetchData();
    } catch (error) {
      console.error("Error importing departments:", error);
      alert("❌ Failed to import departments");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Add new department manually
  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) return;

    try {
      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('token', sessionData.token);
      formData.append('formType', 'add department');
      formData.append('user_id', sessionData.userId);
      formData.append('department', newDepartment.name.trim());

      const res = await fetch(`${sessionData.url}/hrms/add_department`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to add department');

      const newDeptObj = {
        id: Date.now(),
        name: newDepartment.name.trim(),
        employees: 0,
        subdepartments: [],
      };
      setDepartments((prev) => [newDeptObj, ...prev]);

      setNewDepartment({ name: '' });
      setShowAddForm(false);
      alert('Department successfully added ✅');
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  // ✅ Filter departments based on search
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.subdepartments?.some(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // ✅ Department action handlers
  const handleViewDetails = (department) => {
    setSelectedDepartment(department);
    console.log('Viewing details for:', department.name);
  };

  const handleEditDepartment = (department) => {
    console.log('Editing department:', department.name);
    // Implement edit logic here
  };

  const handleAddSubDepartment = (department) => {
    console.log('Adding sub-department to:', department.name);
    // Implement add sub-department logic here
  };

  const handleAssignEmployees = (department) => {
    console.log('Assigning employees to:', department.name);
    // Implement assign employees logic here
  };

  const handleViewAnalytics = (department) => {
    console.log('Viewing analytics for:', department.name);
    // Implement analytics logic here
  };

  const handleDepartmentSettings = (department) => {
    console.log('Opening settings for:', department.name);
    // Implement settings logic here
  };

  const handleAIRecommendation = (department) => {
    console.log('Getting AI recommendations for:', department.name);
    // Implement AI recommendation logic here
  };

  // ✅ Page-level action handlers
  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  };

  const handleSettings = () => {
    console.log('Opening settings');
    // Implement settings logic here
  };

  const handleAddCustomFields = () => {
    console.log('Adding custom fields');
    // Implement custom fields logic here
  };

  const handleGenerativeAI = () => {
    setShowAIAssistant(true);
    console.log('Opening Generative AI Assistant');
  };

  const handleSave = () => {
    onSave?.(departments);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Top Toolbar with Page-Level Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-foreground">Department Structure</h3>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search departments..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* Page-Level Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
        
          
          <Button variant="outline" size="sm" onClick={handleImportDepartments}>
            <FileUp className="w-4 h-4" />
           
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleSettings}>
            <Settings className="w-4 h-4 " />
            
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleAddCustomFields}>
            <SlidersHorizontal className="w-4 h-4 " />
          
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleGenerativeAI}>
            <Sparkles className="w-4 h-4 " />
            
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 " />
           
          </Button>
        </div>
      </div>

      {/* Generative AI Assistant Modal */}
      {showAIAssistant && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-foreground">AI Structure Assistant</h4>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAIAssistant(false)}>
              Close
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Let AI help you optimize your department structure based on industry best practices.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Analyze Current Structure
            </Button>
            <Button size="sm" variant="outline">
              Suggest Improvements
            </Button>
            <Button size="sm" variant="outline">
              Generate Job Roles
            </Button>
          </div>
        </div>
      )}

      {/* Add Department Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Add New Department</h4>
          <Input
            value={newDepartment.name}
            onChange={(e) => setNewDepartment({ name: e.target.value })}
            placeholder="Department Name"
          />
          <div className="flex justify-end space-x-3 mt-4">
            <Button id="cancel" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              id="submit"
              onClick={handleAddDepartment}
              className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
            >
              Submit
            </Button>
          </div>
        </div>
      )}

      {/* Department List */}
      <div className="space-y-4">
        {filteredDepartments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No departments found matching your search.' : 'No departments found.'}
          </div>
        ) : (
          filteredDepartments.map((department) => (
            <div key={department.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-foreground">{department.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {department.employees} employees
                    </p>
                  </div>
                </div>
                
              
              </div>

              {department.subdepartments?.length > 0 && (
                <div className="pl-6 border-l-2 border-border">
                     <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">
                    Sub-departments
                  </h5>
                    {/* Department-Level Action Buttons */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(department)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditDepartment(department)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAddSubDepartment(department)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAssignEmployees(department)}>
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleViewAnalytics(department)}>
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDepartmentSettings(department)}>
                    <ShieldCheck className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAIRecommendation(department)}>
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
                </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {department.subdepartments.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2 bg-muted rounded hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {sub.employees} employees
                          </span>
                          
                        </div>
                      </div>
                    ))}
                  </div>
                
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {filteredDepartments.length} department(s) found
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleSave}
            loading={loading}
            className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
          >
            Save Structure
          </Button>
        </div>
      </div>

      {/* Selected Department Details Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{selectedDepartment.name} Details</h3>
            <div className="space-y-3">
              <div>
                <strong>Total Employees:</strong> {selectedDepartment.employees}
              </div>
              <div>
                <strong>Sub-departments:</strong> {selectedDepartment.subdepartments?.length || 0}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setSelectedDepartment(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentStructure;