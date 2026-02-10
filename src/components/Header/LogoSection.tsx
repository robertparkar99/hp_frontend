"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Bot, Bell, X } from 'lucide-react';

export const LogoSection: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTasks, setNotificationTasks] = useState<any[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showAutoNotification, setShowAutoNotification] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // For forcing re-render
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [notificationPos, setNotificationPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setMounted(true);
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData(parsedData);
      console.log("Session data:", parsedData);
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !notificationRef.current?.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load pending tasks count from localStorage and listen for updates
  useEffect(() => {
    const loadPendingCount = async () => {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        try {
          // Fetch fresh data to get today's count
          const apiUrl = `${parsedData.APP_URL}/api/tasks/counts?token=${parsedData.token}&sub_institute_id=${parsedData.sub_institute_id}&user_id=${parsedData.user_id}`;
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            
            // Get today's date in consistent format (use local date to avoid UTC issues)
            const today = new Date();
            const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
            
            let todayPendingCount = 0;
            
            // Count from daily date_wise_counts for today
            if (data.data?.daily?.date_wise_counts) {
              const todayData = data.data.daily.date_wise_counts.find((d: any) => {
                const countDate = new Date(d.date).toLocaleDateString('en-CA');
                return countDate === todayStr;
              });
              if (todayData) {
                todayPendingCount += todayData.Pending || 0;
              }
            }
            
            // Also check weekly date_wise_counts for today
            if (data.data?.weekly?.date_wise_counts) {
              const todayData = data.data.weekly.date_wise_counts.find((d: any) => {
                const countDate = new Date(d.date).toISOString().split('T')[0];
                return countDate === todayStr;
              });
              if (todayData) {
                todayPendingCount += todayData.Pending || 0;
              }
            }
            console.log('Initial badge count:', todayPendingCount);
            setPendingTasksCount(todayPendingCount);
            localStorage.setItem('pendingTasksCount', todayPendingCount.toString());
          }
        } catch (err) {
          console.error("Error fetching task count:", err);
          // Fallback to localStorage
          const count = localStorage.getItem('pendingTasksCount');
          if (count) {
            setPendingTasksCount(parseInt(count, 10));
          }
        }
      } else {
        const count = localStorage.getItem('pendingTasksCount');
        if (count) {
          setPendingTasksCount(parseInt(count, 10));
        }
      }
    };
    
    // Initial load
    loadPendingCount();
    
    // Listen for updates from other components
    const handleTaskCountUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('taskCountUpdated event received:', detail);
      if (detail && typeof detail.count === 'number') {
        setPendingTasksCount(detail.count);
        setForceUpdate(prev => prev + 1); // Force re-render
        console.log('Badge count updated from event:', detail.count);
      }
    };
    
    window.addEventListener('taskCountUpdated', handleTaskCountUpdate);
    
    return () => window.removeEventListener('taskCountUpdated', handleTaskCountUpdate);
  }, [mounted]);

  // Auto-show notification when there are pending tasks (similar to WhatsApp notification)
  useEffect(() => {
    if (pendingTasksCount > 0 && mounted) {
      setShowAutoNotification(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowAutoNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [pendingTasksCount, mounted]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // Tailwind w-48 = 12rem = 192px
      let left = rect.left;

      // ✅ Adjust so dropdown doesn't overflow on the right side
      if (left + dropdownWidth > window.innerWidth) {
        left = rect.right - dropdownWidth;
      }

      setDropdownPos({ top: rect.bottom + 6, left });
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleNotification = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isNotificationOpen) {
      // Calculate position first
      if (notificationRef.current) {
        const rect = notificationRef.current.getBoundingClientRect();
        const dropdownWidth = 320; // wider for task list
        let left = rect.left;
        
        // Adjust so dropdown doesn't overflow on the right side
        if (left + dropdownWidth > window.innerWidth) {
          left = rect.right - dropdownWidth;
        }
        
        setNotificationPos({ top: rect.bottom + 6, left });
      }
      
      // Fetch notification tasks
      setNotificationLoading(true);
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        try {
          const apiUrl = `${parsedData.APP_URL}/api/tasks/counts?token=${parsedData.token}&sub_institute_id=${parsedData.sub_institute_id}&user_id=${parsedData.user_id}`;
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            
            // Get today's date in consistent format (use local date to avoid UTC issues)
            const today = new Date();
            const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
            
            // Calculate today's pending count from date_wise_counts (matching badge)
            let todayPendingCount = 0;
            
            // Count from daily date_wise_counts for today
            if (data.data?.daily?.date_wise_counts) {
              const todayData = data.data.daily.date_wise_counts.find((d: any) => {
                const countDate = new Date(d.date).toLocaleDateString('en-CA');
                return countDate === todayStr;
              });
              if (todayData) {
                todayPendingCount += todayData.Pending || 0;
              }
            }
            
            // Also check weekly date_wise_counts for today
            if (data.data?.weekly?.date_wise_counts) {
              const todayData = data.data.weekly.date_wise_counts.find((d: any) => {
                const countDate = new Date(d.date).toLocaleDateString('en-CA');
                return countDate === todayStr;
              });
              if (todayData) {
                todayPendingCount += todayData.Pending || 0;
              }
            }
            
            // Also filter tasks array for display
            const isPending = (status: string) => status?.toUpperCase() === 'PENDING';
            const isToday = (dateStr: string) => {
              if (!dateStr) return false;
              const taskDate = new Date(dateStr);
              const taskDateStr = taskDate.toLocaleDateString('en-CA');
              return taskDateStr === todayStr;
            };
            
            const todayPendingTasks: any[] = [];
            
            // Check daily tasks from API
            if (data.data?.daily?.tasks) {
              data.data.daily.tasks
                .filter((task: any) => isPending(task.status) && isToday(task.created_at))
                .forEach((task: any) => todayPendingTasks.push({ 
                  ...task, 
                  period: 'Today',
                  displayDate: new Date(task.created_at).toLocaleDateString()
                }));
            }
            
            // Also check weekly tasks for today's date
            if (data.data?.weekly?.tasks) {
              data.data.weekly.tasks
                .filter((task: any) => isPending(task.status) && isToday(task.created_at))
                .forEach((task: any) => todayPendingTasks.push({ 
                  ...task, 
                  period: 'Today (Weekly)',
                  displayDate: new Date(task.created_at).toLocaleDateString()
                }));
            }
            
            // Use the count from date_wise_counts (matching badge)
            setNotificationTasks(todayPendingTasks);
            setPendingTasksCount(todayPendingCount);
            setForceUpdate(prev => prev + 1); // Force re-render
            console.log('Badge count updated:', todayPendingCount);
            
            // Update localStorage
            localStorage.setItem('pendingTasksCount', todayPendingCount.toString());
            
            // Dispatch event to update other components
            window.dispatchEvent(new CustomEvent('taskCountUpdated', { 
              detail: { count: todayPendingCount } 
            }));
          }
        } catch (err) {
          console.error("Error fetching notification tasks:", err);
        }
      }
      setNotificationLoading(false);
    }
    
    setIsNotificationOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    router.push("/");
  };

  const handleMenuClick = (path: string) => {
    setIsDropdownOpen(false);
    // Navigate directly using router instead of events for global functionality
    const routePath = `/content/${path.replace('/page.tsx', '')}`;
    router.push(routePath);
  };

  const menuItems = userData?.user_profile_name === "Admin" ? [{ label: "Rights Management", path: "groupWiseRights/page.tsx" }] : [];

  return (
    <div className="flex relative items-center">
      {/* icons */}
      <div className="iconDivs flex gap-4 items-center">
        {/* search icon */}
        <div
          className="searchIcon cursor-not-allowed opacity-40 grayscale pointer-events-none"
          title="Search is disabled"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#3B3B3B"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13z"
            />
          </svg>
        </div>

        {/* setting icon with dropdown */}
        <div ref={buttonRef} onClick={toggleDropdown} className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3B3B3B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-black"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 
              2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 
              1.51V21a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-.09a1.65 1.65 0 
              0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 
              1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 
              1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2v-1a2 2 0 0 
              1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 
              0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 
              1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 
              2 0 0 1 2-2h1a2 2 0 0 1 2 2v.09a1.65 1.65 
              0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 
              2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 
              0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 
              1H21a2 2 0 0 1 2 2v1a2 2 0 0 1-2 
              2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>

        {/* dropdown rendered via portal */}
        {mounted &&
          isDropdownOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "absolute",
                top: dropdownPos.top,
                left: dropdownPos.left,
              }}
              className="bg-white shadow-lg rounded-md border border-gray-200 w-48"
            >
              <ul className="py-0">
                {menuItems.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleMenuClick(item.path)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                  >
                    {item.label}
                  </li>
                ))}
                <li
                  className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm text-red-500 border-t border-gray-100"
                  onClick={() => {
                    // Clear all local storage
                    localStorage.clear();

                    // Redirect to '/'
                    window.location.href = "/";
                  }}
                >
                  Logout
                </li>
              </ul>
            </div>,
            document.body
          )}
        {/* notification icon */}
        <div 
          ref={notificationRef}
          onClick={toggleNotification}
          className="notificationIcon cursor-pointer relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3B3B3B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-black"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {pendingTasksCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {pendingTasksCount > 99 ? '99+' : pendingTasksCount}
            </span>
          )}
        </div>

        {/* chatbot icon */}
        <div className="cursor-pointer relative z-40">
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const center = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              };
              const event = new CustomEvent('openChatbot', {
                detail: { x: center.x, y: center.y }
              });
              window.dispatchEvent(event);
            }}
            className="p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <Bot className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        {/* notification dropdown rendered via portal */}
        {mounted &&
          isNotificationOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "absolute",
                top: notificationPos.top,
                left: notificationPos.left,
                zIndex: 9999,
              }}
              className="bg-white shadow-lg rounded-md border border-gray-200 w-80 max-h-96 overflow-y-auto"
            >
              <div className="px-4 py-2 border-b border-gray-100 font-semibold text-sm text-gray-700">
                Today's Pending Tasks ({notificationTasks.length})
              </div>
              {notificationLoading ? (
                <div className="px-4 py-4 text-center text-sm text-gray-500">
                  Loading...
                </div>
              ) : notificationTasks.length === 0 ? (
                <div className="px-4 py-4 text-center text-sm text-gray-500">
                  No pending tasks for today
                </div>
              ) : (
                <ul className="py-0">
                  {notificationTasks.slice(0, 10).map((task, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-b-0"
                    >
                      <div className="font-medium truncate">{task.task_title}</div>
                      <div className="text-xs text-gray-500 flex justify-between mt-1">
                        <span>{task.displayDate}</span>
                        <span className="text-yellow-600">{task.period}</span>
                      </div>
                    </li>
                  ))}
                  {notificationTasks.length > 10 && (
                    <li className="px-4 py-2 text-center text-sm text-blue-600 hover:bg-gray-50 cursor-pointer border-t border-gray-100">
                      View all {notificationTasks.length} tasks
                    </li>
                  )}
                </ul>
              )}
            </div>,
            document.body
          )}
      </div>

      {/* user info */}
      <div className="flex gap-2 border-l-2 border-gray-200 pl-2 ml-2">
        {userData?.org_logo && userData?.org_logo !== "" ? (
          <img
            src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_logo/${userData?.org_logo}`}
            alt="Organization Logo"
            className="h-8 w-auto"
          />
        ) : (
          <p className="text-sm font-medium">{userData?.user_name}</p>
        )}
      </div>
    </div>
  );
};