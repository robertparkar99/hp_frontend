"use client";
import Header from "@/components/Header/Header";
import Template from "../../editor/[templateId]/Component/Template";
import { useState, useEffect } from "react";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default function HomePage({ params }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <>
      <div className="mb-6 ">
        <Header />
      </div>
      <div className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-76" : "md:ml-24"} px-4 md:px-6 lg:px-8 pb-6`}>
        <div className="space-y-6 bg-background">
          <Template params={params} />
        </div>
      </div>
    </>
  );
}