"use client";
import Header from "@/components/Header/Header";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import OfferDashboard from "./OfferDashboard";
import { startOfferManagementTour, shouldTriggerOfferManagementTour } from "./OfferManagementTourSteps";
import { startAllTabTours, shouldTriggerAllTabTours } from "../ManagerHub/ManagerHubTourSteps";

export default function OfferManagementPage() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tourInitialized, setTourInitialized] = useState(false);

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

    // Handle tour trigger from sidebar tour flow
    useEffect(() => {
        if (tourInitialized) return;

        // Check if all tab tours should be triggered (for sequential tour flow)
        const shouldStartAllTours = shouldTriggerAllTabTours();
        console.log('[OfferManagement] Should trigger all tab tours:', shouldStartAllTours);

        if (shouldStartAllTours) {
            // Clear the trigger flag immediately to prevent re-triggering
            sessionStorage.removeItem('triggerPageTour');

            // Navigate to ManagerHub page first, then start tours
            // Set a flag to indicate we need to start tours after navigation
            sessionStorage.setItem('startManagerHubTours', 'true');

            // Navigate to ManagerHub page
            router.push('/content/Telent-management/ManagerHub');
            return;
        }

        // Fall back to original tour check
        const shouldStartTour = shouldTriggerOfferManagementTour();
        console.log('[OfferManagement] Should trigger tour from sidebar:', shouldStartTour);

        if (shouldStartTour) {
            // Clear the trigger flag immediately to prevent re-triggering
            sessionStorage.removeItem('triggerPageTour');

            // Start the tour after a delay to ensure DOM is ready
            setTimeout(() => {
                startOfferManagementTour();
                setTourInitialized(true);
            }, 500);
        } else {
            setTourInitialized(true);
        }
    }, [tourInitialized, router]);

    return (
        <div>
            <div className="mb-5">
                <Header />
            </div>
            <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-76" : "ml-24"} p-2`}>
                <Suspense fallback={<div>Loading...</div>}>
                    <OfferDashboard />
                </Suspense>
            </div>
        </div>
    );
}
