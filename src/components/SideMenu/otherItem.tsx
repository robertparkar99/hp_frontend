"use client";

import React, { useEffect, useState } from "react";

interface otherItemProps {
  icon: string;
  text: string;
  menuName: string;
  showArrow?: boolean;
}

export const otherItem: React.FC<otherItemProps> = ({
  icon,
  text,
  menuName,
  showArrow = false,
}) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedMainMenu, setSelectedMainMenu] = useState<string | null>(
    typeof window !== "undefined" ? (window as any).__currentMainMenu : null
  );

  const allMenuArr = [
    {
      mainMenu: "Organizational Details",
      subMenu: [
        "Add Organization Detail",
        "Add Department - Sub Department",
        "Organization Structure",
        "Admin and Configuration Module",
        "Group Wise Right",
        "Individual right management",
        "Department/team  /people/project",
        "Skill and search skill ",
      ],
    },
    {
      mainMenu: "User Management",
      subMenu: [
        "Profile",
        "Assigned task",
        "Skills",
        "Certifications",
        "Skill Gap Analysis",
      ],
    },
    {
      mainMenu: "Communication Tool",
      subMenu: [
        "Send SMS to User",
        "Send Notification User",
        "Send Email User",
        "Send Email Other User",
        "Send WhatsApp User",
      ],
    },
    {
      mainMenu: "Template Management",
      subMenu: ["Template Management"],
    },
    {
      mainMenu: "Complaint Management",
      subMenu: ["Complaint Management"],
    },
  ];

  const currentMenu = allMenuArr.find((menu) => menu.mainMenu === menuName);

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
    const submenuClass = `.dropdown-card-${text}`;
    const el = document.querySelector(submenuClass) as HTMLElement | null;

    // Set global selection
    (window as any).__currentMainMenu = menuName;
    window.dispatchEvent(
      new CustomEvent("mainMenuSelected", { detail: menuName })
    );

    if (openSubmenu === menuName) {
      setOpenSubmenu(null);
      if (el) el.style.display = "none";
    } else {
      setOpenSubmenu(menuName);
      if (el) el.style.display = "block";
    }
  };

  const handleMenuClick = (menu: string) => {
    const currentSelected = (window as any).__currentMenuItem;
    const isDeselecting = currentSelected === menu;
    console.log("currentSelected", currentSelected);
    console.log("isDeselecting", isDeselecting);
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
        className={`flex gap-5 justify-between items-left w-full px-2 py-1  ${
          selectedMainMenu === menuName ? "text-blue-400 font-semibold" : "text-gray-500"
        }`}
        onClick={() =>
          handleMainMenuClick(text.replace(/\s/g, "_"), menuName)
        }
      >
        <img
          src={icon}
          className="object-contain shrink-0 self-stretch my-auto w-[20px] aspect-square"
          alt=""
        />
        <span className="grow text-left">{text}</span>
        {showArrow && (
          <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/a099a1eb6c3436fc6941ce182752301a7ec18919?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
        className="object-contain shrink-0 self-stretch my-auto w-5 aspect-[1.82]"
        alt=""
          />
        )}
      </button>

      <div
        className={`dropdown-card dropdown-card-${text.replace(/\s/g, "_")}`}
        style={{
          fontSize: "12px",
          display: openSubmenu === menuName ? "block" : "none",
        }}
      >
        <ul className="max-h-[200px] w-[200px] ml-6 overflow-y-auto">
          {currentMenu?.subMenu.map((subMenuItem, index) => (
            <li
              key={index}
              onClick={() => handleMenuClick(subMenuItem)}
              style={{
                marginBottom: "10px",
                color: selectedItem === subMenuItem ? "#4B9CD3" : "inherit",
                cursor: "pointer",
              }}
            >
              {subMenuItem}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
