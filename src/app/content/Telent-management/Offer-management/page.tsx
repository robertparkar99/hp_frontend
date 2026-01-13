"use client";
import Header from "@/components/Header/Header";
import { useState, useEffect } from "react";
import OfferDashboard from "./OfferDashboard";

export default function OfferManagementPage() {
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
        <div>
            <div className="mb-5">
                <Header />
            </div>
            <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-76" : "ml-24"} p-2`}>
                <OfferDashboard />
            </div>
        </div>
    );
}