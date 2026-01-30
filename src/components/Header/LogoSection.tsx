"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Bot } from 'lucide-react';
import WelcomeModal from '@/app/content/Onboarding/Competency-Management/WelcomeModal';

export const LogoSection: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setMounted(true);
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData(parsedData);
      console.log("Session data:", parsedData);
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // Tailwind w-48 = 12rem = 192px
      let left = rect.left;

      // ✅ Adjust so dropdown doesn’t overflow on the right side
      if (left + dropdownWidth > window.innerWidth) {
        left = rect.right - dropdownWidth;
      }

      setDropdownPos({ top: rect.bottom + 6, left });
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    router.push("/");
  };

  const handleMenuClick = (path: string) => {
    setIsDropdownOpen(false);
    (window as any).__currentMenuItem = path;
    window.dispatchEvent(
      new CustomEvent("menuSelected", {
        detail: { menu: path, pageType: "page", access: path },
      })
    );
  };

  const menuItems = userData?.user_profile_name === "Admin" ? [{ label: "Rights Management", path: "groupWiseRights/page.tsx" }] : [];

  return (
    <div className="flex relative z-50 items-center">
      {/* icons */}
      <div className="iconDivs flex gap-4 items-center">
        {/* search icon */}
        <div className="searchIcon cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#3B3B3B"
            className="w-6 h-6 text-black"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13z"
            />
          </svg>
        </div>

        {/* setting icon with dropdown */}
        <div ref={buttonRef} onClick={toggleDropdown} className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3B3B3B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-black"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 
              2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 
              1.51V21a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-.09a1.65 1.65 0 
              0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 
              1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 
              1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2v-1a2 2 0 0 
              1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 
              0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 
              1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 
              2 0 0 1 2-2h1a2 2 0 0 1 2 2v.09a1.65 1.65 
              0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 
              2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 
              0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 
              1H21a2 2 0 0 1 2 2v1a2 2 0 0 1-2 
              2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>

        {/* dropdown rendered via portal */}
        {mounted &&
          isDropdownOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "absolute",
                top: dropdownPos.top,
                left: dropdownPos.left,
              }}
              className="bg-white shadow-lg rounded-md border border-gray-200 w-48"
            >
              <ul className="py-0">
                <li
                  onClick={() => setIsWelcomeModalOpen(true)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                >
                  Start Tour
                </li>
                {menuItems.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleMenuClick(item.path)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                  >
                    {item.label}
                  </li>
                ))}
                <li
                  className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm text-red-500 border-t border-gray-100"
                  onClick={() => {
                    // Clear all local storage
                    localStorage.clear();

                    // Redirect to '/'
                    window.location.href = "/";
                  }}
                >
                  Logout
                </li>
              </ul>
            </div>,
            document.body
          )}
          {/* notification icon */}
        {/* <div className="notificationIcon cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3B3B3B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-black"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div> */}

        {/* chatbot icon */}
        <div className="cursor-pointer">
          <button
            onClick={() => {
              const event = new CustomEvent('openChatbot');
              window.dispatchEvent(event);
            }}
            className="p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <Bot className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      </div>

      {/* user info */}
      <div className="flex gap-2 border-l-2 border-gray-200 pl-2 ml-2">
        {userData?.org_logo && userData?.org_logo !== "" ? (
          <img
            src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_logo/${userData?.org_logo}`}
            alt="Organization Logo"
            className="h-8 w-auto"
          />
        ) : (
          <p className="text-sm font-medium">{userData?.user_name}</p>
        )}
      </div>

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onStartTour={() => {
          setIsWelcomeModalOpen(false);
          // Start tour logic here
        }}
      />
    </div>
  );
};
