'use client';
import React, { useEffect, useState } from 'react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import Icon from '../../../../components/AppIcon';

const BASE_LOGO_URL = 'https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_logo/';

const employeeCountOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000-5000', label: '1000-5000 employees' },
  { value: '5000+', label: '5000+ employees' },
];

const workWeekOptions = [
  { value: 'mon-fri', label: 'Monday to Friday' },
  { value: 'mon-sat', label: 'Monday to Saturday' },
  { value: 'other', label: 'Other' },
];

const OrganizationInfoForm = ({ onSave, loading = false }) => {
  const [sessionData, setSessionData] = useState({});
  const [sessionOrgType, setSessionOrgType] = useState('');
  const [industryOptions, setIndustryOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    legal_name: '',
    cin: '',
    gstin: '',
    pan: '',
    registered_address: '',
    industry: '',
    employee_count: '',
    work_week: '',
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [sisterCompanies, setSisterCompanies] = useState([
    {
      legal_name: '',
      cin: '',
      gstin: '',
      pan: '',
      registered_address: '',
      industry: '',
      employee_count: '',
      work_week: '',
      logo: null,
      logoPreview: null,
    },
  ]);

  const validatePAN = (pan) => {
    if (!pan) return '';
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      return 'PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., AAAAA9999A)';
    }
    return '';
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { APP_URL, token, sub_institute_id,org_type } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id,org_type });
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      console.log('sessionData',sessionData);
      fetchIndustries();
      fetchOrganizationData();
    }
  }, [sessionData.url, sessionData.token]);

  const prependLogoUrl = (logoUrl) => {
    if (!logoUrl) return null;
    return logoUrl.startsWith('http') ? logoUrl : `${BASE_LOGO_URL}${logoUrl}`;
  };

  const fetchIndustries = async () => {
    try {
      const response = await fetch(
        `${sessionData.url}/table_data?table=s_industries&group_by=industries`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setIndustryOptions(data);
    } catch (err) {
      console.error('Error fetching industries:', err);
    }
  };

  const fetchOrganizationData = async () => {
    try {
      const response = await fetch(
        `${sessionData.url}/settings/organization_data?type=API&sub_institute_id=${sessionData.sub_institute_id}&token=${sessionData.token}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData) {
        const data = responseData.org_data[0] || {};
        setSessionOrgType(data.industry || '');
        // console.log("📌 Industry from API:", data.industry); // debug
        // console.log("📌 sessionOrgType (state):", data.industry || ''); // debug
        setFormData({
          legal_name: data.legal_name || '',
          cin: data.cin || '',
          gstin: data.gstin || '',
          pan: data.pan || '',
          registered_address: data.registered_address || '',
          industry: sessionOrgType || '',
          employee_count: data.employee_count || '',
          work_week: data.work_week || '',
          logo: data.logo || null,
        });
        setLogoPreview(prependLogoUrl(data.logo_url || data.logo));

        setSisterCompanies(
          data.sisters_org?.length
            ? data.sisters_org.map((company) => ({
              legal_name: company.legal_name || '',
              cin: company.cin || '',
              gstin: company.gstin || '',
              pan: company.pan || '',
              registered_address: company.registered_address || '',
              industry: sessionOrgType || '',
              employee_count: company.employee_count || '',
              work_week: company.work_week || '',
              logo: company.logo || null,
              logoPreview: prependLogoUrl(company.logo_url || company.logo),
            }))
            : [
              {
                legal_name: '',
                cin: '',
                gstin: '',
                pan: '',
                registered_address: '',
                industry: sessionOrgType || '',
                employee_count: '',
                work_week: '',
                logo: null,
                logoPreview: null,
              },
            ]
        );
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

 const handleSubmit = async (e) => {
   e.preventDefault();
   if (Object.values(errors).some(err => err)) {
     alert('Please fix validation errors before submitting.');
     return;
   }
   try {
    const formDataPayload = new FormData();

    // Main org data
    formDataPayload.append('legal_name', formData.legal_name);
    formDataPayload.append('cin', formData.cin);
    formDataPayload.append('gstin', formData.gstin);
    formDataPayload.append('pan', formData.pan);
    formDataPayload.append('registered_address', formData.registered_address);
    formDataPayload.append('industry', sessionOrgType || formData.industry);
    formDataPayload.append('employee_count', formData.employee_count);
    formDataPayload.append('work_week', formData.work_week);
    
    // Handle logo file
    if (formData.logo instanceof File) {
      formDataPayload.append('logo', formData.logo);
    } else if (formData.logo) {
      formDataPayload.append('logo_url', formData.logo);
    }

    // Sister company data
    sisterCompanies.forEach((sister, index) => {
      formDataPayload.append(`sister_companies[${index}][legal_name]`, sister.legal_name);
      formDataPayload.append(`sister_companies[${index}][cin]`, sister.cin);
      formDataPayload.append(`sister_companies[${index}][gstin]`, sister.gstin);
      formDataPayload.append(`sister_companies[${index}][pan]`, sister.pan);
      formDataPayload.append(`sister_companies[${index}][registered_address]`, sister.registered_address);
      formDataPayload.append(`sister_companies[${index}][industry]`, sessionOrgType || sister.industry);
      formDataPayload.append(`sister_companies[${index}][employee_count]`, sister.employee_count);
      formDataPayload.append(`sister_companies[${index}][work_week]`, sister.work_week);
      
      if (sister.logo instanceof File) {
        formDataPayload.append(`sister_companies[${index}][logo]`, sister.logo);
      } else if (sister.logo) {
        formDataPayload.append(`sister_companies[${index}][logo_url]`, sister.logo);
      }
    });

    // ✅ FIX 1: Ensure all required parameters are included
    formDataPayload.append('token', sessionData.token);
    formDataPayload.append('formType', 'org_data');
    formDataPayload.append('type', 'API');
    formDataPayload.append('sub_institute_id', sessionData.sub_institute_id);

    // ✅ DEBUG: Check what's actually in FormData
    console.log('📦 Form Data being submitted:');
    for (let [key, value] of formDataPayload.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File { name: "${value.name}", type: "${value.type}", size: ${value.size} bytes }`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    // ✅ FIX 2: Try different approaches for token handling

    // Approach 1: Send token only in FormData (remove Authorization header)
    const response = await fetch(`${sessionData.url}/settings/organization_data`, {
      method: 'POST',
      // ❌ Remove Authorization header when using FormData with token
      body: formDataPayload,
    });

    // If Approach 1 doesn't work, try Approach 2:
    // const response = await fetch(`${sessionData.url}/settings/organization_data?token=${sessionData.token}`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${sessionData.token}`,
    //   },
    //   body: formDataPayload,
    // });

    // If Approach 2 doesn't work, try Approach 3 (URL parameters):
    // const url = new URL(`${sessionData.url}/settings/organization_data`);
    // url.searchParams.append('token', sessionData.token);
    // url.searchParams.append('formType', 'org_data');
    // url.searchParams.append('type', 'API');
    // url.searchParams.append('sub_institute_id', sessionData.sub_institute_id);
    
    // const response = await fetch(url, {
    //   method: 'POST',
    //   body: formDataPayload,
    // });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    onSave?.(responseData);
    alert(responseData.message);
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Error saving organization data. Please try again.');
  }
};

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

 const handleLogoUpload = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    // ✅ Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload only PNG or JPG images.');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 2MB.');
      return;
    }
    
    setFormData((prev) => ({ ...prev, logo: file }));
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result);
    reader.readAsDataURL(file);
  }
};

  const addSisterCompany = () => {
    setSisterCompanies((prev) => [
      ...prev,
      {
        legal_name: '',
        cin: '',
        gstin: '',
        pan: '',
        registered_address: '',
        industry: sessionOrgType || '',
        employee_count: '',
        work_week: '',
        logo: null,
        logoPreview: null,
      },
    ]);
  };

  const removeSisterCompany = (index) => {
    if (sisterCompanies.length > 1) {
      setSisterCompanies((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSisterChange = (index, field, value) => {
    if (field === 'pan') value = value.toUpperCase();
    const updated = [...sisterCompanies];
    updated[index][field] = value;
    setSisterCompanies(updated);
  };

 const handleSisterLogoUpload = (index, e) => {
  const file = e.target.files?.[0];
  if (file) {
    // Same validation as above
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024;
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload only PNG or JPG images.');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 2MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = [...sisterCompanies];
      updated[index].logo = file;
      updated[index].logoPreview = e.target?.result;
      setSisterCompanies(updated);
    };
    reader.readAsDataURL(file);
  }
};
  const displayValue = (value, placeholder) =>
    value === null || value === '' ? placeholder : value;

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      {/* MAIN FORM */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Organization Information</h3>
          {/* <Icon name="Building2" size={20} className="text-muted-foreground" /> */}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Legal Name{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <Input
                id="org-legal-name"
                value={displayValue(formData.legal_name, '')}
                placeholder="Enter legal organization name"
                onChange={(e) => handleInputChange('legal_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">CIN (Corporate Identification Number){" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <Input
                id="org-cin"
                value={displayValue(formData.cin, '')}
                placeholder="Enter 21-digit CIN"
                onChange={(e) => handleInputChange('cin', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">GSTIN (Optional)</label>
              <Input
                value={displayValue(formData.gstin, '')}
                placeholder="Enter 15-digit GSTIN"
                onChange={(e) => handleInputChange('gstin', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">PAN{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <Input
                id="org-pan"
                value={displayValue(formData.pan, '')}
                placeholder="Enter PAN (e.g., AAAAA9999A)"
                onChange={(e) => handleInputChange('pan', e.target.value)}
                onBlur={(e) => setErrors(prev => ({...prev, pan: validatePAN(e.target.value)}))}
                required
              />
              {errors.pan && <p className="text-red-500 text-xs">{errors.pan}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2" id="org-industry">
              <label className="block text-sm font-medium">Industry</label>
              {/* <select
                value={sessionData.org_type}
                disabled
                className="w-full px-3 py-2 border border-input rounded-md text-sm shadow-sm"
              >
                <option value="">{sessionOrgType || 'Select industry'}</option>
              </select> */}
              <select
              value={sessionData.org_type}
              disabled // ✅ disables selection
              className="w-full px-3 py-2 border border-input  rounded-md text-sm shadow-sm"
            >
              <option value="">Select industry</option>
              {industryOptions.map((option, index) => (
                <option key={index} value={option.industries}>
                  {option.industries}
                </option>
              ))}
            </select>
              {/* <select
                value={displayValue(formData.industry, '')}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select industry</option>
                {industryOptions.map((option, index) => (
                  <option key={index} value={option.industries}>
                    {option.industries}
                  </option>
                ))}
              </select> */}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Employee Count{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <select
                id="org-employee-count"
                value={displayValue(formData.employee_count, '')}
                onChange={(e) => handleInputChange('employee_count', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select employee count</option>
                {employeeCountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Work Week{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
            <select
              id="org-work-week"
              value={displayValue(formData.work_week, '')}
              onChange={(e) => handleInputChange('work_week', e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Select work week</option>
              {workWeekOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Registered Address{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
            <Input
              id="org-address"
              value={displayValue(formData.registered_address, '')}
              placeholder="Enter complete registered address"
              onChange={(e) => handleInputChange('registered_address', e.target.value)}
              required
            />
          </div>

          <div id="org-logo-upload">
            <label className="block text-sm font-medium mb-2">Organization Logo</label>
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
                <label
                  htmlFor="logo-upload"
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
      </div>

      {/* SISTER COMPANY FORMS */}
      {sisterCompanies.map((sister, index) => (
        <div key={index} className="border border-border rounded-lg p-5 mb-6 relative" id="org-sister-companies">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-foreground">
              {displayValue(sister.legal_name, `Sister Concern Company #${index + 1}`)}
            </h4>
            <div className="flex space-x-2">
              {index === 0 && (
                <button type="button" onClick={addSisterCompany} className="p-1 rounded-full bg-blue-400 text-white hover:bg-blue-500" title="Add another sister company">
                  <Icon name="Plus" size={16} />
                </button>
              )}
              {index !== 0 && (
                <button type="button" onClick={() => removeSisterCompany(index)} className="p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" title="Remove this sister company">
                  <Icon name="Minus" size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Legal Name</label>
              <Input
                value={displayValue(sister.legal_name, '')}
                placeholder="Enter legal company name"
                onChange={(e) => handleSisterChange(index, 'legal_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">CIN</label>
              <Input
                value={displayValue(sister.cin, '')}
                placeholder="Enter 21-digit CIN"
                onChange={(e) => handleSisterChange(index, 'cin', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">GSTIN</label>
              <Input
                value={displayValue(sister.gstin, '')}
                placeholder="Enter 15-digit GSTIN"
                onChange={(e) => handleSisterChange(index, 'gstin', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">PAN</label>
              <Input
                value={displayValue(sister.pan, '')}
                placeholder="Enter PAN (e.g., AAAAA9999A)"
                onChange={(e) => handleSisterChange(index, 'pan', e.target.value)}
                onBlur={(e) => setErrors(prev => ({...prev, [`sister_pan_${index}`]: validatePAN(e.target.value)}))}
              />
              {errors[`sister_pan_${index}`] && <p className="text-red-500 text-xs">{errors[`sister_pan_${index}`]}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Industry</label>
              <select
              value={sessionData.org_type}
              disabled // ✅ disables selection
              className="w-full px-3 py-2 border border-input  rounded-md text-sm shadow-sm"
            >
              <option value="">Select industry</option>
              {industryOptions.map((option, index) => (
                <option key={index} value={option.industries}>
                  {option.industries}
                </option>
              ))}
            </select>
              {/* <select
                value={displayValue(sister.industry, '')}
                disabled // ✅ disables selection
                className="w-full px-3 py-2 border border-input rounded-md text-sm shadow-sm"
              >
                <option value="">Select industry</option>
                {industryOptions.map((option, idx) => (
                  <option key={idx} value={option.industries}>
                    {option.industries}
                  </option>
                ))}
              </select> */}
              {/* <select
                value={displayValue(sister.industry, '')}
                onChange={(e) => handleSisterChange(index, 'industry', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select industry</option>
                {industryOptions.map((option, idx) => (
                  <option key={idx} value={option.industries}>
                    {option.industries}
                  </option>
                ))}
              </select> */}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Employee Count</label>
              <select
                value={displayValue(sister.employee_count, '')}
                onChange={(e) => handleSisterChange(index, 'employee_count', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select employee count</option>
                {employeeCountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium">Registered Address</label>
            <Input
              value={displayValue(sister.registered_address, '')}
              placeholder="Enter complete registered address"
              onChange={(e) => handleSisterChange(index, 'registered_address', e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Company Logo</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden">
                {sister.logoPreview ? (
                  <img src={sister.logoPreview} alt="Sister company logo" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="Building2" size={24} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSisterLogoUpload(index, e)}
                  className="hidden"
                  id={`sister-logo-upload-${index}`}
                />
                <label
                  htmlFor={`sister-logo-upload-${index}`}
                  className="inline-flex items-center px-4 py-2 border border-input bg-background rounded-md text-sm font-medium text-foreground hover:bg-muted cursor-pointer"
                >
                  <Icon name="Upload" size={16} className="mr-2" />
                  Upload Logo
                </label>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-6 col-span-1 md:col-span-3 flex justify-center">
        <Button id="org-info-submit-btn" type="submit" disabled={loading} className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
          {loading ? 'Saving...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
};

export default OrganizationInfoForm;



