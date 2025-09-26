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
  const [editSubDepartment, setEditSubDepartment] = useState(null); // NEW
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (err) {
      console.error('Error fetching department data:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = () => {
    onSave?.(departments);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Department Structure</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
          Add Department
        </Button>
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

      {/* Edit Department Form */}
      {editDepartment && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <h4 className="text-sm font-medium text-foreground mb-5">Edit Department</h4>
          <div className="grid grid-cols-2 gap-4 items-center">
            <Input
              value={editDepartment.name}
              onChange={(e) =>
                setEditDepartment((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="New Department Name"
            />
            <Input
              value={editDepartment.newSubdepartment}
              onChange={(e) =>
                setEditDepartment((prev) => ({ ...prev, newSubdepartment: e.target.value }))
              }
              placeholder="Add Subdepartment"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setEditDepartment(null)}>
              Cancel
            </Button>
            <Button id="update" size="sm" onClick={handleEditSave} className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
              Update
            </Button>
          </div>
        </div>
      )}

      {/* Edit Sub-department Form */}
      {editSubDepartment && (
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
      )}

      {/* Department List */}
      <div className="space-y-4">
        {departments.map((department) => (
          <div key={department.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Icon name="Building2" size={20} className="text-blue-400" />
                <div>
                  <h4 className="font-medium text-foreground">{department.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {department.employees} employees
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditDepartment({
                    ...department,
                    oldName: department.name,
                    newSubdepartment: '',
                  });
                  setShowAddForm(false);
                }}
                className="text-muted-foreground hover:text-blue-400"
              >
                <Icon name="Pencil" size={16} />
              </Button>
            </div>

            {department.subdepartments?.length > 0 && (
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
                      <div className="text-xs text-muted-foreground">
                        {sub.employees} employees
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} loading={loading} className="px-8 py-2 rounded-full text-white font-sem ibold bg-gradient-to-r from-blue-500 to-blue-700">
          Save Structure
        </Button>
      </div>
    </div>
  );
};

export default DepartmentStructure;
