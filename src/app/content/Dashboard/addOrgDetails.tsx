import { datalist } from 'framer-motion/m';
import React, { useState, useEffect } from 'react';

interface OrganizationDetails {
  organization_name?: string;
  organization_code?: string;
  organization_type?: string;
  organization_email?: string;
  organization_ph_no?: string;
  organization_website?: string;
  address?: string;
  industry_type?: string;
  registration_number?: string;
  handler_name?: string;
  handler_mobile?: string;
  handler_email?: string;
  total_emp?: string;
  total_department?: string;
  working_days?: string;
  working_hours?: string;
}

const AddOrgDetails = () => {
  const [formData, setFormData] = useState<OrganizationDetails>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
    syear:'',
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name,syear } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
        syear: syear
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
        `${sessionData.url}/settings/institute_detail?type=API&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}&syear=${sessionData.syear}&formName=organization_details`,
      );
      const data = await response.json();
      // console.log('Fetched organization details:', data);
      if (data) {
        setFormData({
          organization_name: data.organization_name || '',
          organization_code: data.organization_code || '',
          organization_type: data.organization_type || '',
          organization_email: data.organization_email || '',
          organization_ph_no: data.organization_ph_no || '',
          organization_website: data.organization_website || '',
          address: data.address || '',
          industry_type: data.industry_type || '',
          registration_number: data.registration_number || '',
          handler_name: data.handler_name || '',
          handler_mobile: data.handler_mobile || '',
          handler_email: data.handler_email || '',
          total_emp: data.total_emp || '',
          total_department: data.total_department || '',
          working_days: data.working_days || '',
          working_hours: data.working_hours || ''
        });
      }
    } catch (err) {
      setError('Failed to fetch organization details');
      console.error('Error fetching organization details:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

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
          formName:'organization_details',
        })
      });

      const result = await response.json();

      alert(result.message);
      fetchOrganizationDetails();
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-black">Loading...</div>;
  }

  return (
    <div className="detailsDiv">
      <div className="container mx-auto px-1 rounded-lg">
        <div className='flex rounded-lg p-4'>
          <div className="headerMenu">
            <p className="text-3xl font-bold mb-4 text-[#4876ab]" style={{ fontFamily: "cursive" }}>Add Organization Detail</p>
          </div>
          <div className="ml-auto"></div>
        </div>
      </div>
      <hr className='mb-[26px] text-[#ddd] border-2 border-[#449dd5] rounded' />

      {submitSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Organization details saved successfully!
        </div>
      )}

      <div className="formDiv p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organization Basic Info */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name || ''}
                onChange={handleChange}
                placeholder="Enter organization name"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Organization Code</label>
              <input
                type="text"
                name="organization_code"
                value={formData.organization_code || ''}
                onChange={handleChange}
                placeholder="Enter organization code"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Organization Type</label>
              <input
                type="text"
                name="organization_type"
                value={formData.organization_type || ''}
                onChange={handleChange}
                placeholder="Enter organization type"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Organization Email</label>
              <input
                type="email"
                name="organization_email"
                value={formData.organization_email || ''}
                onChange={handleChange}
                placeholder="Enter organization email"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Organization Phone</label>
              <input
                type="tel"
                name="organization_ph_no"
                value={formData.organization_ph_no || ''}
                pattern="[0-9]{10}"
                onChange={handleChange}
                placeholder="Enter organization phone number"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Organization Website</label>
              <input
                type="url"
                name="organization_website"
                value={formData.organization_website || ''}
                onChange={handleChange}
                placeholder="Enter organization website URL"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Enter organization address"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            {/* Industry and Registration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Industry Type</label>
              <input
                type="text"
                name="industry_type"
                value={formData.industry_type || ''}
                onChange={handleChange}
                placeholder="Enter industry type"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number || ''}
                onChange={handleChange}
                placeholder="Enter registration number"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            {/* Handler Information */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Handler Name</label>
              <input
                type="text"
                name="handler_name"
                value={formData.handler_name || ''}
                onChange={handleChange}
                placeholder="Enter handler name"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Handler Mobile</label>
              <input
                type="tel"
                name="handler_mobile"
                value={formData.handler_mobile || ''}
                pattern="[0-9]{10}"
                onChange={handleChange}
                placeholder="Enter handler mobile number"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Handler Email</label>
              <input
                type="email"
                name="handler_email"
                value={formData.handler_email || ''}
                onChange={handleChange}
                placeholder="Enter handler email"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            {/* Employee and Department */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Total Employees</label>
              <input
                type="number"
                name="total_emp"
                value={formData.total_emp || ''}
                onChange={handleChange}
                placeholder="Enter total number of employees"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Total Departments</label>
              <input
                type="number"
                name="total_department"
                value={formData.total_department || ''}
                onChange={handleChange}
                placeholder="Enter total number of departments"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            {/* Working Information */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Working Days</label>
              <input
                type="text"
                name="working_days"
                value={formData.working_days || ''}
                onChange={handleChange}
                placeholder="e.g., Monday-Friday"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Working Hours</label>
              <input
                type="text"
                name="working_hours"
                value={formData.working_hours || ''}
                onChange={handleChange}
                placeholder="e.g., 9:00 AM - 5:00 PM"
                className="w-full block p-2 border-2 border-[var(--color-blue-100)] rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black"
              />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrgDetails;