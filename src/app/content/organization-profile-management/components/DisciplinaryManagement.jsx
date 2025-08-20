// 'use client';

// import React, { useState, useEffect } from 'react';
// import DataTable from 'react-data-table-component';
// import { saveAs } from 'file-saver';

// const SystemConfiguration = () => {
//   const [formData, setFormData] = useState({
//     departmentId: '',
//     employeeId: '',
//     incidentDateTime: '',
//     location: '',
//     misconductType: '',
//     description: '',
//     witnessIds: [],
//     actionTaken: '',
//     remarks: '',
//     attachment: null,
//   });

//   const [dataList, setDataList] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [fileName, setFileName] = useState('');
//   const [userOptions, setUserOptions] = useState([]);
//   const [departmentOptions, setDepartmentOptions] = useState([]);
//   const [sessionData, setSessionData] = useState({});

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const userData = localStorage.getItem('userData');
//       if (userData) {
//         const { APP_URL, token, sub_institute_id, user_id, syear } = JSON.parse(userData);
//         setSessionData({ url: APP_URL, token, sub_institute_id, user_id, syear });
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (sessionData.url && sessionData.token) {
//       fetchUsers();
//       fetchDepartments();
//     }
//   }, [sessionData.url, sessionData.token]);

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch(
//         `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`
//       );
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setUserOptions(
//           data.map((user) => {
//             let displayName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
//             if (!displayName) displayName = user.user_name || '';
//             return { id: user.id, name: displayName };
//           })
//         );
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   const fetchDepartments = async () => {
//   try {
//     const res = await fetch(
//       `${sessionData.url}/table_data?table=hrms_departments&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`
//     );

//     console.log("➡️ API Response status:", res.status);

//     const data = await res.json();
//     console.log("➡️ Department API Raw Data:", data);  // 👈 check raw data

//     if (Array.isArray(data)) {
//       const mapped = data.map((dept) => ({
//         id: dept.id,
//         name: dept.department || "Unnamed",
//       }));

//       console.log("➡️ Mapped Departments:", mapped); // 👈 check mapped data

//       setDepartmentOptions(mapped);
//     } else {
//       console.warn("⚠️ API did not return an array:", data);
//     }
//   } catch (error) {
//     console.error("❌ Error fetching departments:", error);
//   }
// };


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
//       console.error('Error fetching compliance data:', error);
//     }
//   };

//   useEffect(() => {
//     if (sessionData.url && sessionData.sub_institute_id) {
//       fetchComplianceData();
//     }
//   }, [sessionData.url, sessionData.sub_institute_id]);

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
//       attachment: item.attachment?.name || item.attachment || 'N/A',
//     }));

//     let filtered = [...withExtras];

//     Object.keys(filters).forEach((key) => {
//       if (filters[key]) {
//         filtered = filtered.filter((item) => {
//           const val = (item[key] || "").toString().toLowerCase();
//           return val.includes(filters[key]);
//         });
//       }
//     });

//     setFilteredData(filtered);
//   }, [filters, dataList]);

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0] || null;
//     setFileName(file?.name || '');
//     handleChange('attachment', file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formPayload = new FormData();
//       formPayload.append('type', 'API');
//       formPayload.append('formName', 'incident_report');
//       formPayload.append('user_id', sessionData.user_id);
//       formPayload.append('syear', sessionData.syear);
//       formPayload.append('sub_institute_id', sessionData.sub_institute_id);

//       // Append all form fields
//       formPayload.append('department_id', formData.departmentId);
//       formPayload.append('employee_id', formData.employeeId);
//       formPayload.append('incident_datetime', formData.incidentDateTime);
//       formPayload.append('location', formData.location);
//       formPayload.append('misconduct_type', formData.misconductType);
//       formPayload.append('description', formData.description);
//       formPayload.append('witness_ids', formData.witnessIds.join(',')); // send as CSV string
//       formPayload.append('action_taken', formData.actionTaken);
//       formPayload.append('remarks', formData.remarks);
//       if (formData.attachment) formPayload.append('attachment', formData.attachment);

//       const res = await fetch(`${sessionData.url}/settings/institute_detail`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${sessionData.token}` },
//         body: formPayload,
//       });

//       const result = await res.json();
//       if (res.ok) {
//         alert(result.message || 'Data submitted successfully');
//         setFormData({
//           departmentId: '',
//           employeeId: '',
//           incidentDateTime: '',
//           location: '',
//           misconductType: '',
//           description: '',
//           witnessIds: [],
//           actionTaken: '',
//           remarks: '',
//           attachment: null,
//         });
//         setFileName('');
//         fetchComplianceData();
//       } else {
//         alert(result.message || 'Error submitting data');
//       }
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       alert('An error occurred while submitting data.');
//     }
//   };

//   const exportToCSV = () => {
//     const csv = [
//       [
//         'Sr No.', 'Department', 'Employee', 'Incident Date-Time', 'Location', 
//         'Misconduct Type', 'Description', 'Witnesses', 'Action Taken', 'Remarks', 'Attachment'
//       ],
//       ...dataList.map((item, i) => [
//         i + 1,
//         item.department_name || item.departmentId,
//         userOptions.find(u => u.id.toString() === (item.employee_id || item.employeeId)?.toString())?.name || '',
//         item.incident_datetime || '',
//         item.location || '',
//         item.misconduct_type || '',
//         item.description || '',
//         item.witness_ids || '',
//         item.action_taken || '',
//         item.remarks || '',
//         item.attachment?.name || item.attachment || 'N/A',
//       ])
//     ].map(e => e.join(',')).join('\n');

//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     saveAs(blob, 'incident-data.csv');
//   };

//   // Columns for DataTable
//   const columns = [
//     { name: (
//         <div>
//           <div>Sr No.</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.srno, sortable: true },

//     { name: (
//         <div>
//           <div>Department</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.department_name || row.departmentId, sortable: true },

//     { name: (
//         <div>
//           <div>Employee</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => userOptions.find(u => u.id.toString() === (row.employee_id || row.employeeId)?.toString())?.name || '', sortable: true },
//     { name: (
//         <div>
//           <div>Incident Date-Time</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.incident_datetime || '', sortable: true },
//     { name: (
//         <div>
//           <div>Location</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.location || '', sortable: true },
//     { name:(
//         <div>
//           <div>'Misconduct Type</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.misconduct_type || '', sortable: true },
//     { name: (
//         <div>
//           <div>Description</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.description || '', sortable: true },
//     { name: (
//         <div>
//           <div>Witnesses</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.witness_ids || '', sortable: true },
//     { name: (
//         <div>
//           <div>Action Taken</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.action_taken || '', sortable: true },
//     { name: (
//         <div>
//           <div>Remarks</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.remarks || '', sortable: true },
//     { name: (
//         <div>
//           <div>Attachment</div>
//           <input type="text" placeholder="Search..."
//             onChange={(e) => handleColumnFilter("srno", e.target.value)}
//             style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
//         </div>
//       ), selector: row => row.attachment, sortable: true },
//       {
//       name: "Actions", selector: (row) => (
//         <div className="flex space-x-2">
//           <button
//             onClick={() => row.id && handleEditClick(row.id)}
//             className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
//           >
//             <span className="mdi mdi-pencil" data-titleHead="Edit Jobrole"></span>
//           </button>
//           <button
//             onClick={() => row.id && handleDeleteClick(row.id)}
//             className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
//           >
//             <span className="mdi mdi-trash-can" data-titleHead="Delete Jobrole"></span>
//           </button>
//         </div>
//       ),
//       ignoreRowClick: true,
//       button: true,
//       wrap: true,
//     },
//   ];


//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       {/* Form */}
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg">

//         {/* Department */}
//         <select
//   value={formData.departmentId}
//   onChange={(e) => handleChange("departmentId", e.target.value)}
//   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//   required
// >
//   <option value="">Select Department</option>
//   {departmentOptions.map((dept) => (
//     <option key={dept.id} value={dept.id}>
//       {dept.name}
//     </option>
//   ))}
// </select>


//         {/* Employee */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
//           <select
//             value={formData.employeeId}
//             onChange={(e) => handleChange('employeeId', e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//             required
//           >
//             <option value="">Select Employee</option>
//             {userOptions.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
//           </select>
//         </div>

//         {/* Incident Date-Time */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date-Time</label>
//           <input
//             type="datetime-local"
//             value={formData.incidentDateTime}
//             onChange={(e) => handleChange('incidentDateTime', e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//             required
//           />
//         </div>

//         {/* Location */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
//           <input
//             type="text"
//             value={formData.location}
//             onChange={(e) => handleChange('location', e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//             required
//           />
//         </div>

//         {/* Misconduct Type */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Type of Misconduct</label>
//           <select
//             value={formData.misconductType}
//             onChange={(e) => handleChange('misconductType', e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//             required
//           >
//             <option value="">Select Type</option>
//             <option value="Late Arrival">Late Arrival</option>
//             <option value="Absenteeism">Absenteeism</option>
//             <option value="Misbehavior">Misbehavior</option>
//             <option value="Violation of Policy">Violation of Policy</option>
//             <option value="Others">Others</option>
//           </select>
//         </div>

//         {/* Description */}
//         <div className="md:col-span-3">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Description of Incident</label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => handleChange('description', e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//             required
//           />
//         </div>

//         {/* Witnesses */}
//         <div className="md:col-span-3">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Witness Name(s)</label>
//           <select
//             multiple
//             value={formData.witnessIds}
//             onChange={(e) => handleChange('witnessIds', Array.from(e.target.selectedOptions, option => option.value))}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//           >
//             {userOptions.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
//           </select>
//         </div>

//         {/* Action Taken */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
//           <select
//             value={formData.actionTaken}
//             onChange={(e) => handleChange('actionTaken', e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//             required
//           >
//             <option value="">Select Action</option>
//             <option value="Warning">Warning</option>
//             <option value="Suspension">Suspension</option>
//             <option value="Termination">Termination</option>
//             <option value="Counseling">Counseling</option>
//             <option value="Others">Others</option>
//           </select>
//         </div>

//         {/* Remarks */}
//         <div className="md:col-span-3">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
//           <textarea
//             value={formData.remarks}
//             onChange={(e) => handleChange('remarks', e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//           />
//         </div>

//         {/* Attachment */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
//           <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
//             <input type="file" className="hidden" onChange={handleFileChange} />
//             <span className="text-gray-600 truncate">{fileName || 'Choose file'}</span>
//           </label>
//         </div>

//         {/* Submit */}
//         <div className="col-span-1 md:col-span-3 flex justify-center">
//           <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition">
//             Submit
//           </button>
//         </div>
//       </form>

//       {/* Action Buttons */}
//       <div className="my-6 w-full flex justify-end gap-2 mb-4">
//         <button onClick={() => window.print()} className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded hover:bg-blue-700 transition">
//           <span className="mdi mdi-printer text-white text-lg"></span>
//         </button>
//         <button onClick={exportToCSV} className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded hover:bg-blue-700 transition">
//           <span className="mdi mdi-file-excel text-white text-lg"></span>
//         </button>
//       </div>

//       {/* Data Table */}
//       <DataTable
//         columns={columns}
//         data={filteredData.length > 0 ? filteredData : dataList}
//         pagination
//         striped
//         highlightOnHover
//         responsive
//         persistTableHead
//       />
//     </div>
//   );
// };

// export default SystemConfiguration;

'use client';

import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { saveAs } from 'file-saver';

const SystemConfiguration = () => {
  const [formData, setFormData] = useState({
    departmentId: '',
    employeeId: '',
    incidentDateTime: '',
    location: '',
    misconductType: '',
    description: '',
    witnessIds: [],
    actionTaken: '',
    remarks: '',
  });

  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [userOptions, setUserOptions] = useState([]);
  const [witnessOptions, setWitnessOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [sessionData, setSessionData] = useState({});

  // ✅ Load session data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { APP_URL, token, sub_institute_id, user_id, syear } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, user_id, syear });
      }
    }
  }, []);

  // ✅ Fetch departments and witnesses when session ready
  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchDepartments();
      fetchwitness();
    }
  }, [sessionData.url, sessionData.token]);

  // ✅ Fetch departments
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
            name: dept.department || 'Unnamed',
          }))
        );
      }
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
    }
  };

  // ✅ Fetch employees
  const fetchUsers = async (departmentId = '') => {
    try {
      let url = `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`;
      if (departmentId) {
        url += `&filters[department_id]=${departmentId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserOptions(
          data.map((user) => {
            let displayName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
            if (!displayName) displayName = user.user_name || '';
            return { id: user.id, name: displayName };
          })
        );
      } else {
        setUserOptions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUserOptions([]);
    }
  };

  useEffect(() => {
    if (formData.departmentId) {
      fetchUsers(formData.departmentId);
      setFormData((prev) => ({ ...prev, employeeId: '' }));
    } else {
      setUserOptions([]);
      setFormData((prev) => ({ ...prev, employeeId: '' }));
    }
  }, [formData.departmentId]);

  // ✅ Fetch witnesses
  const fetchwitness = async () => {
    try {
      let url = `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setWitnessOptions(
          data.map((user) => {
            let displayName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
            if (!displayName) displayName = user.user_name || '';
            return { id: user.id, name: displayName };
          })
        );
      } else {
        setWitnessOptions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching witnesses:', error);
      setWitnessOptions([]);
    }
  };

  // ✅ Fetch compliance data
  const fetchComplianceData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/settings/discliplinary_management?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`
      );
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setDataList(data.data);
      } else {
        setDataList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching compliance data:', error);
      setDataList([]);
    }
  };

  useEffect(() => {
    if (sessionData.url && sessionData.sub_institute_id) {
      fetchComplianceData();
    }
  }, [sessionData.url, sessionData.sub_institute_id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Delete record
const handleDeleteClick = async (id) => {
  if (!window.confirm("Are you sure you want to delete this record?")) return;

  try {
    const token = localStorage.getItem("token"); // ✅ get token
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    const res = await fetch(
      `${sessionData.url}/settings/discliplinary_management/${id}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ include token
          "Content-Type": "application/json",
        },
      }
    );

     const result = await res.json();
    if (res.ok) {
      alert(result.message || "Record deleted successfully");
      fetchComplianceData(); // refresh table
    } else {
      alert(result.message || "Failed to delete record");
    }
  } catch (error) {
    console.error("❌ Error deleting record:", error);
    alert("An error occurred while deleting the record.");
  }
};


  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      formPayload.append('type', 'API');
      formPayload.append('formName', 'incident_report');
      formPayload.append('user_id', sessionData.user_id); // Reported By
      formPayload.append('syear', sessionData.syear);
      formPayload.append('sub_institute_id', sessionData.sub_institute_id);

      formPayload.append('department_id', formData.departmentId);
      formPayload.append('employee_id', formData.employeeId);
      formPayload.append('incident_datetime', formData.incidentDateTime);
      formPayload.append('location', formData.location);
      formPayload.append('misconduct_type', formData.misconductType);
      formPayload.append('description', formData.description);
      formPayload.append('witness_ids', formData.witnessIds.join(','));
      formPayload.append('action_taken', formData.actionTaken);
      formPayload.append('remarks', formData.remarks);
      formPayload.append('reported_by', sessionData.user_id);
      formPayload.append('date_of_report', new Date().toISOString().slice(0, 19).replace('T', ' '));

      const res = await fetch(`${sessionData.url}/settings/discliplinary_management`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionData.token}` },
        body: formPayload,
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || 'Data submitted successfully');
        setFormData({
          departmentId: '',
          employeeId: '',
          incidentDateTime: '',
          location: '',
          misconductType: '',
          description: '',
          witnessIds: [],
          actionTaken: '',
          remarks: '',
        });
        fetchComplianceData();
      } else {
        alert(result.message || 'Error submitting data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting data.');
    }
  };

  // ✅ DataTable columns
  const columns = [
    { name: 'Sr No.', selector: (row, i) => i + 1, sortable: true },
    { name: 'Department', selector: row => row.department_name || row.departmentId, sortable: true },
    { name: 'Employee', selector: row => row.employee_name || row.employeeId, sortable: true },
    { name: 'Incident Date-Time', selector: row => row.incident_datetime || '', sortable: true },
    { name: 'Location', selector: row => row.location || '', sortable: true },
    { name: 'Misconduct Type', selector: row => row.misconduct_type || '', sortable: true },
    { name: 'Description', selector: row => row.description || '', sortable: true },
    { name: 'Witnesses', selector: row => row.witness_name || '', sortable: true },
    { name: 'Action Taken', selector: row => row.action_taken || '', sortable: true },
    { name: 'Remarks', selector: row => row.remarks || '', sortable: true },
    { name: 'Reported By', selector: row => row.reported_by || row.user_id, sortable: true },
    { name: 'Date of Report', selector: row => row.date_of_report || row.created_date, sortable: true },
    { name: 'Sub Institute ID', selector: row => row.sub_institute_id, sortable: true },
    {
      name: "Actions", selector: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => row.id && handleEditClick(row.id)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-pencil" data-titleHead="Edit Jobrole"></span>
          </button>
          <button
            onClick={() => row.id && handleDeleteClick(row.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
          >
            <span className="mdi mdi-trash-can" data-titleHead="Delete Jobrole"></span>
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
        borderRadius: "20px",
        overflow: "hidden",
      },
    },
    
  };


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg">

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            value={formData.departmentId}
            onChange={(e) => handleChange('departmentId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Department</option>
            {departmentOptions.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Employee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Employee</option>
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        {/* Incident Date-Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date-Time</label>
          <input
            type="datetime-local"
            value={formData.incidentDateTime}
            onChange={(e) => handleChange('incidentDateTime', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Misconduct Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type of Misconduct</label>
          <select
            value={formData.misconductType}
            onChange={(e) => handleChange('misconductType', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Type</option>
            <option value="Late Arrival">Late Arrival</option>
            <option value="Absenteeism">Absenteeism</option>
            <option value="Misbehavior">Misbehavior</option>
            <option value="Violation of Policy">Violation of Policy</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Description */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description of Incident</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Witnesses & Action Taken */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Witnesses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Witnesses</label>
            <select
              multiple
              value={formData.witnessIds}
              onChange={(e) =>
                handleChange('witnessIds', Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {witnessOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Taken */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
            <select
              value={formData.actionTaken}
              onChange={(e) => handleChange('actionTaken', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select Action</option>
              <option value="Warning">Warning</option>
              <option value="Suspension">Suspension</option>
              <option value="Termination">Termination</option>
              <option value="Counseling">Counseling</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {/* Remarks */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <textarea
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Submit */}
        <div className="col-span-1 md:col-span-3 flex justify-center">
          <button type="submit" className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
            Submit
          </button>
        </div>
      </form>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredData.length > 0 ? filteredData : dataList}
         customStyles={customStyles}
        pagination
        striped
        highlightOnHover
        responsive
        persistTableHead
      />
    </div>
  );
};

export default SystemConfiguration;
