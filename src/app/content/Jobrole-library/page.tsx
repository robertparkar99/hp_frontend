// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import AddDialog from "@/components/jobroleComponent/addDialouge";
// import EditDialog from "@/components/jobroleComponent/editDialouge";
// import { Atom } from "react-loading-indicators";
// import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
// import { Square, Table } from "lucide-react"; // ✅ Toggle icons
// import DataTable, { TableColumn, TableStyles } from "react-data-table-component"; // ✅ DataTable

// type JobRole = {
//   id: number;
//   industries: string;
//   department: string;
//   sub_department: string;
//   jobrole: string;
//   description: string;
//   jobrole_category: string;
//   performance_expectation: string;
//   status: string;
//   related_jobrole: string;
// };

// export default function HomePage() {
//   const [roles, setRoles] = useState<JobRole[]>([]);
//   const [selected, setSelected] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [departments, setDepartments] = useState<string[]>([]);
//   const [selectedDept, setSelectedDept] = useState<string>("All Departments");
//   const [viewMode, setViewMode] = useState<"myview" | "table">("myview");
//   const [searchTerm, setSearchTerm] = useState<string>(""); // ✅ search state

//   const [dialogOpen, setDialogOpen] = useState({
//     view: false,
//     add: false,
//     edit: false,
//   });

//   const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);

//   const [sessionData, setSessionData] = useState({
//     url: "",
//     token: "",
//     subInstituteId: "",
//     orgType: "",
//     userId: "",
//   });

//   // ✅ Load session data
//   useEffect(() => {
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       const { APP_URL, token, sub_institute_id, org_type, user_id } =
//         JSON.parse(userData);
//       setSessionData({
//         url: APP_URL,
//         token,
//         subInstituteId: sub_institute_id,
//         orgType: org_type,
//         userId: user_id,
//       });
//     }
//   }, []);

//   // ✅ Fetch job roles
//   const fetchData = async () => {
//     if (!sessionData.url || !sessionData.subInstituteId) return;
//     setLoading(true);

//     try {
//       const res = await fetch(
//         `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}`
//       );
//       const json = await res.json();

//       let data: JobRole[] = [];
//       if (Array.isArray(json)) {
//         data = json;
//       } else if (json?.data) {
//         data = json.data;
//       }

//       setRoles(data);

//       const uniqueDepts = Array.from(
//         new Set(data.map((r) => r.department).filter(Boolean))
//       ).sort((a, b) => a.localeCompare(b));

//       setDepartments(["All Departments", ...uniqueDepts]);
//     } catch (error) {
//       console.error("❌ Error fetching roles:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [sessionData]);

//   // ✅ Delete role
//   const handleDeleteClick = async (id: number) => {
//     if (!id) return;

//     if (window.confirm("Are you sure you want to delete this job role?")) {
//       try {
//         const res = await fetch(
//           `${sessionData.url}/jobrole_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=user`,
//           {
//             method: "DELETE",
//             headers: {
//               Authorization: `Bearer ${sessionData.token}`,
//             },
//           }
//         );

//         const data = await res.json();
//         alert(data.message);

//         await fetchData();
//         setSelectedJobRole(null);
//       } catch (error) {
//         console.error("Error deleting job role:", error);
//         alert("Error deleting job role");
//       }
//     }
//   };

//   // ✅ Handlers
//   const handleEdit = (id: number) => {
//     setSelectedJobRole(id);
//     setDialogOpen({ ...dialogOpen, edit: true });
//   };

//   const handleCloseModel = () => {
//     setDialogOpen({ view: false, add: false, edit: false });
//     setSelectedJobRole(null);
//   };

//   // ✅ Filtered roles
//   const filteredRoles =
//     selectedDept === "All Departments"
//       ? roles
//       : roles.filter((role) => role.department === selectedDept);

//   // ✅ Apply search on filtered roles
//   const searchedRoles = filteredRoles.filter(
//     (role) =>
//       role.jobrole.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       role.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // ✅ Column search state
//   const [columnFilters, setColumnFilters] = useState<{
//     [key: string]: string;
//   }>({ jobrole: "", department: "", description: "", performance_expectation: "" });

//   // ✅ Filter data based on column search
//   const columnFilteredRoles = searchedRoles.filter((role) => {
//     return (
//       role.jobrole.toLowerCase().includes(columnFilters.jobrole?.toLowerCase() || "") &&
//       role.department.toLowerCase().includes(columnFilters.department?.toLowerCase() || "") &&
//       role.description.toLowerCase().includes(columnFilters.description?.toLowerCase() || "") &&
//       role.performance_expectation
//         .toLowerCase()
//         .includes(columnFilters.performance_expectation?.toLowerCase() || "")
//     );
//   });

//   // ✅ DataTable columns with column search inputs
//   const columns: TableColumn<JobRole>[] = [
//     {
//       name: (
//         <div className="flex flex-col">
//           <span>Job Role</span>
//           <input
//             type="text"
//             value={columnFilters.jobrole}
//             onChange={(e) =>
//               setColumnFilters({ ...columnFilters, jobrole: e.target.value })
//             }
//             placeholder="Search..."
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.jobrole,
//       sortable: true,
//       wrap: true,
//       width: "160px",
//     },
//     {
//       name: (
//         <div className="flex flex-col">
//           <span>Department</span>
//           <input
//             type="text"
//             value={columnFilters.department}
//             onChange={(e) =>
//               setColumnFilters({ ...columnFilters, department: e.target.value })
//             }
//             placeholder="Search..."
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.department,
//       sortable: true,
//       wrap: true,
//       width: "140px",
//     },
//     {
//       name: (
//         <div className="flex flex-col">
//           <span>Description</span>
//           <input
//             type="text"
//             value={columnFilters.description}
//             onChange={(e) =>
//               setColumnFilters({ ...columnFilters, description: e.target.value })
//             }
//             placeholder="Search..."
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.description,
//       sortable: false,
//       wrap: true,
//     },
//     {
//       name: (
//         <div className="flex flex-col">
//           <span>Performance Expectation</span>
//           <input
//             type="text"
//             value={columnFilters.performance_expectation}
//             onChange={(e) =>
//               setColumnFilters({
//                 ...columnFilters,
//                 performance_expectation: e.target.value,
//               })
//             }
//             placeholder="Search..."
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.performance_expectation,
//       sortable: false,
//       wrap: true,
//       width: "160px",
//     },
//     {
//       name: "Actions",
//       cell: (row) => (
//         <div className="flex gap-3">
//           {/* <button onClick={() => handleEdit(row.id)}>
//             <FaEdit className="text-blue-500" />
//           </button>
//           <button onClick={() => handleDeleteClick(row.id)}>
//             <FaTrash className="text-red-500" />
//           </button> */}
//           <button
//             onClick={() => handleEdit(row.id)}
//             className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
//           >
//             <span className="mdi mdi-pencil"></span>
//           </button>
//           <button
//             onClick={() => handleDeleteClick(row.id)}
//             className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
//           >
//             <span className="mdi mdi-delete"></span>
//           </button>
//         </div>
//       ),
//       width: "100px"
//     },
//   ];

//   // ✅ Custom styles for DataTable
//   const customStyles: TableStyles = {
//     headCells: {
//       style: {
//         fontSize: "14px",
//         backgroundColor: "#D1E7FF",
//         color: "black",
//         whiteSpace: "nowrap",
//         textAlign: "left",
//       },
//     },
//     cells: {
//       style: {
//         fontSize: "13px",
//         textAlign: "left",
//       },
//     },
//     table: {
//       style: {
//         borderRadius: "20px",
//         overflow: "hidden",
//       },
//     },
//   };

//   return (
//     <div className="pt-6 sm:px-4 px-2">
//       {/* 🔝 Top bar */}
//       <div className="flex justify-between items-center mb-4">
//         <div className="w-60">
//           <Select
//             onValueChange={(val) => {
//               setSelectedDept(val);
//               setSelected(null);
//             }}
//             defaultValue="All Departments"
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Filter by department" />
//             </SelectTrigger>
//             <SelectContent>
//               {departments.map((dept) => (
//                 <SelectItem key={dept} value={dept}>
//                   {dept}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

              

//         <div className="flex items-center gap-3">
//           {/* Add New Jobrole */}
//           <button
//             className="rounded-lg hover:bg-gray-100 px-3 py-1 flex items-center justify-center text-xl"
//             onClick={() => setDialogOpen({ ...dialogOpen, add: true })}
//             data-titlehead="Add New Jobrole"
//           >
//             +
//           </button>
//           {/* ✅ Icon Toggle */}
//           <div className="flex border rounded-md overflow-hidden">
//             <button
//               onClick={() => setViewMode("myview")}
//               className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "myview"
//                   ? "bg-blue-100 text-blue-600"
//                   : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                 }`}
//             >
//               <Square className="h-5 w-5" />
//             </button>
//             <button
//               onClick={() => setViewMode("table")}
//               className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "table"
//                   ? "bg-blue-100 text-blue-600"
//                   : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                 }`}
//             >
//               <Table className="h-5 w-5" />
//             </button>
//           </div>


//         </div>
//       </div>

//       {/* Add Dialog */}
//       {dialogOpen.add && (
//         <AddDialog
//           skillId={null}
//           onClose={handleCloseModel}
//           onSuccess={() => {
//             handleCloseModel();
//             fetchData();
//           }}
//         />
//       )}

//       {/* Edit Dialog */}
//       {dialogOpen.edit && selectedJobRole && (
//         <EditDialog
//           jobRoleId={selectedJobRole}
//           onClose={handleCloseModel}
//           onSuccess={() => {
//             handleCloseModel();
//             fetchData();
//           }}
//         />
//       )}

//       {/* Loader / No Data */}
//       {loading ? (
//         <div className="flex justify-center items-center h-screen">
//           <Atom color="#525ceaff" size="medium" text="" textColor="" />
//         </div>
//       ) : searchedRoles.length === 0 ? (
//         <div className="text-center text-gray-600">No job roles found.</div>
//       ) : viewMode === "myview" ? (
//         // ✅ My View (cards)
//         <div
//           className="
//             grid gap-2.5 min-h-40 w-full
//             sm:grid-cols-6 grid-cols-2 grid-flow-dense
//             auto-rows-[110px]
//           "
//         >
//           {searchedRoles.map((role) => {
//             const isSelected = selected === role.id;
//             return (
//               <motion.div
//                 key={role.id}
//                 layout
//                 transition={{
//                   layout: { duration: 0.4, ease: "easeInOut" },
//                 }}
//                 onClick={() => setSelected(isSelected ? null : role.id)}
//                 className={`relative cursor-pointer 
//                   bg-[#5E9DFF] rounded-[5px] hover:rounded-[20px] 
//                   flex flex-col items-center justify-center text-center p-3
//                   text-white
//                   ${isSelected
//                     ? "sm:col-span-2 sm:row-span-2 col-span-2 row-span-2"
//                     : ""
//                   }
//                 `}
//               >
//                 {!isSelected && (
//                   <>
//                     <motion.span
//                       layout
//                       className="text-[14px] font-semibold mb-2"
//                     >
//                       {role.jobrole}
//                     </motion.span>
//                     <div
//                       className="flex justify-center gap-3"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                        <button onClick={() => handleEdit(role.id)}>
//                         <FaEye className="text-gray" />
//                       </button>
//                       <button onClick={() => handleEdit(role.id)}>
//                         <FaEdit className="text-gray" />
//                       </button>
//                       <button onClick={() => handleDeleteClick(role.id)}>
//                         <FaTrash className="text-gray" />
//                       </button>
//                     </div>
//                   </>
//                 )}

//                 {isSelected && (
//                   <motion.div
//                     layout
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="absolute inset-0 z-10 flex items-center justify-center"
//                   >
//                     <div className="bg-white text-black rounded-md border border-gray-300 w-full h-full flex">
//                       <div className="w-1 bg-[#5E9DFF] rounded-l-md"></div>
//                       <div className="flex-1 p-4 flex flex-col">
//                         <h3 className="text-base font-semibold text-center mb-2">
//                           {role.jobrole}
//                         </h3>
//                         <div className="border-t border-gray-600 mb-3"></div>
//                         <p
//                           className="mb-3 line-clamp-3 overflow-hidden text-ellipsis"
//                           title={role.description}
//                         >
//                           <span className="font-bold">Description:</span>{" "}
//                           {role.description}
//                         </p>
//                         <p>
//                           <span className="font-bold">
//                             Performance Expectation:
//                           </span>{" "}
//                           {role.performance_expectation}
//                         </p>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </motion.div>
//             );
//           })}
//         </div>
//       ) : (
//         // ✅ DataTable View
//         <div>
//           <DataTable
//             columns={columns}
//             data={columnFilteredRoles}
//             customStyles={customStyles}
//             pagination
//             highlightOnHover
//             striped
//             responsive
//           />
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddDialog from "@/components/jobroleComponent/addDialouge";
import EditDialog from "@/components/jobroleComponent/editDialouge";
import { Atom } from "react-loading-indicators";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Square, Table } from "lucide-react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import JobDescriptionModal from "./JobDescriptionModal"; // Import the modal

type JobRole = {
  id: number;
  industries: string;
  department: string;
  sub_department: string;
  jobrole: string;
  description: string;
  jobrole_category: string;
  performance_expectation: string;
  status: string;
  related_jobrole: string;
};

export default function HomePage() {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("All Departments");
  const [viewMode, setViewMode] = useState<"myview" | "table">("myview");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // State for modals
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

  const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);
  const [jobDescriptionModalOpen, setJobDescriptionModalOpen] = useState(false); // New state for job description modal

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  // ✅ Load session data
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } =
        JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
      });
    }
  }, []);

  // ✅ Fetch job roles
  const fetchData = async () => {
    if (!sessionData.url || !sessionData.subInstituteId) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}`
      );
      const json = await res.json();

      let data: JobRole[] = [];
      if (Array.isArray(json)) {
        data = json;
      } else if (json?.data) {
        data = json.data;
      }

      setRoles(data);

      const uniqueDepts = Array.from(
        new Set(data.map((r) => r.department).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b));

      setDepartments(["All Departments", ...uniqueDepts]);
    } catch (error) {
      console.error("❌ Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sessionData]);

  // ✅ Delete role
  const handleDeleteClick = async (id: number) => {
    if (!id) return;

    if (window.confirm("Are you sure you want to delete this job role?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/jobrole_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=user`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
            },
          }
        );

        const data = await res.json();
        alert(data.message);

        await fetchData();
        setSelectedJobRole(null);
      } catch (error) {
        console.error("Error deleting job role:", error);
        alert("Error deleting job role");
      }
    }
  };

  // ✅ Handlers
  const handleEdit = (id: number) => {
    setSelectedJobRole(id);
    setDialogOpen({ ...dialogOpen, edit: true });
  };

  const handleView = (id: number) => {
    setSelectedJobRole(id);
    setJobDescriptionModalOpen(true); // Open job description modal
  };

  const handleCloseModel = () => {
    setDialogOpen({ view: false, add: false, edit: false });
    setSelectedJobRole(null);
  };

  const handleCloseJobDescriptionModal = () => {
    setJobDescriptionModalOpen(false);
    setSelectedJobRole(null);
  };

  // ✅ Get selected job role data for modal
  const getSelectedJobRoleData = () => {
    if (!selectedJobRole) return null;
    return roles.find(role => role.id === selectedJobRole) || null;
  };

  // ✅ Filtered roles
  const filteredRoles =
    selectedDept === "All Departments"
      ? roles
      : roles.filter((role) => role.department === selectedDept);

  // ✅ Apply search on filtered roles
  const searchedRoles = filteredRoles.filter(
    (role) =>
      role.jobrole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Column search state
  const [columnFilters, setColumnFilters] = useState<{
    [key: string]: string;
  }>({ jobrole: "", department: "", description: "", performance_expectation: "" });

  // ✅ Filter data based on column search
  const columnFilteredRoles = searchedRoles.filter((role) => {
    return (
      role.jobrole.toLowerCase().includes(columnFilters.jobrole?.toLowerCase() || "") &&
      role.department.toLowerCase().includes(columnFilters.department?.toLowerCase() || "") &&
      role.description.toLowerCase().includes(columnFilters.description?.toLowerCase() || "") &&
      role.performance_expectation
        .toLowerCase()
        .includes(columnFilters.performance_expectation?.toLowerCase() || "")
    );
  });

  // ✅ DataTable columns with column search inputs
  const columns: TableColumn<JobRole>[] = [
    {
      name: (
        <div className="flex flex-col">
          <span>Job Role</span>
          <input
            type="text"
            value={columnFilters.jobrole}
            onChange={(e) =>
              setColumnFilters({ ...columnFilters, jobrole: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.jobrole,
      sortable: true,
      wrap: true,
      width: "160px",
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Department</span>
          <input
            type="text"
            value={columnFilters.department}
            onChange={(e) =>
              setColumnFilters({ ...columnFilters, department: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.department,
      sortable: true,
      wrap: true,
      width: "140px",
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Description</span>
          <input
            type="text"
            value={columnFilters.description}
            onChange={(e) =>
              setColumnFilters({ ...columnFilters, description: e.target.value })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.description,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <div className="flex flex-col">
          <span>Performance Expectation</span>
          <input
            type="text"
            value={columnFilters.performance_expectation}
            onChange={(e) =>
              setColumnFilters({
                ...columnFilters,
                performance_expectation: e.target.value,
              })
            }
            placeholder="Search..."
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.performance_expectation,
      sortable: false,
      wrap: true,
      width: "160px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-3">
          {/* View Button */}
          <button
            onClick={() => handleView(row.id)}
            className="bg-green-500 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
          >
            <FaEye className="inline mr-1" size={12} />
            View
          </button>
          {/* Edit Button */}
          <button
            onClick={() => handleEdit(row.id)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          >
            <FaEdit className="inline mr-1" size={12} />
            Edit
          </button>
          {/* Delete Button */}
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
          >
            <FaTrash className="inline mr-1" size={12} />
            Delete
          </button>
        </div>
      ),
      width: "220px"
    },
  ];

  // ✅ Custom styles for DataTable
  const customStyles: TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "left",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        textAlign: "left",
      },
    },
    table: {
      style: {
        borderRadius: "20px",
        overflow: "hidden",
      },
    },
  };

  return (
    <div className="pt-6 sm:px-4 px-2">
      {/* 🔝 Top bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-60">
          <Select
            onValueChange={(val) => {
              setSelectedDept(val);
              setSelected(null);
            }}
            defaultValue="All Departments"
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          {/* Add New Jobrole */}
          <button
            className="rounded-lg hover:bg-gray-100 px-3 py-1 flex items-center justify-center text-xl"
            onClick={() => setDialogOpen({ ...dialogOpen, add: true })}
            data-titlehead="Add New Jobrole"
          >
            +
          </button>
          {/* ✅ Icon Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("myview")}
              className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "myview"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <Square className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "table"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <Table className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      {dialogOpen.add && (
        <AddDialog
          skillId={null}
          onClose={handleCloseModel}
          onSuccess={() => {
            handleCloseModel();
            fetchData();
          }}
        />
      )}

      {/* Edit Dialog */}
      {dialogOpen.edit && selectedJobRole && (
        <EditDialog
          jobRoleId={selectedJobRole}
          onClose={handleCloseModel}
          onSuccess={() => {
            handleCloseModel();
            fetchData();
          }}
        />
      )}

      {/* Job Description Modal */}
      {jobDescriptionModalOpen && (
        <JobDescriptionModal
          isOpen={jobDescriptionModalOpen}
          onClose={handleCloseJobDescriptionModal}
          jobRole={getSelectedJobRoleData()}
        />
      )}

      {/* Loader / No Data */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Atom color="#525ceaff" size="medium" text="" textColor="" />
        </div>
      ) : searchedRoles.length === 0 ? (
        <div className="text-center text-gray-600">No job roles found.</div>
      ) : viewMode === "myview" ? (
        // ✅ My View (cards)
        <div
          className="
            grid gap-2.5 min-h-40 w-full
            sm:grid-cols-6 grid-cols-2 grid-flow-dense
            auto-rows-[110px]
          "
        >
          {searchedRoles.map((role) => {
            const isSelected = selected === role.id;
            return (
              <motion.div
                key={role.id}
                layout
                transition={{
                  layout: { duration: 0.4, ease: "easeInOut" },
                }}
                onClick={() => setSelected(isSelected ? null : role.id)}
                className={`relative cursor-pointer 
                  bg-[#5E9DFF] rounded-[5px] hover:rounded-[20px] 
                  flex flex-col items-center justify-center text-center p-3
                  text-white
                  ${isSelected
                    ? "sm:col-span-2 sm:row-span-2 col-span-2 row-span-2"
                    : ""
                  }
                `}
              >
                {!isSelected && (
                  <>
                    <motion.span
                      layout
                      className="text-[14px] font-semibold mb-2"
                    >
                      {role.jobrole}
                    </motion.span>
                    <div
                      className="flex justify-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* View Button */}
                      <button onClick={() => handleView(role.id)}>
                        <FaEye className="text-white hover:text-gray-200" />
                      </button>
                      {/* Edit Button */}
                      <button onClick={() => handleEdit(role.id)}>
                        <FaEdit className="text-white hover:text-gray-200" />
                      </button>
                      {/* Delete Button */}
                      <button onClick={() => handleDeleteClick(role.id)}>
                        <FaTrash className="text-white hover:text-gray-200" />
                      </button>
                    </div>
                  </>
                )}

                {isSelected && (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-10 flex items-center justify-center"
                  >
                    <div className="bg-white text-black rounded-md border border-gray-300 w-full h-full flex">
                      <div className="w-1 bg-[#5E9DFF] rounded-l-md"></div>
                      <div className="flex-1 p-4 flex flex-col">
                        <h3 className="text-base font-semibold text-center mb-2">
                          {role.jobrole}
                        </h3>
                        <div className="border-t border-gray-600 mb-3"></div>
                        <p
                          className="mb-3 line-clamp-3 overflow-hidden text-ellipsis"
                          title={role.description}
                        >
                          <span className="font-bold">Description:</span>{" "}
                          {role.description}
                        </p>
                        <p>
                          <span className="font-bold">
                            Performance Expectation:
                          </span>{" "}
                          {role.performance_expectation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        // ✅ DataTable View
        <div>
          <DataTable
            columns={columns}
            data={columnFilteredRoles}
            customStyles={customStyles}
            pagination
            highlightOnHover
            striped
            responsive
          />
        </div>
      )}
    </div>
  );
}