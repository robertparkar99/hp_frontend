// app/content/MainScreen.tsx
"use client";

import * as React from "react";
import { useEffect, useState, Suspense, lazy } from "react";
import  StatGrid  from "./StatGrid";
import { useRouter } from "next/navigation";
import Loading from "../../../components/utils/loading";
import { Atom } from "react-loading-indicators" // Import the Loading component

type MenuDetail = {
  menu: string;
  pageType: string;
  access: string; // component import path relative to /app/content/
};

const MainScreen: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<MenuDetail | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [DynamicComponent, setDynamicComponent] = useState<React.LazyExoticComponent<React.ComponentType<any>> | null>(null);
  const navigate = useRouter();

  useEffect(() => {
    const handleMenuSelect = async (e: Event) => {
      const customEvent = e as CustomEvent<MenuDetail>;
      const menuDetail = customEvent.detail;
      setSelectedMenu(menuDetail);

      if (menuDetail?.access) {
        const strippedAccess = menuDetail.access.slice(0, -4); // remove .tsx
        try {
          const LoadedComponent = lazy(() =>
            import(`@/app/content/${strippedAccess}`)
          );
          setDynamicComponent(() => LoadedComponent);
          setLoading(false);
        } catch (error) {
          console.error("Component load error:", error);
          setDynamicComponent(null);
        }
      }
    };

    window.addEventListener("menuSelected", handleMenuSelect);
    return () => window.removeEventListener("menuSelected", handleMenuSelect);
  }, []);

  // Define a type for the component map
  type ComponentMap = {
    [key: string]: React.LazyExoticComponent<React.ComponentType<any>>;
  };
  console.log(selectedMenu?.access)
  // Create the component map with proper typing
  const componentMap: ComponentMap = {
    'Libraries/skillLibrary.tsx': lazy(() => import('@/app/content/Libraries/skillLibrary')),
    'skill-taxonomy/page.tsx': lazy(() => import('@/app/content/skill-taxonomy/page')),
    // Add other components here as needed
  };

  const renderComponent = () => {
    if (!selectedMenu) return null;

    if (!DynamicComponent) {
      return <div>{selectedMenu.menu} component not found (404).</div>;
    }
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen">
  <Atom color="#525ceaff" size="medium" text="" textColor="" />
</div>
}>
        <DynamicComponent />
      </Suspense>
    );
  };

  if (!selectedMenu && !isLoading) {
    return (
      <div className="flex-col w-auto pt-5 px-10 rounded-2xl max-md:px-5 max-md:pb-24 dashboardCard">
        {/* <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/e6eab4227e391bd1268df1fb318a60e266703003?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          alt=""
          className="object-contain self-end aspect-square w-[35px]"
        /> */}
        <div className="self-center mt-4w-full">
          <StatGrid />
        </div>
      </div>
    );
  }

  return (
    !isLoading ? (
      <main className="flex overflow-scroll flex-col w-auto pr-2 pl-2 bg-white rounded-2xl shadow-sm pb-6 h-[87vh] hide-scroll max-md:px-5 max-md:pb-24 renderComponent">
        <div className="self-center mt-4 w-full max-w-[1360px] max-md:max-w-full">
          {renderComponent()}
        </div>
      </main>
    ) : (<Loading />)
  );
};

export default MainScreen;

// "use client";
// import { useEffect, useState } from "react";
// import { MoreVertical } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// // Interfaces
// interface Employee {
//   id: number | string;
//   full_name: string;
//   email: string;
//   jobrole: string;  
//   status: string;
//   joined_date: string;
//   image?: string;
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

//   // Fetch dashboard data when sessionData is ready
//   useEffect(() => {
//     if (!sessionData) return; // ⬅️ wait until sessionData is loaded

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

//         // Process weekly task data for the chart
//         if (data.week_task && data.week_task.length > 0) {
//           // Get the current date to determine the week
//           const now = new Date();
//           const startOfWeek = new Date(now);
//           startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
//           const endOfWeek = new Date(now);
//           endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // Saturday
          
//           // Format dates to YYYY-MM-DD for comparison
//           const formatDate = (date: Date) => date.toISOString().split('T')[0];
          
//           // Initialize weekly data structure
//           const weeklyData: Record<string, {count: number, status: string}> = {};
          
