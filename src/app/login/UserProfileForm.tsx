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
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ email, mobile, firstName, lastName, subInstituteId }) => {
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
    is_admin: "false",
    status: "Active",
    allocated_standard: "",
    department_id: "",
    employee_id: ""
  });
  
  const [formData, setFormData] = useState(getInitialFormData());

  // Update form data when subInstituteId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      sub_institute_id: subInstituteId || prev.sub_institute_id
    }));
  }, [subInstituteId]);
  
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userProfiles, setUserProfiles] = useState<{ id: number; name: string }[]>([]);
  const [substitutes, setSubstitutes] = useState<{ id: number; name: string }[]>([]);
  const [clients, setClients] = useState<{ id: number; client_name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; department_name: string }[]>([]);

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
        const departmentsResponse = await fetch("http://127.0.0.1:8000/table_data?table=hrms_department&fields=id,department_name");
        const departmentsData = await departmentsResponse.json();
        if (Array.isArray(departmentsData)) {
          setDepartments(departmentsData);
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchDropdowns();
  }, [subInstituteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/tbluser",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      if (data.status === 1 || data.message === 'User created successfully') {
        setSuccess("Profile created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message || "Failed to create profile. Please try again.");
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

                  <select
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
                  </select>

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
                        {dept.department_name}
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

                  <input
                    type="text"
                    placeholder="Allocated Standard"
                    name="allocated_standard"
                    value={formData.allocated_standard}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />

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
