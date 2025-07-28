import React, { useState, useEffect } from 'react';
import Button from '../../../../components/skill/Button';
import Input from '../../../../components/skill/Input';
import Select from '../../../../components/skill/Select';
import Icon from '@/components/AppIcon';

const OrganizationInfoForm = ({ onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    organization_name: '',
    industry_type: '',
    total_emp: '',
    organization_website: '',
    organization_ph_no: '',
    organization_email: '',
    address: '',
    description: '',
    logo: null
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    orgType: '',
    subInstituteId: '',
    userId: '',
    userProfile: '',
    syear: '',
  });

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'other', label: 'Other' }
  ];

  const employeeCountOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000-5000', label: '1000-5000 employees' },
    { value: '5000+', label: '5000+ employees' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const {
        APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name, syear
      } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
        syear
      });
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchOrganizationDetails();
    }
  }, [sessionData]);

  const fetchOrganizationDetails = async () => {
    try {
      const response = await fetch(
        `${sessionData.url}/settings/institute_detail?type=API&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}&syear=${sessionData.syear}&formName=organization_details`
      );
      const data = await response.json();

      if (data) {
        setFormData({
          organization_name: data.organization_name || '',
          industry_type: data.industry_type || '',
          total_emp: data.total_emp || '',
          organization_website: data.organization_website || '',
          organization_ph_no: data.organization_ph_no || '',
          organization_email: data.organization_email || '',
          address: data.address || '',
          description: data.description || '',
          logo: null
        });
      }
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setError('Failed to fetch organization details');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${sessionData.url}/settings/institute_detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: 'API',
          sub_institute_id: sessionData.subInstituteId,
          user_id: sessionData.userId,
          syear: sessionData.syear,
          formName: 'organization_details',
        })
      });

      const result = await response.json();
      alert(result.message);
      fetchOrganizationDetails();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Organization Information</h3>
        <Icon name="Building2" size={20} className="text-muted-foreground" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Organization Name" value={formData.organization_name} onChange={e => handleInputChange('organization_name', e.target.value)} required />
          <Select label="Industry" value={formData.industry_type} onChange={value => handleInputChange('industry_type', value)} options={industryOptions} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select label="Employee Count" value={formData.total_emp} onChange={value => handleInputChange('total_emp', value)} options={employeeCountOptions} required />
          <Input label="Website" type="url" value={formData.organization_website} onChange={e => handleInputChange('organization_website', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Phone" type="tel" value={formData.organization_ph_no} onChange={e => handleInputChange('organization_ph_no', e.target.value)} />
          <Input label="Email" type="organization_email" value={formData.organization_email} onChange={e => handleInputChange('organization_email', e.target.value)} />
        </div>

        <Input label="Address" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} />

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
              <label htmlFor="logo-upload" className="inline-flex items-center px-4 py-2 border border-input bg-background rounded-md text-sm font-medium text-foreground hover:bg-muted transition-micro cursor-pointer">
                <Icon name="Upload" size={16} className="mr-2" /> Upload Logo
              </label>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB. Recommended: 200x200px</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" type="button">Cancel</Button>
          <Button type="submit" loading={loading || isSubmitting}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationInfoForm;