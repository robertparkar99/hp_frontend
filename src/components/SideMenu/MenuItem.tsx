"use client";

import React, { useEffect, useState } from "react";

interface MenuItemProps {
  imgIcon?: string | null;
  icon?: string | null;
  text: string;
  menuName: string;
  showArrow?: boolean;
  menuParent?: null,
  onClick?: () => void; // Add this line
}

export const MenuItem: React.FC<MenuItemProps> = ({
  imgIcon,
  icon,
  text,
  menuName,
  showArrow = false,
  menuParent,
  onClick,
}) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedMainMenu, setSelectedMainMenu] = useState<string | null>(
    typeof window !== "undefined" ? (window as any).__currentMainMenu : null
  );

  useEffect(() => {
    const elements = document.querySelectorAll(
      ".dropdown-card"
    ) as NodeListOf<HTMLElement>;
    elements.forEach((el) => {
      el.style.display = "none";
    });

    const submenuListener = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSelectedItem(customEvent.detail);
    };

    const mainMenuListener = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSelectedMainMenu(customEvent.detail);
    };

    window.addEventListener("menuSelected", submenuListener);
    window.addEventListener("mainMenuSelected", mainMenuListener);

    return () => {
      window.removeEventListener("menuSelected", submenuListener);
      window.removeEventListener("mainMenuSelected", mainMenuListener);
    };
  }, []);

  const handleMainMenuClick = (text: string, menuName: string) => {
    // const submenuClass = `.dropdown-card-${text}`;
    // const el = document.querySelector(submenuClass) as HTMLElement | null;

    // // Set global selection
    // (window as any).__currentMainMenu = menuName;
    // window.dispatchEvent(
    //   new CustomEvent("mainMenuSelected", { detail: menuName })
    // );

    // if (openSubmenu === menuName) {
    //   setOpenSubmenu(null);
    //   if (el) el.style.display = "none";
    // } else {
    //   setOpenSubmenu(menuName);
    //   if (el) el.style.display = "block";
    // }
  };

  const handleMenuClick = (menu: string) => {
    const currentSelected = (window as any).__currentMenuItem;
    const isDeselecting = currentSelected === menu;

    if (isDeselecting) {
      (window as any).__currentMenuItem = null;
      window.dispatchEvent(new CustomEvent("menuSelected", { detail: null }));
    } else {
      (window as any).__currentMenuItem = menu;
      window.dispatchEvent(new CustomEvent("menuSelected", { detail: menu }));
    }
  };

  return (
    <>
      <button
        className={`flex justify-between items-left w-full px-2 py-1  ${
          selectedMainMenu === menuName ? "text-blue-400 font-semibold" : "text-gray-500"
        }`}
        onClick={onClick}
      >
        {icon ? (
          <span className={icon} style={{ fontSize: "30px", alignSelf: "center" }}>
          </span>
        ) : (
          <img
        src={imgIcon || ""}
        className="object-contain shrink-0 self-stretch w-[20px] aspect-square"
        alt=""
          />
        )}
        <span className="grow text-left px-4">{text}</span>
        {showArrow && (
          <span className="mdi mdi-chevron-down text-2xl"></span>
        )}
      </button>
      <div
        className={`dropdown-card dropdown-card-${text.replace(/\s/g, "_")}`}
        style={{
          fontSize: "12px",
          display: openSubmenu === menuName ? "block" : "none",
        }}
      >
      
      </div>
    </>
  );
};
