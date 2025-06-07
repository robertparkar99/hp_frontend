// main menu file which have dropdown menu list
"use client";

import * as React from "react";
import { MenuItem } from "./MenuItem";
import { useEffect, useState } from "react";
interface NavigationMenuProps {
  onMenuItemClick: (menuId: number) => void; // Prop for handling menu item clicks
}
export const NavigationMenu: React.FC<NavigationMenuProps> = ({ onMenuItemClick }) => {
   const [userData, setUserData] = useState(null);
  const [menuItemArr, setMenuItemArr] = useState<{ id: number; menu_name: string; icon: string; access_link: string; menu_type: string }[]>([]);

  useEffect(() => {
    let userData: any = null;
    const item = localStorage.getItem('userData');

    if (item !== null) {
      userData = JSON.parse(item);
    }

    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${userData.APP_URL}/table_data?table=tblmenumaster&filters[parent_id]=0&filters[level]=1`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        // console.log("level 1 = ",response);
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
  }, []);
  


  const handleMenuClick = (item: string) => {
    const el = document.querySelector('.leftaside') as HTMLElement | null;
    if (el) {
      el.style.width = '17%';

      el.style.display = 'block';
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

  const handleMenuClickWithAnimation = (item: string,menuId: number) => {
    localStorage.setItem('mainMenuId', menuId?.toString() || '');
    const storedId = localStorage.getItem("mainMenuId");
    window.dispatchEvent(new Event('storage'));
    //console.log(`Menu item clicked nav : ${storedId}`);
    handleMenuClick(item);
    onMenuItemClick(menuId);
    // const el = document.querySelector('.leftaside') as HTMLElement | null;
    // if (el) {
    //   el.style.opacity = '0';
    //   el.style.transition = 'opacity 1.0s ease-in-out';
    //   setTimeout(() => {
    //     el.style.opacity = '1';
    //   }, 0);
    // }
  };

  return (
    <nav
      className="flex overflow-hidden flex-col justify-center items-center px-28 py-3 text-sm text-blue-400 bg-white max-md:px-5 hiddenMenu"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex flex-wrap gap-2 justify-between w-full max-w-[1389px] max-md:max-w-full">
        {/* <MenuItem
          iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/d00d71d9c1bc913fa00df0572008f1f12358d667?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          text="Organizational Development"
          onClick={() => handleMenuClickWithAnimation("Organizational Development")}
        />
        <MenuItem
          iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/e650ec2387aa2d88e29a964d7c6a8b4f568ac84f?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          text="Skill Management"
          onClick={() => handleMenuClickWithAnimation("Skill Management")}
        />
        <MenuItem
          iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/6ef17bfbca34341b9a4caa06e5b89d149b5a16a4?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          text="Talent Management"
          onClick={() => handleMenuClickWithAnimation("Talent Management")}
        />
        <MenuItem
          iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/585861c1d12cb05e56b4562173176128abf0f642?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          text="LMS"
          onClick={() => handleMenuClickWithAnimation("LMS")}
        />
        <MenuItem
          iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/ef1f5543a96e8df9fedefdae7e229eb311b350c3?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          text="HRIT Solution"
          onClick={() => handleMenuClickWithAnimation("HRIT Solution")}
        />
        <MenuItem
          iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/7ad6cfa32ac11f46cbf34fa6baab2bb1cb352269?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          text="Reports"
          onClick={() => handleMenuClickWithAnimation("Reports")}
        /> */}

        {menuItemArr.map((item) => (
          // <div key={item.id} className="flex flex-col items-start gap-2">
          //   <label htmlFor={`menu_name_${item.id}`}>Menu Name:</label>
          //   <input
          //     id={`menu_name_${item.id}`}
          //     type="text"
          //     value={item.menu_name}
          //     readOnly
          //     className="border p-2 rounded"
          //   />
          //   <label htmlFor={`icon_${item.id}`}>Icon:</label>
          //   <input
          //     id={`icon_${item.id}`}
          //     type="text"
          //     value={item.icon}
          //     readOnly
          //     className="border p-2 rounded"
          //   />
          // </div>
          <MenuItem
          key={item.id}
          iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/7ad6cfa32ac11f46cbf34fa6baab2bb1cb352269?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          text={item.menu_name}
          onClick={() => handleMenuClickWithAnimation(item.menu_name,item.id)}
        /> 
        ))}
      </div>
    </nav>
  );
};

export default NavigationMenu;
