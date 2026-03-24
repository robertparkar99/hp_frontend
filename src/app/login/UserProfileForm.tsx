"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

interface UserProfileFormProps {
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  subInstituteId?: string;
  departmentId?: string;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ email, mobile, firstName, lastName, subInstituteId, departmentId }) => {
  const router = useRouter();
  // Set initial form data including subInstituteId
  const getInitialFormData = () => ({
    user_name: "",
    password: "",
    first_name: firstName,
    last_name: lastName,
    email: email,
    mobile: mobile,
    user_profile_id: "",
    sub_institute_id: subInstituteId || "",
    client_id: "",
    is_admin: "true",
    status: "Active",
    allocated_standard: "",
    department_id: departmentId || "",
    employee_id: "",
    job_role_id: ""
  });
  
  const [formData, setFormData] = useState(getInitialFormData());

  // Update form data when subInstituteId or departmentId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      sub_institute_id: subInstituteId || prev.sub_institute_id,
      department_id: departmentId || prev.department_id
    }));
  }, [subInstituteId, departmentId]);
  
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userProfiles, setUserProfiles] = useState<{ id: number; name: string }[]>([]);
  const [substitutes, setSubstitutes] = useState<{ id: number; name: string }[]>([]);
  const [clients, setClients] = useState<{ id: number; client_name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number | string; department?: string; name?: string; department_name?: string }[]>([]);
  const [jobRoles, setJobRoles] = useState<{ id: number | string; jobrole?: string }[]>([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      if (!subInstituteId) {
        console.log("No subInstituteId provided yet");
        return;
      }
      
      try {
        // Fetch user profiles dynamically based on sub_institute_id from props
        const profileUrl = `http://127.0.0.1:8000/table_data?table=tbluserprofilemaster&filters[sub_institute_id]=${subInstituteId}`;
        console.log("Fetching profiles from:", profileUrl);
        const profilesResponse = await fetch(profileUrl);
        const profilesData = await profilesResponse.json();
        console.log("Profiles data:", profilesData);
        if (Array.isArray(profilesData)) {
          setUserProfiles(profilesData);
        }

        // Fetch sub institutes
        const substitutesResponse = await fetch("http://127.0.0.1:8000/table_data?table=tblsubinstitute&fields=id,name");
        const substitutesData = await substitutesResponse.json();
        if (Array.isArray(substitutesData)) {
          setSubstitutes(substitutesData);
        }

        // Fetch clients
        const clientsResponse = await fetch("http://127.0.0.1:8000/table_data?table=tblclient&fields=id,client_name");
        const clientsData = await clientsResponse.json();
        if (Array.isArray(clientsData)) {
          setClients(clientsData);
        }

        // Fetch departments
        console.log("Fetching departments for subInstituteId:", subInstituteId);
        const departmentsResponse = await fetch(`http://127.0.0.1:8000/table_data?table=hrms_departments&fields=id,department&filters[sub_institute_id]=${subInstituteId}`);
        const departmentsData = await departmentsResponse.json();
        console.log("Departments API response:", departmentsData);
        
        // Handle different response formats
        let departmentsArray = [];
        if (Array.isArray(departmentsData)) {
          departmentsArray = departmentsData;
        } else if (departmentsData.data && Array.isArray(departmentsData.data)) {
          departmentsArray = departmentsData.data;
        } else if (departmentsData.result && Array.isArray(departmentsData.result)) {
          departmentsArray = departmentsData.result;
        }
        
        if (departmentsArray.length > 0) {
          console.log("Setting departments:", departmentsArray.map((d: any) => ({ id: d.id, name: d.department || d.name })));
          setDepartments(departmentsArray);
        }

        // Fetch job roles
        const jobRolesResponse = await fetch(`http://127.0.0.1:8000/table_data?table=s_user_jobrole&fields=id,jobrole&filters[sub_institute_id]=${subInstituteId}`);
        const jobRolesData = await jobRolesResponse.json();
        console.log("Job Roles API response:", jobRolesData);
        
        // Handle different response formats
        let jobRolesArray = [];
        if (Array.isArray(jobRolesData)) {
          jobRolesArray = jobRolesData;
        } else if (jobRolesData.data && Array.isArray(jobRolesData.data)) {
          jobRolesArray = jobRolesData.data;
        } else if (jobRolesData.result && Array.isArray(jobRolesData.result)) {
          jobRolesArray = jobRolesData.result;
        }
        
        if (jobRolesArray.length > 0) {
          setJobRoles(jobRolesArray);
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchDropdowns();
  }, [subInstituteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`handleChange: ${name} = ${value}`);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.user_name || !formData.password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);

    // Prepare form data with required format
    const currentYear = new Date().getFullYear();
    
    // Use department_id from the form (which includes the selected department from UserProfileForm dropdown)
    const selectedDepartmentId = formData.department_id || departmentId || "";
    
    const submitData = {
      user_name: formData.user_name,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      mobile: formData.mobile,
      user_profile_id: formData.user_profile_id,
      sub_institute_id: formData.sub_institute_id,
      client_id: formData.client_id,
      is_admin: formData.is_admin === "true" ? "1" : "0",
      status: "1",
      allocated_standards: formData.allocated_standard,
      department_id: selectedDepartmentId,
      employee_id: formData.employee_id,
      syear: currentYear.toString()
    };
    
    console.log("Submitting form data:", submitData);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/user-signup",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );
      const data = await response.json();

      if (data.status === 1 || data.message === 'User created successfully') {
        setSuccess("Profile created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Extract exact error message from various possible response formats
        let errorMessage = "Failed to create profile. Please try again.";
        
        // Get the raw error message to check for duplicates
        let rawError = "";
        if (data.error) {
          rawError = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        } else if (data.errors && Array.isArray(data.errors)) {
          rawError = data.errors.map((err: any) => 
            typeof err === 'string' ? err : JSON.stringify(err)
          ).join(', ');
        } else if (data.detail) {
          rawError = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        } else if (data.message) {
          rawError = data.message;
        }
        
        // Check for duplicate email error patterns
        const lowerError = rawError.toLowerCase();
        if (lowerError.includes('duplicate') || 
            lowerError.includes('unique constraint') || 
            lowerError.includes('email') ||
            lowerError.includes('already exists') ||
            lowerError.includes('already registered')) {
          errorMessage = "This email is already registered. Please use a different email.";
        } else {
          errorMessage = rawError;
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      setError("Error creating profile. Please try again.");
      console.error("Profile creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-blue-400 overflow-hidden">
      {/* Three-column layout */}
      <div className="flex w-full">
        {/* Left Image Column */}
        <div className="hidden lg:flex lg:w-1/4 items-end">
          <img
            src="./Group 1.svg"
            alt="Logo"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Center Form Column */}
        <div className="w-full xl:w-2/2 lg:w-1/2 sm:w-1/2 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Panel - Gradient */}
              <div className="md:w-1/2 bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col items-center justify-center p-8 min-h-[400px]">
                <img
                  src="./Group 292.svg"
                  alt="Company Logo"
                  className="w-2/3 mb-4"
                />
                <h1 className="text-2xl font-bold mb-1 text-center">
                  Gaps to Growth
                </h1>
                <p className="text-sm text-center">
                  Complete Your Profile
                </p>
              </div>

              {/* Right Panel - Form */}
              <div className="md:w-1/2 bg-white p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  User Profile Details
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Fill in your details to complete registration
                </p>

                {error && (
                  <div className="w-full p-3 mb-3 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="w-full p-3 mb-3 text-sm text-green-700 bg-green-100 rounded-lg">
                    {success}
                  </div>
                )}

                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="User Name"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleChange}
                      required
                      className="w-1/2 p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-1/2 p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-1/2 p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-1/2 p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>

                  <input
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Mobile Number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />

                  <select
                    name="user_profile_id"
                    value={formData.user_profile_id}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-500"
                    required
                  >
                    <option value="" disabled>
                      Select User Profile
                    </option>
                    {userProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>

                  {/* <select
                    name="sub_institute_id"
                    value={subInstituteId || formData.sub_institute_id}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-500"
                  >
                    <option value="">Select Sub Institute</option>
                    {substitutes.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select> */}

                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-500"
                  >
                    <option value="">Select Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.client_name}
                      </option>
                    ))}
                  </select>

                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department || dept.department_name || dept.name || `Department ${dept.id}`}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Employee ID"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />

                  <select
                    name="allocated_standard"
                    value={formData.allocated_standard}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-500"
                  >
                    <option value="">Select Job Role</option>
                    {jobRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.jobrole || `Job Role ${role.id}`}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="is_admin"
                        checked={formData.is_admin === "true"}
                        onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked ? "true" : "false" })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      Is Admin
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isLoading ? "Creating Profile..." : "Submit Profile"}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Image Column */}
        <div className="hidden lg:flex lg:w-1/4 items-start justify-end">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b9e93eff85539beead9a70cd2e4a92d72d046658?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
            alt="Right Image"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </main>
  );
};

export default UserProfileForm;
