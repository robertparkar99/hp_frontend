// main menu file which have dropdown menu list
"use client";

import * as React from "react";
import { MenuItem } from "./MenuItem";
import { useEffect, useState } from "react";
import Loading from "../utils/loading"; // Import the Loading component

interface NavigationMenuProps {
  onMenuItemClick: (menuId: number) => void; // Prop for handling menu item clicks
}
export const NavigationMenu: React.FC<NavigationMenuProps> = ({ onMenuItemClick }) => {
  const [userData, setUserData] = useState(null);
  const [menuItemArr, setMenuItemArr] = useState<{ id: number; menu_name: string; icon: string; access_link: string; menu_type: string }[]>([]);
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    let userData: any = null;
    const item = localStorage.getItem('userData');

    if (item !== null) {
      userData = JSON.parse(item);
    }

    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${userData.APP_URL}/table_data?table=tblmenumaster&filters[parent_id]=0&filters[level]=1&filters[status]=1&sort_order=sort_order`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        // console.log("level 1 = ",response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setLoading(false);
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
  }, []);

  const handleMenuClick = (item: string) => {
    const el = document.querySelector('.leftaside') as HTMLElement | null;
    const dashboardCard = document.querySelector('.dashboardCard') as HTMLElement | null;
    const renderComponent = document.querySelector('.renderComponent') as HTMLElement | null;

    if (el) {
      el.style.width = '17%';
      el.style.display = 'block';
      if (dashboardCard) {
      dashboardCard.style.height = 'calc(90vh - 20px)';
      }
      if (renderComponent) {
      renderComponent.style.height = 'calc(87vh - 20px)';
      }
    }
    else{
       if (dashboardCard) {
          dashboardCard.style.height = 'calc(80vh - 20px)';
        }
        if (renderComponent) {
        renderComponent.style.height = 'calc(80vh - 20px)';
        }
    }

    const el2 = document.querySelector('.hiddenMenu') as HTMLElement | null;
    if (el2) {
      // el2.style.width = '15%';
      el2.style.display = 'none';
      const main = document.querySelector('.contentDiv') as HTMLElement | null;
      if (main) {
        // alert("css called 1");

        main.style.width = '100%';
        main.style.marginLeft = '0%';
      }
      // alert("css called 0");

    }

    const main = document.querySelector('.contentDiv') as HTMLElement | null;
    if (main) {
      // alert("css called 1");

      main.style.width = '83%';
      main.style.marginLeft = '17%';
    }
  };

  const handleMenuClickWithAnimation = (item: string, menuId: number) => {
    localStorage.setItem('mainMenuId', menuId?.toString() || '');
    const storedId = localStorage.getItem("mainMenuId");
    window.dispatchEvent(new Event('storage'));
    //console.log(`Menu item clicked nav : ${storedId}`);
    handleMenuClick(item);
    onMenuItemClick(menuId);
  };

  return (
    <>
      {isLoading ? (<div></div>) : (<nav
        className="flex overflow-hidden flex-col justify-center items-center px-28 py-3 text-sm text-blue-400 bg-white max-md:px-5 hiddenMenu"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-wrap gap-2 justify-between w-full max-w-[1389px] max-md:max-w-full">
          {/* <MenuItem
            key="website-analyzer"
            iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/7ad6cfa32ac11f46cbf34fa6baab2bb1cb352269?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
            text="Website Analyzer"
            onClick={() => {
              const menuDetail = {
                menu: 'Website Analyzer',
                pageType: 'custom',
                access: 'WebsiteAnalyzer.tsx',
              };
              window.dispatchEvent(new CustomEvent('menuSelected', { detail: menuDetail }));
            }}
          /> */}
          {menuItemArr.map((item) => (

            <MenuItem
              key={item.id}
              iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/7ad6cfa32ac11f46cbf34fa6baab2bb1cb352269?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
              text={item.menu_name}
              onClick={() => handleMenuClickWithAnimation(item.menu_name, item.id)}
            />
          ))}
        </div>
      </nav>)}
    </>
  );
};

export default NavigationMenu;
