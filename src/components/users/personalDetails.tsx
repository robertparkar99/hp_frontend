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

    const [activeTab, setActiveTab] = useState("personal-details");
    const [toggleState, setToggleState] = useState(false);

    return (
    <>
        
      {/* Header Section */}
      <div className="header-ajit">
        <div className="header-section">
          <div className="header-background">
            <div className="profile-image-container">
              <img
                src="Ellipse 23.png"
                alt="Kavya Mehta"
                className="profile-image"
              />
            </div>
            <div className="header-content">
              <h1 className="user-name">{userDetails?.first_name} {userDetails?.middle_name} {userDetails?.last_name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar Menu */}
        <div className="sidebar-menu">
          <div className="menu-item active">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="
                  M0,0 
                  H1360 
                  V220 
                  H220 
                  A110,110 0 0 0 0,220 
                  Z
                "
              />
            </clipPath>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#C9E3FF" />
              <stop offset="100%" stopColor="#47A0FF" />
            </linearGradient>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#grad)"
            clipPath="url(#circleNotchClip)"
            rx="30"
          />
        </svg>
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
          

          <div className="menu-item">
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
        <div className="menu-item">
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
          <h2 className="section-title">Personal information</h2>
          <div className="title-underline"></div>

          <div className="form-grid">
            <div className="form-row">
              <div className="input-field">
                <input type="text" placeholder="First Name" />
              </div>
              <div className="input-field">
                <input type="text" placeholder="Middle Name" />
              </div>
            </div>

            <div className="form-row">
              <div className="input-field">
                <input type="text" placeholder="Last Name" />
              </div>
              <div className="input-field">
                <input type="text" placeholder="User Name" />
              </div>
            </div>

            <div className="form-row">
              <div className="input-field">
                <input type="email" placeholder="Email Address" />
              </div>
              <div className="input-field">
                <input type="tel" placeholder="Mobile Number" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Name + Line beside Image */}
      <div
        className="absolute"
        style={{
          top: "60px",
          left: "260px",
          right: "60px",
        }}
      >
        <h1 className="text-[48px] font-bold text-gray-800 mb-4">Kavya Mehta</h1>
        <div className="w-full h-[4px] bg-gray-800 rounded-full" />
      </div>
    </div>
  );
};

export default ProfileInterface;
