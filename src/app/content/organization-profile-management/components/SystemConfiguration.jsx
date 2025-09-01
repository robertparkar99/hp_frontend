
// "use client";

// import React, { useState, useEffect } from "react";
// import DataTable from "react-data-table-component";
// import { saveAs } from "file-saver";
// import Button from "@/components/taskComponent/ui/Button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import dynamic from "next/dynamic";

// const ExcelExportButton = dynamic(
//   () =>
//     import("@/components/exportButtons/excelExportButton").then(
//       (mod) => mod.ExcelExportButton
//     ),
//   { ssr: false }
// );

// const PdfExportButton = dynamic(
//   () =>
//     import("@/components/exportButtons/PdfExportButton").then(
//       (mod) => mod.PdfExportButton
//     ),
//   { ssr: false }
// );

// const PrintButton = dynamic(
//   () =>
//     import("@/components/exportButtons/printExportButton").then(
//       (mod) => mod.PrintButton
//     ),
//   { ssr: false }
// );

// const SystemConfiguration = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     departmentName: "",
//     assignedTo: "",
//     dueDate: "",
//     attachment: null,
//   });

//   const [editFormData, setEditFormData] = useState({
//     id: "",
//     name: "",
//     description: "",
//     departmentName: "",
//     assignedTo: "",
//     dueDate: "",
//     attachment: null,
//   });

