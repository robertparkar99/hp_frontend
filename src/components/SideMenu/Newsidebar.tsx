"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { CornerDownRight, ChevronLeft, ChevronRight, Home } from "lucide-react"; // Added Home icon
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "./UserProfile"; // UserProfile import करें

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
    subItems?: { key: string; label: string; page_type?: string; access_link?: string }[];
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
}: {
    item: SubItem & { page_type?: string; access_link?: string };
    isExpanded: boolean;
    onToggle: () => void;
    hasSubItems?: boolean;
    isCollapsed: boolean;
    onExpandSidebar: () => void;
}) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCollapsed) {
            onExpandSidebar();
            return;
        }

        if (item.page_type === "url" && item.access_link) {
            window.open(item.access_link, "_blank");
        } else if (item.page_type === "page" && item.access_link) {
            const normalizedLink = item.access_link.startsWith("/")
                ? item.access_link
                : `/${item.access_link}`;
            window.location.href = normalizedLink;
        } else if (hasSubItems) {
            onToggle();
        }
    };

    const handleSubItemClick = (e: React.MouseEvent, subItem: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (subItem.page_type === "url" && subItem.access_link) {
            window.open(subItem.access_link, "_blank");
        } else if (subItem.page_type === "page" && subItem.access_link) {
            const normalizedLink = subItem.access_link.startsWith("/")
                ? subItem.access_link
                : `/${subItem.access_link}`;
            window.location.href = normalizedLink;
        }
    };

    return (
        <div className="w-[280px] ml-[20px] mb-1">
            <div
                className="h-auto w-60 pl-1 items-center rounded-[10px]"
                style={{
                    background: "rgba(71, 160, 255, 0.25)",
                    boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.10)",
                }}
            >
                <div className="w-[240px] bg-white rounded-[10px] transition-all overflow-hidden">
                    <button
                        onClick={handleClick}
                        className="w-full h-[40px] flex items-center justify-between px-[15px] hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-[20px]">
                            {item.icon}
                            {!isCollapsed && (
                                <span
                                    className="text-[#686868] text-[12px] font-medium leading-[18px]"
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
                                    className="ml-[20px] pb-2"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    {item.subItems.map((subItem: any) => (
                                        <button
                                            key={subItem.key}
                                            className="flex items-center gap-[30px] py-2 cursor-pointer w-full text-left hover:bg-gray-50 px-2 rounded"
                                            onClick={(e) => handleSubItemClick(e, subItem)}
                                        >
                                            <CornerDownRight className="text-gray-400" />
                                            <span
                                                className="text-[#686868] text-[12px] font-normal leading-[18px]"
                                                style={{
                                                    fontFamily:
                                                        "Roboto, -apple-system, Roboto, Helvetica, sans-serif",
                                                }}
                                            >
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
}: {
    section: SectionItem;
    isActive: boolean;
    open: boolean;
    onToggle: () => void;
    subOpen: SubOpenState;
    onSubToggle: (subKey: string) => void;
    isCollapsed: boolean;
    onExpandSidebar: () => void;
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
                        className="mx-[15px] mt-[20px] h-[50px] flex items-center justify-center rounded-[15px]"
                        style={{ background: "#007BE5" }}
                    >
                        <button
                            type="button"
                            onClick={handleClick}
                            className="w-full h-full flex items-center justify-between px-[11px] transition-colors rounded-[15px]"
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
                            onClick={handleClick}
                            className="w-full h-full flex items-center justify-between px-[25px] hover:bg-gray-50 transition-colors"
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
                <div className="pb-4">
                    {section.subItems.map((subItem) => (
                        <SubMenuItem
                            key={subItem.key}
                            item={subItem}
                            isExpanded={subOpen[subItem.key] || false}
                            onToggle={() => onSubToggle(subItem.key)}
                            hasSubItems={!!subItem.subItems && subItem.subItems.length > 0}
                            isCollapsed={isCollapsed}
                            onExpandSidebar={onExpandSidebar}
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

            // Fetch all data in parallel where possible
            const [level1Data, level2Data, level3Data] = await Promise.all([
                fetchWithRetry(
                    `${sessionData.url}/table_data?table=tblmenumaster&filters[parent_id]=0&filters[level]=1&filters[status]=1&sort_order=sort_order`
                ),
                fetchWithRetry(
                    `${sessionData.url}/table_data?table=tblmenumaster&filters[level]=2&filters[status]=1&sort_order=sort_order`
                ),
                fetchWithRetry(
                    `${sessionData.url}/table_data?table=tblmenumaster&filters[level]=3&filters[status]=1&sort_order=sort_order`
                )
            ]);

            // Process data
            const sectionsData = level1Data.map((l1: MenuApiItem) => {
                const l2Items = level2Data.filter((l2: MenuApiItem) => l2.parent_id === l1.id);
                const subItems = l2Items.map((l2: MenuApiItem) => {
                    const l3Items = level3Data.filter((l3: MenuApiItem) => l3.parent_id === l2.id);
                    return {
                        key: String(l2.id),
                        label: l2.menu_name,
                        icon: <i className={l2.icon}></i>,
                        page_type: l2.page_type,
                        access_link: l2.access_link,
                        subItems: l3Items.map((l3: MenuApiItem) => ({
                            key: String(l3.id),
                            label: l3.menu_name,
                            page_type: l3.page_type,
                            access_link: l3.access_link,
                        })),
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

// Dashboard Section Component
const DashboardSection = ({
    isCollapsed,
    onExpandSidebar,
}: {
    isCollapsed: boolean;
    onExpandSidebar: () => void;
}) => {
    const handleDashboardClick = () => {
        if (isCollapsed) {
            onExpandSidebar();
            return;
        }
        // Navigate to home page
        window.location.href = "/";
    };

    return (
        <div className="w-full">
            <div className="w-full h-[60px] relative">
                <div className="w-full h-[60px] bg-white relative">
                    <button
                        type="button"
                        onClick={handleDashboardClick}
                        className="w-full h-full flex items-center justify-between px-[25px] hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-[20px]">
                            <Home className="w-[16px] h-[24px] " />
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
            </div>
        </div>
    );
};

export default function Sidebar({ mobileOpen, onClose, userSessionData }: SidebarProps) {
    const [open, setOpen] = useState<OpenState>({});
    const [activeSection, setActiveSection] = useState<string>();
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

    const { sections, loading, error, fetchMenuData } = useMenuData(sessionData);

    // Initialize collapse state from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("sidebarOpen");
        if (stored !== null) {
            setIsCollapsed(stored === "true" ? false : true);
        } else {
            localStorage.setItem("sidebarOpen", String(!isCollapsed));
        }
    }, []);

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
                const { APP_URL, token, sub_institute_id, org_type, user_id, userimage, userProfile, firstName, lastName } = JSON.parse(userData);
                setSessionData({
                    url: APP_URL || "",
                    token: token || "",
                    subInstituteId: sub_institute_id || "",
                    orgType: org_type || "",
                    userId: user_id || "",
                    userimage: userimage || "",
                    userProfile: userProfile || "",
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

    const handleSectionToggle = (key: string) => {
        setOpen((o) => ({ ...o, [key]: !o[key] }));
        setActiveSection(key);
    };

    const handleSubToggle = (subKey: string) => {
        setSubOpen((s) => ({ ...s, [subKey]: !s[subKey] }));
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
                    ) : loading ? (
                        <div className="relative flex flex-col justify-center items-center transform bg-white w-full">
                            <img
                                src="/assets/loading/black_simple_laoding.gif"
                                alt="loading.."
                                className="w-[30px] h-[30px]"
                            />
                            <p className="mt-4">Please wait...</p>
                        </div>
                    ) : (
                        sections.map((section) => (
                            <Section
                                key={section.key}
                                section={section}
                                isActive={activeSection === section.key}
                                open={!!open[section.key]}
                                onToggle={() => handleSectionToggle(section.key)}
                                subOpen={subOpen}
                                onSubToggle={handleSubToggle}
                                isCollapsed={isCollapsed}
                                onExpandSidebar={handleExpandSidebar}
                            />
                        ))
                    )}
                </div>
            </aside>
        </>
    );
}