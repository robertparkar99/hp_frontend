// "use client";

// import * as React from "react";
// import { StatCard } from "./StatCard";

// export const StatGrid: React.FC = () => {
//   return (
//     <section className="flex gap-5 max-md:flex-col">
//       <div className="w-3/12 max-md:ml-0 max-md:w-full">
//         <StatCard title="Total Skills" value="126" />
//       </div>
//       <div className="ml-5 w-3/12 max-md:ml-0 max-md:w-full">
//         <StatCard title="Mapped Skills" value="78" />
//       </div>
//       <div className="ml-5 w-3/12 max-md:ml-0 max-md:w-full">
//         <StatCard title="Unmapped Skills" value="48" />
//       </div>
//       <div className="ml-5 w-3/12 max-md:ml-0 max-md:w-full">
//         <StatCard title="Most Used Skills" value="10" />
//       </div>
//     </section>
//   );
// };

// "use client";
// import { useEffect, useState } from "react";
// import { MoreVertical } from "lucide-react";

// // Interfaces
// interface Employee {
//   id: number | string;
//   full_name: string;
//   email: string;
//   mobile: string;   // ✅ added
//   jobrole: string;
//   status: string;
//   department_name: string;
//   joined_date?: string;
//   image?: string;
//   sortConfig?: { key: string; direction: "asc" | "desc" } | null;
// }

// interface Task {
//   id: number | string | null;
//   task_title: string;
//   task_type: string;
//   task_date: string;
//   status: string;
//   allocatedUser: string;
//   allocatedBy: string;
// }

// interface ChartData {
//   label: string;
//   value: number;
//   status: string;
// }

// interface DashboardResponse {
//   employeeList?: Employee[];
//   today_task?: Task[];
//   week_task?: Task[];
//   // Statistics fields
//   totle_employees?: number;
//   umapped_employees?: number;
//   totle_jobroles?: number;
//   totle_skills?: number;
//   // Widget data for charts
//   widget?: any[];
// }

// export default function Dashboard() {
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [todayTasks, setTodayTasks] = useState<Task[]>([]);
//   const [weekTasks, setWeekTasks] = useState<Task[]>([]);
//   const [stats, setStats] = useState({
//     totalEmployees: 0,
//     unmappedEmployees: 0,
//     totalJobRoles: 0,
//     totalSkills: 0,
//   });
//   const [chartData, setChartData] = useState<ChartData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [sessionData, setSessionData] = useState<any>(null);

