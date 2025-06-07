// Navbar.tsx
"use client";
import * as React from "react";
import { UserProfile } from "./UserProfile";
import { LogoSection } from "./LogoSection";
import NavigationMenu from "./NavigationMenu";
import LeftSideMenu from "../SideMenu/LeftSideMenu"; // Import LeftSideMenu
const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeMenuId, setActiveMenuId] = React.useState<number | null>(null);
  const handleMenuItemClick = (menuId: number) => {
    setActiveMenuId(menuId);
    setIsMenuOpen(true); // Open the sidebar when a menu item is clicked
  };
  return (
    <>
      <nav className="flex justify-between overflow-hidden flex-wrap gap-10 px-10 py-1.0 bg-white shadow-[0px_4px_4px_rgba(71,160,255,0.25)] max-md:px-5">
        <UserProfile />
        <LogoSection />
      </nav>
      <NavigationMenu onMenuItemClick={handleMenuItemClick} />
      <LeftSideMenu activeMenuId={activeMenuId} />{/* Render LeftSideMenu based on state */}
    </>
  );
};
export default Navbar;