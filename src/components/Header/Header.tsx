// Navbar.tsx
"use client";
import * as React from "react";
import { useState,useEffect } from "react";
import { UserProfile } from "./UserProfile";
import { LogoSection } from "./LogoSection";
import NavigationMenu from "./NavigationMenu";
import LeftSideMenu from "../SideMenu/LeftSideMenu";
import Loading from "../utils/loading"; // Import the Loading component

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeMenuId, setActiveMenuId] = React.useState<number | null>(null);
  // Introduce a loading state, initialized to true
  const [isLoading, setIsLoading] = React.useState(true);

    const [sessionData, setSessionData] = useState({
      url: "",
      token: "",
      orgType: "",
      subInstituteId: "",
      userId: "",
      userProfile: "",
      userimage : "",
      firstName:"",
      lastName:"",
    });
  // Use useEffect to set isLoading to false after the component mounts
  // This simulates the "page loaded" state.
  React.useEffect(() => {
    setIsLoading(false); // Once the component has mounted, set loading to false
    const userData = localStorage.getItem("userData");
        if (userData) {
          console.log(userData);
          const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name, user_image,first_name,last_name} = JSON.parse(userData);

          setSessionData({
            url: APP_URL,
            token,
            orgType: org_type,
            subInstituteId: sub_institute_id,
            userId: user_id,
            userProfile: user_profile_name,
            userimage : user_image,
            firstName:first_name,
            lastName:last_name,
          });

        }
  }, []);

  const handleMenuItemClick = (menuId: number) => {
    setActiveMenuId(menuId);
    setIsMenuOpen(true); // Open the sidebar when a menu item is clicked
  };

    useEffect(() => {
        
    // console.log(sessionData);

      }, []);

  return (
    <>
      {isLoading ? (<Loading />) : (
        <><nav className="flex justify-between overflow-hidden flex-wrap gap-10 px-[16px] py-[10px] bg-white shadow-[0px_4px_4px_rgba(71,160,255,0.25)] max-md:px-5">
          {/* UserProfile and LogoSection always display */}
          <UserProfile userSessionData={sessionData} />
          <LogoSection />
        </nav><NavigationMenu onMenuItemClick={handleMenuItemClick} /><LeftSideMenu activeMenuId={activeMenuId} /></>
      )}
    </>
  );
};

export default Navbar;
