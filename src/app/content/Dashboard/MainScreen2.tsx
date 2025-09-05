// app/content/MainScreen.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import  StatGrid  from "./StatGrid";
import { Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  componentName: string;
};
type MenuDetail = {
  menu: string;
  pageType: string;
  access: string; // component import path relative to this file
};

const MainScreen: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<MenuDetail | null>(null);
  const navigate = useRouter();

  useEffect(() => {
    const handleMenuSelect = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSelectedMenu(customEvent.detail); // null or menu text
    };

    window.addEventListener("menuSelected", handleMenuSelect);
    return () => window.removeEventListener("menuSelected", handleMenuSelect);
  }, []);

  const renderComponent = () => {
  if (!selectedMenu) return null;
  // alert(selectedMenu.access);
    switch (selectedMenu) {
      case selectedMenu:
        const DynamicComponent = lazy(() => {
          const tryImport = (attempt: number): Promise<{ default: React.ComponentType<any> }> => {
            let importPath = '';
            console.log('attempt ', attempt);
            switch (attempt) {
              case 1:
                importPath = `@/app/content/${selectedMenu.access}`;
                console.log('case ', importPath);
                break;
              case 2:
                importPath = `@/app/content/Libraries/${selectedMenu.menu}`;
                console.log('case ', importPath);
                break;
              default:
                return Promise.resolve({
                  default: () => <div>{selectedMenu.menu} component not found (404).</div>,
                });
            }

            return import(importPath)
              .then((module) => {
                if (!module.default) {
                  return tryImport(attempt + 1);
                }
                return { default: module.default };
              })
              .catch(() => {
                return tryImport(attempt + 1);
              });
          };

          return tryImport(1);
        });

        return (
          <Suspense fallback={<div>Loading...</div>}>
            <DynamicComponent />
          </Suspense>
        );
      default:
        return (
          <h2 className="text-2xl font-semibold text-gray-500">
            {selectedMenu.menu} page is under construction.
          </h2>
        );
    }
  };

  if (!selectedMenu) {
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
    <main className="flex overflow-hidden flex-col w-auto pt-5 pr-6 pl-6 bg-white rounded-2xl shadow-sm pb-6 h-[fit-content] max-md:px-5 max-md:pb-24">
        {/* <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/e6eab4227e391bd1268df1fb318a60e266703003?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          alt=""
          className="object-contain self-end aspect-square w-[35px]"
        /> */}
        <div className="self-center mt-4 w-full max-w-[1360px] max-md:max-w-full">
      {renderComponent()}
      </div>
    </main>
  );
};

export default MainScreen;
