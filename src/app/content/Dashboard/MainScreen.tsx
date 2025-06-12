// app/content/MainScreen.tsx
"use client";

import * as React from "react";
import { useEffect, useState, Suspense, lazy } from "react";
import { StatGrid } from "./StatGrid";
import { useRouter } from "next/navigation";

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
      <main className="flex overflow-hidden flex-col w-auto pt-5 px-10 bg-white rounded-2xl shadow-sm pb-[680px] max-md:px-5 max-md:pb-24">
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
    ) : (<div
        className="overloadGif flex items-center justify-center w-full h-screen z-[1000] bg-white"
        id="overloadGif"
      >
        <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-6">
          {/* Glowing Ring Spinner */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-l-blue-500 animate-spin shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
            <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-900"></div>
          </div>

          {/* Animated Text */}
          <p className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-bluse-500 text-transparent bg-clip-text animate-pulse tracking-wide">
            Loading Please Wait...
          </p>

          {/* Optional subtitle or loader bar */}
          <div className="w-40 h-2 bg-gradient-to-r from-blue-400 via-bluse-400 to-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>)
  );
};

export default MainScreen;
