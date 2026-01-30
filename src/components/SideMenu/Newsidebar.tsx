"use client";

import { useMemo, useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { CornerDownRight, ChevronLeft, ChevronRight, Home } from "lucide-react"; // Added Home icon
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "./UserProfile";
import GlobalFooter from "./GlobalFooter"; // Import GlobalFooter
import { SidebarTourGuide } from "./SidebarTour";

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
    userSessionData: {
        url: string;
        token: string;
        orgType: string;
        subInstituteId: string;
        userId: string;
        userProfile: string;
        userimage: string;
        firstName: string;
        lastName: string;
    };
}

interface SubItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    page_type?: string;
    access_link?: string;
    subItems?: {
        key: string;
        label: string;
        page_type?: string;
        access_link?: string;
    }[];
}

interface SectionItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    subItems: SubItem[];
}
interface UserSessionDataProps {
    userSessionData: any;
}

type OpenState = {
    [key: string]: boolean;
};

type SubOpenState = {
    [key: string]: boolean;
};

interface MenuApiItem {
    id: number;
    menu_name: string;
    parent_id: number;
    level: number;
    page_type: string;
    access_link: string;
    icon: string;
    status: number;
    sort_order: number;
    sub_institute_id: string;
    menu_type: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string | null;
}

// Cache implementation
const menuCache = new Map();
const CACHE_KEYS = {
    LEVEL1: 'level1',
    LEVEL2: 'level2',
    LEVEL3: 'level3'
};

