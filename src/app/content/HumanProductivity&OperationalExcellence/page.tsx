'use client';
import { useEffect, useState } from 'react';
import Header from "@/components/Header/Header";

export default function HumanProductivityAndOperationalExcellence() {
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
        <div className="min-h-screen bg-gray-50/50">
            <div className={`mb-5 transition-all duration-300 ${isSidebarOpen ? "lg:ml-72" : "lg:ml-20"}`}>
                <Header />
            </div>
            <div className={`transition-all duration-300 p-2 h-[calc(100vh-100px)] ${isSidebarOpen ? "lg:ml-72" : "lg:ml-20"}`}>
                <div className="w-full h-full overflow-hidden rounded-[12px]">
                    <iframe
                        src="https://lookerstudio.google.com/embed/reporting/6cb8787d-de6b-4754-96a4-6e22160e8c4a/page/rfErF"
                        style={{ width: '100%', height: 'calc(100% + 55px)', border: 'none' }}
                        title="Human Productivity & Operational Excellence"
                        loading="lazy"
                        allowFullScreen
                        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    />
                </div>
            </div>
        </div>
    );
}