//   // Load session data once
//   useEffect(() => {
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       const {
//         APP_URL,
//         token,
//         sub_institute_id,
//         org_type,
//         user_id,
//         user_profile_id,
//         user_profile_name,
//       } = JSON.parse(userData);
//       setSessionData({
//         url: APP_URL,
//         token,
//         subInstituteId: sub_institute_id,
//         orgType: org_type,
//         userId: user_id,
//         userProfileId: user_profile_id,
//         userProfileName: user_profile_name,
//       });
//     }
//   }, []);

//   // Fetch dashboard data
//   useEffect(() => {
//     if (!sessionData) return;

//     async function fetchDashboard() {
//       try {
//         const res = await fetch(
//           `${sessionData.url}/dashboard?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&user_id=${sessionData.userId}&user_profile_id=${sessionData.userProfileId}&user_profile_name=${sessionData.userProfileName}&org_type=${sessionData.orgType}`
//         );
//         if (!res.ok) throw new Error(`API error: ${res.status}`);

//         const data: DashboardResponse = await res.json();
//         console.log("Dashboard API Response:", data);

//         setEmployees(data.employeeList ?? []);
//         setTodayTasks(data.today_task ?? []);
//         setWeekTasks(data.week_task ?? []);

//         setStats({
//           totalEmployees: data.totle_employees ?? 0,
//           unmappedEmployees: data.umapped_employees ?? 0,
//           totalJobRoles: data.totle_jobroles ?? 0,
//           totalSkills: data.totle_skills ?? 0,
//         });

//         // Chart data processing...
//         if (data.week_task && data.week_task.length > 0) {
//           const now = new Date();
//           const startOfWeek = new Date(now);
//           startOfWeek.setDate(now.getDate() - now.getDay());
//           const formatDate = (date: Date) => date.toISOString().split("T")[0];
//           const weeklyData: Record<string, { count: number; status: string }> =
//             {};
//           for (let i = 0; i < 7; i++) {
//             const date = new Date(startOfWeek);
//             date.setDate(startOfWeek.getDate() + i);
//             const dayKey = formatDate(date);
//             weeklyData[dayKey] = { count: 0, status: "NO_TASKS" };
//           }
//           data.week_task.forEach((task) => {
//             if (!task.task_date) return;
//             const taskDate = new Date(task.task_date);
//             const taskDayKey = formatDate(taskDate);
//             if (taskDayKey in weeklyData) {
//               weeklyData[taskDayKey].count += 1;
//               const currentStatus = weeklyData[taskDayKey].status;
//               if (task.status === "COMPLETED") {
//                 weeklyData[taskDayKey].status = "COMPLETED";
//               } else if (
//                 task.status === "IN_PROGRESS" &&
//                 currentStatus !== "COMPLETED"
//               ) {
//                 weeklyData[taskDayKey].status = "IN_PROGRESS";
//               } else if (
//                 task.status === "PENDING" &&
//                 currentStatus !== "COMPLETED" &&
//                 currentStatus !== "IN_PROGRESS"
//               ) {
//                 weeklyData[taskDayKey].status = "PENDING";
//               }
//             }
//           });
//           const daysOfWeek = [
//             "Sunday",
//             "Monday",
//             "Tuesday",
//             "Wednesday",
//             "Thursday",
//             "Friday",
//             "Saturday",
//           ];
//           const processedChartData = Object.keys(weeklyData)
//             .sort()
//             .map((date) => {
//               const dayDate = new Date(date);
//               return {
//                 label: daysOfWeek[dayDate.getDay()].substring(0, 3),
//                 value: weeklyData[date].count,
//                 status: weeklyData[date].status,
//               };
//             });
//           setChartData(processedChartData);
//         }
//       } catch (err) {
//         console.error("Error fetching dashboard:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchDashboard();
//   }, [sessionData]);

//   // Chart bar color
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "COMPLETED":
//         return "bg-blue-800";
//       case "IN_PROGRESS":
//         return "bg-blue-500";
//       case "PENDING":
//         return "bg-blue-300";
//       default:
//         return "bg-gray-300";
//     }
//   };

//   const maxValue = Math.max(...chartData.map((d) => d.value), 1);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen text-gray-600">
//         Loading dashboard...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen text-gray-900 p-6">
//       <div className="grid grid-cols-12 gap-6">
//         {/* Left Section */}
//         <div className="col-span-9 space-y-6">
//           {/* Stats + Chart */}
//           <div className="bg-white rounded-xl shadow p-6">
//             <div className="flex gap-6">
//               {/* Stats Section */}
//               <div className="grid grid-cols-2 gap-6 flex-1">
//                 <div className="flex items-center gap-3 border-b border-r pb-4 pr-6">
//                   <div className="w-5 h-5 rounded bg-blue-300" />
//                   <div>
//                     <p className="font-semibold text-gray-700">Total Employee</p>
//                     <p className="text-2xl font-bold">{stats.totalEmployees}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 border-b pl-6 pb-4">
//                   <div className="w-5 h-5 rounded bg-red-300" />
//                   <div>
//                     <p className="font-semibold text-gray-700">
//                       Unmapped Employee
//                     </p>
//                     <p className="text-2xl font-bold">{stats.unmappedEmployees}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 border-r pt-4 pr-6">
//                   <div className="w-5 h-5 rounded bg-green-300" />
//                   <div>
//                     <p className="font-semibold text-gray-700">Total Job role</p>
//                     <p className="text-2xl font-bold">{stats.totalJobRoles}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 pt-4 pl-6">
//                   <div className="w-5 h-5 rounded bg-yellow-300" />
//                   <div>
//                     <p className="font-semibold text-gray-700">Total Skill</p>
//                     <p className="text-2xl font-bold">{stats.totalSkills}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Chart */}
//               <div className="flex-1">
//                 <h2 className="font-semibold mb-4 text-center">
//                   Weekly Task Progress
//                 </h2>
//                 <div className="relative">
//                   {/* Y-axis labels */}
//                   <div className="absolute left-0 h-48 flex flex-col justify-between text-xs text-gray-500">
//                     <span>{maxValue}</span>
//                     <span>{Math.round(maxValue * 0.8)}</span>
//                     <span>{Math.round(maxValue * 0.6)}</span>
//                     <span>{Math.round(maxValue * 0.4)}</span>
//                     <span>{Math.round(maxValue * 0.2)}</span>
//                     <span>0</span>
//                   </div>

//                   {/* Chart content */}
//                   <div className="ml-6 h-48 flex justify-between items-end gap-2">
//                     {chartData.map((data, i) => (
//                       <div key={i} className="flex flex-col items-center flex-1">
//                         <div
//                           className={`w-full rounded-t ${getStatusColor(data.status)}`}
//                           style={{
//                             height: `${(data.value / maxValue) * 100}%`,
//                             minHeight: data.value > 0 ? '4px' : '0'
//                           }}
//                         />
//                         <span className="text-xs text-gray-500 mt-2">{data.label}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Chart Legend */}
//                 <div className="flex justify-center mt-4 gap-4 text-xs">
//                   <div className="flex items-center gap-1">
//                     <div className="w-3 h-3 bg-blue-800 rounded"></div>
//                     <span>Completed</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <div className="w-3 h-3 bg-blue-500 rounded"></div>
//                     <span>In Progress</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <div className="w-3 h-3 bg-blue-300 rounded"></div>
//                     <span>Pending</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <div className="w-3 h-3 bg-gray-300 rounded"></div>
//                     <span>No Tasks</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>


//           {/* Employee Table */}
//           {/* Employee Table */}
//           <div className="bg-white rounded-xl shadow overflow-hidden">
//             {/* Header */}
//             <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] bg-blue-100 px-4 py-2 font-medium text-sm gap-4">
//               <span className="flex items-center">Employee</span>
//               <span className="flex items-center">Mobile</span>
//               <span className="flex items-center">Department</span>
//               <span className="flex items-center">Role</span>
//               <span className="flex items-center">Status</span>
//               <span className="flex items-center justify-end">Action</span>
//             </div>

//             {/* Rows */}
//             {employees.map((emp) => (
//               <div
//                 key={emp.id}
//                 className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center px-4 py-3 border-t text-sm gap-4 hover:bg-gray-50"
//               >
//                 {/* Employee */}
//                 <div className="flex items-center gap-2 min-w-0">
//                   {emp.image && emp.image !== "" ? (
//                     <img
//                       src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${emp.image}`}
//                       alt={emp.full_name}
//                       className="w-8 h-8 rounded-full object-cover flex-shrink-0"
//                     />
//                   ) : (
//                     <img
//                       src="https://i.pravatar.cc/40"
//                       alt="profile"
//                       className="w-8 h-8 rounded-full flex-shrink-0"
//                     />
//                   )}
//                   <div className="min-w-0">
//                     <p className="font-medium truncate">{emp.full_name}</p>
//                     <p className="text-gray-500 text-xs truncate">{emp.email}</p>
//                   </div>
//                 </div>

//                 {/* Mobile */}
//                 <span className="truncate">{emp.mobile || "-"}</span>

//                 {/* Department */}
//                 <span className="truncate">{emp.department_name}</span>

//                 {/* Role */}
//                 <span className="truncate">{emp.jobrole}</span>

//                 {/* Status */}
//                 <span
//                   className={`px-2 py-1 rounded-md w-fit text-xs ${emp.status === "Active"
//                       ? "text-green-600 bg-green-100"
//                       : "text-red-600 bg-red-100"
//                     }`}
//                 >
//                   {emp.status}
//                 </span>

//                 {/* Action */}
//                 <div className="flex justify-end">
//                   <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer flex-shrink-0" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         {/* Right Section */}
//         <div className="col-span-3 space-y-6">
//           {/* Today's Task Progress */}
//           <div className="p-4 bg-white rounded-lg shadow h-77 overflow-y-auto">
//             <h2 className="font-semibold mb-4">Today's Task Progress</h2>
//             {todayTasks.length > 0 ? (
//               todayTasks.map((task, index) => (
//                 <div key={index} className="mb-4 border rounded-lg p-3">
//                   <span className="text-xs text-blue-500 font-semibold bg-blue-100 px-2 py-1 rounded">
//                     {task.task_type}
//                   </span>
//                   <p className="font-medium mt-1">{task.task_title}</p>
//                   <p className="text-xs text-gray-500">
//                     Assigned to: {task.allocatedUser}
//                   </p>
//                   <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
//                     <span>{task.task_date}</span>
//                     <span>Status: {task.status}</span>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500 text-sm">No tasks for today</p>
//             )}
//           </div>

//           {/* Weekly Task Progress with Scroll */}
//           <div className="p-4 bg-white rounded-lg shadow h-96 overflow-y-auto">
//             <h2 className="font-semibold mb-4">Weekly Task Progress</h2>
//             {weekTasks.length > 0 ? (
//               weekTasks.map((task, index) => (
//                 <div key={index} className="mb-4 border rounded-lg p-3">
//                   <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-1 rounded">
//                     {task.task_type}
//                   </span>
//                   <p className="font-medium mt-1">{task.task_title}</p>
//                   <p className="text-xs text-gray-500">
//                     Assigned to: {task.allocatedUser}
//                   </p>
//                   <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
//                     <span>{task.task_date}</span>
//                     <span>Status: {task.status}</span>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500 text-sm">No tasks for this week</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }  
"use client";
import { useEffect, useState } from "react";
import { MoreVertical, ChevronDown } from "lucide-react";

// Interfaces
interface Employee {
  id: number | string;
  full_name: string;
  email: string;
  mobile: string;
  jobrole: string;
  status: string;
  department_name: string;
  joined_date?: string;
  image?: string;
  sortConfig?: { key: string; direction: "asc" | "desc" } | null;
}

interface Task {
  id: number | string | null;
  task_title: string;
  task_type: string;
  task_date: string;
  status: string;
  allocatedUser: string;
  allocatedBy: string;
}

interface ChartData {
  label: string;
  value: number;
  status: string;
}

interface DashboardResponse {
  employeeList?: Employee[];
  today_task?: Task[];
  week_task?: Task[];
  // Statistics fields
  totle_employees?: number;
  umapped_employees?: number;
  totle_jobroles?: number;
  totle_skills?: number;
  // Widget data for dropdown
  widget?: string[];
}

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    unmappedEmployees: 0,
    totalJobRoles: 0,
    totalSkills: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [widgetOptions, setWidgetOptions] = useState<string[]>([]);
  const [isWidgetDropdownOpen, setIsWidgetDropdownOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const placeholderImage =
    "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

  // Check if sidebar is open
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

  // Load session data once
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const {
        APP_URL,
        token,
        sub_institute_id,
        org_type,
        user_id,
        user_profile_id,
        user_profile_name,
      } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
        userProfileId: user_profile_id,
        userProfileName: user_profile_name,
      });
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!sessionData) return;

    async function fetchDashboard() {
      try {
        const res = await fetch(
          `${sessionData.url}/dashboard?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&user_id=${sessionData.userId}&user_profile_id=${sessionData.userProfileId}&user_profile_name=${sessionData.userProfileName}&org_type=${sessionData.orgType}`
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data: DashboardResponse = await res.json();
        console.log("Dashboard API Response:", data);

        setEmployees(data.employeeList ?? []);
        setTodayTasks(data.today_task ?? []);
        setWeekTasks(data.week_task ?? []);
        setWidgetOptions(data.widget ?? []);

        setStats({
          totalEmployees: data.totle_employees ?? 0,
          unmappedEmployees: data.umapped_employees ?? 0,
          totalJobRoles: data.totle_jobroles ?? 0,
          totalSkills: data.totle_skills ?? 0,
        });

        // Chart data processing...
        if (data.week_task && data.week_task.length > 0) {
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const formatDate = (date: Date) => date.toISOString().split("T")[0];
          const weeklyData: Record<string, { count: number; status: string }> =
            {};
          for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dayKey = formatDate(date);
            weeklyData[dayKey] = { count: 0, status: "NO_TASKS" };
          }
          data.week_task.forEach((task) => {
            if (!task.task_date) return;
            const taskDate = new Date(task.task_date);
            const taskDayKey = formatDate(taskDate);
            if (taskDayKey in weeklyData) {
              weeklyData[taskDayKey].count += 1;
              const currentStatus = weeklyData[taskDayKey].status;
              if (task.status === "COMPLETED") {
                weeklyData[taskDayKey].status = "COMPLETED";
              } else if (
                task.status === "IN_PROGRESS" &&
                currentStatus !== "COMPLETED"
              ) {
                weeklyData[taskDayKey].status = "IN_PROGRESS";
              } else if (
                task.status === "PENDING" &&
                currentStatus !== "COMPLETED" &&
                currentStatus !== "IN_PROGRESS"
              ) {
                weeklyData[taskDayKey].status = "PENDING";
              }
            }
          });
          const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const processedChartData = Object.keys(weeklyData)
            .sort()
            .map((date) => {
              const dayDate = new Date(date);
              return {
                label: daysOfWeek[dayDate.getDay()].substring(0, 3),
                value: weeklyData[date].count,
                status: weeklyData[date].status,
              };
            });
          setChartData(processedChartData);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [sessionData]);

  // Chart bar color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-blue-800";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "PENDING":
        return "bg-blue-300";
      default:
        return "bg-gray-300";
    }
  };

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  // Check if a widget should be shown based on selection
  const shouldShowWidget = (widgetName: string) => {
    if (!selectedWidget) return true; // Show all if none selected
    return selectedWidget === widgetName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-gray-900 p-6 transition-all duration-300 ${
      isSidebarOpen ? "ml-64" : "ml-0"
    }`}>
      {/* Header with widget dropdown */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        {/* Widget Dropdown */}
        {/* <div className="relative">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            onClick={() => setIsWidgetDropdownOpen(!isWidgetDropdownOpen)}
          >
            <span className="mdi mdi-list-box text-xl text-gray-600"></span>
           
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isWidgetDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <ul className="py-1">
                <li>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setSelectedWidget(null);
                      setIsWidgetDropdownOpen(false);
                    }}
                  >
                    All Widgets
                  </button>
                </li>
                {widgetOptions.map((widget, index) => (
                  <li key={index}>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSelectedWidget(widget);
                        setIsWidgetDropdownOpen(false);
                      }}
                    >
                      {widget}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div> */}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Section - Adjust column span based on sidebar state */}
        <div className={`${isSidebarOpen ? "col-span-9" : "col-span-9"} space-y-6`}>
          {/* Stats + Chart - Always visible */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex gap-6">
              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-6 flex-1">
                <div className="flex items-center gap-3 border-b border-r pb-4 pr-6">
                  <div className="w-5 h-5 rounded bg-blue-300" />
                  <div>
                    <p className="font-semibold text-gray-700">Total Employee</p>
                    <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b pl-6 pb-4">
                  <div className="w-5 h-5 rounded bg-red-300" />
                  <div>
                    <p className="font-semibold text-gray-700">
                      Unmapped Employee
                    </p>
                    <p className="text-2xl font-bold">{stats.unmappedEmployees}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-r pt-4 pr-6">
                  <div className="w-5 h-5 rounded bg-green-300" />
                  <div>
                    <p className="font-semibold text-gray-700">Total Job role</p>
                    <p className="text-2xl font-bold">{stats.totalJobRoles}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 pl-6">
                  <div className="w-5 h-5 rounded bg-yellow-300" />
                  <div>
                    <p className="font-semibold text-gray-700">Total Skill</p>
                    <p className="text-2xl font-bold">{stats.totalSkills}</p>
                  </div>
                </div>
              </div>

              {/* Chart - Only show if no widget selected or Weekly Task Progress selected */}
              {(shouldShowWidget("Weekly Task Progress") || !selectedWidget) && (
                <div className="flex-1">
                  <h2 className="font-semibold mb-4 text-center">
                    Weekly Task Progress
                  </h2>
                  <div className="relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 h-48 flex flex-col justify-between text-xs text-gray-500">
                      <span>{maxValue}</span>
                      <span>{Math.round(maxValue * 0.8)}</span>
                      <span>{Math.round(maxValue * 0.6)}</span>
                      <span>{Math.round(maxValue * 0.4)}</span>
                      <span>{Math.round(maxValue * 0.2)}</span>
                      <span>0</span>
                    </div>

                    {/* Chart content */}
                    <div className="ml-6 h-48 flex justify-between items-end gap-2">
                      {chartData.map((data, i) => (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div
                            className={`w-full rounded-t ${getStatusColor(data.status)}`}
                            style={{
                              height: `${(data.value / maxValue) * 100}%`,
                              minHeight: data.value > 0 ? '4px' : '0'
                            }}
                          />
                          <span className="text-xs text-gray-500 mt-2">{data.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart Legend */}
                  <div className="flex justify-center mt-4 gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-800 rounded"></div>
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-300 rounded"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span>No Tasks</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Table - Only show if no widget selected or Employee List selected */}
          {(shouldShowWidget("Employee List") || !selectedWidget) && (
            <div className="bg-white rounded-xl shadow h-96 overflow-y-auto hide-scroll ">
              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] bg-blue-100 px-4 py-2 font-medium text-sm gap-4">
                <span className="flex items-center">Employee</span>
                <span className="flex items-center">Mobile</span>
                <span className="flex items-center">Department</span>
                <span className="flex items-center">Role</span>
                <span className="flex items-center">Status</span>
                <span className="flex items-center justify-end">Action</span>
              </div>

              {/* Rows */}
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center px-4 py-3 border-t text-sm gap-4 hover:bg-gray-50"
                >
                  {/* Employee */}
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={
                        emp.image && emp.image !== ""
                          ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${emp.image}`
                          : placeholderImage
                      }
                      alt={emp.full_name || "profile"}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          placeholderImage;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{emp.full_name}</p>
                      <p className="text-gray-500 text-xs truncate">{emp.email}</p>
                    </div>
                  </div>

                  {/* Mobile */}
                  <span className="truncate">{emp.mobile || "-"}</span>

                  {/* Department */}
                  <span className="truncate">{emp.department_name}</span>

                  {/* Role */}
                  <span className="truncate">{emp.jobrole}</span>

                  {/* Status */}
                  <span
                    className={`px-2 py-1 rounded-md w-fit text-xs ${emp.status === "Active"
                        ? "text-green-600 bg-green-100"
                        : "text-red-600 bg-red-100"
                      }`}
                  >
                    {emp.status}
                  </span>

                  {/* Action */}
                  <div className="flex justify-end">
                    <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section - Adjust column span based on sidebar state */}
        <div className={`${isSidebarOpen ? "col-span-3" : "col-span-3"} space-y-6`}>
          {/* Today's Task Progress - Only show if no widget selected or Today Task List selected */}
          {(shouldShowWidget("Today Task List") || !selectedWidget) && (
            <div className="p-4 bg-white rounded-lg shadow h-77 overflow-y-auto hide-scroll">
              <h2 className="font-semibold mb-4">Today's Task Progress</h2>
              {todayTasks.length > 0 ? (
                todayTasks.map((task, index) => (
                  <div key={index} className="mb-4 border rounded-lg p-3">
                    <span className="text-xs text-blue-500 font-semibold bg-blue-100 px-2 py-1 rounded">
                      {task.task_type}
                    </span>
                    <p className="font-medium mt-1">{task.task_title}</p>
                    <p className="text-xs text-gray-500">
                      Assigned to: {task.allocatedUser}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>{task.task_date}</span>
                      <span>Status: {task.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No tasks for today</p>
              )}
            </div>
          )}
          
          {/* Weekly Task Progress with Scroll - Only show if no widget selected or Week Task List selected */}
          {(shouldShowWidget("Week Task List") || !selectedWidget) && (
            <div className="p-4 bg-white rounded-lg shadow h-96 overflow-y-auto hide-scroll ">
              <h2 className="font-semibold mb-4">Weekly Task Progress</h2>
              {weekTasks.length > 0 ? (
                weekTasks.map((task, index) => (
                  <div key={index} className="mb-4 border rounded-lg p-3">
                    <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-1 rounded">
                      {task.task_type}
                    </span>
                    <p className="font-medium mt-1">{task.task_title}</p>
                    <p className="text-xs text-gray-500">
                      Assigned to: {task.allocatedUser}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>{task.task_date}</span>
                      <span>Status: {task.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No tasks for this week</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Close dropdown when clicking outside */}
      {isWidgetDropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsWidgetDropdownOpen(false)}
        ></div>
      )}
    </div>
  );
}