//   const [dataList, setDataList] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [fileName, setFileName] = useState("");
//   const [editFileName, setEditFileName] = useState("");
//   const [allUsers, setAllUsers] = useState([]); // 🔹 Store all users
//   const [userOptions, setUserOptions] = useState([]);
//   const [editUserOptions, setEditUserOptions] = useState([]);
//   const [departmentOptions, setDepartmentOptions] = useState([]); // 🔹 departments state
//   const [sessionData, setSessionData] = useState({});
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const userData = localStorage.getItem("userData");
//       if (userData) {
//         const { APP_URL, token, sub_institute_id, user_id, syear } =
//           JSON.parse(userData);
//         setSessionData({
//           url: APP_URL,
//           token,
//           sub_institute_id,
//           user_id,
//           syear,
//         });
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (sessionData.url && sessionData.token) {
//       fetchUsers();
//       fetchDepartments(); // 🔹 fetch departments
//     }
//   }, [sessionData.url, sessionData.token]);
//   const fetchUsers = async () => {
//     try {
//       const res = await fetch(
//         `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`
//       );
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         const mappedUsers = data.map((user) => {
//           let displayName = `${user.first_name || ""} ${user.middle_name || ""
//             } ${user.last_name || ""}`.trim();
//           if (!displayName) displayName = user.user_name || "";
//           return {
//             id: user.id,
//             name: displayName,
//             department_id: user.department_id || null, // 🔹 make sure API gives department_id
//           };
//         });
//         setAllUsers(mappedUsers);
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       const res = await fetch(
//         `${sessionData.url}/table_data?table=hrms_departments&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`
//       );
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setDepartmentOptions(
//           data.map((dept) => ({
//             id: dept.id,
//             name: dept.department || "Unnamed Department",
//           }))
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//     }
//   };

//   const fetchComplianceData = async () => {
//     try {
//       const res = await fetch(
//         `${sessionData.url}/table_data?table=master_compliance&filters[sub_institute_id]=${sessionData.sub_institute_id}`
//       );
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setDataList(data);
//       }
//     } catch (error) {
//       console.error("Error fetching compliance data:", error);
//     }
//   };
//   useEffect(() => {
//     if (sessionData.url && sessionData.sub_institute_id) {
//       fetchComplianceData();
//     }
//   }, [sessionData.url, sessionData.sub_institute_id]);



//   // 🔹 Handle department selection in ADD form
//   useEffect(() => {
//     if (formData.departmentName) {
//       const dept = departmentOptions.find(
//         (d) => d.name === formData.departmentName
//       );
//       if (dept) {
//         setUserOptions(allUsers.filter((u) => u.department_id == dept.id));
//       } else {
//         setUserOptions([]);
//       }
//     } else {
//       setUserOptions([]);
//     }
//   }, [formData.departmentName, allUsers, departmentOptions]);

//   // 🔹 Handle department selection in EDIT form
//   useEffect(() => {
//     if (editFormData.departmentName) {
//       const dept = departmentOptions.find(
//         (d) => d.name === editFormData.departmentName
//       );
//       if (dept) {
//         setEditUserOptions(allUsers.filter((u) => u.department_id == dept.id));
//       } else {
//         setEditUserOptions([]);
//       }
//     } else {
//       setEditUserOptions([]);
//     }
//   }, [editFormData.departmentName, allUsers, departmentOptions]);

//   // ... (delete, edit, update, submit handlers remain unchanged) ...
//   const handleDeleteClick = async (id) => {
//     if (!id) return;

//     if (window.confirm("Are you sure you want to delete this Data?")) {
//       try {
//         const res = await fetch(
//           `${sessionData.url}/settings/institute_detail/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&user_id=${sessionData.user_id}&formName=complaince_library`,
//           {
//             method: "DELETE",
//             headers: {
//               Authorization: `Bearer ${sessionData.token}`,
//             },
//           }
//         );

//         const data = await res.json();
//         alert(data.message);
//         fetchComplianceData();
//       } catch (error) {
//         console.error("Error deleting data:", error);
//         alert("Error deleting data");
//       }
//     }
//   };
//   const handleEditClick = (id) => {
//     const itemToEdit = dataList.find((item) => item.id === id);
//     if (itemToEdit) {
//       setEditingId(id);

//       // find department object
//       const dept = departmentOptions.find(
//         (d) => d.name === itemToEdit.standard_name
//       );

//       setEditFormData({
//         id: itemToEdit.id,
//         name: itemToEdit.name || "",
//         description: itemToEdit.description || "",
//         departmentName: dept ? dept.name : "",   // ✅ match dropdown by name
//         assignedTo: itemToEdit.assigned_to?.toString() || "", // ✅ match dropdown by id
//         dueDate: itemToEdit.duedate || "",
//         attachment: null,
//       });

//       setEditFileName(itemToEdit.attachment || "");
//       setIsEditModalOpen(true);
//     }
//   };
//   // const handleEditClick = (id) => {
//   //   const itemToEdit = dataList.find((item) => item.id === id);
//   //   if (itemToEdit) {
//   //     setEditingId(id);
//   //     setEditFormData({
//   //       id: itemToEdit.id,
//   //       name: itemToEdit.name || "",
//   //       description: itemToEdit.description || "",
//   //       departmentName: itemToEdit.standard_name || "",
//   //       assignedTo: itemToEdit.assigned_to || "",
//   //       dueDate: itemToEdit.duedate || "",
//   //       attachment: null,
//   //     });
//   //     setEditFileName(itemToEdit.attachment || "");
//   //     setIsEditModalOpen(true);
//   //   }
//   // };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//         // Check if session data is loaded
//     if (!sessionData.url || !sessionData.token) {
//       alert('Session data not loaded. Please refresh the page.');
//       return;
//     }
//     try {
//       const formPayload = new FormData();
//       formPayload.append("type", "API");
//       formPayload.append("formName", "complaince_library");
//       formPayload.append("user_id", sessionData.user_id);
//       formPayload.append("syear", sessionData.syear);
//       formPayload.append("sub_institute_id", sessionData.sub_institute_id);
//       formPayload.append("name", editFormData.name);
//       formPayload.append("description", editFormData.description);
//       formPayload.append("standard_name", editFormData.departmentName);
//       formPayload.append("assigned_to", editFormData.assignedTo);
//       formPayload.append("duedate", editFormData.dueDate);
//       if (editFormData.attachment) {
//         formPayload.append("attachment", editFormData.attachment);
//       }

//       const res = await fetch(
//         `${sessionData.url}/settings/institute_detail/${editingId}`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${sessionData.token}`, 'X-HTTP-Method-Override': 'PUT' },
//           body: formPayload,
//         }
//       );

//       const result = await res.json();
//       alert(result.message || "Data updated successfully");
//       setIsEditModalOpen(false);
//       setEditingId(null);
//       fetchComplianceData();

//     } catch (error) {
//       console.error("Error updating form:", error);
//       alert("An error occurred while updating data.");
//     }
//   };
//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleEditChange = (field, value) => {
//     setEditFormData((prev) => ({ ...prev, [field]: value }));

//        if (field === 'departmentId') {
//       fetchEditUsers(value);
//       setEditFormData((prev) => ({ ...prev, employeeId: '' }));
//     }
//   };


//   const handleEditFileChange = (e) => {
//     const file = e.target.files?.[0] || null;
//     setEditFileName(file?.name || "");
//     handleEditChange("attachment", file);
//   };

//   const handleColumnFilter = (field, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [field]: value.toLowerCase(),
//     }));
//   };

//   useEffect(() => {
//     let withExtras = dataList.map((item, index) => ({
//       ...item,
//       srno: (index + 1).toString(),
//       attachment: item.attachment?.name || item.attachment || "N/A",
//       assigned_to_name: userOptions.find(
//         (u) => u.id.toString() === (item.assigned_to || "")?.toString()
//       )?.name || "",
//     }));

//     let filtered = [...withExtras];

//     // Apply filters only if they have values
//     Object.keys(filters).forEach((key) => {
//       if (filters[key] && filters[key].trim() !== "") {
//         filtered = filtered.filter((item) => {
//           const val = (item[key] || "").toString().toLowerCase();
//           return val.includes(filters[key]);
//         });
//       }
//     });

//     setFilteredData(filtered);
//   }, [filters, dataList, userOptions]);

//   // const handleChange = (field, value) => {
//   //   setFormData((prev) => ({ ...prev, [field]: value }));
//   // };

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0] || null;
//     setFileName(file?.name || "");
//     handleChange("attachment", file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//         if (!sessionData.url || !sessionData.token) {
//       alert('Session data not loaded. Please refresh the page.');
//       return;
//     }

//     try {
//       const formPayload = new FormData();
//       formPayload.append("type", "API");
//       formPayload.append("formName", "complaince_library");
//       formPayload.append("user_id", sessionData.user_id);
//       formPayload.append("syear", sessionData.syear);
//       formPayload.append("sub_institute_id", sessionData.sub_institute_id);
//       formPayload.append("name", formData.name);
//       formPayload.append("description", formData.description);
//       formPayload.append("standard_name", formData.departmentName);
//       formPayload.append("assigned_to", formData.assignedTo);
//       formPayload.append("duedate", formData.dueDate);
//       if (formData.attachment)
//         formPayload.append("attachment", formData.attachment);

//       const res = await fetch(`${sessionData.url}/settings/institute_detail`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${sessionData.token}` },
//         body: formPayload,
//       });

//       const result = await res.json();
//       if (res.ok) {
//         alert(result.message || "Data submitted successfully");
//         setFormData({
//           name: "",
//           description: "",
//           departmentName: "",
//           assignedTo: "",
//           dueDate: "",
//           attachment: null,
//         });
//         setFileName("");
//         fetchComplianceData();
//       } else {
//         alert(result.message || "Error submitting data");
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       alert("An error occurred while submitting data.");
//     }
//   };

//   const exportToCSV = () => {
//     const csv = [
//       [
//         "Sr No.",
//         "Name",
//         "Description",
//         "Standard Name",
//         "Assigned To",
//         "Due Date",
//         "Attachment",
//       ],
//       ...dataList.map((item, i) => [
//         i + 1,
//         item.name,
//         item.description,
//         item.standard_name || "",
//         userOptions.find(
//           (u) =>
//             u.id.toString() === (item.assigned_to || "")?.toString()
//         )?.name || "",
//         item.duedate || "",
//         item.attachment?.name || item.attachment || "N/A",
//       ]),
//     ]
//       .map((e) => e.join(","))
//       .join("\n");

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     saveAs(blob, "submitted-data.csv");
//   };

//   const columns = [
//     {
//       name: (
//         <div>
//           <div>Sr No.</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.srno,
//       width: "100px",
//       sortable: true,
//     },
//     {
//       name: (
//         <div>
//           <div>Name</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("name", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.name,
//       sortable: true
//     },
//     {
//       name: (
//         <div>
//           <div>Description</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("description", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.description,
//       sortable: true
//     },
//     {
//       name: (
//         <div>
//           <div>Standard Name</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("standard_name", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.standard_name || "",
//       sortable: true,
//       wrap: true,
//     },
//     {
//       name: (
//         <div>
//           <div>Assigned To</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("assigned_to_name", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.assigned_to_name || "",
//       sortable: true,
//     },
//     {
//       name: (
//         <div>
//           <div>Due Date</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("duedate", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => row.duedate || "",
//       sortable: true,
//       wrap: true,
//     },
//     {
//       name: (
//         <div>
//           <div>Attachment</div>
//           <input
//             type="text"
//             placeholder="Search..."
//             onChange={(e) => handleColumnFilter("attachment", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }}
//           />
//         </div>
//       ),
//       selector: (row) => {
//         if (row.attachment && row.attachment != '' && row.attachment != 'N/A') {
//           return (
//             <a
//               href={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/compliance_library/${row.attachment}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 hover:text-blue-800 underline"
//             >
//               View Attachment
//             </a>
//           );
//         }
//         return row.attachment;
//       },
//       sortable: true,
//       wrap: true,
//     },
//     {
//       name: "Actions",
//       cell: (row) => (
//         <div className="flex space-x-2">
//           <button
//             onClick={() => row.id && handleEditClick(row.id)}
//             className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
//           >
//             <span className="mdi mdi-pencil"></span>
//           </button>
//           <button
//             onClick={() => row.id && handleDeleteClick(row.id)}
//             className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
//           >
//             <span className="mdi mdi-delete"></span>
//           </button>
//         </div>
//       ),
//       ignoreRowClick: true,
//       button: true,
//     },
//   ];

//   const customStyles = {
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
//         border: "1px solid #ddd",
//         borderRadius: "20px",
//         overflow: "hidden",
//       },
//     },
//   };

//   // Determine which data to display
//   const displayData = filteredData.length > 0 ? filteredData : dataList;
//   // ... (rest of your logic stays the same) ...

//   // ---------- JSX ----------
//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       {/* Add Form */}
//       <form
//         onSubmit={handleSubmit}
//         className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg mb-10"
//       >
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Name
//           </label>
//           <input
//             type="text"
//             value={formData.name}
//             onChange={(e) => handleChange("name", e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2"
//             required
//           />
//         </div>

//         <div className="md:col-span-2">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Description
//           </label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => handleChange("description", e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2"
//             required
//           />
//         </div>

//         {/* 🔹 Department dropdown */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Department
//           </label>
//           <select
//             value={formData.departmentName}
//             onChange={(e) => handleChange("departmentName", e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2"
//             required
//           >
//             <option value="">Select Department</option>
//             {departmentOptions.map((dept) => (
//               <option key={dept.id} value={dept.name}>
//                 {dept.name}
//               </option>
//             ))}
//           </select>
//         </div>


//         {/* Assigned To - filtered by department */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Assigned To
//           </label>
//           <select
//             value={formData.assignedTo}
//             onChange={(e) => handleChange("assignedTo", e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2"
//             required
//           >
//             <option value="">Select User</option>
//             {userOptions.map((user) => (
//               <option key={user.id} value={user.id}>
//                 {user.name}
//               </option>
//             ))}
//           </select>
//         </div>


//         {/* Due Date */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Due Date
//           </label>
//           <input
//             type="date"
//             value={formData.dueDate}
//             onChange={(e) => handleChange("dueDate", e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2"
//             required
//           />
//         </div>

//         {/* Attachment */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Attachment
//           </label>
//           <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
//             <input type="file" className="hidden" onChange={handleFileChange} />
//             <span className="text-gray-600 truncate">
//               {fileName || "Choose file"}
//             </span>
//           </label>
//         </div>

//         <div className="col-span-1 md:col-span-3 flex justify-center">
//           <button
//             type="submit"
//             className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
//           >
//             Submit
//           </button>
//         </div>
//       </form>

//       {/* Data Table */}
//       <div className="mt-2">
//         <div className="flex justify-between items-center mb-4 py-4">
//           <div className="space-x-4">
//             {/* Pagination controls if needed */}
//           </div>
//           <div className="flex space-x-2">
//             <PrintButton
//               data={filteredData.length > 0 ? filteredData : dataList}
//               title="Incident Reports"
//               excludedFields={["id"]}
//               buttonText={
//                 <>
//                   <span className="mdi mdi-printer-outline"></span>
//                 </>
//               }
//             />
//             <ExcelExportButton
//               sheets={[{ data: filteredData.length > 0 ? filteredData : dataList, sheetName: "Incident Reports" }]}
//               fileName="incident_reports"
//               buttonText={
//                 <>
//                   <span className="mdi mdi-file-excel"></span>
//                 </>
//               }
//             />
//             <PdfExportButton
//               data={filteredData.length > 0 ? filteredData : dataList}
//               fileName="incident_reports"
//               buttonText={
//                 <>
//                   <span className="mdi mdi-file-pdf-box"></span>
//                 </>
//               }
//             />
//           </div>
//         </div>

//         <DataTable
//           columns={columns}
//           data={filteredData.length > 0 ? filteredData : dataList}
//           customStyles={customStyles}
//           pagination
//           highlightOnHover
//           responsive
//           noDataComponent={<div className="p-4 text-center">No data available</div>}
//           persistTableHead
//         />
//       </div>
//       {/* Edit Dialog */}
//       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//         <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
//           <DialogHeader>
//             <DialogTitle>Edit Task Assignment</DialogTitle>
//           </DialogHeader>
         
//           <form
//             onSubmit={handleUpdate}
//             className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4"
//           >
//             {/* Similar inputs as above, with 🔹 department dropdown */}
//             {[
//               { label: "Name", name: "name", type: "text" },
//               { label: "Description", name: "description", type: "textarea" },
//               // { label: "Department Name", name: "departmentName", type: "text" },
//             ].map(({ label, name, type }) => (
//               <div key={name} className={type === "textarea" ? "md:col-span-2" : ""}>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   {label}
//                 </label>
//                 {type === "textarea" ? (
//                   <textarea
//                     value={editFormData[name]}
//                     onChange={(e) => handleEditChange(name, e.target.value)}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//                     required
//                   />
//                 ) : (
//                   <input
//                     type="text"
//                     value={editFormData[name]}
//                     onChange={(e) => handleEditChange(name, e.target.value)}
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//                     required
//                   />
//                 )}
//               </div>
//             ))}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Department
//               </label>
//               <select
//                 value={editFormData.departmentName}
//                 onChange={(e) => handleEditChange("departmentName", e.target.value)}
//                 className="w-full border border-gray-300 rounded-md px-3 py-2"
//                 required
//               >
//                 <option value="">Select Department</option>
//                 {departmentOptions.map((dept) => (
//                   <option key={dept.id} value={dept.name}>
//                     {dept.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Assigned To */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Assigned To
//               </label>
//               <select
//                 value={editFormData.assignedTo}
//                 onChange={(e) => handleEditChange("assignedTo", e.target.value)}
//                 className="w-full border border-gray-300 rounded-md px-3 py-2"
//                 required
//               >
//                 <option value="">Select User</option>
//                 {editUserOptions.map((user) => (
//                   <option key={user.id} value={user.id.toString()}>
//                     {user.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Due Date
//               </label>
//               <input
//                 type="date"
//                 value={editFormData.dueDate}
//                 onChange={(e) => handleEditChange("dueDate", e.target.value)}
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Attachment
//               </label>
//               <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
//                 <input
//                   type="file"
//                   className="hidden"
//                   onChange={handleEditFileChange}
//                 />
//                 <span className="text-gray-600 truncate">
//                   {editFileName || "Choose file"}
//                 </span>
//               </label>
//               {editFileName && !editFormData.attachment && (
//                 <p className="text-sm text-gray-500 mt-1">
//                   Current file: {editFileName}
//                 </p>
//               )}
//             </div>

//             {/* ... other fields unchanged ... */}

//             <div className="col-span-1 md:col-span-3 flex justify-center space-x-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setIsEditModalOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit">Update</Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default SystemConfiguration;
"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { saveAs } from "file-saver";
import Button from "@/components/taskComponent/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const ExcelExportButton = dynamic(
  () =>
    import("@/components/exportButtons/excelExportButton").then(
      (mod) => mod.ExcelExportButton
    ),
  { ssr: false }
);

const PdfExportButton = dynamic(
  () =>
    import("@/components/exportButtons/PdfExportButton").then(
      (mod) => mod.PdfExportButton
    ),
  { ssr: false }
);

const PrintButton = dynamic(
  () =>
    import("@/components/exportButtons/printExportButton").then(
      (mod) => mod.PrintButton
    ),
  { ssr: false }
);

const SystemConfiguration = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentName: "",
    assignedTo: "",
    dueDate: "",
    attachment: null,
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    description: "",
    departmentName: "",
    assignedTo: "",
    dueDate: "",
    attachment: null,
  });

  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [fileName, setFileName] = useState("");
  const [editFileName, setEditFileName] = useState("");
  const [allUsers, setAllUsers] = useState([]); // 🔹 Store all users
  const [userOptions, setUserOptions] = useState([]);
  const [editUserOptions, setEditUserOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]); // 🔹 departments state
  const [sessionData, setSessionData] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, user_id, syear } =
          JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          sub_institute_id,
          user_id,
          syear,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchUsers();
      fetchDepartments(); // 🔹 fetch departments
    }
  }, [sessionData.url, sessionData.token]);
  
  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        const mappedUsers = data.map((user) => {
          let displayName = `${user.first_name || ""} ${user.middle_name || ""
            } ${user.last_name || ""}`.trim();
          if (!displayName) displayName = user.user_name || "";
          return {
            id: user.id,
            name: displayName,
            department_id: user.department_id || null, // 🔹 make sure API gives department_id
          };
        });
        setAllUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=hrms_departments&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setDepartmentOptions(
          data.map((dept) => ({
            id: dept.id,
            name: dept.department || "Unnamed Department",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchComplianceData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=master_compliance&filters[sub_institute_id]=${sessionData.sub_institute_id}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setDataList(data);
      }
    } catch (error) {
      console.error("Error fetching compliance data:", error);
    }
  };
  
  useEffect(() => {
    if (sessionData.url && sessionData.sub_institute_id) {
      fetchComplianceData();
    }
  }, [sessionData.url, sessionData.sub_institute_id]);

  // 🔹 Handle department selection in ADD form
  useEffect(() => {
    if (formData.departmentName) {
      const dept = departmentOptions.find(
        (d) => d.name === formData.departmentName
      );
      if (dept) {
        setUserOptions(allUsers.filter((u) => u.department_id == dept.id));
      } else {
        setUserOptions([]);
      }
    } else {
      setUserOptions([]);
    }
  }, [formData.departmentName, allUsers, departmentOptions]);

  // 🔹 Handle department selection in EDIT form
  useEffect(() => {
    if (editFormData.departmentName) {
      const dept = departmentOptions.find(
        (d) => d.name === editFormData.departmentName
      );
      if (dept) {
        setEditUserOptions(allUsers.filter((u) => u.department_id == dept.id));
      } else {
        setEditUserOptions([]);
      }
    } else {
      setEditUserOptions([]);
    }
  }, [editFormData.departmentName, allUsers, departmentOptions]);

  const handleDeleteClick = async (id) => {
    if (!id) return;

    if (window.confirm("Are you sure you want to delete this Data?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/settings/institute_detail/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&user_id=${sessionData.user_id}&formName=complaince_library`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
            },
          }
        );

        const data = await res.json();
        alert(data.message);
        fetchComplianceData();
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("Error deleting data");
      }
    }
  };
  
  const handleEditClick = (id) => {
    const itemToEdit = dataList.find((item) => item.id === id);
    if (itemToEdit) {
      setEditingId(id);

      // find department object
      const dept = departmentOptions.find(
        (d) => d.name === itemToEdit.standard_name
      );

      setEditFormData({
        id: itemToEdit.id,
        name: itemToEdit.name || "",
        description: itemToEdit.description || "",
        departmentName: dept ? dept.name : "",   // ✅ match dropdown by name
        assignedTo: itemToEdit.assigned_to?.toString() || "", // ✅ match dropdown by id
        dueDate: itemToEdit.duedate || "",
        attachment: null,
      });

      setEditFileName(itemToEdit.attachment || "");
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Check if session data is loaded
    if (!sessionData.url || !sessionData.token) {
      alert('Session data not loaded. Please refresh the page.');
      return;
    }
    try {
      const formPayload = new FormData();
      formPayload.append("type", "API");
      formPayload.append("formName", "complaince_library");
      formPayload.append("user_id", sessionData.user_id);
      formPayload.append("syear", sessionData.syear);
      formPayload.append("sub_institute_id", sessionData.sub_institute_id);
      formPayload.append("name", editFormData.name);
      formPayload.append("description", editFormData.description);
      formPayload.append("standard_name", editFormData.departmentName);
      formPayload.append("assigned_to", editFormData.assignedTo);
      formPayload.append("duedate", editFormData.dueDate);
      if (editFormData.attachment) {
        formPayload.append("attachment", editFormData.attachment);
      }

      const res = await fetch(
        `${sessionData.url}/settings/institute_detail/${editingId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionData.token}`, 'X-HTTP-Method-Override': 'PUT' },
          body: formPayload,
        }
      );

      const result = await res.json();
      alert(result.message || "Data updated successfully");
      setIsEditModalOpen(false);
      setEditingId(null);
      fetchComplianceData();

    } catch (error) {
      console.error("Error updating form:", error);
      alert("An error occurred while updating data.");
    }
  };
  
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'departmentName') {
      // Reset assignedTo when department changes
      setEditFormData((prev) => ({ ...prev, assignedTo: '' }));
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setEditFileName(file?.name || "");
    handleEditChange("attachment", file);
  };

  const handleColumnFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value.toLowerCase(),
    }));
  };

  useEffect(() => {
    // Create a mapping of user IDs to names from allUsers
    const userMap = {};
    allUsers.forEach(user => {
      userMap[user.id] = user.name;
    });

    let withExtras = dataList.map((item, index) => ({
      ...item,
      srno: (index + 1).toString(),
      attachment: item.attachment?.name || item.attachment || "N/A",
      // Use the userMap to get the name for the assigned user
      assigned_to_name: userMap[item.assigned_to] || "N/A",
    }));

    let filtered = [...withExtras];

    // Apply filters only if they have values
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].trim() !== "") {
        filtered = filtered.filter((item) => {
          const val = (item[key] || "").toString().toLowerCase();
          return val.includes(filters[key]);
        });
      }
    });

    setFilteredData(filtered);
  }, [filters, dataList, allUsers]); // Changed dependency to allUsers instead of userOptions

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || "");
    handleChange("attachment", file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionData.url || !sessionData.token) {
      alert('Session data not loaded. Please refresh the page.');
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("type", "API");
      formPayload.append("formName", "complaince_library");
      formPayload.append("user_id", sessionData.user_id);
      formPayload.append("syear", sessionData.syear);
      formPayload.append("sub_institute_id", sessionData.sub_institute_id);
      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description);
      formPayload.append("standard_name", formData.departmentName);
      formPayload.append("assigned_to", formData.assignedTo);
      formPayload.append("duedate", formData.dueDate);
      if (formData.attachment)
        formPayload.append("attachment", formData.attachment);

      const res = await fetch(`${sessionData.url}/settings/institute_detail`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionData.token}` },
        body: formPayload,
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Data submitted successfully");
        setFormData({
          name: "",
          description: "",
          departmentName: "",
          assignedTo: "",
          dueDate: "",
          attachment: null,
        });
        setFileName("");
        fetchComplianceData();
      } else {
        alert(result.message || "Error submitting data");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting data.");
    }
  };

  const exportToCSV = () => {
    // Create a mapping of user IDs to names from allUsers
    const userMap = {};
    allUsers.forEach(user => {
      userMap[user.id] = user.name;
    });
    
    const csv = [
      [
        "Sr No.",
        "Name",
        "Description",
        "Standard Name",
        "Assigned To",
        "Due Date",
        "Attachment",
      ],
      ...dataList.map((item, i) => [
        i + 1,
        item.name,
        item.description,
        item.standard_name || "",
        userMap[item.assigned_to] || "N/A", // Use the userMap here
        item.duedate || "",
        item.attachment?.name || item.attachment || "N/A",
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "submitted-data.csv");
  };

  const columns = [
    {
      name: (
        <div>
          <div>Sr No.</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("srno", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.srno,
      width: "100px",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.name,
      sortable: true
    },
    {
      name: (
        <div>
          <div>Description</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("description", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.description,
      sortable: true
    },
    {
      name: (
        <div>
          <div>Standard Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("standard_name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.standard_name || "",
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Assigned To</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("assigned_to_name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.assigned_to_name || "",
      sortable: true,
    },
    {
      name: (
        <div>
          <div>Due Date</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("duedate", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => row.duedate || "",
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Attachment</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("attachment", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row) => {
        if (row.attachment && row.attachment != '' && row.attachment != 'N/A') {
          return (
            <a
              href={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/compliance_library/${row.attachment}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Attachment
            </a>
          );
        }
        return row.attachment;
      },
      sortable: true,
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => row.id && handleEditClick(row.id)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-pencil"></span>
          </button>
          <button
            onClick={() => row.id && handleDeleteClick(row.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-delete"></span>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  const customStyles = {
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
        border: "1px solid #ddd",
        borderRadius: "20px",
        overflow: "hidden",
      },
    },
  };

  // Determine which data to display
  const displayData = filteredData.length > 0 ? filteredData : dataList;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Add Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg mb-10"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        {/* 🔹 Department dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={formData.departmentName}
            onChange={(e) => handleChange("departmentName", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Department</option>
            {departmentOptions.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned To - filtered by department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select User</option>
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Attachment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachment
          </label>
          <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <span className="text-gray-600 truncate">
              {fileName || "Choose file"}
            </span>
          </label>
        </div>

        <div className="col-span-1 md:col-span-3 flex justify-center">
          <button
            type="submit"
            className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Data Table */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-4 py-4">
          <div className="space-x-4">
            {/* Pagination controls if needed */}
          </div>
          <div className="flex space-x-2">
            <PrintButton
              data={filteredData.length > 0 ? filteredData : dataList}
              title="Incident Reports"
              excludedFields={["id"]}
              buttonText={
                <>
                  <span className="mdi mdi-printer-outline"></span>
                </>
              }
            />
            <ExcelExportButton
              sheets={[{ data: filteredData.length > 0 ? filteredData : dataList, sheetName: "Incident Reports" }]}
              fileName="incident_reports"
              buttonText={
                <>
                  <span className="mdi mdi-file-excel"></span>
                </>
              }
            />
            <PdfExportButton
              data={filteredData.length > 0 ? filteredData : dataList}
              fileName="incident_reports"
              buttonText={
                <>
                  <span className="mdi mdi-file-pdf-box"></span>
                </>
              }
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={displayData}
          customStyles={customStyles}
          pagination
          highlightOnHover
          responsive
          noDataComponent={<div className="p-4 text-center">No data available</div>}
          persistTableHead
        />
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
          <DialogHeader>
            <DialogTitle>Edit Task Assignment</DialogTitle>
          </DialogHeader>
         
          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4"
          >
            {/* Similar inputs as above, with 🔹 department dropdown */}
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Description", name: "description", type: "textarea" },
            ].map(({ label, name, type }) => (
              <div key={name} className={type === "textarea" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                {type === "textarea" ? (
                  <textarea
                    value={editFormData[name]}
                    onChange={(e) => handleEditChange(name, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={editFormData[name]}
                    onChange={(e) => handleEditChange(name, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={editFormData.departmentName}
                onChange={(e) => handleEditChange("departmentName", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Department</option>
                {departmentOptions.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                value={editFormData.assignedTo}
                onChange={(e) => handleEditChange("assignedTo", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select User</option>
                {editUserOptions.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={editFormData.dueDate}
                onChange={(e) => handleEditChange("dueDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachment
              </label>
              <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleEditFileChange}
                />
                <span className="text-gray-600 truncate">
                  {editFileName || "Choose file"}
                </span>
              </label>
              {editFileName && !editFormData.attachment && (
                <p className="text-sm text-gray-500 mt-1">
                  Current file: {editFileName}
                </p>
              )}
            </div>

            <div className="col-span-1 md:col-span-3 flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemConfiguration;

