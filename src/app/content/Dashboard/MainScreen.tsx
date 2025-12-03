"use client";

import * as React from "react";
import { useEffect, useState, Suspense, lazy } from "react";
import StatGrid from "./StatGrid";
import { useRouter } from "next/navigation";
import Loading from "../../../components/utils/loading";
import { Atom } from "react-loading-indicators"; // Import the Loading component

type MenuDetail = {
  menu: string;
  pageType: string;
  access: string; // component import path relative to /app/content/
};

const MainScreen: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<MenuDetail | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [DynamicComponent, setDynamicComponent] = useState<
    React.LazyExoticComponent<React.ComponentType<any>> | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 👈 Added
  const navigate = useRouter();

  // ✅ Listen to sidebar open/close state (from localStorage)
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarState = localStorage.getItem("sidebarOpen");
      setIsSidebarOpen(sidebarState === "true");
    };

    checkSidebarState();
    window.addEventListener("sidebarStateChange", checkSidebarState);

    return () => {
      window.removeEventListener("sidebarStateChange", checkSidebarState);
    };
  }, []);

  // ✅ Menu selection logic
  useEffect(() => {
    const handleMenuSelect = async (e: Event) => {
      const customEvent = e as CustomEvent<MenuDetail>;
      const menuDetail = customEvent.detail;
      setSelectedMenu(menuDetail);

      if (menuDetail?.access) {
        const strippedAccess = menuDetail.access.slice(0, -4); // remove .tsx
        try {
          const LoadedComponent = lazy(() =>
            import(`@/app/content/${strippedAccess}`)
          );
          setDynamicComponent(() => LoadedComponent);
          setLoading(false);
        } catch (error) {
          console.error("Component load error:", error);
          setDynamicComponent(null);
        }
      }
    };

    window.addEventListener("menuSelected", handleMenuSelect);
    return () => window.removeEventListener("menuSelected", handleMenuSelect);
  }, []);

  type ComponentMap = {
    [key: string]: React.LazyExoticComponent<React.ComponentType<any>>;
  };

  const componentMap: ComponentMap = {
    "Libraries/skillLibrary.tsx": lazy(
      () => import("@/app/content/Libraries/skillLibrary")
    ),
    "skill-taxonomy/page.tsx": lazy(
      () => import("@/app/content/skill-taxonomy/page")
    ),
  };

  const renderComponent = () => {
    if (!selectedMenu) return null;
    if (!DynamicComponent) {
      return <div>{selectedMenu.menu} component not found (404).</div>;
    }

    return (
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            <Atom color="#525ceaff" size="medium" text="" textColor="" />
          </div>
        }
      >
        <DynamicComponent />
      </Suspense>
    );
  };

  // ✅ Default StatGrid view
  if (!selectedMenu && !isLoading) {
    return (
      <div
        className={`flex-col w-auto pt-5 px-10 rounded-2xl max-md:px-5 max-md:pb-24 dashboardCard transition-all duration-300 `}
      >
        <div className="self-center mt-4 w-full">
          <StatGrid />
        </div>
      </div>
    );
  }

  // ✅ Dynamic Content View
  return !isLoading ? (
    <main
      className={`flex overflow-scroll flex-col w-auto pr-2 pl-2 bg-white rounded-2xl shadow-sm pb-6 h-[87vh] hide-scroll transition-all duration-300 ${
        isSidebarOpen ? "ml-72" : "ml-20"
      }`}
    >
      <div className="self-center mt-4 w-full max-w-[1360px] max-md:max-w-full">
        {renderComponent()}
      </div>
    </main>
  ) : (
    <Loading />
  );
};

export default MainScreen;
