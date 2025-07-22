"use client";

import React, { useEffect, useState, useMemo } from 'react';
// import '@app/content/Dashboard/UserProfile.css';
import '../../app/content/Dashboard/UserProfile.css';
interface userDetailsprops {
  userDetails: any | [];
}

const personalDetails: React.FC<userDetailsprops> = ({ userDetails }) => {

  // New states for table control
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [activeSection, setActiveSection] = useState<'personal' | 'contact' | 'reporting' | 'offdays'>('personal');
  const [activeTab, setActiveTab] = useState("personal-details");
  const [toggleState, setToggleState] = useState(false);

  return (
    <>

      {/* Header Section */}
      <div className="header-ajit mb-18">
        <div className="header-section">
          <div className="h-full bg-[url('/Header.png')] bg-contain bg-no-repeat">
            <div className="rounded-lg">
              {/* <img
                src={`${userDetails?.image}`}
                alt={`${userDetails?.id}`}
                className="w-[40px] h-[40px] rounded-full object-cover border-[2px]  border-white"
              /> */}
              {userDetails.image && userDetails.image != '' ? (
                <img
                  src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/` + userDetails.image}
                  alt="User icon"
                  style={{transform:"translate(34%,28%)"}}
                  className="lg:w-[170px] lg:h-[170px] md:w-[120px] md:h-[120px] rounded-full relative object-cover border-[2px] shadow-lg border-white"
                />
              ) : (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
                  alt="User icon"
                  style={{transform:"translate(34%,28%)"}}
                  className="lg:w-[170px] lg:h-[170px] md:w-[120px] md:h-[120px] rounded-full relative object-cover border-[2px] shadow-lg border-white"
                />
              )}
            </div>
            <div className="header-content" style={{transform:"translate(10%,-20%)"}}>
              <span className="text-2xl font-bold" >{userDetails?.first_name} {userDetails?.middle_name} {userDetails?.last_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar Menu */}
        <div className="sidebar-menu">
          <div className={`menu-item ${activeSection === 'personal' ? 'active' : ''}`} onClick={() => setActiveSection('personal')}>
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M23.75 26.25V23.75C23.75 22.4239 23.2232 21.1521 22.2855 20.2145C21.3479 19.2768 20.0761 18.75 18.75 18.75H11.25C9.92392 18.75 8.65215 19.2768 7.71447 20.2145C6.77678 21.1521 6.25 22.4239 6.25 23.75V26.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 13.75C17.7614 13.75 20 11.5114 20 8.75C20 5.98858 17.7614 3.75 15 3.75C12.2386 3.75 10 5.98858 10 8.75C10 11.5114 12.2386 13.75 15 13.75Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Personal Details</span>
          </div>

          <div className={`menu-item ${activeSection === 'contact' ? 'active' : ''}`} onClick={() => setActiveSection('contact')}>
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M17.29 20.71C17.5482 20.8286 17.839 20.8556 18.1146 20.7868C18.3902 20.718 18.6342 20.5573 18.8063 20.3312L19.25 19.75C19.4829 19.4395 19.7848 19.1875 20.132 19.0139C20.4791 18.8404 20.8619 18.75 21.25 18.75H25C25.663 18.75 26.2989 19.0134 26.7678 19.4822C27.2366 19.9511 27.5 20.587 27.5 21.25V25C27.5 25.663 27.2366 26.2989 26.7678 26.7678C26.2989 27.2366 25.663 27.5 25 27.5C19.0326 27.5 13.3097 25.1295 9.0901 20.9099C4.87053 16.6903 2.5 10.9674 2.5 5C2.5 4.33696 2.76339 3.70107 3.23223 3.23223C3.70107 2.76339 4.33696 2.5 5 2.5H8.75C9.41304 2.5 10.0489 2.76339 10.5178 3.23223C10.9866 3.70107 11.25 4.33696 11.25 5V8.75C11.25 9.13811 11.1596 9.5209 10.9861 9.86803C10.8125 10.2152 10.5605 10.5171 10.25 10.75L9.665 11.1888C9.43552 11.364 9.27377 11.6132 9.20724 11.8942C9.1407 12.1751 9.17348 12.4705 9.3 12.73C11.0084 16.1998 13.818 19.006 17.29 20.71Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span><a href="#contactsec">Contact & Address</a></span>
          </div>

          {/* <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M15 15H15.0125"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 7.5V5C20 4.33696 19.7366 3.70107 19.2678 3.23223C18.7989 2.76339 18.163 2.5 17.5 2.5H12.5C11.837 2.5 11.2011 2.76339 10.7322 3.23223C10.2634 3.70107 10 4.33696 10 5V7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.5 16.25C23.791 18.6987 19.4444 20.0041 15 20.0041C10.5556 20.0041 6.20901 18.6987 2.5 16.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M25 7.5H5C3.61929 7.5 2.5 8.61929 2.5 10V22.5C2.5 23.8807 3.61929 25 5 25H25C26.3807 25 27.5 23.8807 27.5 22.5V10C27.5 8.61929 26.3807 7.5 25 7.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span><a href="#empdetail">Employment Details</a></span>
          </div> */}

          {/* <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M10 2.5V7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 2.5V7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23.75 5H6.25C4.86929 5 3.75 6.11929 3.75 7.5V25C3.75 26.3807 4.86929 27.5 6.25 27.5H23.75C25.1307 27.5 26.25 26.3807 26.25 25V7.5C26.25 6.11929 25.1307 5 23.75 5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.75 12.5H26.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span><a href="#empstatus">Employment Status & History</a></span>
          </div> */}

          {/* <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M18.75 2.5H7.5C6.83696 2.5 6.20107 2.76339 5.73223 3.23223C5.26339 3.70107 5 4.33696 5 5V25C5 25.663 5.26339 26.2989 5.73223 26.7678C6.20107 27.2366 6.83696 27.5 7.5 27.5H22.5C23.163 27.5 23.7989 27.2366 24.2678 26.7678C24.7366 26.2989 25 25.663 25 25V8.75L18.75 2.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 2.5V7.5C17.5 8.16304 17.7634 8.79893 18.2322 9.26777C18.7011 9.73661 19.337 10 20 10H25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span><a href="#financialsec">Financial & Statutory info</a></span>
          </div> */}


          <div className="menu-item" onClick={() => setActiveSection('reporting')}>
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M20 26.25V23.75C20 22.4239 19.4732 21.1521 18.5355 20.2145C17.5979 19.2768 16.3261 18.75 15 18.75H7.5C6.17392 18.75 4.90215 19.2768 3.96447 20.2145C3.02678 21.1521 2.5 22.4239 2.5 23.75V26.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 3.91016C21.0722 4.18812 22.0217 4.81424 22.6996 5.69023C23.3775 6.56623 23.7452 7.64252 23.7452 8.75016C23.7452 9.85779 23.3775 10.9341 22.6996 11.8101C22.0217 12.6861 21.0722 13.3122 20 13.5902"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.5 26.2501V23.7501C27.4992 22.6423 27.1304 21.5661 26.4517 20.6905C25.773 19.8149 24.8227 19.1896 23.75 18.9126"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.25 13.75C14.0114 13.75 16.25 11.5114 16.25 8.75C16.25 5.98858 14.0114 3.75 11.25 3.75C8.48858 3.75 6.25 5.98858 6.25 8.75C6.25 11.5114 8.48858 13.75 11.25 13.75Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span><a href="#reportsec">Reporting & Attendance</a></span>
          </div>
          <div className="menu-item" onClick={() => setActiveSection('offdays')}>
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M18.75 2.5H7.5C6.83696 2.5 6.20107 2.76339 5.73223 3.23223C5.26339 3.70107 5 4.33696 5 5V25C5 25.663 5.26339 26.2989 5.73223 26.7678C6.20107 27.2366 6.83696 27.5 7.5 27.5H22.5C23.163 27.5 23.7989 27.2366 24.2678 26.7678C24.7366 26.2989 25 25.663 25 25V8.75L18.75 2.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 2.5V7.5C17.5 8.16304 17.7634 8.79893 18.2322 9.26777C18.7011 9.73661 19.337 10 20 10H25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span><a href="#financialsec">Off Day's</a></span>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <h2 className="section-title">
            {activeSection === 'personal'
              ? 'Personal Information'
              : activeSection === 'contact'
                ? 'Contact Information'
                : activeSection === 'reporting'
                  ? 'Reporting & Attendance Information'
                  : activeSection === 'offdays'
                    ? "Off Day's Information"
                    : ''}
          </h2>
          <div className="title-underline"></div>
          {activeSection === 'personal' && (
            <div className="form-grid">
              <div className="form-row">
                <select
                  className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                >
                  <option value="">Select Suffix</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                </select>
                <div className="input-field">
                  <input type="text" placeholder="First Name" />
                </div>
                <div className="input-field">
                  <input type="text" placeholder="Middle Name" />
                </div>
                <div className="input-field">
                  <input type="text" placeholder="Last Name" />
                </div>
              </div>

              <div className="form-row">

                <div className="input-field">
                  <input type="text" placeholder="User Name" />
                </div>
                <div className="input-field">
                  <input type="email" placeholder="Email Address" />
                </div>
              </div>

              <div className="form-row">

                <div className="input-field">
                  <input type="tel" placeholder="Mobile Number" />
                </div>
                <select
                  className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                >
                  <option value="">Select Jobrole</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </div>
              <div className="form-row">
                <select
                  className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                >
                  <option value="">Level of Responsibility</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                </select>
                <div className="flex mb-4 gap-2">
                  <label className="block text-[#393939] text-[14px] font-normal font-inter mb-2">
                    Gender
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 w-fit h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)] cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        className="accent-blue-500"
                      />
                      Male
                    </label>
                    <label className="flex items-center gap-2 w-fit h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)] cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        className="accent-pink-500"
                      />
                      Female
                    </label>
                  </div>
                </div>

              </div>
              <div className="form-row">
                <select
                  className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                >
                  <option value="">User Profile</option>
                  <option value="Admin">Admin</option>
                  <option value="HR">HR</option>
                  <option value="Employee">Employee</option>
                </select>
                <div className="input-field w-full">
                  <input type="text" placeholder="Joining Year" />
                </div>
              </div>
              <div className="form-row">
                <div className="input-field w-full">
                  <input type="password" placeholder="Password" />
                </div>
                <div className="input-field w-full">
                  <input type="date" placeholder="Birthdate" />
                </div>
              </div>
              <div className="form-row">
                <select
                  className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                >
                  <option value="">Inactive Status</option>
                  <option value="Admin">Yes</option>
                  <option value="HR">No</option>
                </select>
                <div className="flex items-center gap-4 w-[70%]">
                  <label className="text-[#393939] text-[14px] font-normal font-inter min-w-[80px]">
                    User Image
                  </label>
                  <input
                    type="file"
                    className="file-input px-4 py-1 rounded-full shadow-[inset_0px_2px_8px_rgba(0,0,0,0.15)] bg-[#f4faff] text-sm text-[#393939]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="form-grid">
              {/* CONTACT & ADDRESS SECTION BASED ON YOUR IMAGE */}

              <div className="form-row">
                <div className="input-field w-full">
                  <input type="text" placeholder="user_address" />
                </div>
                <div className="input-field w-full">
                  <input type="text" placeholder="user_city" />
                </div>
              </div>

              <div className="form-row">
                <div className="input-field w-full">
                  <input type="text" placeholder="user_state" />
                </div>
                <div className="input-field w-full">
                  <input type="text" placeholder="user_pincode" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reporting' && (
            <div className="form-grid space-y-4">
              <div className="form-row">
                <div className="input-field w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Supervisor / Subordinate</label>
                  <select className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]">
                    <option value="">Subordinate</option>
                  </select>
                </div>
                <div className="input-field w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Employee Name</label>
                  <select className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]">
                    <option value="">Select Employee</option>
                  </select>
                </div>
                <div className="input-field w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Reporting Method</label>
                  <select className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]">
                    <option value="">In Direct</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-4">Direct Deposit</h3>

              <div className="form-row">
                <div className="input-field w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    placeholder="Test Bank"
                    className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                  />
                </div>
                <div className="input-field w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Branch Name</label>
                  <input
                    type="text"
                    placeholder="Main Branch"
                    className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                  />
                </div>
                <div className="input-field w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Account</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-field w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">IFSC</label>
                  <input
                    type="text"
                    placeholder="TEST0001234"
                    className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                  />
                </div>
                <div className="input-field w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="text"
                    placeholder="50000.00"
                    className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                  />
                </div>
                <div className="input-field w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Transfer Type</label>
                  <select className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]">
                    <option value="">In Direct</option>
                  </select>
                </div>
              </div>
            </div>
          )}


          {activeSection === 'offdays' && (
            <div className="form-grid w-full">
              {/* ✅ One-line Weekday Checkboxes */}
              <div className="flex items-center gap-8 mb-6">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <input type="checkbox" />
                    {day}
                  </label>
                ))}
              </div>

              {/* In/Out Time Inputs Per Day */}
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day, index) => (
                <div key={index} className="form-row flex flex-col lg:flex-row gap-4 mb-4">
                  <div className="input-field w-full">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {day} In Date
                    </label>
                    <input
                      type="time"
                      className="w-full h-[35px] px-3 rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                    />
                  </div>
                  <div className="input-field w-full">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {day} Out Date
                    </label>
                    <input
                      type="time"
                      className="w-full h-[35px] px-3 rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="px-8 py-2 rounded-full text-white font-medium transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

    </>

  )
};

export default personalDetails;