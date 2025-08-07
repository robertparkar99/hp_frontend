'use client';

import React, { useState } from 'react';
import {Input} from '../../../../components/ui/input';
import {Select} from '../../../../components/ui/select';
import {Button} from '../../../../components/ui/button';
import Icon from '../../../../components/AppIcon';

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const employeeCountOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000-5000', label: '1000-5000 employees' },
  { value: '5000+', label: '5000+ employees' },
];

const OrganizationInfoForm = ({ onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    name: 'Acme Corporation',
    industry: 'technology',
    employeeCount: '1000-5000',
    website: 'https://www.acme.com',
    phone: '+1 (555) 123-4567',
    email: 'info@acme.com',
    address: '123 Business Ave, Tech City, TC 12345',
    description: 'Leading technology company focused on innovation and excellence.',
    logo: null
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [sisterCompanies, setSisterCompanies] = useState([
    {
      name: 'Sister Company 1',
      industry: '',
      employeeCount: '',
      website: '',
      phone: '',
      email: '',
      address: '',
      description: '',
      logo: null,
      logoPreview: null
    }
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({...formData, sisterCompanies});
  };

  const addSisterCompany = () => {
    setSisterCompanies(prev => [
      ...prev,
      {
        name: `Sister Company ${prev.length + 1}`,
        industry: '',
        employeeCount: '',
        website: '',
        phone: '',
        email: '',
        address: '',
        description: '',
        logo: null,
        logoPreview: null
      }
    ]);
  };

  const removeSisterCompany = (index) => {
    if (sisterCompanies.length > 1) {
      setSisterCompanies(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSisterChange = (index, field, value) => {
    const updated = [...sisterCompanies];
    updated[index][field] = value;
    setSisterCompanies(updated);
  };

  const handleSisterLogoUpload = (index, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = [...sisterCompanies];
      updated[index].logo = file;
      updated[index].logoPreview = e.target?.result;
      setSisterCompanies(updated);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* MAIN FORM */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Organization Information</h3>
          <Icon name="Building2" size={20} className="text-muted-foreground" />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Organization Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
            <Select label="Industry" value={formData.industry} onChange={(value) => handleInputChange('industry', value)} options={industryOptions} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Employee Count" value={formData.employeeCount} onChange={(value) => handleInputChange('employeeCount', value)} options={employeeCountOptions} required />
            <Input label="Website" type="url" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
          </div>

          <div>
            <Input label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              className="w-full h-24 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your organization..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Organization Logo</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="Building2" size={24} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                <label htmlFor="logo-upload" className="inline-flex items-center px-4 py-2 border border-input bg-background rounded-md text-sm font-medium text-foreground hover:bg-muted cursor-pointer">
                  <Icon name="Upload" size={16} className="mr-2" />
                  Upload Logo
                </label>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB. Recommended: 200x200px</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SISTER COMPANY FORMS */}
      {sisterCompanies.map((sister, index) => (
        <div key={index} className="bg-muted border border-border rounded-lg p-5 mb-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-foreground">Sister Concern Company #{index + 1}</h4>
            <div className="flex space-x-2">
              {/* Always show plus button on first form */}
              {index === 0 && (
                <button 
                  type="button" 
                  onClick={addSisterCompany}
                  className="p-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  title="Add another sister company"
                >
                  <Icon name="Plus" size={16} />
                </button>
              )}
              {/* Show minus button on all forms except first */}
              {index !== 0 && (
                <button 
                  type="button" 
                  onClick={() => removeSisterCompany(index)}
                  className="p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  title="Remove this sister company"
                >
                  <Icon name="Minus" size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Company Name" value={sister.name} onChange={(e) => handleSisterChange(index, 'name', e.target.value)} />
            <Select label="Industry" value={sister.industry} onChange={(value) => handleSisterChange(index, 'industry', value)} options={industryOptions} />
            <Select label="Employee Count" value={sister.employeeCount} onChange={(value) => handleSisterChange(index, 'employeeCount', value)} options={employeeCountOptions} />
            <Input label="Website" value={sister.website} onChange={(e) => handleSisterChange(index, 'website', e.target.value)} />
            <Input label="Email" value={sister.email} onChange={(e) => handleSisterChange(index, 'email', e.target.value)} />
            <Input label="Phone" value={sister.phone} onChange={(e) => handleSisterChange(index, 'phone', e.target.value)} />
            <Input label="Address" value={sister.address} onChange={(e) => handleSisterChange(index, 'address', e.target.value)} />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              className="w-full h-24 px-3 py-2 border border-input bg-background rounded-md text-sm"
              value={sister.description}
              onChange={(e) => handleSisterChange(index, 'description', e.target.value)}
              placeholder="Brief description of this company..."
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Upload Logo</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden">
                {sister.logoPreview ? (
                  <img src={sister.logoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="Building2" size={24} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSisterLogoUpload(index, file);
                  }}
                  className="hidden"
                  id={`logo-upload-${index}`}
                />
                <label
                  htmlFor={`logo-upload-${index}`}
                  className="inline-flex items-center px-4 py-2 border border-input bg-background rounded-md text-sm font-medium text-foreground hover:bg-muted cursor-pointer"
                >
                  <Icon name="Upload" size={16} className="mr-2" />
                  Upload Logo
                </label>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB. Recommended: 200x200px</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ACTION BUTTONS AT THE BOTTOM */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" type="button">Cancel</Button>
        <Button type="submit" loading={loading}>Save Changes</Button>
      </div>
    </form>
  );
};

export default OrganizationInfoForm;