'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/AppIcon';
import Loading from '@/components/utils/loading';

const DepartmentStructure = ({ onSave, loading = false }) => {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState({ name: '' });
  const [editDepartment, setEditDepartment] = useState(null);
  const [editSubDepartment, setEditSubDepartment] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // New state for toolbar actions
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  const [addSubDeptFor, setAddSubDeptFor] = useState(null);
  const [newSubDeptName, setNewSubDeptName] = useState("");

  // Load session data from localStorage
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

  // Fetch departments + subdepartments
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchData();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(
        `${sessionData.url}/api/departments-management?type=api&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}`
      );

      if (!res.ok) throw new Error('Network error');

      const data = await res.json();

      const mainDepts = data.main_departments || [];
      const subDepts = data.sub_departments || {};

      const merged = mainDepts.map((dept) => ({
        id: dept.id,
        name: dept.department,
        // employees: 0, // Employee count not provided in new API
        subdepartments: (subDepts[dept.id] || []).map((sub) => ({
          id: sub.id,
          name: sub.department,
          // employees: 0, // Employee count not provided in new API
        })),
      }));

      setDepartments(merged);
    } catch (err) {
      console.error('Error fetching department data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter departments based on search query
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.subdepartments?.some(sub =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Add department
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
      await fetchData(); // Refetch to get correct IDs
      alert('Department successfully added ✅');
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  // Edit department
  const handleEditSave = async () => {
    if (!editDepartment?.name.trim()) return;

    try {
      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('token', sessionData.token);
      formData.append('formType', 'edit department');
      formData.append('user_id', sessionData.userId);
      formData.append('department', editDepartment.name.trim());
      formData.append('old_department', editDepartment.oldName.trim());
      if (editDepartment.newSubdepartment?.trim()) {
        formData.append('sub_department', editDepartment.newSubdepartment.trim());
      }

      const res = await fetch(`${sessionData.url}/hrms/add_department`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to edit department');

      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === editDepartment.id
            ? {
              ...dept,
              name: editDepartment.name.trim(),
              subdepartments: editDepartment.newSubdepartment?.trim()
                ? [
                  ...dept.subdepartments,
                  {
                    id: Date.now(),
                    name: editDepartment.newSubdepartment.trim(),
                    employees: 0,
                  },
                ]
                : dept.subdepartments,
            }
            : dept
        )
      );

      setEditDepartment(null);
    } catch (error) {
      console.error('Error editing department:', error);
    }
  };

  // Add sub-department - CORRECTED FUNCTION
  // Add sub-department - WITH EXISTING DATA CHECK
  const handleSubmitSubDepartment = async () => {
    if (!newSubDeptName.trim() || !addSubDeptFor) return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("type", "api");
      formData.append("token", sessionData.token);
      formData.append("sub_institute_id", sessionData.subInstituteId);

      // ✔ CORRECT according to your backend:
      formData.append("department", newSubDeptName.trim());  // sub-department name
      formData.append("parent_id", addSubDeptFor.id);        // main department ID

      formData.append("user_id", sessionData.userId);
      formData.append("formType", "add sub_department");

      const res = await fetch(`${sessionData.url}/api/departments-management`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      console.log("ADD SUB DEPT RESPONSE:", result);

      if (result.status == "0") {
        alert(result.message || "Failed to add sub-department");
        return;
      }

      if (result.status == "1") {
        await fetchData();
        setNewSubDeptName("");
        setAddSubDeptFor(null);
        alert("Sub-department added successfully ✅");
      }

    } catch (err) {
      console.error("API error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit sub-department
  const handleEditSubDepartmentSave = async () => {
    if (!editSubDepartment?.newName.trim()) return;

    try {
      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('token', sessionData.token);
      formData.append('user_id', sessionData.userId);
      formData.append('department', editSubDepartment.departmentName.trim());
      formData.append('old_sub_department', editSubDepartment.oldName.trim());
      formData.append('sub_department', editSubDepartment.newName.trim());
      formData.append('formType', 'edit sub_department');

      const res = await fetch(`${sessionData.url}/hrms/add_department`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to edit sub-department');

      setDepartments((prev) =>
        prev.map((dept) =>
          dept.name === editSubDepartment.departmentName
            ? {
              ...dept,
              subdepartments: dept.subdepartments.map((sub) =>
                sub.name === editSubDepartment.oldName
                  ? { ...sub, name: editSubDepartment.newName.trim() }
                  : sub
              ),
            }
            : dept
        )
      );

      setEditSubDepartment(null);
    } catch (error) {
      console.error('Error editing sub-department:', error);
    }
  };

  // Delete sub-department
  const handleDeleteSubDepartment = async (department, subDepartment) => {
    if (!confirm(`Are you sure you want to delete "${subDepartment.name}"?`)) return;

    try {
      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('token', sessionData.token);
      formData.append('user_id', sessionData.userId);
      formData.append('department', department.name);
      formData.append('sub_department', subDepartment.name);
      formData.append('formType', 'delete sub_department');

      const res = await fetch(`${sessionData.url}/hrms/add_department`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to delete sub-department');

      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === department.id
            ? {
              ...dept,
              subdepartments: dept.subdepartments.filter(
                (sub) => sub.id !== subDepartment.id
              ),
            }
            : dept
        )
      );

      alert('Sub-department deleted successfully ✅');
    } catch (error) {
      console.error('Error deleting sub-department:', error);
      alert('Failed to delete sub-department');
    }
  };

  // View department details
  const handleViewDetails = (department) => {
    setSelectedDepartment(department);
    setShowDepartmentDetails(true);
  };

  const handleAssignEmployees = (dept) => { };
  const handleShowAnalytics = (dept) => { };
  const handleShowPermissions = (dept) => { };
  const handleShowAIRecommendations = (dept) => { };

  const handleSave = () => {
    onSave?.(departments);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Top Toolbar Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-88"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Settings */}
          <Button variant="outline" size="sm" title='settings'>
            <Icon name="Settings" size={16} />
          </Button>

          {/* Add Custom Fields */}
          <Button variant="outline" size="sm" title='Coustom Fields'>
            <Icon name="SlidersHorizontal" size={16} />
          </Button>

          {/* AI Assistant */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShowAIRecommendations()}
            title='AI Assistant'
          >
            <Icon name="Sparkles" size={16} />
          </Button>

          {/* Add Department */}
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} title='Add Department'>
            <Icon name="Plus" size={16} />
          </Button>
        </div>
      </div>

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
            <Button id='cancel' variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button size="sm" id='submit' onClick={handleAddDepartment} className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
              Submit
            </Button>
          </div>
        </div>
      )}

      {/* Edit Sub-department Form */}
      {/* {editSubDepartment && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <h4 className="text-sm font-medium text-foreground mb-5">Edit Sub-department</h4>
          <Input
            value={editSubDepartment.newName}
            onChange={(e) =>
              setEditSubDepartment((prev) => ({ ...prev, newName: e.target.value }))
            }
            placeholder="New Sub-department Name"
          />
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setEditSubDepartment(null)}>
              Cancel
            </Button>
            <Button size="sm" id="update" onClick={handleEditSubDepartmentSave} className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
              Update
            </Button>
          </div>
        </div>
      )} */}

      {/* Department List */}
      <div className="space-y-4">
        {filteredDepartments.map((department) => {
          const isEditing = editDepartment?.id === department.id;

          return (
            <div key={department.id} className="border border-border rounded-lg p-4">
              {/* HEADER AREA */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Icon name="Building2" size={20} className="text-blue-400" />

                  {/* INLINE EDIT MODE */}
                  {isEditing ? (
                    <Input
                      value={editDepartment.name}
                      onChange={(e) =>
                        setEditDepartment((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-60"
                    />
                  ) : (
                    <div>
                      <h4 className="font-medium text-foreground">{department.name}</h4>
                      {/* <p className="text-sm text-muted-foreground">
                        {department.employees} employees
                      </p> */}
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center space-x-1">
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(department)}
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                  )}

                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditDepartment({
                          id: department.id,
                          oldName: department.name,
                          name: department.name,
                          newSubdepartment: "",
                        });
                      }}
                    >
                      <Icon name="Edit3" size={16} />
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="px-3 py-1 bg-blue-600 text-white rounded-full"
                        onClick={handleEditSave}
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditDepartment(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {/* ADD SUB-DEPARTMENT */}
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAddSubDeptFor(department);
                        setNewSubDeptName("");
                      }}
                    >
                      <Icon name="Plus" size={16} />
                    </Button>
                  )}
                  {/* Assign Employees */}
                  {/* {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Assign Employees"
                      onClick={() => handleAssignEmployees(department)}
                    >
                      <Icon name="UserPlus" size={16} />
                    </Button>
                  )} */}

                  {/* Analytics */}
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Analytics"
                      onClick={() => handleShowAnalytics(department)}
                    >
                      <Icon name="BarChart3" size={16} />
                    </Button>
                  )}

                  {/* Permissions */}
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Permissions"
                      onClick={() => handleShowPermissions(department)}
                    >
                      <Icon name="ShieldCheck" size={16} />
                    </Button>
                  )}

                  {/* AI Recommendations */}
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="AI Recommendations"
                      onClick={() => handleShowAIRecommendations(department)}
                    >
                      <Icon name="Sparkles" size={16} />
                    </Button>
                  )}

                </div>
              </div>

              {/* INLINE SUB-DEPARTMENT FORM */}
              {/* INLINE SUB-DEPARTMENT FORM */}
              {addSubDeptFor?.id === department.id && (
                <div className="mt-3 mb-4 p-3 bg-muted rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium">Add Sub-department to {department.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const existing = department.subdepartments?.map(sub => sub.name).join(', ') || 'None';
                        alert(`Existing sub-departments in ${department.name}:\n\n${existing}`);
                      }}
                      className="text-xs"
                    >
                      <Icon name="Info" size={12} className="mr-1" />
                      View Existing
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Input
                        placeholder="Enter unique sub-department name"
                        value={newSubDeptName}
                        onChange={(e) => setNewSubDeptName(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Current sub-departments: {department.subdepartments?.length || 0}
                      </p>
                    </div>

                    {/* Show existing sub-departments */}
                    {department.subdepartments?.length > 0 && (
                      <div className="bg-card p-2 rounded border max-h-24 overflow-y-auto">
                        <p className="text-xs text-muted-foreground mb-1">Already exists:</p>
                        <div className="flex flex-wrap gap-1">
                          {department.subdepartments.map((sub, idx) => (
                            <span
                              key={sub.id}
                              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAddSubDeptFor(null);
                          setNewSubDeptName('');
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        size="sm"
                        className="px-5 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700"
                        onClick={handleSubmitSubDepartment}
                        disabled={
                          !newSubDeptName.trim() ||
                          department.subdepartments?.some(
                            sub => sub.name.toLowerCase() === newSubDeptName.trim().toLowerCase()
                          )
                        }
                      >
                        {isLoading ? (
                          <>
                            <Icon name="Loader2" size={14} className="animate-spin mr-1" />
                            Adding...
                          </>
                        ) : (
                          'Add Sub-department'
                        )}
                      </Button>


                    </div>
                  </div>
                </div>
              )}
              {/* EDIT SUB-DEPARTMENT FORM (INSIDE CORRECT DEPARTMENT BOX) */}
              {editSubDepartment && editSubDepartment.departmentName === department.name && (
                <div className="mb-4 p-3 bg-muted rounded-lg border border-border">
                  <h4 className="text-sm font-medium mb-3">Edit Sub-department</h4>

                  <Input
                    value={editSubDepartment.newName}
                    onChange={(e) =>
                      setEditSubDepartment((prev) => ({ ...prev, newName: e.target.value }))
                    }
                    placeholder="Enter new sub-department name"
                  />

                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditSubDepartment(null)}
                    >
                      Cancel
                    </Button>

                    <Button
                      size="sm"
                      className="px-4 py-1 rounded-full text-white bg-blue-600 hover:bg-blue-700"
                      onClick={handleEditSubDepartmentSave}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              )}


              {/* SUB-DEPARTMENTS LIST */}
              {!isEditing && department.subdepartments?.length > 0 && (
                <div className="pl-6 border-l-2 border-border">
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">
                    Sub-departments
                  </h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {department.subdepartments.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div
                          className="flex items-center space-x-2 cursor-pointer"
                          onDoubleClick={() =>
                            setEditSubDepartment({
                              departmentName: department.name,
                              oldName: sub.name,
                              newName: sub.name,
                            })
                          }
                        >
                          <Icon name="Users" size={16} className="text-muted-foreground" />
                          <span className="text-sm text-foreground">{sub.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">

                          {/* Employees Count */}
                          {/* <div className="text-xs text-muted-foreground">
                            {sub.employees} employees
                          </div> */}

                          {/* Edit Sub-department */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="Edit Sub-department"
                            onClick={() =>
                              setEditSubDepartment({
                                departmentName: department.name,
                                oldName: sub.name,
                                newName: sub.name, // prefill
                              })
                            }
                          >
                            <Icon name="Edit3" size={14} className="text-blue-600" />
                          </Button>

                          {/* Delete Sub-department */}
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="Delete Sub-department"
                            onClick={() => handleDeleteSubDepartment(department, sub)}
                          >
                            <Icon name="Trash2" size={14} className="text-destructive" />
                          </Button> */}

                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modals for various actions */}
              {/* View Department Details Modal */}
              {showDepartmentDetails && selectedDepartment && (
                <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex items-center justify-center z-0">
                  <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4 shadow-xl border border-white/20">
                    <h3 className="text-lg font-semibold mb-4">Department Details</h3>

                    <div className="space-y-3 text-sm">
                      <p>
                        <strong>Name:</strong> {selectedDepartment.name}
                      </p>
                      {/* <p>
                        <strong>Employees:</strong> {selectedDepartment.employees}
                      </p> */}
                      <p>
                        <strong>Sub-departments:</strong> {selectedDepartment.subdepartments?.length || 0}
                      </p>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button onClick={() => setShowDepartmentDetails(false)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}


              {showAnalytics && selectedDepartment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Analytics - {selectedDepartment.name}</h3>
                    <div className="space-y-3 text-sm">
                      {/* <p>Employee count: {selectedDepartment.employees}</p> */}
                      <p>Sub-departments: {selectedDepartment.subdepartments?.length || 0}</p>
                      <p>Analytics data would be displayed here...</p>
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button onClick={() => setShowAnalytics(false)}>Close</Button>
                    </div>
                  </div>
                </div>
              )}

              {showPermissions && selectedDepartment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Permissions - {selectedDepartment.name}</h3>
                    <div className="space-y-3 text-sm">
                      <p>Permission settings would be configured here...</p>
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button onClick={() => setShowPermissions(false)}>Close</Button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>


      {/* Footer */}
      {/* <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} loading={loading} className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
          Save Structure
        </Button>
      </div> */}
    </div>
  );
};

export default DepartmentStructure;