// app/content/MainScreen.tsx
"use client";

import * as React from "react";
import { useEffect, useState, Suspense, lazy } from "react";
import { StatGrid } from "./StatGrid";
import { useRouter } from "next/navigation";
import Loading from "../../../components/utils/loading"; // Import the Loading component

type MenuDetail = {
  menu: string;
  pageType: string;
  access: string; // component import path relative to /app/content/
};

const MainScreen: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<MenuDetail | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [DynamicComponent, setDynamicComponent] = useState<React.LazyExoticComponent<React.ComponentType<any>> | null>(null);
  const navigate = useRouter();

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

  // Define a type for the component map
  type ComponentMap = {
    [key: string]: React.LazyExoticComponent<React.ComponentType<any>>;
  };
  console.log(selectedMenu?.access)
  // Create the component map with proper typing
  const componentMap: ComponentMap = {
    'Libraries/skillLibrary.tsx': lazy(() => import('@/app/content/Libraries/skillLibrary')),
    // Add other components here as needed
  };

  const renderComponent = () => {
    if (!selectedMenu) return null;

    if (!DynamicComponent) {
      return <div>{selectedMenu.menu} component not found (404).</div>;
    }
    return (
      <Suspense fallback={<div> please wait...
      </div>}>
        <DynamicComponent />
      </Suspense>
    );
  };

  if (!selectedMenu && !isLoading) {
    return (
      <main className="flex overflow-hidden flex-col w-auto pt-5 px-10 bg-white rounded-2xl shadow-sm h-[550px] max-md:px-5 max-md:pb-24">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/e6eab4227e391bd1268df1fb318a60e266703003?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          alt=""
          className="object-contain self-end aspect-square w-[35px]"
        />
        <div className="self-center mt-4 w-full max-w-[1360px] max-md:max-w-full">
          <StatGrid />
        </div>
      </main>
    );
  }

  return (
    !isLoading ? (
      <main className="flex overflow-hidden flex-col w-auto pt-5 pr-6 pl-6 bg-white rounded-2xl shadow-sm pb-6 h-[fit-content] max-md:px-5 max-md:pb-24">
        <div className="self-center mt-4 w-full max-w-[1360px] max-md:max-w-full">
          {renderComponent()}
        </div>
      </main>
    ) : (<Loading />)
  );
};

export default MainScreen;
