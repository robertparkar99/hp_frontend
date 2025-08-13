'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/AppIcon';
import Loading from '@/components/utils/loading';

const AbilityTaxonomy = ({ onSave, loading = false }) => {
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

  // Load session data
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

  // Fetch data
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchData();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const deptRes = await fetch(
        `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[classification]=ability&group_by=classification_category&order_by[direction]=desc`
      );
      const subDeptRes = await fetch(
        `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[classification]=ability&group_by=classification_sub_category&order_by[direction]=desc`
      );

      if (!deptRes.ok || !subDeptRes.ok) throw new Error('Network error');

      const deptData = await deptRes.json();
      const subDeptData = await subDeptRes.json();

      const merged = deptData.map((dept) => ({
        id: dept.id || dept.classification_category,
        name: dept.classification_category,
        employees: dept.total_employees || 0,
        subdepartments: subDeptData
          .filter((sub) => sub.classification_category === dept.classification_category)
          .map((sub) => ({
            id: sub.id || sub.classification_sub_category,
            name: sub.classification_sub_category,
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

  // Add category
  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) return;

    try {
      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('token', sessionData.token);
      formData.append('formType', 'add category');
      formData.append('user_id', sessionData.userId);
      formData.append('attribute', 'ability');
      formData.append('classification_category', newDepartment.name.trim());

      const res = await fetch(`${sessionData.url}/skill_library/attributes_taxonomy`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to add category');

      await fetchData(); // refresh list immediately
      setNewDepartment({ name: '' });
      setShowAddForm(false);
      alert('Category successfully added ✅');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  // Edit category
  const handleEditSave = async () => {
    if (!editDepartment?.name.trim()) return;

    try {
      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('token', sessionData.token);
      formData.append('formType', 'edit category');
      formData.append('user_id', sessionData.userId);
      formData.append('attribute', 'ability');
      formData.append('old_classification_category', editDepartment.oldName.trim());
      formData.append('classification_category', editDepartment.name.trim());

      const res = await fetch(`${sessionData.url}/skill_library/attributes_taxonomy`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to edit category');

      await fetchData();
      setEditDepartment(null);
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  // Add subcategory
  const handleAddSubCategory = async (departmentName, subName) => {
    try {
      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('token', sessionData.token);
      formData.append('user_id', sessionData.userId);
      formData.append('formType', 'edit category');
      formData.append('attribute', 'ability');
      formData.append('classification_category', departmentName.trim());
      formData.append('classification_sub_category', subName.trim());

      const res = await fetch(`${sessionData.url}/skill_library/attributes_taxonomy`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to add sub-category');

      await fetchData();
    } catch (error) {
      console.error('Error adding sub-category:', error);
    }
  };

  // Edit subcategory
  const handleEditSubDepartmentSave = async () => {
    if (!editSubDepartment?.newName.trim()) return;

    try {
      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('token', sessionData.token);
      formData.append('user_id', sessionData.userId);
      formData.append('formType', 'edit sub_category');
      formData.append('attribute', 'ability');
      formData.append('classification_category', editSubDepartment.departmentName.trim());
      formData.append('old_classification_sub_category', editSubDepartment.oldName.trim());
      formData.append('classification_sub_category', editSubDepartment.newName.trim());

      const res = await fetch(`${sessionData.url}/skill_library/attributes_taxonomy`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to edit sub-category');

      await fetchData();
      setEditSubDepartment(null);
    } catch (error) {
      console.error('Error editing sub-category:', error);
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
        <h3 className="text-lg font-semibold text-foreground">Ability Taxonomy</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
          Add Category
        </Button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Add New Category</h4>
          <Input
            value={newDepartment.name}
            onChange={(e) => setNewDepartment({ name: e.target.value })}
            placeholder="Category Name"
          />
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddDepartment} disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      )}

      {/* Department List */}
      <div className="space-y-4">
        {departments.map((department) => (
          <div key={department.id} className="border border-border rounded-lg p-4">
            {editDepartment?.id === department.id ? (
              <div className="mb-4 p-4 bg-muted rounded-lg border border-border">
                <h4 className="text-sm font-medium text-foreground mb-4">Edit Category</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    className="flex-1"
                    value={editDepartment.name}
                    onChange={(e) =>
                      setEditDepartment((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Category Name"
                  />
                  <Input
                    className="flex-1"
                    value={editDepartment.newSub || ''}
                    onChange={(e) =>
                      setEditDepartment((prev) => ({ ...prev, newSub: e.target.value }))
                    }
                    placeholder="Add Sub-category"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setEditDepartment(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      await handleEditSave();
                      if (editDepartment.newSub?.trim()) {
                        await handleAddSubCategory(department.name, editDepartment.newSub.trim());
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Icon name="Building2" size={20} className="text-primary" />
                  <h4 className="font-medium text-foreground">{department.name}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setEditDepartment({
                      id: department.id,
                      name: department.name,
                      oldName: department.name,
                      newSub: '',
                    })
                  }
                  className="text-muted-foreground hover:text-primary"
                >
                  <Icon name="Pencil" size={16} />
                </Button>
              </div>
            )}

            {/* Subcategories */}
            {department.subdepartments?.length > 0 && (
              <div className="pl-6 border-l-2 border-border">
                <h5 className="text-sm font-medium text-muted-foreground mb-2">
                  Sub-categories
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {department.subdepartments
                    .filter((sub) => sub?.name?.trim())
                    .map((sub) => (
                      <div key={sub.id} className="flex flex-col gap-2">
                        {editSubDepartment?.departmentName === department.name &&
                        editSubDepartment?.oldName === sub.name ? (
                          <div className="p-2 bg-muted rounded border border-border">
                            <Input
                              value={editSubDepartment.newName}
                              onChange={(e) =>
                                setEditSubDepartment((prev) => ({
                                  ...prev,
                                  newName: e.target.value,
                                }))
                              }
                              placeholder="New Sub-category Name"
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditSubDepartment(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleEditSubDepartmentSave}
                                disabled={loading}
                              >
                                {loading ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer"
                            onDoubleClick={() =>
                              setEditSubDepartment({
                                departmentName: department.name,
                                oldName: sub.name,
                                newName: sub.name,
                              })
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <Icon name="Users" size={16} className="text-muted-foreground" />
                              <span className="text-sm text-foreground">{sub.name}</span>
                            </div>
                          </div>
                        )}
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
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Structure'}
        </Button>
      </div>
    </div>
  );
};

export default AbilityTaxonomy;
