"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { UserProfile } from "./UserProfile";
import { LogoSection } from "./LogoSection";
import Loading from "../utils/loading";
import Sidebar from "../SideMenu/Newsidebar";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
    userimage: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const {
        APP_URL,
        token,
        org_type,
        sub_institute_id,
        user_id,
        user_profile_name,
        user_image,
        first_name,
        last_name,
      } = JSON.parse(userData);

      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
        userimage: user_image,
        firstName: first_name,
        lastName: last_name,
      });
    }
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {/* 🔹 Top Navbar */}
          <nav className="flex justify-between items-center flex-wrap gap-10 px-[16px] py-[10px] bg-white shadow-[0px_4px_4px_rgba(71,160,255,0.25)]">
            <UserProfile userSessionData={sessionData} />
            <LogoSection />
            <button
              onClick={handleMenuToggle}
              className="lg:hidden text-gray-600 hover:text-blue-500"
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
          </nav>

          {/* 🔹 Sidebar (now inside provider) */}
          <Sidebar
            mobileOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            userSessionData={sessionData}
          />
        </>
      )}
    </>
  );
};

export default Navbar;
