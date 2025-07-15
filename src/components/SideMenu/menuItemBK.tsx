"use client";

import React, { useEffect, useState } from "react";

interface MenuItemProps {
  icon: string;
  text: string;
  menuName: string;
  showArrow?: boolean;
  menuParent?: null,
  onClick?: () => void; // Add this line
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  text,
  menuName,
  showArrow = false,
  menuParent,
}) => {
   const [userData, setUserData] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedMainMenu, setSelectedMainMenu] = useState<string | null>(
    typeof window !== "undefined" ? (window as any).__currentMainMenu : null
  );
  const [menuId, setMenuId] = useState<string | null>(null);
  const [menuItemArr, setMenuItemArr] = useState<{ id: number; menu_name: string; icon: string; access_link: string; menu_type: string }[]>([]);
  const [submenuItemArr, setsubmenuItemArr] = useState<{ id: number; menu_name: string; icon: string; access_link: string; menu_type: string }[]>([]);

  useEffect(() => {
 let userData: any = null;
    const item = localStorage.getItem('userData');
    setUserData(userData);

    if (item !== null) {
      userData = JSON.parse(item);
    }

    const getStoredId = async () => {
      const storedId = localStorage.getItem('mainMenuId');
      console.log(`Menu item clicked menu : ${storedId}`);
      setMenuId(storedId);

      if (storedId) {
      try {
        const fetchMenuItems = async () => {
          try {
            const response = await fetch(`${userData.APP_URL}/table_data?table=tblmenumaster&filters[parent_id]=${storedId}&filters[level]=2&filters[status]=1`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
      
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
      
            const data = await response.json();
      
            setMenuItemArr(
              data.map((item: any) => ({
                id: item.id,
                menu_name: item.menu_name,
                icon: item.icon,
                access_link: item.access_link,
                menu_type: item.menu_type,
              }))
            );
          } catch (error) {
            console.error("Error fetching menu items:", error);
          }
        };
      
        fetchMenuItems();
      } catch (error) {
        console.error("Error fetching submenu array:", error);
      }
      }
    };

    getStoredId(); // Initial load

    // Optional: Listen to storage event to update live
    const handleStorageChange = () => {
      getStoredId();
    };

    window.addEventListener('storage', handleStorageChange);
   
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



  const handleMainMenuClick = (text: number, menuName: string,parentId : number) => {
    const submenuClass = `.dropdown-card-${text}`;
    const el = document.querySelector(submenuClass) as HTMLElement | null;

    // Set global selection
    (window as any).__currentMainMenu = menuName;
    window.dispatchEvent(
      new CustomEvent("mainMenuSelected", { detail: menuName })
    );

    if (openSubmenu === menuName) {
      const storedId = localStorage.getItem("mainMenuId");
      if (storedId) {
        setMenuId(storedId);
        console.log(`Menu item clicked: ${storedId}`);
      } else {
        console.log("mainMenuId not found in localStorage");
      }
      
      setOpenSubmenu(null);
      if (el) el.style.display = "none";
    } else {
      setOpenSubmenu(menuName);
      if (el) el.style.display = "block";
    }

    try {
      let userData: any = null;
    const item = localStorage.getItem('userData');
    setUserData(userData);

    if (item !== null) {
      userData = JSON.parse(item);
    }
      const fetchMenuItems = async () => {
        try {
          const response = await fetch(`${userData.APP_URL}/table_data?table=tblmenumaster&filters[parent_id]=${parentId}&filters[level]=3&filters[status]=1`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const data = await response.json();
    
          setsubmenuItemArr(
            data.map((item: any) => ({
              id: item.id,
              menu_name: item.menu_name,
              icon: item.icon,
              access_link: item.access_link,
              menu_type: item.menu_type,
            }))
          );
        } catch (error) {
          console.error("Error fetching menu items:", error);
        }
      };
    
      fetchMenuItems();
    } catch (error) {
      console.error("Error fetching submenu array:", error);
    }

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
      {menuItemArr.map((item) => (
      <div key={item.id}>
        <button
        className={`flex gap-5 justify-between items-left w-full px-2 py-1  ${
          selectedMainMenu === item.menu_name ? "text-blue-400 font-semibold" : "text-gray-500"
        }`}
        onClick={() =>
          handleMainMenuClick(item.id, item.menu_name,item.id)
        }
        >
        <span className="grow text-left">{item.menu_name}</span>
        {showArrow && (
          <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/a099a1eb6c3436fc6941ce182752301a7ec18919?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-[1.82]"
          alt=""
          />
        )}
        </button>

        <div
        className={`dropdown-card dropdown-card-${item.id}`}
        style={{
          fontSize: "12px",
          display: openSubmenu === item.menu_name ? "block" : "none",
        }}
        >
        <ul className="max-h-[200px] w-[200px] ml-6 overflow-y-auto">
          {submenuItemArr
          .filter((subItem) => subItem.menu_name.startsWith(item.menu_name))
          .map((subMenuItem, index) => (
            <li
            key={index}
            onClick={() => handleMenuClick(subMenuItem.menu_name)}
            style={{
              marginBottom: "10px",
              color: selectedItem === subMenuItem.menu_name ? "#4B9CD3" : "inherit",
              cursor: "pointer",
            }}
            >
            {subMenuItem.menu_name}
            </li>
          ))}
        </ul>
        </div>
      </div>
      ))}
    </>
  );
};
