'use client';

import React, { useEffect, useState } from 'react';
import Icon from '../../../AppIcon';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../ui/select';
import { Checkbox } from '../../../ui/checkbox';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type Skill = {
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  jobRoles: string[];
  knowledge: string;
  ability: string;
  application: string;
  proficiencyDistribution?: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
};

type SkillModalProps = {
  skill?: Skill;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'create';
  sessionData: {
    url: string;
    token: string;
    subInstituteId: string;
    orgType: string;
  };
};

type OptionType = {
  value: string;
  label: string;
};

const SkillModal: React.FC<SkillModalProps> = ({ skill, isOpen, onClose, mode, sessionData }) => {
  const [editData, setEditData] = useState<Skill>({
    name: '',
    description: '',
    category: '',
    priority: 'medium',
    icon: 'Target',
    jobRoles: [],
    knowledge: '',
    ability: '',
    application: ''
  });

  const [categories, setCategories] = useState<OptionType[]>([]);
  const [subCategories, setSubCategories] = useState<OptionType[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'employees' | 'courses'>('overview');

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=category&searchWord=departments`
      );
      const data = await res.json();
      setCategories(data.searchData?.map((item: string) => ({ 
        value: item, 
        label: item 
      })) || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments");
    }
  };

  const getSubDepartment = async (category: string) => {
    try {
      const res = await fetch(
        `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_category&searchWord=${encodeURIComponent(category)}`
      );
      const data = await res.json();
      setSubCategories(data.searchData?.map((item: string) => ({ 
        value: item, 
        label: item 
      })) || []);
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
      alert("Failed to load sub-departments");
    }
    setEditData(prev => ({ ...prev, category }));
  };

  useEffect(() => {
    if (isOpen && mode !== 'view') {
      fetchDepartments();
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setEditData({
          name: '',
          description: '',
          category: '',
          priority: 'medium',
          icon: 'Target',
          jobRoles: [],
          knowledge: '',
          ability: '',
          application: ''
        });
      } else if (skill) {
        setEditData(skill);
        if (skill.category) {
          getSubDepartment(skill.category);
        }
      }
    }
  }, [isOpen, mode, skill]);

  if (!isOpen) return null;

  const priorityOptions: OptionType[] = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const jobRoleOptions: OptionType[] = [
    { value: 'frontend-developer', label: 'Frontend Developer' },
    { value: 'backend-developer', label: 'Backend Developer' },
    { value: 'fullstack-developer', label: 'Fullstack Developer' },
    { value: 'ui-designer', label: 'UI Designer' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'data-analyst', label: 'Data Analyst' }
  ];

  const iconOptions: OptionType[] = [
    { value: 'Code', label: 'Code' },
    { value: 'Target', label: 'Target' },
    { value: 'Palette', label: 'Palette' },
    { value: 'Users', label: 'Users' },
    { value: 'Briefcase', label: 'Briefcase' },
    { value: 'BarChart3', label: 'BarChart3' }
  ];

  const proficiencyData = skill?.proficiencyDistribution
    ? [
        { level: 'Beginner', count: skill.proficiencyDistribution.beginner },
        { level: 'Intermediate', count: skill.proficiencyDistribution.intermediate },
        { level: 'Advanced', count: skill.proficiencyDistribution.advanced },
        { level: 'Expert', count: skill.proficiencyDistribution.expert }
      ]
    : [];

  const pieData = skill?.proficiencyDistribution
    ? [
        { name: 'Beginner', value: skill.proficiencyDistribution.beginner, color: '#EF4444' },
        { name: 'Intermediate', value: skill.proficiencyDistribution.intermediate, color: '#F59E0B' },
        { name: 'Advanced', value: skill.proficiencyDistribution.advanced, color: '#10B981' },
        { name: 'Expert', value: skill.proficiencyDistribution.expert, color: '#1E40AF' }
      ]
    : [];

  const handleSave = () => {
    console.log('Saving skill:', editData);
    onClose();
  };

  const handleInputChange = (field: keyof Skill, value: string | string[]) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (roleValue: string, isChecked: boolean) => {
    const updatedRoles = isChecked
      ? [...editData.jobRoles, roleValue]
      : editData.jobRoles.filter((r) => r !== roleValue);
    handleInputChange('jobRoles', updatedRoles);
  };

  const getSelectedOptionLabel = (value: string, options: OptionType[]) => {
    return options.find(option => option.value === value)?.label || value;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={editData.icon} size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {mode === 'edit' ? 'Edit Skill' : mode === 'create' ? 'Create New Skill' : skill?.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mode === 'view' ? skill?.category : 'Skill Management'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'view' && (
                <Button variant="outline" size="sm">
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {mode === 'view' && (
          <div className="border-b border-border">
            <div className="flex space-x-1 p-1">
              {['overview', 'analytics', 'employees', 'courses'].map((tabId) => (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId as 'overview' | 'analytics' | 'employees' | 'courses')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                    activeTab === tabId
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon 
                    name={
                      tabId === 'overview' ? 'Eye' : 
                      tabId === 'analytics' ? 'BarChart3' : 
                      tabId === 'employees' ? 'Users' : 'BookOpen'
                    } 
                    size={16} 
                  />
                  <span>{tabId.charAt(0).toUpperCase() + tabId.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {(mode === 'edit' || mode === 'create') ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* <Input
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter skill name"
                  required
                /> */}
                <Select
                  value={editData.category}
                  onValueChange={(value: string) => {
                    handleInputChange('category', value);
                    getSubDepartment(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subCategories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    value={editData.subCategory || ''}
                    onValueChange={(value: string) => handleInputChange('subCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  value={editData.priority}
                  onValueChange={(value: string) => handleInputChange('priority', value as 'high' | 'medium' | 'low')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={editData.icon}
                  onValueChange={(value: string) => handleInputChange('icon', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  className="w-full p-3 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  value={editData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter skill description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Associated Job Roles</label>
                <div className="grid grid-cols-2 gap-2">
                  {jobRoleOptions.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.value}`}
                        checked={editData.jobRoles.includes(role.value)}
                        onCheckedChange={(checked) => handleCheckboxChange(role.value, checked as boolean)}
                      />
                      <label htmlFor={`role-${role.value}`} className="text-sm font-medium leading-none">
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">KAA Framework</h3>
                <Input
                  value={editData.knowledge}
                  onChange={(e) => handleInputChange('knowledge', e.target.value)}
                  placeholder="What knowledge is required?"
                />
                <Input
                  value={editData.ability}
                  onChange={(e) => handleInputChange('ability', e.target.value)}
                  placeholder="What abilities are needed?"
                />
                <Input
                  value={editData.application}
                  onChange={(e) => handleInputChange('application', e.target.value)}
                  placeholder="How is this skill applied?"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                  <p className="text-foreground">{skill?.category}</p>
                </div>
                {skill?.subCategory && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Sub-Category</h3>
                    <p className="text-foreground">{skill.subCategory}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                  <p className="text-foreground capitalize">{skill?.priority}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="text-foreground">{skill?.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Associated Job Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {skill?.jobRoles.map((role) => (
                    <span key={role} className="px-3 py-1 bg-muted rounded-full text-sm text-foreground">
                      {getSelectedOptionLabel(role, jobRoleOptions)}
                    </span>
                  ))}
                </div>
              </div>

              {activeTab === 'analytics' && skill?.proficiencyDistribution && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-foreground">Proficiency Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={proficiencyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="level" />
                          <YAxis />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(mode === 'edit' || mode === 'create') && (
          <div className="p-6 border-t border-border">
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSave}>
                {mode === 'create' ? 'Create Skill' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillModal;