// "use client";
// import { useEffect, useState } from "react";
// import { MoreVertical, ChevronDown } from "lucide-react";

// // Interfaces
// interface Employee {
//   id: number | string;
//   full_name: string;
//   email: string;
//   mobile: string;
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
//   image?: string;
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
//   // Widget data for dropdown
//   widget?: string[];
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
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [widgetOptions, setWidgetOptions] = useState<string[]>([]);
//   const [isWidgetDropdownOpen, setIsWidgetDropdownOpen] = useState(false);
//   const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

//   const placeholderImage =
//     "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

//   // Check if sidebar is open
//   useEffect(() => {
//     const checkSidebarState = () => {
//       const sidebarState = localStorage.getItem("sidebarOpen");
//       setIsSidebarOpen(sidebarState === "true");
//     };

//     checkSidebarState();

//     window.addEventListener("sidebarStateChange", checkSidebarState);

//     return () => {
//       window.removeEventListener("sidebarStateChange", checkSidebarState);
//     };
//   }, []);

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
//         setWidgetOptions(data.widget ?? []);

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

//   // Check if a widget should be shown based on selection
//   const shouldShowWidget = (widgetName: string) => {
//     if (!selectedWidget) return true; // Show all if none selected
//     return selectedWidget === widgetName;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen text-gray-600">
//         Loading dashboard...
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen text-gray-900  transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"
//       }`}>
//       {/* Header with widget dropdown */}
//       {/* <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1> */}

//       {/* Widget Dropdown */}
//       {/* <div className="relative">
//           <button 
//             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//             onClick={() => setIsWidgetDropdownOpen(!isWidgetDropdownOpen)}
//           >
//             <span className="mdi mdi-list-box text-xl text-gray-600"></span>

//             <ChevronDown className="w-4 h-4" />
//           </button>

//           {isWidgetDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//               <ul className="py-1">
//                 <li>
//                   <button
//                     className="w-full text-left px-4 py-2 hover:bg-gray-100"
//                     onClick={() => {
//                       setSelectedWidget(null);
//                       setIsWidgetDropdownOpen(false);
//                     }}
//                   >
//                     All Widgets
//                   </button>
//                 </li>
//                 {widgetOptions.map((widget, index) => (
//                   <li key={index}>
//                     <button
//                       className="w-full text-left px-4 py-2 hover:bg-gray-100"
//                       onClick={() => {
//                         setSelectedWidget(widget);
//                         setIsWidgetDropdownOpen(false);
//                       }}
//                     >
//                       {widget}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div> */}
//       {/* </div> */}

//       <div className="grid grid-cols-12 gap-6">
//         {/* Left Section - Adjust column span based on sidebar state */}
//         <div className={`${isSidebarOpen ? "col-span-9" : "col-span-9"} space-y-6`}>
//           {/* Stats + Chart - Always visible */}
//           <div className="bg-white rounded-xl shadow p-6">
//             <div className="flex gap-6">
//               {/* Stats Section */}
//               <div className="grid grid-cols-2 divide-x divide-y border rounded-lg overflow-hidden flex-1">
//                 <div className="flex items-center gap-3 border-b border-r pb-4 pr-6">
//                   {/* <div className="w-5 h-5 rounded bg-blue-300" /> */}
//                   <div className="flex items-center gap-3 p-4">
//                     <div className="w-9 h-9 rounded bg-blue-300 mb-7" />
//                     <div>
//                       <p className="font-bold text-gray-700">Total Employee</p>
//                       <p className="text-2xl font-bold text-center mt-3">{stats.totalEmployees}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 border-b pl-6 pb-4">
//                   {/* <div className="w-5 h-5 rounded bg-red-300" /> */}
//                   <div className="flex items-center gap-3 p-1">
//                     <div className="w-9 h-9 rounded bg-red-300 mb-7" />
//                     <div>
//                       <p className="font-bold text-gray-700">Unmapped Employee</p>
//                       <p className="text-2xl font-bold text-center mt-3">{stats.unmappedEmployees}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 border-r pt-4 pr-6">
//                   {/* <div className="w-5 h-5 rounded bg-green-300" /> */}
//                   <div className="flex items-center gap-3 p-4">
//                     <div className="w-9 h-9 rounded bg-green-300 mb-9" />
//                     <div>
//                       <p className="font-bold text-gray-700 mb-5">Total Job role</p>
//                       <p className="text-2xl font-bold text-center">{stats.totalJobRoles}</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 pt-4 pl-6">
//                   {/* <div className="w-5 h-5 rounded bg-yellow-300" /> */}
//                   <div className="flex items-center gap-3 p-4">
//                     <div className="w-9 h-9 rounded bg-yellow-300 mb-9" />
//                     <div>
//                       <p className="font-bold text-gray-700 mb-5">Total Skill</p>
//                       <p className="text-2xl font-bold text-center">{stats.totalSkills}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Chart - Only show if no widget selected or Weekly Task Progress selected */}
//               {(shouldShowWidget("Weekly Task Progress") || !selectedWidget) && (
//                 <div className="flex-1">
//                   <h2 className="font-semibold mb-4 text-center">
//                     Weekly Task Progress
//                   </h2>
//                   <div className="relative">
//                     {/* Y-axis labels */}
//                     <div className="absolute left-0 h-48 flex flex-col justify-between text-xs text-gray-500">
//                       <span>{maxValue}</span>
//                       <span>{Math.round(maxValue * 0.8)}</span>
//                       <span>{Math.round(maxValue * 0.6)}</span>
//                       <span>{Math.round(maxValue * 0.4)}</span>
//                       <span>{Math.round(maxValue * 0.2)}</span>
//                       <span>0</span>
//                     </div>

//                     {/* Chart content */}
//                     <div className="ml-6 h-48 flex justify-between items-end gap-2">
//                       {chartData.map((data, i) => (
//                         <div key={i} className="flex flex-col items-center flex-1">
//                           <div
//                             className={`w-full rounded-t ${getStatusColor(data.status)}`}
//                             style={{
//                               height: `${(data.value / maxValue) * 100}%`,
//                               minHeight: data.value > 0 ? '4px' : '0'
//                             }}
//                           />
//                           <span className="text-xs text-gray-500 mt-2">{data.label}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Chart Legend */}
//                   <div className="flex justify-center mt-4 gap-4 text-xs">
//                     <div className="flex items-center gap-1">
//                       <div className="w-3 h-3 bg-blue-800 rounded"></div>
//                       <span>Completed</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <div className="w-3 h-3 bg-blue-500 rounded"></div>
//                       <span>In Progress</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <div className="w-3 h-3 bg-blue-300 rounded"></div>
//                       <span>Pending</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <div className="w-3 h-3 bg-gray-300 rounded"></div>
//                       <span>No Tasks</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Employee Table - Only show if no widget selected or Employee List selected */}
//           {/* {(shouldShowWidget("Employee List") || !selectedWidget) && (
//             <div className="bg-white rounded-xl shadow h-96 overflow-y-auto hide-scroll ">

//               <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] bg-blue-100 px-4 py-2 font-medium text-sm gap-4">
//                 <span className="flex items-center">Employee</span>
//                 <span className="flex items-center">Mobile</span>
//                 <span className="flex items-center">Department</span>
//                 <span className="flex items-center">Role</span>
//                 <span className="flex items-center">Status</span>
//                 <span className="flex items-center justify-end">Action</span>
//               </div>


//               {employees.map((emp) => (
//                 <div
//                   key={emp.id}
//                   className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center px-4 py-3 border-t text-sm gap-4 hover:bg-gray-50"
//                 >

//                   <div className="flex items-center gap-2 min-w-0">
//                     <img
//                       src={
//                         emp.image && emp.image !== ""
//                           ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${emp.image}`
//                           : placeholderImage
//                       }
//                       alt={emp.full_name || "profile"}
//                       className="w-8 h-8 rounded-full object-cover flex-shrink-0"
//                       onError={(e) => {
//                         (e.currentTarget as HTMLImageElement).src =
//                           placeholderImage;
//                       }}
//                     />
//                     <div className="min-w-0">
//                       <p className="font-medium truncate">{emp.full_name}</p>
//                       <p className="text-gray-500 text-xs truncate">{emp.email}</p>
//                     </div>
//                   </div>

//                   <span className="truncate">{emp.mobile || "-"}</span>

//                   <span className="truncate">{emp.department_name}</span>

//                   <span className="truncate">{emp.jobrole}</span>

//                   <span
//                     className={`px-2 py-1 rounded-md w-fit text-xs ${emp.status === "Active"
//                       ? "text-green-600 bg-green-100"
//                       : "text-red-600 bg-red-100"
//                       }`}
//                   >
//                     {emp.status}
//                   </span>


//                   <div className="flex justify-end">
//                     <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer flex-shrink-0" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )} */}

//           {sessionData?.userProfileName === "Admin" ? (
//             // 👉 Admin view

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//               {/* Left: Enterprise Skills Heatmap */}
//               <div className="col-span-2 bg-white rounded-xl shadow p-4">
//                 <h2 className="font-semibold text-lg mb-2">Enterprise Skills Heatmap</h2>

//                 {/* Legend */}
//                 <div className="flex gap-4 text-sm mb-3">
//                   <span className="flex items-center gap-1">
//                     <span className="w-3 h-3 rounded-sm bg-red-500" /> Critical Gap
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <span className="w-3 h-3 rounded-sm bg-orange-400" /> Moderate Gap
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <span className="w-3 h-3 rounded-sm bg-green-500" /> Healthy
//                   </span>
//                 </div>

//                 {/* Heatmap Table */}
//                 <div className="overflow-x-auto ">
//                   <table className="w-full border-separate   border-spacing-1 text-sm">
//                     <thead>
//                       <tr className="text-left ">
//                         <th className="px-3 py-2">Department</th>
//                         <th className="px-3 py-2">AI/ML</th>
//                         <th className="px-3 py-2">Cloud Security</th>
//                         <th className="px-3 py-2">Data Analytics</th>
//                         <th className="px-3 py-2">Python</th>
//                         <th className="px-3 py-2">React</th>
//                         <th className="px-3 py-2">Digital Marketing</th>
//                         <th className="px-3 py-2">Content Strategy</th>
//                         <th className="px-3 py-2">SEO/SEM</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr >
//                         <td className="px-3 py-2 font-medium bg-gray-100">Engineering</td>
//                         <td className="bg-red-500 text-white text-center">-12</td>
//                         <td className="bg-orange-400 text-white text-center">-8</td>
//                         <td className="bg-green-200 text-center">✓</td>
//                         <td className="bg-green-200 text-center">✓</td>
//                         <td className="bg-orange-400 text-white text-center">-6</td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                       </tr>
//                       <tr>
//                         <td className="px-3 py-2 font-medium bg-gray-100">Marketing</td>
//                         <td className="bg-red-500 text-white text-center">-4</td>
//                         <td className="bg-orange-400 text-white text-center">-5</td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td className="bg-green-200 text-center">✓</td>
//                         <td className="bg-green-200 text-center">✓</td>
//                         <td className="bg-orange-400 text-white text-center">-3</td>
//                       </tr>
//                       <tr>
//                         <td className="px-3 py-2 font-medium bg-gray-100">Sales</td>
//                         <td></td>
//                         <td></td>
//                         <td className="bg-red-500 text-white text-center">-6</td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                       </tr>
//                       <tr>
//                         <td className="px-3 py-2 font-medium bg-gray-100">Finance</td>
//                         <td></td>
//                         <td></td>
//                         <td className="bg-orange-400 text-white text-center">-4</td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                       </tr>
//                       <tr>
//                         <td className="px-3 py-2 font-medium bg-gray-100">HR</td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 <p className="text-xs text-gray-500 mt-2">
//                   Click on any cell to drill down into detailed gap analysis
//                 </p>
//               </div>

//               {/* Right: Risk & Opportunity Matrix */}
//               <div className="bg-white rounded-xl shadow p-4">
//                 <h2 className="font-semibold text-lg">Risk & Opportunity Matrix</h2>
//                 <p className="text-xs text-gray-500 mb-3">
//                   Skills prioritization by business impact and availability
//                 </p>

//                 {/* Placeholder for scatter plot */}
//                 <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded">
//                   <span className="text-gray-400 text-sm">[Scatter Plot Here]</span>
//                 </div>

//                 {/* Legend */}
//                 <div className="flex gap-4 mt-4 text-sm">
//                   <span className="flex items-center gap-1">
//                     <span className="w-3 h-3 rounded-full bg-red-500" /> High Priority (High Impact, Scarce)
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <span className="w-3 h-3 rounded-full bg-orange-400" /> Strategic Watch (High Impact, Available)
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             // 👉 Non-admin view
//             < div className="space-y-6">
//           {/* My Skill Profile */}
//           <div className="bg-white border rounded-xl p-5">
//             <h2 className="font-semibold text-lg flex items-center gap-2 mb-1">
//               <span>🧑‍💻</span> My Skill Profile
//             </h2>
//             <p className="text-sm text-gray-500 mb-4">
//               Skills endorsed by peers and managers
//             </p>

//             <div className="grid md:grid-cols-2 gap-4">
//               {/* React */}
//               <div className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <p className="font-medium">React</p>
//                   <div className="flex items-center gap-2 mt-1 text-sm">
//                     <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-xs font-medium">
//                       expert
//                     </span>
//                     <span className="text-gray-500">⭐ 12</span>
//                   </div>
//                 </div>
//                 <button className="px-3 py-1 border rounded-lg text-sm font-medium hover:bg-gray-50">
//                   Get Endorsed
//                 </button>
//               </div>

//               {/* JavaScript */}
//               <div className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <p className="font-medium">JavaScript</p>
//                   <div className="flex items-center gap-2 mt-1 text-sm">
//                     <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-xs font-medium">
//                       expert
//                     </span>
//                     <span className="text-gray-500">⭐ 15</span>
//                   </div>
//                 </div>
//                 <button className="px-3 py-1 border rounded-lg text-sm font-medium hover:bg-gray-50">
//                   Get Endorsed
//                 </button>
//               </div>

//               {/* Python */}
//               <div className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <p className="font-medium">Python</p>
//                   <div className="flex items-center gap-2 mt-1 text-sm">
//                     <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
//                       intermediate
//                     </span>
//                     <span className="text-gray-500">⭐ 8</span>
//                   </div>
//                 </div>
//                 <button className="px-3 py-1 border rounded-lg text-sm font-medium hover:bg-gray-50">
//                   Get Endorsed
//                 </button>
//               </div>

//               {/* Data Analytics */}
//               <div className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <p className="font-medium">Data Analytics</p>
//                   <div className="flex items-center gap-2 mt-1 text-sm">
//                     <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
//                       novice
//                     </span>
//                     <span className="text-gray-500">⭐ 3</span>
//                   </div>
//                 </div>
//                 <button className="px-3 py-1 border rounded-lg text-sm font-medium hover:bg-gray-50">
//                   Get Endorsed
//                 </button>
//               </div>

//               {/* Cloud Security */}
//               <div className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <p className="font-medium">Cloud Security</p>
//                   <div className="flex items-center gap-2 mt-1 text-sm">
//                     <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
//                       novice
//                     </span>
//                     <span className="text-gray-500">⭐ 1</span>
//                   </div>
//                 </div>
//                 <button className="px-3 py-1 border rounded-lg text-sm font-medium hover:bg-gray-50">
//                   Get Endorsed
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* My Growth Opportunities */}
//           <div className="bg-white border rounded-xl p-5">
//             <h2 className="font-semibold text-lg flex items-center gap-2 mb-2">
//               ⊚ My Growth Opportunities
//             </h2>

//             {/* Current Role Proficiency */}
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-sm font-medium">Current Role Proficiency</p>
//               <p className="text-green-600 font-semibold">55%</p>
//             </div>
//             <div className="w-full h-3 bg-gray-100 rounded">
//               <div className="h-3 bg-gray-900 rounded" style={{ width: "55%" }}></div>
//             </div>

//             {/* Skills List */}
//             <div className="mt-4 space-y-2">
//               {[
//                 { skill: "React", percent: 100 },
//                 { skill: "JavaScript", percent: 100 },
//                 { skill: "Node.js", percent: 30 },
//                 { skill: "Database Design", percent: 25 },
//                 { skill: "System Architecture", percent: 20 },
//               ].map((item) => (
//                 <div key={item.skill} className="flex items-center justify-between text-sm">
//                   <span>{item.skill}</span>
//                   <div className="flex items-center gap-2 w-40">
//                     <div className="flex-1 h-2 bg-gray-100 rounded">
//                       <div
//                         className="h-2 bg-gray-900 rounded"
//                         style={{ width: `${item.percent}%` }}
//                       ></div>
//                     </div>
//                     <span className="text-gray-800 font-medium">{item.percent}%</span>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Skills for Data Scientist Role */}
//             <h3 className="font-medium mt-5 mb-2">Skills for Data Scientist Role</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <p>AI/ML</p>
//                   <p className="text-xs text-gray-500">Need Expert level</p>
//                 </div>
//                 <button className="px-3 py-1 border rounded-lg text-xs font-medium">
//                   3 courses
//                 </button>
//               </div>

//               <div className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <p>Cloud Security</p>
//                   <p className="text-xs text-gray-500">Need Intermediate level</p>
//                 </div>
//                 <button className="px-3 py-1 border rounded-lg text-xs font-medium">
//                   5 courses
//                 </button>
//               </div>

//               <div className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <p>Data Analytics</p>
//                   <p className="text-xs text-gray-500">Need Expert level</p>
//                 </div>
//                 <button className="px-3 py-1 border rounded-lg text-xs font-medium">
//                   4 courses
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//           )}

//       </div>

//       {/* Right Section - Adjust column span based on sidebar state */}

//       <div className={`${isSidebarOpen ? "col-span-3" : "col-span-3"} space-y-6`}>
//         {(shouldShowWidget("Today Task List") || !selectedWidget) && (

//           <div className="p-4 bg-white rounded-lg shadow h-77 overflow-y-auto hide-scroll">
//             <h2 className="font-semibold mb-4">Today's Task Progress</h2>
//             {todayTasks.length > 0 ? (
//               todayTasks.map((task, index) => (
//                 <div key={index} className="mb-4 border-l-2 border-red-400 pl-3">
//                   {/* Badge */}
//                   <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-1 rounded">
//                     {task.task_type}
//                   </span>

//                   {/* Title */}
//                   <p className="font-semibold mt-2">{task.task_title}</p>
//                   <p className="text-xs text-gray-500">Created Outlook of wireframe</p>

//                   {/* Profile */}
//                   <div className="flex items-center gap-2 mt-2">
//                     <img
//                       src={
//                         task.image && task.image !== ""
//                           ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${task.image}`
//                           : placeholderImage
//                       }
//                       alt={task.allocatedUser}
//                       className="w-8 h-8 rounded-full object-cover"
//                       onError={(e) => {
//                         (e.currentTarget as HTMLImageElement).src = placeholderImage;
//                       }}
//                     />
//                     <div>
//                       <p className="text-sm font-medium">{task.allocatedUser}</p>
//                       <p className="text-xs text-gray-400">
//                         {(() => {
//                           if (!task.task_date) return "";
//                           const d = new Date(task.task_date);
//                           const day = String(d.getDate()).padStart(2, "0");
//                           const month = String(d.getMonth() + 1).padStart(2, "0");
//                           const year = d.getFullYear();
//                           return `${day}-${month}-${year}`;
//                         })()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500 text-sm">No tasks for today</p>
//             )}
//           </div>

//         )}

//         {(shouldShowWidget("Week Task List") || !selectedWidget) && (
//           <div className="p-4 bg-white rounded-lg shadow h-96 overflow-y-auto hide-scroll">
//             <h2 className="font-semibold mb-4">Weekly Task Progress</h2>
//             {weekTasks.length > 0 ? (
//               weekTasks.map((task, index) => (
//                 <div key={index} className="mb-4 border-l-2 border-red-400 pl-3">
//                   {/* Badge */}
//                   <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-1 rounded">
//                     {task.task_type}
//                   </span>

//                   {/* Title */}
//                   <p className="font-semibold mt-2">{task.task_title}</p>
//                   <p className="text-xs text-gray-500">Created Outlook of wireframe</p>

//                   {/* Profile */}
//                   <div className="flex items-center gap-2 mt-2">
//                     <img
//                       src={
//                         task.image && task.image !== ""
//                           ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${task.image}`
//                           : placeholderImage
//                       }
//                       alt={task.allocatedUser}
//                       className="w-8 h-8 rounded-full object-cover"
//                       onError={(e) => {
//                         (e.currentTarget as HTMLImageElement).src = placeholderImage;
//                       }}
//                     />
//                     <div>
//                       <p className="text-sm font-medium">{task.allocatedUser}</p>
//                       <p className="text-xs text-gray-400">
//                         {(() => {
//                           if (!task.task_date) return "";
//                           const d = new Date(task.task_date);
//                           const day = String(d.getDate()).padStart(2, "0");
//                           const month = String(d.getMonth() + 1).padStart(2, "0");
//                           const year = d.getFullYear();
//                           return `${day}-${month}-${year}`;
//                         })()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500 text-sm">No tasks for this week</p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>


//       {/* Close dropdown when clicking outside */ }
//   {
//     isWidgetDropdownOpen && (
//       <div
//         className="fixed inset-0 z-0"
//         onClick={() => setIsWidgetDropdownOpen(false)}
//       ></div>
//     )
//   }
//     </div >
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { MoreVertical, ChevronDown } from "lucide-react";
import { Atom } from "react-loading-indicators"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  image?: string;
}

interface Department {
  id: number;
  department: string;
}

// Update the GapAnalysisData interface
interface GapAnalysisData {
  title: string;
  totalLevels: number;
  currentLevel: number;
  gap: number;
  gapText: string;
  upskillingCandidates: {
    name: string;
    role: string;
    totalSkills: number;
    skillList: string;
    image?: string;
    skillLevel?: string; // Add skill level
  }[];
}



interface MySkill {
  jobrole_skill_id: number;
  jobrole: string;
  skill: string;
  skill_id: number;
  title: string;
  category: string;
  sub_category: string;
  description: string;
  proficiency_level: string;
  knowledge: string[];
  ability: string[];
}
interface MyGrowth {
  id: number;
  title: string;
  category: string;
  sub_category: string;
  description: string;
  department: string;
  sub_department: string;
  status: string;
  skill_level: string | null;
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
  mySKill?: MySkill[];
  myGrowth?: MyGrowth[];
  current_level: number;
  departmentList?: Department[];
  skillHeatmap?: any;
  skillLevels?: any[];
}