//           // Create entries for each day of the current week
//           for (let i = 0; i < 7; i++) {
//             const date = new Date(startOfWeek);
//             date.setDate(startOfWeek.getDate() + i);
//             const dayKey = formatDate(date);
//             weeklyData[dayKey] = {count: 0, status: 'NO_TASKS'};
//           }
          
//           // Process each task and assign to the appropriate day
//           data.week_task.forEach(task => {
//             if (!task.task_date) return;
            
//             const taskDate = new Date(task.task_date);
//             const taskDayKey = formatDate(taskDate);
            
//             // Only process tasks from the current week
//             if (taskDayKey in weeklyData) {
//               weeklyData[taskDayKey].count += 1;
              
//               // Update status based on priority: COMPLETED > IN_PROGRESS > PENDING > NO_TASKS
//               const currentStatus = weeklyData[taskDayKey].status;
//               if (task.status === 'COMPLETED') {
//                 weeklyData[taskDayKey].status = 'COMPLETED';
//               } else if (task.status === 'IN_PROGRESS' && currentStatus !== 'COMPLETED') {
//                 weeklyData[taskDayKey].status = 'IN_PROGRESS';
//               } else if (task.status === 'PENDING' && 
//                         currentStatus !== 'COMPLETED' && 
//                         currentStatus !== 'IN_PROGRESS') {
//                 weeklyData[taskDayKey].status = 'PENDING';
//               }
//             }
//           });
          
//           // Convert to chart data format with day names
//           const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//           const processedChartData = Object.keys(weeklyData)
//             .sort() // Sort by date
//             .map((date, index) => {
//               const dayDate = new Date(date);
//               return {
//                 label: daysOfWeek[dayDate.getDay()].substring(0, 3),
//                 value: weeklyData[date].count,
//                 status: weeklyData[date].status
//               };
//             });
          
//           setChartData(processedChartData);
//         } else {
//           // Fallback data if no weekly tasks
//           const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//           const fallbackData = daysOfWeek.map(day => ({
//             label: day,
//             value: 0,
//             status: 'NO_TASKS'
//           }));
//           setChartData(fallbackData);
//         }
//       } catch (err) {
//         console.error("Error fetching dashboard:", err);
//       } finally { 
//         setLoading(false);
//       }
//     }

//     fetchDashboard();
//   }, [sessionData]); // ⬅️ dependency added

//   // Function to get color based on task status
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'COMPLETED':
//         return 'bg-blue-800'; // Dark blue for completed
//       case 'IN_PROGRESS':
//         return 'bg-blue-500'; // Medium blue for in progress
//       case 'PENDING':
//         return 'bg-blue-300'; // Light blue for pending
//       default:
//         return 'bg-gray-300'; // Gray for no tasks
//     }
//   };

//   // Calculate max value for scaling the chart
//   const maxValue = Math.max(...chartData.map(data => data.value), 1);

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
//           <div className="bg-white rounded-xl shadow overflow-hidden">
//             <div className="grid grid-cols-4 bg-blue-100 px-4 py-2 font-medium text-sm">
//               <span>Full Name</span>
//               <span>Role</span>
//               <span>Active Status</span>
//               <span>Join Date</span>
//             </div>
//             {employees.map((emp) => (
//               <div
//                 key={emp.id}
//                 className="grid grid-cols-4 items-center px-4 py-3 border-t text-sm"
//               >
//                 <div className="flex items-center gap-2">
//                   {emp.image && emp.image !== "" ? (
//                     <img
//                       src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${emp.image}`}
//                       alt={emp.full_name}
//                       className="w-8 h-8 rounded-full object-cover"
//                     />
//                   ) : (
//                     <img
//                       src={emp.image || "https://i.pravatar.cc/40"}
//                       alt="profile"
//                       className="w-8 h-8 rounded-full"
//                     />
//                   )}
//                   <div>
//                     <p className="font-medium">{emp.full_name}</p>
//                     <p className="text-gray-500 text-xs">{emp.email}</p>
//                   </div>
//                 </div>
//                 <span>{emp.jobrole}</span>
//                 <span
//                   className={`px-2 py-1 rounded-md w-fit text-xs ${emp.status === "Active"
//                       ? "text-green-600 bg-green-100"
//                       : "text-red-600 bg-red-100"
//                     }`}
//                 >
//                   {emp.status}
//                 </span>
//                 <div className="flex items-center justify-between">
//                   <span>{emp.joined_date}</span>
//                   <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer" />
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