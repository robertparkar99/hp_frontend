import React, { useState } from 'react';
//import Button from '../../../../components/ui/button';
//import Input from '../../../../components/ui/input';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
import Button from '../../../../components/skill/Button';
import Input from '../../../../components/skill/Input';
import Icon from '@/components/AppIcon';

const DepartmentStructure = ({ onSave, loading = false }) => {
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: 'Engineering',
      head: 'Rajesh Rafaliya',
      employees: 5,
      subdepartments: [
        { id: 11, name: 'Frontend Development', head: 'Vivek Gajera', employees: 2 },
        { id: 12, name: 'Backend Development', head: 'Uma Saroj', employees: 2 },
        { id: 13, name: 'DevOps', head: 'Shivraj Singh', employees: 1 }
      ]
    },
    {
      id: 2,
      name: 'Marketing',
      head: 'Kalpesh Sheth',
      employees: 2,
      subdepartments: [
        { id: 21, name: 'Digital Marketing', head: 'Dev Sheth', employees: 1 },
        { id: 22, name: 'Content Marketing', head: 'Devanshi Modi', employees: 1 }
      ]
    },
    {
      id: 3,
      name: 'Sales',
      head: 'Kalpesh Sheth',
      employees: 3,
      subdepartments: [
        { id: 31, name: 'Inside Sales', head: 'Abhi Raval', employees: 2 },
        { id: 32, name: 'Field Sales', head: 'Ajit Singh', employees: 1 }
      ]
    },
    {
      id: 4,
      name: 'Human Resources',
      head: 'Kalpesh Sheth',
      employees: 0,
      subdepartments: []
    }
  ]);

  const [editingDepartment, setEditingDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', head: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddDepartment = () => {
    if (newDepartment.name && newDepartment.head) {
      const department = {
        id: Date.now(),
        name: newDepartment.name,
        head: newDepartment.head,
        employees: 0,
        subdepartments: []
      };
      setDepartments([...departments, department]);
      setNewDepartment({ name: '', head: '' });
      setShowAddForm(false);
    }
  };

  const handleEditDepartment = (id) => {
    const dept = departments.find(d => d.id === id);
    setEditingDepartment(dept);
  };

  const handleUpdateDepartment = (updatedDept) => {
    setDepartments(departments.map(dept => 
      dept.id === updatedDept.id ? updatedDept : dept
    ));
    setEditingDepartment(null);
  };

  const handleDeleteDepartment = (id) => {
    setDepartments(departments.filter(dept => dept.id !== id));
  };

  const handleSave = () => {
    onSave?.(departments);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Department Structure</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddForm(true)}
          iconName="Plus"
        >
          Add Department
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Add New Department</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department Name"
              value={newDepartment.name}
              onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
              placeholder="e.g., Finance"
            />
            <Input
              label="Department Head"
              value={newDepartment.head}
              onChange={(e) => setNewDepartment({...newDepartment, head: e.target.value})}
              placeholder="e.g., Rajesh Rafaliya"
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
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditDepartment(department.id)}
                  iconName="Edit"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDepartment(department.id)}
                  iconName="Trash2"
                />
              </div>
            </div>

            {department.subdepartments?.length > 0 && (
              <div className="pl-6 border-l-2 border-border space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Sub-departments</h5>
                {department.subdepartments.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center space-x-2">
                      <Icon name="Users" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{sub.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sub.head} • {sub.employees} employees
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave} loading={loading}>
          Save Structure
        </Button>
      </div>
    </div>
  );
};

export default DepartmentStructure;