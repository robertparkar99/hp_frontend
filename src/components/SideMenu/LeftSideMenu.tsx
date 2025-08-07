"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { MenuItem } from "./MenuItem";
import { otherItem as OtherItem } from "./otherItem";
import { MenuSection } from "./MenuSection";
import { UserProfile } from "./UserProfile";

interface LeftSideMenuProps {
  activeMenuId: number | null; // Prop to receive the active menu ID
}
const LeftSideMenu: React.FC<LeftSideMenuProps> = ({ activeMenuId }) => {
  const [userData, setUserData] = useState(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeParent, setActiveParent] = useState<number | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [menuItemArr, setMenuItemArr] = useState<{ id: number; menu_name: string; icon: string; access_link: string; menu_type: string }[]>([]);
  const [submenuItemArr, setsubmenuItemArr] = useState<{ id: number; menu_name: string; icon: string; page_type: string; access_link: string; menu_type: string, parent_id: number }[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
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
    setLoading(true);
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name, user_image, first_name, last_name } = JSON.parse(userData);
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
  }, []);

  useEffect(() => {
    let userData: any = null;
    const item = localStorage.getItem('userData');

    if (item !== null) {
      userData = JSON.parse(item);
      setUserData(userData);
    }

    const getStoredId = async () => {

      const storedId = localStorage.getItem('mainMenuId');
      //console.log(`Menu item clicked menu : ${storedId}`);
      setMenuId(storedId);

      if (storedId) {
        setActiveMenu(storedId);
        try {
          const fetchMenuItems = async () => {
            if (activeMenuId !== null) {
              setIsMenuOpen(true);
              setLoading(true);
              try {
                const response = await fetch(`${userData.APP_URL}/table_data?table=tblmenumaster&filters[parent_id]=${storedId}&filters[level]=2&filters[status]=1&sort_order=sort_order`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                console.log("Function called");
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
                setLoading(false);
              } catch (error) {
                console.error("Error fetching menu items:", error);
              }
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

  }, [activeMenuId]);

  const handleMenuItemClick = (menuName: string, parentId: number | null) => {
    // console.log("Hello");
    // console.log(`Menu item clicked: ${menuName}`);
    setActiveMenu(menuName);
    setActiveParent(parentId);
    // console.log(activeParent);
    // console.log(`Menu item clicked parentId: ${parentId}`);


    // Set global selectionF
    (window as any).__currentMainMenu = menuName;
    window.dispatchEvent(
      new CustomEvent("mainMenuSelected", { detail: menuName })
    );

    try {
      let userData: any = null;
      const item = localStorage.getItem('userData');
      setUserData(userData);

      if (item !== null) {
        userData = JSON.parse(item);
      }

      const fetchMenuItems = async () => {
        try {
          const response = await fetch(`${userData.APP_URL}/table_data?table=tblmenumaster&filters[parent_id]=${parentId}&filters[level]=3&filters[status]=1&sort_order=sort_order`, {
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
              page_type: item.page_type,
              access_link: item.access_link,
              menu_type: item.menu_type,
              parent_id: item.parent_id,
            }))
          );
          const submenuClass = `.dropdown-card-${parentId}`;
          const el = document.querySelector(submenuClass) as HTMLElement | null;
          if (openSubmenu === parentId) {
            setOpenSubmenu(null);
            if (el) el.style.display = "none";
          } else {
            setOpenSubmenu(parentId);
            if (el) el.style.display = "block";
          }
        } catch (error) {
          console.error("Error fetching menu items:", error);
        }
      };

      fetchMenuItems();
    } catch (error) {
      console.error("Error fetching submenu array:", error);
    }
  };

  const handleMenuClick = (menu: string, page: string, access: string) => {
    //console.log(`Menu item clicked: ${menu}`);
    const currentSelected = (window as any).__currentMenuItem;
    const isDeselecting = currentSelected === menu;
    setActiveMenu(menu);
    // console.log("currentSelected", currentSelected);
    // console.log("isDeselecting", isDeselecting);
    if (isDeselecting) {
      (window as any).__currentMenuItem = null;
      window.dispatchEvent(new CustomEvent("menuSelected", { detail: { menu: null, pageType: null, access: null } }));
    } else {
      (window as any).__currentMenuItem = menu;
      window.dispatchEvent(new CustomEvent("menuSelected", { detail: { menu: menu, pageType: page, access: access } }));
    }
  };
  const renderMenuContent = () => {
    if (activeMenu === "User Profile") {
      const menuNames = [
        { key: 'Dashboard/MyProfile.tsx', name: "My Profile" },
        { key: 'Dashboard/MyCertificate.tsx', name: "My Certificate" },
        { key: 'Dashboard/MyAssignedTask.tsx', name: "My Assigned Task" },
        { key: 'Dashboard/MySkills.tsx', name: "My Skills" },
        { key: 'Dashboard/MySkillGapAnalysis.tsx', name: "My Skill Gap Analysis" },
      ];
      return (
        <MenuSection title="MAIN MENU">
          {menuNames.map((menuName, index) => (
            <MenuItem
              key={menuName.key}
              imgIcon={`https://cdn.builder.io/api/v1/image/assets/TEMP/.png?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39`}
              icon=""
              text={menuName.name}
              menuName={menuName.name}
              onClick={() => handleMenuClick(menuName.key, "page", menuName.key)}
            />
          ))}
        </MenuSection>
      );
    }
    else {
      // Default menu content
      return (
        <>

          {isLoading === true ? ( // or just isLoading
            <div className="relative flex flex-col justify-center items-center transform bg-white w-[220px]">
              <img src="/assets/loading/black_simple_laoding.gif" alt="loading.." className="w-[30px] h-[30px]" />
              <p className="mt-4">Please wait...</p>
            </div>
          ) : ( // Corrected: removed the extra '{' and added a ')'
            <MenuSection title="MAIN MENU">
              {menuItemArr.map((item) => (
                <div key={item.id}>
                  <MenuItem
                    imgIcon="https://cdn.builder.io/api/v1/image/assets/TEMP/3677ab9baa84cdb831d836dec797d42d38b543b6?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
                    icon={item.icon}
                    text={item.menu_name}
                    menuName={item.menu_name}
                    showArrow={true}
                    onClick={() => handleMenuItemClick(item.menu_name, item.id)}
                  />
                  {activeParent === item.id && (
                    <div
                      className={`dropdown-card dropdown-card-${item.id} ml-4 shadow-md shadow-blue-400/50 rounded-lg w-[200px]`}
                      style={{
                        fontSize: "12px",
                        display: openSubmenu === item.id ? "block" : "none",
                      }}
                    >
                      <ul className="p-2">
                        {submenuItemArr
                          .filter((subItem) => subItem.parent_id === item.id)
                          .map((subMenuItem) => (
                            <li key={subMenuItem.id}>
                              {/* <span className={subMenuItem.icon} style={{ fontSize: "20px"}}></span> */}
                              {subMenuItem.page_type === "link" && subMenuItem.menu_name !== 'Competency Framework' ? (
                                <a href={subMenuItem.access_link} target="_blank" rel="noopener noreferrer">
                                  {subMenuItem.menu_name}
                                </a>
                              ) : subMenuItem.page_type === "blade" ? (
                                <a href={`${sessionData.url}/${subMenuItem.access_link}?type=web&user_id=${sessionData.userId}`} target="_blank">
                                  {subMenuItem.menu_name}
                                </a>
                              ) : (
                                <span
                                  onClick={() =>
                                    handleMenuClick(
                                      subMenuItem.menu_name,
                                      subMenuItem.page_type,
                                      subMenuItem.menu_name === 'Competency Framework'
                                        ? 'skill-taxonomy/page.tsx'

                                        : subMenuItem.access_link
                                    )
                                  }
                                  style={{
                                    marginBottom: "10px",
                                    color: activeMenu === subMenuItem.menu_name ? "#4B9CD3" : "inherit",
                                    fontWeight: activeMenu === subMenuItem.menu_name ? 'bold' : '100',
                                    cursor: "pointer",
                                  }}
                                >
                                  {subMenuItem.menu_name}
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </MenuSection>
          )}

        </>
      );
    }
  };

  return (
    <>
      {isMenuOpen && (
        <aside className="flex flex-col pb-2 bg-white rounded-none h-screen overflow-scroll max-w-[280px] shadow-[2px_4px_15px_rgba(71,160,255,0.25)] text-stone-500 leftaside rounded-xl hide-scroll">
          <UserProfile UserProfileProp={sessionData} onClick={() => handleMenuItemClick("User Profile", 0)} />
          <main className="flex overflow-y-scroll flex-col px-2.5 pt-2.5 pb-7 mt-6 w-full text-sm leading-6 bg-white rounded-xl hide-scroll ">
            {renderMenuContent()}

            <MenuSection title="OTHER" className="px-2.5 pb-7 mt-2">
              <div className="flex flex-col gap-2 mt-4">
                <MenuItem
                  imgIcon=""
                  icon="fa fa-sign-out"
                  text="Logout"
                  menuName="Logout"
                  showArrow={false}
                  onClick={() => {
                    // Clear all local storage
                    localStorage.clear();

                    // Redirect to '/'
                    window.location.href = "/";
                  }}
                />
              </div>
              <div className="flex gap-2 self-start ml-5">
              </div>
            </MenuSection>
          </main>

        </aside>
      )}
    </>
  );
};

export default LeftSideMenu;
