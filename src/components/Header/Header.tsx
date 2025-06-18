// Navbar.tsx
"use client";
import * as React from "react";
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

  // Use useEffect to set isLoading to false after the component mounts
  // This simulates the "page loaded" state.
  React.useEffect(() => {
    setIsLoading(false); // Once the component has mounted, set loading to false
  }, []);

  const handleMenuItemClick = (menuId: number) => {
    setActiveMenuId(menuId);
    setIsMenuOpen(true); // Open the sidebar when a menu item is clicked
  };

  return (
    <>
      {isLoading ? (<Loading />) : (
        <><nav className="flex justify-between overflow-hidden flex-wrap gap-10 px-[16px] py-[10px] bg-white shadow-[0px_4px_4px_rgba(71,160,255,0.25)] max-md:px-5">
          {/* UserProfile and LogoSection always display */}
          <UserProfile />
          <LogoSection />
        </nav><NavigationMenu onMenuItemClick={handleMenuItemClick} /><LeftSideMenu activeMenuId={activeMenuId} /></>
      )}
    </>
  );
};

export default Navbar;
