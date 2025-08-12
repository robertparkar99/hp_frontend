'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/AppIcon';
import Loading from '@/components/utils/loading';

const DepartmentStructure = ({ onSave, loading = false }) => {
  const [departments, setDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', head: '' });
  const [newDepartment, setNewDepartment] = useState({ name: '', head: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load session data
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
      });
    }
  }, []);

  // Fetch departments and subdepartments
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchData();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const deptRes = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}&group_by=department`
      );
      const subDeptRes = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}&group_by=sub_department`
      );

      if (!deptRes.ok || !subDeptRes.ok) throw new Error('Network error');

      const deptData = await deptRes.json();
      const subDeptData = await subDeptRes.json();

      const merged = deptData.map((dept) => ({
        id: dept.department_id || dept.department,
        name: dept.department,
        head: dept.head || '',
        employees: dept.total_employees || 0,
        subdepartments: subDeptData
          .filter((sub) => sub.department === dept.department)
          .map((sub) => ({
            id: sub.sub_department_id || sub.sub_department,
            name: sub.sub_department,
            head: sub.head || '',
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

  const handleAddDepartment = () => {
    if (newDepartment.name && newDepartment.head) {
      const department = {
        id: Date.now(),
        name: newDepartment.name,
        head: newDepartment.head,
        employees: 0,
        subdepartments: [],
      };
      setDepartments([department, ...departments]);
      setNewDepartment({ name: '', head: '' });
      setShowAddForm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEditClick = (dept) => {
    setEditingDepartment(dept.id);
    setEditForm({ name: dept.name, head: dept.head });
  };

  const handleUpdateDepartment = async () => {
    try {
      // Optimistic update
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === editingDepartment
            ? { ...dept, name: editForm.name, head: editForm.head }
            : dept
        )
      );

      // API call to persist
      const res = await fetch(`${sessionData.url}/add_department`, {
        method: 'POST', // change to PUT if needed
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify({
          id: editingDepartment,
          name: editForm.name,
          head: editForm.head,
          sub_institute_id: sessionData.subInstituteId,
        }),
      });

      if (!res.ok) throw new Error('Failed to update department');

      // Refresh data from server
      await fetchData();

      setEditingDepartment(null);
      setEditForm({ name: '', head: '' });
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleSave = () => {
    onSave?.(departments);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Department Structure</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
          Add Department
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Add New Department</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, name: e.target.value })
              }
              placeholder="Department Name"
            />
            <Input
              value={newDepartment.head}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, head: e.target.value })
              }
              placeholder="Department Head"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddDepartment}>
              Add Department
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {departments.map((department) => (
          <div key={department.id} className="border border-border rounded-lg p-4">
            {editingDepartment === department.id ? (
              <div className="mb-4 p-4 bg-muted rounded-lg border border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Edit Department</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                  <Input
                    value={editForm.head}
                    placeholder="New Category"
                    onChange={(e) =>
                      setEditForm({ ...editForm, head: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingDepartment(null)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleUpdateDepartment}>
                    Update Department
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon name="Building2" size={20} className="text-primary" />
                    <div>
                      <h4 className="font-medium text-foreground">{department.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Head: {department.head} • {department.employees} employees
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(department)}
                  >
                    <Icon name="Edit" size={16} />
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
                          <div className="flex items-center space-x-2">
                            <Icon
                              name="Users"
                              size={16}
                              className="text-muted-foreground"
                            />
                            <span className="text-sm text-foreground">{sub.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sub.head} • {sub.employees} employees
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} loading={loading}>
          Save Structure
        </Button>
      </div>
    </div>
  );
};

export default DepartmentStructure;