// Interface for skills data in the matrix
interface SkillMatrixData {
  name: string;
  impact: number;
  availability: number;
  gap: "critical" | "high" | "medium" | "low";
}

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [mySkills, setMySkills] = useState<MySkill[]>([]);
  const [myGrowth, setMyGrowth] = useState<MyGrowth[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isGapAnalysisOpen, setIsGapAnalysisOpen] = useState(false);
  const [selectedGapAnalysis, setSelectedGapAnalysis] = useState<GapAnalysisData | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [skillHeatmap, setSkillHeatmap] = useState<any>({});
  const [selectedCandidateSkills, setSelectedCandidateSkills] = useState<string[]>([]);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [expandedEmployeeIndex, setExpandedEmployeeIndex] = useState<number | null>(null);
  const [skillLevels, setSkillLevels] = useState([]);

  const toggleSkills = (index: number) => {
    setExpandedEmployeeIndex(expandedEmployeeIndex === index ? null : index);
  };

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
  const [selectedSkill, setSelectedSkill] = useState<MySkill | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [maxLevel, setMaxLevel] = useState<number>(0);

  const attrArray = [
    { title: "knowledge", icon: "mdi-book-open-page-variant" },
    { title: "ability", icon: "mdi-lightbulb-on" },
    { title: "behaviour", icon: "mdi-account-group" },
    { title: "attitude", icon: "mdi-emoticon-happy-outline" },
  ];

  const placeholderImage =
    "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

  // Sample data for the Risk & Opportunity Matrix
  const skillsMatrixData: SkillMatrixData[] = [
    { name: "AI/ML", impact: 90, availability: 15, gap: "critical" },
    { name: "Cloud Security", impact: 85, availability: 30, gap: "high" },
    { name: "Data Analytics", impact: 80, availability: 65, gap: "medium" },
    { name: "Python", impact: 75, availability: 70, gap: "medium" },
    { name: "React", impact: 70, availability: 40, gap: "high" },
    { name: "Digital Marketing", impact: 65, availability: 75, gap: "low" },
    { name: "Content Strategy", impact: 60, availability: 80, gap: "low" },
    { name: "SEO/SEM", impact: 55, availability: 60, gap: "medium" },
    { name: "Node.js", impact: 50, availability: 45, gap: "high" },
    { name: "DevOps", impact: 85, availability: 25, gap: "critical" }
  ];

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
          `${sessionData.url}/dashboard?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&user_id=${sessionData.userId}&user_profile_id=${sessionData.userProfileId}&user_profile_name=${sessionData.userProfileName}&org_type=${sessionData.orgType}&syear=2025`
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        console.log("Dashboard API Response:", data);

        setEmployees(data.employeeList ?? []);
        setTodayTasks(data.today_task ?? []);
        setWeekTasks(data.week_task ?? []);
        setWidgetOptions(data.widget ?? []);
        setMySkills(data.mySKill ?? []);
        setMyGrowth(data.myGrowth ?? []);
        setDepartments(data.departmentList || []);
        setSkillHeatmap(data.skillHeatmap || {});
        // setSkillLevels(data.SkillLevels || []);
        

        // Extract unique skills from skillHeatmap
        const allSkills = new Set<string>();
        if (data.skillHeatmap) {
          Object.values(data.skillHeatmap).forEach((deptData: any) => {
            Object.keys(deptData).forEach(skill => {
              allSkills.add(skill);
            });
          });
        }
        setSkills(Array.from(allSkills));
         setSkillLevels(data.SkillLevels || []);
        console.log("Extracted Skills:", Array.from(skillLevels));
        const apiLevel = data.current_level ?? 0;
        setCurrentLevel(apiLevel);

        // update max level dynamically
        setMaxLevel((prevMax) => (apiLevel > prevMax ? apiLevel : prevMax));

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
          data.week_task.forEach((task:any) => {
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

  // Get color for matrix points based on gap level
  const getGapColor = (gap: string) => {
    switch (gap) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-400";
      case "medium":
        return "bg-blue-400";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  // Get color for skill heatmap cells based on gap value
  const getSkillGapColor = (totalEmp: number, requiredEmp: number) => {
    if (totalEmp === 0) return "bg-red-500"; // Critical gap - no employees
    const gapPercentage = (requiredEmp - totalEmp) / requiredEmp;

    if (gapPercentage >= 0.5) return "bg-red-500"; // Critical gap
    if (gapPercentage >= 0.3) return "bg-orange-400"; // High gap
    if (gapPercentage >= 0.1) return "bg-yellow-400"; // Medium gap
    return "bg-green-500"; // Healthy
  };

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  // Check if a widget should be shown based on selection
  const shouldShowWidget = (widgetName: string) => {
    if (!selectedWidget) return true; // Show all if none selected
    return selectedWidget === widgetName;
  };

  // Handle skill selection in the matrix
  const handleSkillSelect = (skillName: string) => {
    // If already selected, deselect
    if (selectedSkill && selectedSkill.skill === skillName) {
      setSelectedSkill(null);
    } else {
      // Find in mySkills if available, else just set a dummy object for matrix
      const foundSkill = mySkills.find(skill => skill.skill === skillName) || null;
      setSelectedSkill(foundSkill);
    }
  };

  // Enhanced function to handle multiple separators
  // More robust function with fallback
  const handleSkillListClick = (skillList: string) => {
    let skills: string[] = [];

    if (skillList && typeof skillList === 'string') {
      // Try multiple separators
      const separators = /[,;|/]/;
      skills = skillList.split(separators)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
    } else {
      skills = ['No skills listed'];
    }

    setSelectedCandidateSkills(skills);
    setIsSkillsModalOpen(true);
  };

  // Add this function to handle cell clicks
  const handleCellClick = (department: string, skill: string, totalEmp: number, requiredEmp: number, skillData: any[]) => {
    // Get levels from API data or use defaults
    const skillLevels = skillData?.find((emp: any) => emp.skill_level)?.skill_level || skill;
    // If your API has max_level field
    const totalLevels = skillData?.find((emp: any) => emp.max_level)?.max_level || 3;
    const currentLevel = parseInt(skillLevels.replace("Level ", ""))
    const gap = (currentLevel) ? totalLevels - currentLevel : 0;


    const gapData: GapAnalysisData = {
      title: `${skill} in ${department}`,
      totalLevels: totalLevels,
      currentLevel: currentLevel,
      gap: gap,
      gapText: gap > 0 ? `${gap} more levels needed` : "Maximum level achieved",
      upskillingCandidates: skillData?.map((employee: any) => ({
        name: employee.user_name || "Unknown Employee",
        role: employee.jobrole || "Unknown Role",
        totalSkills: employee.total_skills || 0,
        skillList: employee.skillList || "No skills listed",
        image: employee.image ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${employee.image}` : placeholderImage,
        skillLevel: employee.skill_level || "Level 1" // Add skill level from API
      })) || []
    };


    setSelectedGapAnalysis(gapData);
    setIsGapAnalysisOpen(true);
  };

  // Convert skill_level to percent
  const getLevelPercent = (level: string | null): number => {
    switch (level) {
      case "Level 1":
        return 25;
      case "Level 2":
        return 50;
      case "Level 3":
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }
  // Convert to percent (normalize)
  const currentPercent =
    maxLevel > 0 ? Math.min(100, Math.round((currentLevel / maxLevel) * 100)) : 0;

  return (
    <div className={`h-[90vh] text-gray-900 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
      <div className="grid grid-cols-12 gap-6 ">
        {/* Left Section - Adjust column span based on sidebar state */}
        <div className={`${isSidebarOpen ? "col-span-9" : "col-span-9"} space-y-6`}>
          {/* Stats + Chart - Always visible */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex gap-6">
              {/* Stats Section */}
              <div className="grid grid-cols-2 divide-x divide-y border rounded-lg overflow-hidden flex-1">
                <div className="flex items-center gap-3 border-b border-r pb-4 pr-6">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded bg-blue-300 mb-7" />
                    <div>
                      <p className="font-bold text-gray-700">Total Employee</p>
                      <p className="text-2xl font-bold text-center mt-3">{stats.totalEmployees}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b pl-6 pb-4">
                  <div className="flex items-center gap-3 p-1">
                    <div className="w-9 h-9 rounded bg-red-300 mb-7" />
                    <div>
                      <p className="font-bold text-gray-700">Unmapped Employee</p>
                      <p className="text-2xl font-bold text-center mt-3">{stats.unmappedEmployees}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-r pt-4 pr-6">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded bg-green-300 mb-9" />
                    <div>
                      <p className="font-bold text-gray-700 mb-5">Total Job role</p>
                      <p className="text-2xl font-bold text-center">{stats.totalJobRoles}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 pl-6">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded bg-yellow-300 mb-9" />
                    <div>
                      <p className="font-bold text-gray-700 mb-5">Total Skill</p>
                      <p className="text-2xl font-bold text-center">{stats.totalSkills}</p>
                    </div>
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

          {/* Conditional rendering based on user role */}
          {sessionData?.userProfileName === "Admin" ? (
            // Admin view - Skills Heatmap and Matrix
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: Enterprise Skills Heatmap */}
              <div className="col-span-2 bg-white rounded-xl shadow p-4">
                <h2 className="font-semibold text-lg mb-2">Enterprise Skills Heatmap</h2>

                {/* Legend */}
                <div className="flex gap-4 text-sm mb-3">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-red-500" /> Critical Gap
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-orange-400" /> Moderate Gap
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-green-500" /> Healthy
                  </span>
                </div>

                {/* Heatmap Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-1 text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="px-3 py-2">Department</th>

                        {skillLevels.map((level:any,key) => (
                          <th key={key} className="px-3 py-2 text-center">
                            {level.proficiency_level}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {departments.map((dept) => (
                        <tr key={dept.id}>
                          <td className="px-3 py-2 font-medium bg-gray-100">
                            {dept.department}
                          </td>

                          {skills.map((skill) => {
                            const deptData = skillHeatmap[dept.department] || {};
                            const skillData = deptData[skill];
                            const totalEmp = skillData?.total_emp || 0;

                            // Get the required number from your data instead of hardcoding
                            const requiredEmp = skillData?.required_level || 0;

                            // Assign colors based on employee count compared to requirement
                            let cellColor = "";
                            if (totalEmp === 0) {
                              cellColor = "bg-red-400"; // critical gap 
                            } else if (totalEmp === 1) {
                              cellColor = "bg-orange-400"; // warning 
                            } else if (totalEmp === 2) {
                              cellColor = "bg-green-500"; // good 
                            } else {
                              cellColor = "bg-blue-500"; // optional for >2 
                            }

                            return (
                              <td
                                key={skill}
                                className={`text-white text-center rounded-sm cursor-pointer transition-colors p-2 ${cellColor} hover:opacity-80`}
                                onClick={() => handleCellClick(
                                  dept.department,
                                  skill,
                                  totalEmp,
                                  requiredEmp, // Pass the actual required level
                                  skillData?.skillData || [] // Pass the skillData array
                                )}
                              >
                                {totalEmp}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Click on any cell to drill down into detailed gap analysis
                </p>
              </div>

              {/* Gap Analysis Dialog */}
              <>
                {/* Gap Analysis Dialog */}
                <Dialog open={isGapAnalysisOpen} onOpenChange={setIsGapAnalysisOpen}>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 hide-scroll">
                    <DialogHeader>
                      <DialogTitle>Gap Analysis</DialogTitle>
                    </DialogHeader>
                    {selectedGapAnalysis && (
                      <div className="space-y-6">
                        {/* Header */}
                        <div>
                          <h2 className="text-1xl mt-2">{selectedGapAnalysis.title}</h2>
                        </div>

                        {/* Total Levels and Current Level */}
                        <div className="flex justify-between items-center grid-cols-2 border rounded-lg p-4 bg-gray-50">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{selectedGapAnalysis.totalLevels}</div>
                            <div className="text-sm mt-1">Required Level</div>
                          </div>

                          <div className="text-center">
                            <div className="text-3xl font-bold">{selectedGapAnalysis.currentLevel}</div>
                            <div className="text-sm mt-1">Current Level</div>
                          </div>
                        </div>

                        {/* Gap */}
                        <div className="bg-red-200 text-center border-t border-b border-gray-300 py-4">
                          <h3 className="text-red text-xl font-bold ">Gap: {selectedGapAnalysis.gap}</h3>
                          <p className="text-sm mt-1 ">{selectedGapAnalysis.gapText}</p>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-gray-300"></div>

                        {/* Upskilling Candidates with their actual levels */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Upskilling Candidates</h3>
                          <div className="space-y-4">
                            {selectedGapAnalysis.upskillingCandidates.map((candidate, index) => {
                              // Parse the skillList to handle multiple skills separated by commas
                              const skills = candidate.skillList
                                ? candidate.skillList.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
                                : ['No skills listed'];

                              return (
                                <div key={index} className="border rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={candidate.image || placeholderImage}
                                        alt={candidate.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = placeholderImage;
                                        }}
                                      />
                                      <div>
                                        <div className="font-medium">{candidate.name}</div>
                                        <div className="text-sm text-gray-600">{candidate.role}</div>
                                      </div>
                                    </div>
                                    <div
                                      className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 cursor-pointer hover:bg-blue-200"
                                      onClick={() => toggleSkills(index)}
                                    >
                                      {candidate.totalSkills} Skills
                                    </div>
                                  </div>

                                  {/* Skills list that appears when clicked */}
                                  {expandedEmployeeIndex === index && (
                                    <div className="mt-3 pl-12">
                                      <h4 className="text-sm font-semibold mb-2">Skills:</h4>
                                      <div className="space-y-2">
                                        {skills && skills.length > 0 ? (
                                          // split skills string if it contains |||
                                          skills
                                            .join("|||") // In case skills is array of strings
                                            .split("|||")
                                            .map((skill, skillIndex) => (
                                              <div
                                                key={skillIndex}
                                                className="flex items-center gap-2 p-2 bg-gray-100 rounded"
                                              >
                                                <span className="mdi mdi-check-circle text-green-500 text-sm"></span>
                                                <span className="text-sm">{skill.trim()}</span>
                                              </div>
                                            ))
                                        ) : (
                                          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                            <span className="mdi mdi-alert-circle text-yellow-500 text-sm"></span>
                                            <span className="text-sm">No skills listed</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </>


              {/* Right: Risk & Opportunity Matrix */}
              <div className="bg-white rounded-xl shadow p-4">
                <h2 className="font-semibold text-lg">Employee Attendance</h2>
                <p className="text-xs text-gray-500 mb-3">
                  Track and manage employee attendance efficiently
                </p>

                {/* Matrix Visualization */}
                <div className="relative h-64 border-l-2 border-b-2 border-gray-400 mb-2">
                  {/* Y-axis label */}
                  <div className="absolute -left-10 ml-5 top-0 transform -rotate-90 origin-center text-xs font-medium">
                    High
                  </div>
                  <div className="absolute -left-10 ml-5 bottom-0 transform -rotate-90 origin-center text-xs font-medium">
                    Low
                  </div>

                  {/* X-axis label */}
                  {/* <div className="absolute bottom-0 left-0 -mb-6 text-xs font-medium w-full text-center">
                    Low Availability
                  </div> */}
                  {/* <div className="absolute bottom-0 right-0 -mb-6 text-xs font-medium w-full text-center">
                    High Availability
                  </div> */}

                  {/* Quadrants */}
                  {/* <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-50 border-b-2 border-l-2 border-red-200"></div> */}
                  {/* <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-50 border-b-2 border-r-2 border-green-200"></div> */}

                  {/* quadrant labels */}
                  {/* <div className="absolute top-2 right-2 text-xs font-medium text-red-600">
                    High Priority
                    <div className="text-[10px] text-red-500">(High Impact, Scarce)</div>
                  </div>
                  <div className="absolute top-2 left-2 text-xs font-medium text-green-600">
                    Strategic Watch
                    <div className="text-[10px] text-green-500">(High Impact, Available)</div>
                  </div> */}

                  {/* Data points */}
                  {skillsMatrixData.map((skill, index) => (
                    <div
                      key={index}
                      className={`absolute w-3 h-3 rounded-full cursor-pointer ${getGapColor(skill.gap)}
                      ${selectedSkill && selectedSkill.skill === skill.name ?
                          'ring-2 ring-offset-1 ring-black' : ''}`}
                      style={{
                        left: `${skill.availability}%`,
                        bottom: `${skill.impact}%`,
                        transform: 'translate(-50%, 50%)'
                      }}
                      onClick={() => handleSkillSelect(skill.name)}
                      title={`${skill.name}: Impact ${skill.impact}%, Availability ${skill.availability}%`}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    High Priority (High Impact, Scarce)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    Strategic Watch (High Impact, Available)
                  </span>
                </div>

                {/* Selected skill details */}
                {selectedSkill && (
                  <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                    <strong>Selected:{selectedSkill.skill}
                    </strong>
                    {skillsMatrixData.filter(skill => skill.name === selectedSkill.skill).map(skill => (
                      <div key={skill.name}>
                        Impact: {skill.impact}% | Availability: {skill.availability}% | Gap: {skill.gap}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Click on any point to view skill details
                </p>
              </div>
            </div>
          ) : (

            // Non-admin view - Skill Profile and Growth Opportunities
            <div className="space-y-6">
              {/* My Skill Profile */}
              <div className="p-4 bg-white rounded-lg shadow h-110 overflow-y-auto hide-scroll">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-1">
                  <span>🧑‍💻</span> My Skill Profile
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Skills endorsed by peers and managers
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {mySkills.length > 0 ? (
                    mySkills.map((skill) => (
                      <div
                        key={skill.jobrole_skill_id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium">{skill.skill}</p>
                          <p className="flex items-center gap-2 mt-1 text-sm">{skill.jobrole}

                            {/* <div className="flex items-center gap-2 mt-1 text-sm"> */}
                            <span className="mdi mdi-chart-bar"></span>&nbsp;&nbsp;{" "}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${Number(skill.proficiency_level) >= 5
                                ? "bg-green-100 text-green-600"
                                : Number(skill.proficiency_level) >= 3
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-blue-100 text-blue-600"
                                }`}
                            >
                              {skill.proficiency_level}
                            </span>
                          </p>
                          {/* </div> */}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedSkill(skill);
                            setIsEditModalOpen(true);
                          }}
                          className="px-3 py-1 border rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          View More
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No skills found</p>
                  )}
                </div>
              </div>

              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
                  <DialogHeader>
                    <DialogTitle>
                      <span className="mdi mdi-brain"></span>{" "}
                      {selectedSkill?.skill ?? "Skill Details"}
                    </DialogTitle>
                  </DialogHeader>
                  <hr className="m-0 mx-2" />

                  {selectedSkill ? (
                    <div className="w-full">
                      {/* Top Info */}
                      <div className="flex gap-4 px-4">
                        <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                          <span className="mdi mdi-briefcase"></span>&nbsp;
                          <label className="text-bold">Jobrole</label>
                          <hr className="my-2" />
                          {selectedSkill.jobrole}
                        </div>
                        <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                          <span className="mdi mdi-tag-multiple"></span>&nbsp;
                          <label className="text-bold">Category</label>
                          <hr className="my-2" />
                          {selectedSkill.category}
                        </div>
                        <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                          <span className="mdi mdi-tag"></span>&nbsp;
                          <label className="text-bold">Sub-Category</label>
                          <hr className="my-2" />
                          {selectedSkill.sub_category}
                        </div>
                        <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                          <span className="mdi mdi-chart-bar"></span>&nbsp;
                          <label className="text-bold">Proficiency</label>
                          <hr className="my-2" />
                          {selectedSkill.proficiency_level}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="px-4 mt-4">
                        <div className="w-full bg-[#eaf7f2] p-2 rounded-md">
                          <span className="mdi mdi-information-variant-circle"></span>
                          &nbsp;
                          <label className="text-bold">Description</label>
                          <hr className="my-2" />
                          {selectedSkill.description}
                        </div>
                      </div>

                      {/* Knowledge & Ability */}
                      <div className="flex gap-4 px-4 mt-4">
                        {attrArray.map((attr, key) => (
                          <div
                            key={key}
                            className="w-1/2 bg-blue-100 flex rounded-2xl shadow p-2"
                          >
                            <div className="py-2 w-full">
                              <h4 className="font-semibold mb-2">
                                <span className={`mdi ${attr.icon} text-xl`}></span>{" "}
                                {attr.title.charAt(0).toUpperCase() +
                                  attr.title.slice(1)}
                              </h4>
                              <hr className="mb-2" />
                              <div className="w-full h-[calc(40vh)] overflow-y-auto hide-scrollbar">
                                {(selectedSkill[attr.title as keyof MySkill] as any[])?.map(
                                  (item: any, index: number) => (
                                    <div
                                      key={index}
                                      className="w-full bg-white p-2 rounded-lg mb-2"
                                    >
                                      <p className="text-sm">{item}</p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p>No Skill details found</p>
                  )}

                  <DialogFooter>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Close
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>



              {/* My Growth Opportunities */}
              <div className="bg-white border rounded-xl p-5 w-full col-span-12 -mx-1 px-6">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-2">
                  ⊚ My Growth Opportunities
                </h2>

                {/* Current Role Proficiency - Now calculated as average of all skills */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Current Role Proficiency</p>
                  <p className="text-green-600 font-semibold">
                    {myGrowth.length > 0
                      ? `${Math.round(myGrowth.reduce((sum, item) => sum + getLevelPercent(item.skill_level), 0) / myGrowth.length)}%`
                      : "0%"
                    }
                  </p>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded">
                  <div
                    className="h-3 bg-gray-900 rounded"
                    style={{
                      width: myGrowth.length > 0
                        ? `${Math.round(myGrowth.reduce((sum, item) => sum + getLevelPercent(item.skill_level), 0) / myGrowth.length)}%`
                        : "0%"
                    }}
                  ></div>
                </div>

                {/* Skills List from API */}
                <div className="mt-4 space-y-2">
                  {myGrowth.length > 0 ? (
                    myGrowth.map((item) => {
                      const percent = getLevelPercent(item.skill_level);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{item.title}</span>
                          <div className="flex items-center gap-2 w-40">
                            <div className="flex-1 h-2 bg-gray-100 rounded">
                              <div
                                className="h-2 bg-gray-900 rounded"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-800 font-medium">{percent}%</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No growth opportunities found</p>
                  )}
                </div>

                {/* Skills for Data Scientist Role */}
                {/* <h3 className="font-medium mt-5 mb-2">Skills for Data Scientist Role</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p>AI/ML</p>
                      <p className="text-xs text-gray-500">Need Expert level</p>
                    </div>
                    <button className="px-3 py-1 border rounded-lg text-xs font-medium">
                      3 courses
                    </button>
                  </div>

                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p>Cloud Security</p>
                      <p className="text-xs text-gray-500">Need Intermediate level</p>
                    </div>
                    <button className="px-3 py-1 border rounded-lg text-xs font-medium">
                      5 courses
                    </button>
                  </div>

                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p>Data Analytics</p>
                      <p className="text-xs text-gray-500">Need Expert level</p>
                    </div>
                    <button className="px-3 py-1 border rounded-lg text-xs font-medium">
                      4 courses
                    </button>
                  </div>
                </div> */}
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Adjust column span based on sidebar state */}
        <div className={`${isSidebarOpen ? "col-span-3" : "col-span-3"} space-y-6`}>
          {(shouldShowWidget("Today Task List") || !selectedWidget) && (
            <div className="p-4 bg-white rounded-lg shadow h-77 overflow-y-auto hide-scroll">
              <h2 className="font-semibold mb-4">Today's Task Progress</h2>
              {todayTasks.length > 0 ? (
                todayTasks.map((task, index) => (
                  <div key={index} className="mb-4 border-l-2 border-red-400 pl-3">
                    {/* Badge */}
                    <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-1 rounded">
                      {task.task_type}
                    </span>

                    {/* Title */}
                    <p className="mt-2">{task.task_title}</p>
                    {/* <p className="text-xs text-gray-500">Created Outlook of wireframe</p> */}

                    {/* Profile */}
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={
                          task.image && task.image !== ""
                            ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${task.image}`
                            : placeholderImage
                        }
                        alt={task.allocatedUser}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = placeholderImage;
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{task.allocatedUser}</p>
                        <p className="text-xs text-gray-400">
                          {(() => {
                            if (!task.task_date) return "";
                            const d = new Date(task.task_date);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const year = d.getFullYear();
                            return `${day}-${month}-${year}`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No tasks for today</p>
              )}
            </div>
          )}

          {(shouldShowWidget("Week Task List") || !selectedWidget) && (
            <div className="p-4 bg-white rounded-lg shadow h-110 overflow-y-auto hide-scroll">
              <h2 className="font-semibold mb-4">Weekly Task Progress</h2>
              {weekTasks.length > 0 ? (
                weekTasks.map((task, index) => (
                  <div key={index} className="mb-4 border-l-2 border-red-400 pl-3">
                    {/* Badge */}
                    <span className="text-xs text-red-500 font-semibold bg-red-100 px-2 py-1 rounded">
                      {task.task_type}
                    </span>

                    {/* Title */}
                    <p className="mt-2">{task.task_title}</p>
                    {/* <p className="text-xs text-gray-500">Created Outlook of wireframe</p> */}

                    {/* Profile */}
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={
                          task.image && task.image !== ""
                            ? `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${task.image}`
                            : placeholderImage
                        }
                        alt={task.allocatedUser}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = placeholderImage;
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{task.allocatedUser}</p>
                        <p className="text-xs text-gray-400">
                          {(() => {
                            if (!task.task_date) return "";
                            const d = new Date(task.task_date);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const year = d.getFullYear();
                            return `${day}-${month}-${year}`;
                          })()}
                        </p>
                      </div>
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