const SubMenuItem = ({
    item,
    isExpanded,
    onToggle,
    hasSubItems = false,
    isCollapsed,
    onExpandSidebar,
    isActive,
    onSetActiveSub,
    onSetActiveSubSub,
    activeSubSubItem,
    router,
    sectionKey,
    onSetActiveSection,
}: {
    item: SubItem;
    isExpanded: boolean;
    onToggle: () => void;
    hasSubItems?: boolean;
    isCollapsed: boolean;
    onExpandSidebar: () => void;
    isActive: boolean;
    onSetActiveSub: (key: string | undefined) => void;
    onSetActiveSubSub: (key: string | undefined) => void;
    activeSubSubItem?: string;
    router: any;
    sectionKey: string;
    onSetActiveSection: (key: string) => void;
}) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCollapsed) {
            onExpandSidebar();
            return;
        }
        //url insted of link
        if (item.page_type === "link" && item.access_link) {
            window.open(item.access_link, "_blank");
            onSetActiveSection(sectionKey);
            onSetActiveSub(item.key);
            localStorage.setItem("activeSection", sectionKey);
            localStorage.setItem("activeSubItem", item.key);
            localStorage.removeItem("activeSubSubItem");
        } else if (item.page_type === "page" && item.access_link) {
            const normalizedLink = item.access_link.startsWith("/")
                ? item.access_link
                : `/${item.access_link}`;
            router.push(normalizedLink);
            onSetActiveSection(sectionKey);
            onSetActiveSub(item.key);
            localStorage.setItem("activeSection", sectionKey);
            localStorage.setItem("activeSubItem", item.key);
            localStorage.removeItem("activeSubSubItem");
        } else if (hasSubItems) {
            onToggle();
            onSetActiveSection(sectionKey);
            onSetActiveSub(item.key);
            localStorage.setItem("activeSection", sectionKey);
            localStorage.setItem("activeSubItem", item.key);
            localStorage.removeItem("activeSubSubItem");
        }
    };

    const handleSubItemClick = (e: React.MouseEvent, subItem: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (subItem.page_type === "url" && subItem.access_link) {
            window.open(subItem.access_link, "_blank");
            onSetActiveSection(sectionKey);
            onSetActiveSub(item.key);
            onSetActiveSubSub(subItem.key);
            localStorage.setItem("activeSection", sectionKey);
            localStorage.setItem("activeSubItem", item.key);
            localStorage.setItem("activeSubSubItem", subItem.key);
        } else if (subItem.page_type === "page" && subItem.access_link) {
            const normalizedLink = subItem.access_link.startsWith("/")
                ? subItem.access_link
                : `/${subItem.access_link}`;
            router.push(normalizedLink);
            onSetActiveSection(sectionKey);
            onSetActiveSub(item.key);
            onSetActiveSubSub(subItem.key);
            localStorage.setItem("activeSection", sectionKey);
            localStorage.setItem("activeSubItem", item.key);
            localStorage.setItem("activeSubSubItem", subItem.key);
        }
    };

    return (
        // <div className="w-[280px] ml-[20px] mb-1">
        //     <div
        //         className="h-auto w-60 pl-1 items-center rounded-[10px]"
        //         style={{ background: "rgba(71, 160, 255, 0.35)", boxShadow: "0 0 6px 0 rgba(0,0,0,0.1)" }}
        //     >
        //         <div className="w-[240px] bg-white rounded-[10px] transition-all overflow-hidden">
        <div className="w-[260px] ml-[14px] mb-2">
            <div
                className="pl-1 rounded-[12px]"
                style={{
                    background: "rgba(71, 160, 255, 0.35)",
                    boxShadow: "0 0 6px 0 rgba(0,0,0,0.1)",

                }}
            >
                <div className="bg-white rounded-[12px] overflow-hidden shadow-sm">

                    <button
                        onClick={handleClick}
                        className={`w-full h-[42px] flex items-center justify-between px-[18px] rounded-md transition-all  hover:bg-blue-200 
    ${isActive ? "bg-blue-200 font-semibold " : ""}
`}

                    >
                        <div className="flex items-center gap-[20px]">
                            {item.icon}
                            {!isCollapsed && (
                                <span
                                    className={`${isActive ? 'text-[#686868]' : 'text-[#686868]'} text-[12px] font-medium leading-[18px]`}
                                    style={{
                                        fontFamily:
                                            "Roboto, -apple-system, Roboto, Helvetica, sans-serif",
                                    }}
                                >
                                    {item.label}
                                </span>
                            )}
                        </div>
                        {!isCollapsed && hasSubItems && (
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                            >
                                <path
                                    d="M4.29289 8.29289C4.68342 7.90237 5.31658 7.90237 5.70711 8.29289L12 14.5858L18.2929 8.29289C18.6834 7.90237 19.3166 7.90237 19.7071 8.29289C20.0976 8.68342 20.0976 9.31658 19.7071 9.70711L12.7071 16.7071C12.3166 17.0976 11.6834 17.0976 11.2929 16.7071L4.29289 9.70711C3.90237 9.31658 3.90237 8.68342 4.29289 8.29289Z"
                                    fill="#686868"
                                />
                            </svg>
                        )}
                    </button>

                    {!isCollapsed && (
                        <AnimatePresence initial={false}>
                            {isExpanded && item.subItems && item.subItems.length > 0 && (
                                <motion.div
                                    className="ml-[10px] pb-2"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    {item.subItems.map((subItem: any, subSubIndex: number) => (
                                        <button
                                            id={`tour-subsub-${subItem.key}`}
                                            key={`subsub-${subSubIndex}-${subItem.key}`}
                                            className={`flex items-center gap-[22px] py-2 px-2 mb-1 rounded-md cursor-pointer w-full
    ${activeSubSubItem === subItem.key
                                                    ? "text-blue-500 font-bold bg-blue-50"
                                                    : "text-[#686868] hover:text-blue-500 hover:bg-blue-50"
                                                }
`}
                                            onClick={(e) => handleSubItemClick(e, subItem)}
                                        >
                                            <CornerDownRight />

                                            <span className="text-[12px] font-medium leading-[18px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                                {subItem.label}
                                            </span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

const Section = ({
    section,
    isActive,
    open,
    onToggle,
    subOpen,
    onSubToggle,
    isCollapsed,
    onExpandSidebar,
    activeSubItem,
    activeSubSubItem,
    onSetActiveSub,
    onSetActiveSubSub,
    router,
    onSetActiveSection,
}: {
    section: SectionItem;
    isActive: boolean;
    open: boolean;
    onToggle: () => void;
    subOpen: SubOpenState;
    onSubToggle: (subKey: string) => void;
    isCollapsed: boolean;
    onExpandSidebar: () => void;
    activeSubItem?: string;
    activeSubSubItem?: string;
    onSetActiveSub: (key: string | undefined) => void;
    onSetActiveSubSub: (key: string | undefined) => void;
    router: any;
    onSetActiveSection: (key: string) => void;
}) => {
    const handleClick = () => {
        if (isCollapsed) {
            onExpandSidebar();
            return;
        }
        onToggle();
    };

    return (
        <div className="w-full">
            <div className="w-full h-[60px] relative">
                {isActive ? (
                    <div
                        className="mx-[15px] mt-[12px] h-[48px] rounded-[12px] flex items-center shadow-sm"
                        style={{ background: "#007BE5" }}
                    >
                        <button
                            type="button"
                            id={`tour-section-${section.key}`}
                            onClick={handleClick}
                            className="w-full h-full flex items-center justify-between px-[11px] transition-colors rounded-md"
                            aria-expanded={open}
                        >
                            <div className="flex items-center gap-[15px]">
                                <div className="w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center">
                                    {section.icon}
                                </div>
                                {!isCollapsed && (
                                    <span
                                        className="text-white text-[12px] font-medium leading-[18px]"
                                        style={{
                                            fontFamily:
                                                "Roboto, -apple-system, Roboto, Helvetica, sans-serif",
                                        }}
                                    >
                                        {section.label}
                                    </span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`}
                                >
                                    <path
                                        d="M7.79289 20.2071C7.40237 19.8166 7.40237 19.1834 7.79289 18.7929L14.0858 12.5L7.79289 6.2071C7.40237 5.8166 7.40237 5.1834 7.79289 4.7929C8.18342 4.4024 8.81658 4.4024 9.20711 4.7929L16.2071 11.7929C16.5976 12.1834 16.5976 12.8166 16.2071 13.2071L9.20711 20.2071C8.81658 20.5976 8.18342 20.5976 7.79289 20.2071Z"
                                        fill="white"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-[60px] bg-white relative">
                        <button
                            type="button"
                            id={`tour-section-${section.key}`}
                            onClick={handleClick}
                                className="w-full h-full flex items-center justify-between px-[25px] hover:bg-gray-50 transition-colors rounded-md"
                            aria-expanded={open}
                        >
                            <div className="flex items-center gap-[20px]">
                                {section.icon}
                                {!isCollapsed && (
                                    <span
                                        className="text-[#686868] text-[12px] font-medium leading-[18px]"
                                        style={{
                                            fontFamily:
                                                "Roboto, -apple-system, Roboto, Helvetica, sans-serif",
                                        }}
                                    >
                                        {section.label}
                                    </span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                                >
                                    <path
                                        d="M4.29289 8.29289C4.68342 7.90237 5.31658 7.90237 5.70711 8.29289L12 14.5858L18.2929 8.29289C18.6834 7.90237 19.3166 7.90237 19.7071 8.29289C20.0976 8.68342 20.0976 9.31658 19.7071 9.70711L12.7071 16.7071C12.3166 17.0976 11.6834 17.0976 11.2929 16.7071L4.29289 9.70711C3.90237 9.31658 3.90237 8.68342 4.29289 8.29289Z"
                                        fill="#686868"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {!isCollapsed && isActive && open && (
                <div className="pb-2 ">
                    {section.subItems.map((subItem, subIndex) => (
                        <SubMenuItem
                            key={`sub-${subIndex}-${subItem.key}`}
                            item={subItem}
                            isExpanded={subOpen[subItem.key] || false}
                            onToggle={() => onSubToggle(subItem.key)}
                            hasSubItems={!!subItem.subItems && subItem.subItems.length > 0}
                            isCollapsed={isCollapsed}
                            onExpandSidebar={onExpandSidebar}
                            isActive={activeSubItem === subItem.key}
                            onSetActiveSub={onSetActiveSub}
                            onSetActiveSubSub={onSetActiveSubSub}
                            activeSubSubItem={activeSubSubItem}
                            router={router}
                            sectionKey={section.key}
                            onSetActiveSection={onSetActiveSection}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Custom hook for fetching menu data
const useMenuData = (sessionData: any) => {
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const hasFetchedData = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchMenuData = useCallback(async () => {
        if (!sessionData.url || hasFetchedData.current) return;

        // Check cache first
        const cacheKey = `menu-data-${sessionData.subInstituteId}`;
        if (menuCache.has(cacheKey)) {
            setSections(menuCache.get(cacheKey));
            return;
        }

        hasFetchedData.current = true;
        setLoading(true);
        setError(null);

        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
                try {
                    const res = await fetch(url, { signal });
                    if (!res.ok) throw new Error(`Fetch failed: ${url}`);
                    return await res.json();
                } catch (err: any) {
                    if (retries > 0 && err.name !== 'AbortError') {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return fetchWithRetry(url, retries - 1);
                    }
                    throw err;
                }
            };

            // Fetch menu data from the new API
            const menuData = await fetchWithRetry(
                `${sessionData.url}/user/ajax_groupwiserights?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&profile_id=${sessionData.userProfile}`
            );

            // Process data
            const sectionsData = menuData.level_1
                .filter((l1: any) => l1.can_view === 1)
                .map((l1: any) => {
                    const l2Group = menuData.level_2[l1.id] || {};
                    const subItems = Object.values(l2Group)
                        .filter((l2: any) => l2.can_view === 1)
                        .map((l2: any) => {
                            const l3Group = menuData.level_3[l2.id] || {};
                            const subSubItems = Object.values(l3Group)
                                .filter((l3: any) => l3.can_view === 1)
                                .map((l3: any) => ({
                                    key: String(l3.id),
                                    label: l3.menu_name,
                                    page_type: l3.page_type,
                                    access_link: l3.access_link,
                                }));

                            return {
                                key: String(l2.id),
                                label: l2.menu_name,
                                icon: <i className={l2.icon}></i>,
                                page_type: l2.page_type,
                                access_link: l2.access_link,
                                subItems: subSubItems,
                            };
                        });

                    return {
                        key: String(l1.id),
                        label: l1.menu_name,
                        icon: <i className={l1.icon}></i>,
                        subItems,
                    };
                });

            // Cache the result
            menuCache.set(cacheKey, sectionsData);
            setSections(sectionsData);

        } catch (err: any) {
            if (err.name !== "AbortError") {
                console.error("Sidebar fetch error:", err);
                setError("Failed to load menu data");
                // Reset the flag to allow retrying
                hasFetchedData.current = false;
            }
        } finally {
            setLoading(false);
        }
    }, [sessionData.url, sessionData.subInstituteId]);

    return { sections, loading, error, fetchMenuData };
};
const DASHBOARD_KEY = "___dashboard___";
// Dashboard Section Component
const DashboardSection = ({
    isCollapsed,
    onExpandSidebar,
    activeSection,
    onSetActiveSection,
    onSetActiveSub,
    onSetActiveSubSub,
}: {
    isCollapsed: boolean;
    onExpandSidebar: () => void;
    activeSection?: string;
    onSetActiveSection: (key: string) => void;
    onSetActiveSub: (key: string | undefined) => void;
    onSetActiveSubSub: (key: string | undefined) => void;
}) => {
    const isActive = activeSection === DASHBOARD_KEY;

    const handleDashboardClick = () => {
        if (isCollapsed) {
            onExpandSidebar();
            return;
        }
        onSetActiveSection(DASHBOARD_KEY);
        onSetActiveSub(undefined);
        onSetActiveSubSub(undefined);
        localStorage.setItem("activeSection", DASHBOARD_KEY);
        localStorage.removeItem("activeSubItem");
        localStorage.removeItem("activeSubSubItem");
        // Navigate to home page
        window.location.href = "/";
    };

    return (
        <div className="w-full mb-2">
            <div className="w-full h-[60px] relative">
                {isActive ? (
                    <div
                        className="mx-[15px] mt-[20px] h-[50px] flex items-center justify-center rounded-[15px]"
                        style={{ background: "#007BE5" }}
                    >
                        <button
                            type="button"
                            id="tour-dashboard"
                            onClick={handleDashboardClick}
                            className="w-full h-full flex items-center justify-between px-[11px] transition-colors rounded-md"
                        >
                            <div className="flex items-center gap-[15px]">
                                <div className="w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center">
                                    <Home className="w-[16px] h-[24px] text-white" />
                                </div>
                                {!isCollapsed && (
                                    <span
                                        className="text-white text-[12px] font-medium leading-[18px]"
                                        style={{
                                            fontFamily:
                                                "Roboto, -apple-system, Roboto, Helvetica, sans-serif",
                                        }}
                                    >
                                        Dashboard
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-[60px] bg-white relative">
                        <button
                            type="button"
                            onClick={handleDashboardClick}
                                className="w-full h-full flex items-center justify-between px-[25px] hover:bg-gray-50 transition-colors rounded-md"
                        >
                            <div className="flex items-center gap-[20px]">
                                <Home className="w-[16px] h-[24px]" />
                                {!isCollapsed && (
                                    <span
                                        className="text-[#686868] text-[12px] font-medium leading-[18px]"
                                        style={{
                                            fontFamily:
                                                "Roboto, -apple-system, Roboto, Helvetica, sans-serif",
                                        }}
                                    >
                                        Dashboard
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Sidebar({ mobileOpen, onClose, userSessionData }: SidebarProps) {
    const router = useRouter();
    const [open, setOpen] = useState<OpenState>({});
    const [activeSection, setActiveSection] = useState<string>();
    const [activeSubItem, setActiveSubItem] = useState<string>();
    const [activeSubSubItem, setActiveSubSubItem] = useState<string>();
    const [subOpen, setSubOpen] = useState<SubOpenState>({});
    const [sessionData, setSessionData] = useState({
        url: "",
        token: "",
        subInstituteId: "",
        orgType: "",
        userId: "",
        userimage: "",
        userProfile: "",
        firstName: "",
        lastName: "",
    });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const tourGuideRef = useRef<SidebarTourGuide | null>(null);

    const { sections, loading, error, fetchMenuData } = useMenuData(sessionData);

    const expandSidebar = () => setIsCollapsed(false);
    const expandSection = (sectionKey: string) => setOpen(o => ({ ...o, [sectionKey]: true }));
    const expandSub = (subKey: string) => setSubOpen(s => ({ ...s, [subKey]: true }));

    // Initialize collapse state and active states from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("sidebarOpen");
        if (stored !== null) {
            setIsCollapsed(stored === "true" ? false : true);
        } else {
            localStorage.setItem("sidebarOpen", String(!isCollapsed));
        }

        const storedActiveSection = localStorage.getItem("activeSection");
        if (storedActiveSection) {
            setActiveSection(storedActiveSection);
        }

        const storedActiveSubItem = localStorage.getItem("activeSubItem");
        if (storedActiveSubItem) {
            setActiveSubItem(storedActiveSubItem);
        }

        const storedActiveSubSubItem = localStorage.getItem("activeSubSubItem");
        if (storedActiveSubSubItem) {
            setActiveSubSubItem(storedActiveSubSubItem);
        }
    }, []);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (initialized === true) return;
        if (!sections.length) return;

        const currentPath = window.location.pathname;
        const normalizePath = (path: string = "") =>
            "/" + path.replace(/^\/+/, "").replace(/\/+$/, "");

        for (const section of sections) {
            for (const l2 of section.subItems) {

                if (normalizePath(l2.access_link) === currentPath) {
                    setActiveSection(section.key);
                    setActiveSubItem(l2.key);
                    setOpen(o => ({ ...o, [section.key]: true }));
                    setSubOpen(s => ({ ...s, [l2.key]: true }));
                    setInitialized(true);
                    return;
                }

                for (const l3 of (l2.subItems || [])) {
                    if (normalizePath(l3.access_link) === currentPath) {
                        setActiveSection(section.key);
                        setActiveSubItem(l2.key);
                        setActiveSubSubItem(l3.key);
                        setOpen(o => ({ ...o, [section.key]: true }));
                        setSubOpen(s => ({ ...s, [l2.key]: true }));
                        setInitialized(true);
                        return;
                    }
                }
            }
        }
    }, [sections]);

    // Persist sidebar state
    useEffect(() => {
        try {
            localStorage.setItem("sidebarOpen", String(!isCollapsed));
            window.dispatchEvent(new Event("sidebarStateChange"));
        } catch (err) {
            console.warn("Could not persist sidebar state:", err);
        }
    }, [isCollapsed]);

    const handleExpandSidebar = () => setIsCollapsed(false);

    // Get session data
    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            try {
                const { APP_URL, token, sub_institute_id, org_type, user_id, userimage, user_profile_id, firstName, lastName } = JSON.parse(userData);
                setSessionData({
                    url: APP_URL || "",
                    token: token || "",
                    subInstituteId: sub_institute_id || "",
                    orgType: org_type || "",
                    userId: user_id || "",
                    userimage: userimage || "",
                    userProfile: user_profile_id || "",
                    firstName: firstName || "",
                    lastName: lastName || "",
                });
            } catch (err) {
                console.error("Error parsing user data:", err);
            }
        }
    }, []);

    // Fetch menu data when session data is available
    useEffect(() => {
        if (sessionData.url && sessionData.subInstituteId) {
            fetchMenuData();
        }
    }, [sessionData.url, sessionData.subInstituteId, fetchMenuData]);

    // Initialize tour when sections are loaded
    useEffect(() => {
        if (sections.length > 0 && !loading) {
            tourGuideRef.current = new SidebarTourGuide(sections, expandSidebar, expandSection, expandSub, setActiveSection);
            tourGuideRef.current.startTour();
        }
    }, [sections, loading]);

    const handleSectionToggle = (key: string) => {
        setOpen((o) => ({ ...o, [key]: !o[key] }));
        setActiveSection(key);
        setActiveSubItem(undefined);
        setActiveSubSubItem(undefined);
        localStorage.setItem("activeSection", key);
        localStorage.removeItem("activeSubItem");
        localStorage.removeItem("activeSubSubItem");
    };

    const handleSubToggle = (subKey: string) => {
        setSubOpen((s) => ({ ...s, [subKey]: !s[subKey] }));
        // Find the section key for this subKey
        const section = sections.find(s => s.subItems.some(sub => sub.key === subKey));
        if (section) {
            setActiveSection(section.key);
            setActiveSubItem(subKey);
            setActiveSubSubItem(undefined);
            localStorage.setItem("activeSection", section.key);
            localStorage.setItem("activeSubItem", subKey);
            localStorage.removeItem("activeSubSubItem");
        }
    };

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            <div
                onClick={onClose}
            // className={`fixed inset-0 bg-black/30 lg:hidden transition-opacity ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />

            <aside
                className={`fixed left-0 top-0 z-40 h-screen bg-[#FFFDFD] transition-all duration-300 ease-out flex flex-col ${isCollapsed ? "w-[80px]" : "w-[280px]"
                    } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
                style={{
                    borderRadius: "0 15px 15px 0",
                    boxShadow: "2px 4px 15px 0 rgba(71, 160, 255, 0.25)",
                }}
            >
                {/* Header */}
                <div className="h-[100px] flex items-center justify-between px-[20px]">
                    {!isCollapsed && (
                        <UserProfile userSessionData={sessionData} />
                    )}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleToggle}
                        className="w-[30px] h-[30px] flex items-center justify-center border-[1.5px] border-[#393939] rounded-[4px]"
                    >
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={isCollapsed ? "right" : "left"}
                                initial={{ opacity: 0, x: isCollapsed ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isCollapsed ? 10 : -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isCollapsed ? (
                                    <ChevronRight className="w-4 h-4 text-[#393939]" />
                                ) : (
                                    <ChevronLeft className="w-4 h-4 text-[#393939]" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.button>
                </div>

                {/* Sidebar Menu */}
                <div
                    className="flex-1 overflow-y-auto overflow-x-hidden"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {/* Dashboard Section - Always at the top */}
                    <DashboardSection
                        isCollapsed={isCollapsed}
                        onExpandSidebar={handleExpandSidebar}
                        activeSection={activeSection}
                        onSetActiveSection={setActiveSection}
                        onSetActiveSub={setActiveSubItem}
                        onSetActiveSubSub={setActiveSubSubItem}
                    />

                    {error ? (
                        <div className="p-4 text-center text-red-500">
                            <p>{error}</p>
                            <button
                                onClick={fetchMenuData}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Retry
                            </button>
                        </div>
                        // ) : loading ? (
                        //     <div className="relative flex flex-col justify-center items-center transform bg-white w-full">
                        //         <img
                        //             src="/assets/loading/black_simple_laoding.gif"
                        //             alt="loading.."
                        //             className="w-[30px] h-[30px]"
                        //         />
                        //         <p className="mt-4">Please wait...</p>
                        //     </div>
                    ) : (
                        sections.map((section, index) => (
                            <Section
                                key={`section-${index}-${section.key}`}
                                section={section}
                                isActive={activeSection === section.key && activeSection !== DASHBOARD_KEY}
                                open={!!open[section.key]}
                                onToggle={() => handleSectionToggle(section.key)}
                                subOpen={subOpen}
                                onSubToggle={handleSubToggle}
                                isCollapsed={isCollapsed}
                                onExpandSidebar={handleExpandSidebar}
                                activeSubItem={activeSubItem}
                                activeSubSubItem={activeSubSubItem}
                                onSetActiveSub={setActiveSubItem}
                                onSetActiveSubSub={setActiveSubSubItem}
                                router={router}
                                onSetActiveSection={setActiveSection}
                            />
                        ))
                    )}
                </div>
            </aside>
            { /* Global Footer with Chatbot */}
            <GlobalFooter />
        </>
    );
}