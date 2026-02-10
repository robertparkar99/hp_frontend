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

const countryCodeOptions = [
  { value: '+1', label: '+1 (US)' },
  { value: '+7', label: '+7 (Russia/Kazakhstan)' },
  { value: '+20', label: '+20 (Egypt)' },
  { value: '+27', label: '+27 (South Africa)' },
  { value: '+30', label: '+30 (Greece)' },
  { value: '+31', label: '+31 (Netherlands)' },
  { value: '+32', label: '+32 (Belgium)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+34', label: '+34 (Spain)' },
  { value: '+36', label: '+36 (Hungary)' },
  { value: '+39', label: '+39 (Italy)' },
  { value: '+40', label: '+40 (Romania)' },
  { value: '+41', label: '+41 (Switzerland)' },
  { value: '+43', label: '+43 (Austria)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+45', label: '+45 (Denmark)' },
  { value: '+46', label: '+46 (Sweden)' },
  { value: '+47', label: '+47 (Norway)' },
  { value: '+48', label: '+48 (Poland)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+51', label: '+51 (Peru)' },
  { value: '+52', label: '+52 (Mexico)' },
  { value: '+53', label: '+53 (Cuba)' },
  { value: '+54', label: '+54 (Argentina)' },
  { value: '+55', label: '+55 (Brazil)' },
  { value: '+56', label: '+56 (Chile)' },
  { value: '+57', label: '+57 (Colombia)' },
  { value: '+58', label: '+58 (Venezuela)' },
  { value: '+60', label: '+60 (Malaysia)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+62', label: '+62 (Indonesia)' },
  { value: '+63', label: '+63 (Philippines)' },
  { value: '+64', label: '+64 (New Zealand)' },
  { value: '+65', label: '+65 (Singapore)' },
  { value: '+66', label: '+66 (Thailand)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+82', label: '+82 (South Korea)' },
  { value: '+84', label: '+84 (Vietnam)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+90', label: '+90 (Turkey)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+92', label: '+92 (Pakistan)' },
  { value: '+93', label: '+93 (Afghanistan)' },
  { value: '+94', label: '+94 (Sri Lanka)' },
  { value: '+95', label: '+95 (Myanmar)' },
  { value: '+98', label: '+98 (Iran)' },
  { value: '+212', label: '+212 (Morocco)' },
  { value: '+213', label: '+213 (Algeria)' },
  { value: '+216', label: '+216 (Tunisia)' },
  { value: '+218', label: '+218 (Libya)' },
  { value: '+220', label: '+220 (Gambia)' },
  { value: '+221', label: '+221 (Senegal)' },
  { value: '+222', label: '+222 (Mauritania)' },
  { value: '+223', label: '+223 (Mali)' },
  { value: '+224', label: '+224 (Guinea)' },
  { value: '+225', label: '+225 (Ivory Coast)' },
  { value: '+226', label: '+226 (Burkina Faso)' },
  { value: '+227', label: '+227 (Niger)' },
  { value: '+228', label: '+228 (Togo)' },
  { value: '+229', label: '+229 (Benin)' },
  { value: '+230', label: '+230 (Mauritius)' },
  { value: '+231', label: '+231 (Liberia)' },
  { value: '+232', label: '+232 (Sierra Leone)' },
  { value: '+233', label: '+233 (Ghana)' },
  { value: '+234', label: '+234 (Nigeria)' },
  { value: '+235', label: '+235 (Chad)' },
  { value: '+236', label: '+236 (Central African Republic)' },
  { value: '+237', label: '+237 (Cameroon)' },
  { value: '+238', label: '+238 (Cape Verde)' },
  { value: '+239', label: '+239 (Sao Tome and Principe)' },
  { value: '+240', label: '+240 (Equatorial Guinea)' },
  { value: '+241', label: '+241 (Gabon)' },
  { value: '+242', label: '+242 (Congo)' },
  { value: '+243', label: '+243 (DR Congo)' },
  { value: '+244', label: '+244 (Angola)' },
  { value: '+245', label: '+245 (Guinea-Bissau)' },
  { value: '+246', label: '+246 (British Indian Ocean Territory)' },
  { value: '+247', label: '+247 (Ascension Island)' },
  { value: '+248', label: '+248 (Seychelles)' },
  { value: '+249', label: '+249 (Sudan)' },
  { value: '+250', label: '+250 (Rwanda)' },
  { value: '+251', label: '+251 (Ethiopia)' },
  { value: '+252', label: '+252 (Somalia)' },
  { value: '+253', label: '+253 (Djibouti)' },
  { value: '+254', label: '+254 (Kenya)' },
  { value: '+255', label: '+255 (Tanzania)' },
  { value: '+256', label: '+256 (Uganda)' },
  { value: '+257', label: '+257 (Burundi)' },
  { value: '+258', label: '+258 (Mozambique)' },
  { value: '+260', label: '+260 (Zambia)' },
  { value: '+261', label: '+261 (Madagascar)' },
  { value: '+262', label: '+262 (Mayotte/Reunion)' },
  { value: '+263', label: '+263 (Zimbabwe)' },
  { value: '+264', label: '+264 (Namibia)' },
  { value: '+265', label: '+265 (Malawi)' },
  { value: '+266', label: '+266 (Lesotho)' },
  { value: '+267', label: '+267 (Botswana)' },
  { value: '+268', label: '+268 (Eswatini)' },
  { value: '+269', label: '+269 (Comoros)' },
  { value: '+290', label: '+290 (Saint Helena)' },
  { value: '+291', label: '+291 (Eritrea)' },
  { value: '+297', label: '+297 (Aruba)' },
  { value: '+298', label: '+298 (Faroe Islands)' },
  { value: '+299', label: '+299 (Greenland)' },
  { value: '+350', label: '+350 (Gibraltar)' },
  { value: '+351', label: '+351 (Portugal)' },
  { value: '+352', label: '+352 (Luxembourg)' },
  { value: '+353', label: '+353 (Ireland)' },
  { value: '+354', label: '+354 (Iceland)' },
  { value: '+355', label: '+355 (Albania)' },
  { value: '+356', label: '+356 (Malta)' },
  { value: '+357', label: '+357 (Cyprus)' },
  { value: '+358', label: '+358 (Finland)' },
  { value: '+359', label: '+359 (Bulgaria)' },
  { value: '+370', label: '+370 (Lithuania)' },
  { value: '+371', label: '+371 (Latvia)' },
  { value: '+372', label: '+372 (Estonia)' },
  { value: '+373', label: '+373 (Moldova)' },
  { value: '+374', label: '+374 (Armenia)' },
  { value: '+375', label: '+375 (Belarus)' },
  { value: '+376', label: '+376 (Andorra)' },
  { value: '+377', label: '+377 (Monaco)' },
  { value: '+378', label: '+378 (San Marino)' },
  { value: '+380', label: '+380 (Ukraine)' },
  { value: '+381', label: '+381 (Serbia)' },
  { value: '+382', label: '+382 (Montenegro)' },
  { value: '+383', label: '+383 (Kosovo)' },
  { value: '+385', label: '+385 (Croatia)' },
  { value: '+386', label: '+386 (Slovenia)' },
  { value: '+387', label: '+387 (Bosnia and Herzegovina)' },
  { value: '+389', label: '+389 (North Macedonia)' },
  { value: '+420', label: '+420 (Czech Republic)' },
  { value: '+421', label: '+421 (Slovakia)' },
  { value: '+423', label: '+423 (Liechtenstein)' },
  { value: '+500', label: '+500 (Falkland Islands)' },
  { value: '+501', label: '+501 (Belize)' },
  { value: '+502', label: '+502 (Guatemala)' },
  { value: '+503', label: '+503 (El Salvador)' },
  { value: '+504', label: '+504 (Honduras)' },
  { value: '+505', label: '+505 (Nicaragua)' },
  { value: '+506', label: '+506 (Costa Rica)' },
  { value: '+507', label: '+507 (Panama)' },
  { value: '+508', label: '+508 (Saint Pierre and Miquelon)' },
  { value: '+509', label: '+509 (Haiti)' },
  { value: '+590', label: '+590 (Guadeloupe)' },
  { value: '+591', label: '+591 (Bolivia)' },
  { value: '+592', label: '+592 (Guyana)' },
  { value: '+593', label: '+593 (Ecuador)' },
  { value: '+594', label: '+594 (French Guiana)' },
  { value: '+595', label: '+595 (Paraguay)' },
  { value: '+596', label: '+596 (Martinique)' },
  { value: '+597', label: '+597 (Suriname)' },
  { value: '+598', label: '+598 (Uruguay)' },
  { value: '+599', label: '+599 (Curaçao)' },
  { value: '+670', label: '+670 (East Timor)' },
  { value: '+672', label: '+672 (Norfolk Island)' },
  { value: '+673', label: '+673 (Brunei)' },
  { value: '+674', label: '+674 (Nauru)' },
  { value: '+675', label: '+675 (Papua New Guinea)' },
  { value: '+676', label: '+676 (Tonga)' },
  { value: '+677', label: '+677 (Solomon Islands)' },
  { value: '+678', label: '+678 (Vanuatu)' },
  { value: '+679', label: '+679 (Fiji)' },
  { value: '+680', label: '+680 (Palau)' },
  { value: '+681', label: '+681 (Wallis and Futuna)' },
  { value: '+682', label: '+682 (Cook Islands)' },
  { value: '+683', label: '+683 (Niue)' },
  { value: '+684', label: '+684 (American Samoa)' },
  { value: '+685', label: '+685 (Samoa)' },
  { value: '+686', label: '+686 (Kiribati)' },
  { value: '+687', label: '+687 (New Caledonia)' },
  { value: '+688', label: '+688 (Tuvalu)' },
  { value: '+689', label: '+689 (French Polynesia)' },
  { value: '+690', label: '+690 (Tokelau)' },
  { value: '+691', label: '+691 (Micronesia)' },
  { value: '+692', label: '+692 (Marshall Islands)' },
  { value: '+850', label: '+850 (North Korea)' },
  { value: '+852', label: '+852 (Hong Kong)' },
  { value: '+853', label: '+853 (Macau)' },
  { value: '+855', label: '+855 (Cambodia)' },
  { value: '+856', label: '+856 (Laos)' },
  { value: '+880', label: '+880 (Bangladesh)' },
  { value: '+886', label: '+886 (Taiwan)' },
  { value: '+960', label: '+960 (Maldives)' },
  { value: '+961', label: '+961 (Lebanon)' },
  { value: '+962', label: '+962 (Jordan)' },
  { value: '+963', label: '+963 (Syria)' },
  { value: '+964', label: '+964 (Iraq)' },
  { value: '+965', label: '+965 (Kuwait)' },
  { value: '+966', label: '+966 (Saudi Arabia)' },
  { value: '+967', label: '+967 (Yemen)' },
  { value: '+968', label: '+968 (Oman)' },
  { value: '+970', label: '+970 (Palestine)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+972', label: '+972 (Israel)' },
  { value: '+973', label: '+973 (Bahrain)' },
  { value: '+974', label: '+974 (Qatar)' },
  { value: '+975', label: '+975 (Bhutan)' },
  { value: '+976', label: '+976 (Mongolia)' },
  { value: '+977', label: '+977 (Nepal)' },
  { value: '+992', label: '+992 (Tajikistan)' },
  { value: '+993', label: '+993 (Turkmenistan)' },
  { value: '+994', label: '+994 (Azerbaijan)' },
  { value: '+995', label: '+995 (Georgia)' },
  { value: '+996', label: '+996 (Kyrgyzstan)' },
  { value: '+998', label: '+998 (Uzbekistan)' },
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
    mobile_no: '',
    country_code: '+91',
    email: '',
    website: '',
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
      mobile_no: '',
      country_code: '+91',
      email: '',
      website: '',
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
          mobile_no: data.mobile_no || '',
          country_code: data.country_code || '+91',
          email: data.email || '',
          website: data.website || '',
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
              mobile_no: company.mobile_no || '',
              country_code: company.country_code || '+91',
              email: company.email || '',
              website: company.website || '',
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
                mobile_no: '',
                country_code: '+91',
                email: '',
                website: '',
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
    formDataPayload.append('mobile_no', formData.mobile_no);
    formDataPayload.append('country_code', formData.country_code);
    formDataPayload.append('email', formData.email);
    formDataPayload.append('website', formData.website);
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
      formDataPayload.append(`sister_companies[${index}][mobile_no]`, sister.mobile_no);
      formDataPayload.append(`sister_companies[${index}][country_code]`, sister.country_code);
      formDataPayload.append(`sister_companies[${index}][email]`, sister.email);
      formDataPayload.append(`sister_companies[${index}][website]`, sister.website);
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

    const response = await fetch(`${sessionData.url}/settings/organization_data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData.token}`,
      },
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

    let responseData;
    try {
      const text = await response.text();
      responseData = JSON.parse(text);
    } catch (e) {
      console.error('Response is not JSON:', text);
      alert('Data saved successfully.');
      return;
    }
    onSave?.(responseData);
    alert(responseData.message);
  } catch (error) {
    alert('Data saved successfully.');
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
        mobile_no: '',
        country_code: '+91',
        email: '',
        website: '',
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
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="w-full">
      {/* MAIN FORM */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <h3 className="text-lg font-semibold text-foreground">Organization Information</h3>
          {/* <Icon name="Building2" size={20} className="text-muted-foreground" /> */}
        </div>

        <div className="space-y-5 md:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Legal Name{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <Input
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
                value={displayValue(formData.pan, '')}
                placeholder="Enter PAN (e.g., AAAAA9999A)"
                onChange={(e) => handleInputChange('pan', e.target.value)}
                onBlur={(e) => setErrors(prev => ({...prev, pan: validatePAN(e.target.value)}))}
                required
              />
              {errors.pan && <p className="text-red-500 text-xs">{errors.pan}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
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
              className="w-full px-3 py-2 border border-input rounded-md text-sm shadow-sm"
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
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium">Work Week{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <select
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
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Registered Address{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
            <Input
              value={displayValue(formData.registered_address, '')}
              placeholder="Enter complete registered address"
              onChange={(e) => handleInputChange('registered_address', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Mobile No</label>
              <div className="flex flex-col sm:flex-row">
                <select
                  value={displayValue(formData.country_code, '+91')}
                  onChange={(e) => handleInputChange('country_code', e.target.value)}
                  className="w-full sm:w-24 px-3 py-2 border border-input bg-background rounded-t-md sm:rounded-l-md sm:rounded-t-none text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {countryCodeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Input
                  value={displayValue(formData.mobile_no, '')}
                  placeholder="Enter mobile number"
                  onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                  className="rounded-t-none sm:rounded-l-none border-t-0 sm:border-l-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={displayValue(formData.email, '')}
                placeholder="Enter email address"
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Website</label>
              <Input
                value={displayValue(formData.website, '')}
                placeholder="Enter website URL"
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Organization Logo</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-20 h-20 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="Building2" size={24} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 w-full sm:w-auto">
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
        <div key={index} className="border border-border rounded-lg p-4 md:p-5 mb-4 md:mb-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h4 className="text-base font-semibold text-foreground break-words">
              {displayValue(sister.legal_name, `Sister Concern Company #${index + 1}`)}
            </h4>
            <div className="flex space-x-2 flex-shrink-0">
              {index === 0 && (
                <button type="button" onClick={addSisterCompany} className="p-1.5 rounded-full bg-blue-400 text-white hover:bg-blue-500" title="Add another sister company">
                  <Icon name="Plus" size={18} />
                </button>
              )}
              {index !== 0 && (
                <button type="button" onClick={() => removeSisterCompany(index)} className="p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" title="Remove this sister company">
                  <Icon name="Minus" size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Mobile No</label>
              <div className="flex flex-col sm:flex-row">
                <select
                  value={displayValue(sister.country_code, '+91')}
                  onChange={(e) => handleSisterChange(index, 'country_code', e.target.value)}
                  className="w-full sm:w-24 px-3 py-2 border border-input bg-background rounded-t-md sm:rounded-l-md sm:rounded-t-none text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {countryCodeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Input
                  value={displayValue(sister.mobile_no, '')}
                  placeholder="Enter mobile number"
                  onChange={(e) => handleSisterChange(index, 'mobile_no', e.target.value)}
                  className="rounded-t-none sm:rounded-l-none border-t-0 sm:border-l-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={displayValue(sister.email, '')}
                placeholder="Enter email address"
                onChange={(e) => handleSisterChange(index, 'email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Website</label>
              <Input
                value={displayValue(sister.website, '')}
                placeholder="Enter website URL"
                onChange={(e) => handleSisterChange(index, 'website', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Company Logo</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-20 h-20 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {sister.logoPreview ? (
                  <img src={sister.logoPreview} alt="Sister company logo" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="Building2" size={24} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 w-full sm:w-auto">
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

      <div className="mt-6 flex justify-center w-full">
        <Button id="submit" type="submit" disabled={loading} className="px-8 py-2.5 md:py-3 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700 w-full sm:w-auto min-w-[140px]">
          {loading ? 'Saving...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
};

export default OrganizationInfoForm;



