"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../components/utils/api_url";

const Signup: React.FC = () => {
  const router = useRouter(); 
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    department: "",
  });
  
  const [industries, setIndustries] = useState<{ id: number; industries: string }[]>([]);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  // Fetch industries from API
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch(
          "https://hp.triz.co.in/table_data?table=s_industries&group_by=industries"
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setIndustries(data);
        }
      } catch (err) {
        console.error("Error fetching industries:", err);
      }
    };

    fetchIndustries();
  }, []);

  const sendOtp = async () => {
    // Validate email
    if (!formData.email) {
      setEmailError("Email is required");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError("Enter valid email");
      return;
    }
    
    setEmailError("");

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/send-otp?email=${formData.email}&type=API`,
        {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      // Check for success message 'OTP sent successfully'
      if (data.message === 'OTP sent successfully' || data.status === 1) {
        setOtpSent(true);
        setMessage("OTP sent successfully");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Error sending OTP. Please try again.");
      console.error("OTP send error:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/verify-otp?email=${formData.email}&otp=${otp}&type=API`,
        {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.status === 1 || data.message === 'OTP verified successfully') {
        setOtpVerified(true);
        setMessage("Email verified successfully!");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Error verifying OTP. Please try again.");
      console.error("OTP verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otpVerified) {
      setError("Please verify your email with OTP first");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/register?first_name=${formData.firstName}&last_name=${formData.lastName}&email=${formData.email}&organization=${formData.organization}&department=${formData.department}&type=API`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.status === 1) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Error during registration. Please try again.");
      console.error("Signup error:", err);
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
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8">
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
                  Empowering skills for a brighter future
                </p>
              </div>  

              {/* Right Panel - Form */}
              <div className="md:w-1/2 bg-white p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Create Admin Account
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Fill in your details to get started
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

                <form className="space-y-3" onSubmit={handleSignup}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-1/2 p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-1/2 p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={(e) => {
                      handleChange(e);
                      setEmailError("");
                    }}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                  )}

                  <input
                    type="text"
                    placeholder="Institute Name"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-500"
                    required
                  >
                    <option value="" disabled>
                      Select industries Type
                    </option>
                    {industries.map((industry) => (
                      <option key={industry.id} value={industry.industries}>
                        {industry.industries}
                      </option>
                    ))}
                  </select>

                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-sm text-gray-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      className="flex-1 p-2.5 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      name="otp"
                      value={otp}
                      onChange={handleOtpChange}
                      disabled={otpVerified}
                      required
                      className="flex-1 p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={isLoading}
                        className="py-2 px-4 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? "Sending..." : "Send OTP"}
                      </button>
                    ) : !otpVerified ? (
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={isLoading}
                        className="py-2 px-4 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                    ) : (
                      <span className="flex items-center px-3 text-green-600 font-semibold text-sm">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {message && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !otpVerified}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isLoading ? "Creating Account..." : "Sign Up"}
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

export default Signup;