'use client';
import { useEffect, useState } from 'react';
import Header from "@/components/Header/Header";
import Sidebar from "@/components/SideMenu/Newsidebar";

export default function Index() {
    const [subInstituteId, setSubInstituteId] = useState<string>('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsedData = JSON.parse(userData);
            setSubInstituteId(parsedData.sub_institute_id || '');
        }

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

    const handleCloseMobileSidebar = () => {
        setMobileOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className={`mb-5 transition-all duration-300 ${isSidebarOpen ? "lg:ml-72" : "lg:ml-20"}`}>
                <Header />
            </div>
            {/* <Sidebar mobileOpen={mobileOpen} onClose={handleCloseMobileSidebar} /> */}
            <div className={`transition-all duration-300 p-2 h-[calc(100vh-100px)] ${isSidebarOpen ? "lg:ml-72" : "lg:ml-20"}`}>
                {subInstituteId && (
                    <iframe
                        src={`https://skill-ontology-neo4j.vercel.app/?sub_institute_id=${subInstituteId}`}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
                        title="Skill Neo4j"
                    />
                )}
            </div>
        </div>
    );
}