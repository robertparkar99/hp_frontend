'use client';
import { useEffect, useState } from 'react';
import Header from "@/components/Header/Header";

export default function HRWorkforceAnalyticsReport() {
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
                        src="https://lookerstudio.google.com/embed/reporting/3a7b9fa7-35b5-49cc-aabe-6dae3dcdcd23/page/jnrpF"
                        style={{ width: '100%', height: 'calc(100% + 55px)', border: 'none' }}
                        title="HR Workforce Analytics Report"
                        loading="lazy"
                        allowFullScreen
                        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    />
                </div>
            </div>
        </div>
    );
}
