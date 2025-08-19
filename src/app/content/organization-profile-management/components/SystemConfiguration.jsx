// 'use client';

// import React, { useState, useEffect } from 'react';
// import DataTable from 'react-data-table-component';
// import { saveAs } from 'file-saver';

// const SystemConfiguration = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     departmentName: '',
//     assignedTo: '',
//     dueDate: '',
//     attachment: null,
//   });

//   const [dataList, setDataList] = useState([]);
//   const [showTable, setShowTable] = useState(false);
//   const [fileName, setFileName] = useState('');
//   const [userOptions, setUserOptions] = useState([]);
//   const [sessionData, setSessionData] = useState({});

//   useEffect(() => {
//   // Fetch user list fruseEffect(() => {
//       if (typeof window !== 'undefined') {
//         const userData = localStorage.getItem('userData');
//         if (userData) {
//           const { APP_URL, token, sub_institute_id,user_id,syear } = JSON.parse(userData);
//           setSessionData({ url: APP_URL, token, sub_institute_id,user_id,syear });
//         }
//       }
//     }, []);

//     useEffect(() => {
//       if (sessionData.url && sessionData.token) {
//         fetchUsers();
//       }
//     }, [sessionData.url, sessionData.token]);
//     // om API (tbluser)
//     const fetchUsers = async () => {
//       try {
//         const res = await fetch(
//           `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`
//         );
//         const data = await res.json();
//         if (Array.isArray(data)) {
//           setUserOptions(
//             data.map((user) => {
//               let displayName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
//               if (!displayName) {
//                 displayName = user.user_name || '';
//               }
//               return {
//                 id: user.id,
//                 name: displayName,
//               };
//             })
//           );
//         }
//       } catch (error) {
//         console.error('Error fetching users:', error);
//       }
//     };


//   // Fetch master_compliance data from API
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

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0] || null;
//     setFileName(file?.name || '');
//     handleChange('attachment', file);
//   };

//   // Submit form to backend API with file upload
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const formPayload = new FormData();
//       formPayload.append('type', 'API');
//       formPayload.append('formName', 'compliance_library');
//       formPayload.append('user_id', sessionData.user_id); // Replace with actual logged-in user ID if needed
//       formPayload.append('syear', sessionData.syear); // Could be dynamic if needed
//       formPayload.append('sub_institute_id', sessionData.sub_institute_id);
//       formPayload.append('name', formData.name);
//       formPayload.append('description', formData.description);
//       formPayload.append('standard_name', formData.departmentName);
//       formPayload.append('assigned_to', formData.assignedTo);
//       formPayload.append('duedate', formData.dueDate);
//       if (formData.attachment) {
//         formPayload.append('attachment', formData.attachment);
//       }

//       // const res = await fetch(`${sessionData.url}/settings/institute_detail`, {
//       //   method: 'POST',
//       //   // headers: {
//       //   //   'Accept': 'application/json',
//       //   //   'Content-Type': 'application/json', // Not needed for FormData
//       //   // },
//       //   body: formPayload,
//       // });
//       const res = await fetch(`${sessionData.url}/settings/institute_detail`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${sessionData.token}` },
//         body: formPayload,
//       });

//       const result = await res.json();
//       console.log('API Response:', result);

//       if (res.ok) {
//         alert(result.message || 'Data submitted successfully');
//         setFormData({
//           name: '',
//           description: '',
//           departmentName: '',
//           assignedTo: '',
//           dueDate: '',
//           attachment: null,
//         });
//         setFileName('');
//       } else {
//         alert('Error submitting data');
//       }
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       alert('An error occurred while submitting data.');
//     }
//   };

//   const exportToCSV = () => {
//     const csv = [
//       ['Sr No.', 'Name', 'Description', 'Standard Name', 'Assigned To', 'Due Date', 'Attachment'],
//       ...dataList.map((item, i) => [
//         i + 1,
//         item.name,
//         item.description,
//         item.department_name || item.departmentName,
//         userOptions.find((u) => u.id.toString() === (item.assigned_to || item.assignedTo)?.toString())?.name || '',
//         item.due_date || item.dueDate,
//         item.attachment?.name || item.attachment || 'N/A',
//       ]),
//     ]
//       .map((e) => e.join(','))
//       .join('\n');

//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     saveAs(blob, 'submitted-data.csv');
//   };

//   const columns = [
//     { name: 'Sr No.', selector: (_, index) => index + 1, width: '80px', sortable: true },
//     { name: 'Name', selector: (row) => row.name, sortable: true },
//     { name: 'Description', selector: (row) => row.description, sortable: true },
//     { name: 'Standard Name', selector: (row) => row.department_name || row.departmentName, sortable: true },
//     {
//       name: 'Assigned To',
//       selector: (row) =>
//         userOptions.find((u) => u.id.toString() === (row.assigned_to || row.assignedTo)?.toString())?.name || '',
//       sortable: true,
//     },
//     { name: 'Due Date', selector: (row) => row.due_date || row.dueDate, sortable: true },
//     { name: 'Attachment', selector: (row) => row.attachment?.name || row.attachment || 'N/A' },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       <form
//         onSubmit={handleSubmit}
//         className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg"
//       >
//         {[
//           { label: 'Name', name: 'name', type: 'text' },
//           { label: 'Description', name: 'description', type: 'textarea' },
//           { label: 'Department Name', name: 'departmentName', type: 'text' },
//         ].map(({ label, name, type }) => (
//           <div key={name}>
//             <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//             {type === 'textarea' ? (
//               <textarea
//                 value={formData[name]}
//                 onChange={(e) => handleChange(name, e.target.value)}
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//                 required
//               />
//             ) : (
//               <input
//                 type="text"
//                 value={formData[name]}
//                 onChange={(e) => handleChange(name, e.target.value)}
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//                 required
//               />
//             )}
//           </div>
//         ))}

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
//           <select
//             value={formData.assignedTo}
//             onChange={(e) => handleChange('assignedTo', e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
//           <input
//             type="date"
//             value={formData.dueDate}
//             onChange={(e) => handleChange('dueDate', e.target.value)}
//             className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
//           <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
//             <input type="file" className="hidden" onChange={handleFileChange} />
//             <span className="text-gray-600 truncate">{fileName || 'Choose file'}</span>
//           </label>
//         </div>

//         <div className="col-span-1 md:col-span-3 flex justify-center">
//           <button
//             type="submit"
//             className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
//           >
//             Submit
//           </button>
//         </div>
//       </form>

//       <div className="my-6 flex flex-wrap gap-4">
//         <button
//           onClick={() => {
//             fetchComplianceData();
//             setShowTable((prev) => !prev);
//           }}
//           className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded border border-cyan-300 hover:bg-cyan-200"
//         >
//           View Added Data
//         </button>
//         {showTable && (
//           <>
//             <button
//               onClick={exportToCSV}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Export CSV
//             </button>
//             <button
//               onClick={() => window.print()}
//               className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
//             >
//               Print
//             </button>
//           </>
//         )}
//       </div>

//       {showTable && (
//         <DataTable
//           columns={columns}
//           data={dataList}
//           pagination
//           striped
//           highlightOnHover
//           responsive
//         />
//       )}
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
    name: '',
    description: '',
    departmentName: '',
    assignedTo: '',
    dueDate: '',
    attachment: null,
  });

  const [dataList, setDataList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [fileName, setFileName] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const [sessionData, setSessionData] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { APP_URL, token, sub_institute_id, user_id, syear } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, user_id, syear });
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchUsers();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserOptions(
          data.map((user) => {
            let displayName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
            if (!displayName) displayName = user.user_name || '';
            return { id: user.id, name: displayName };
          })
        );
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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
      console.error('Error fetching compliance data:', error);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!id) return;

    if (window.confirm("Are you sure you want to delete this Data?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/settings/institute_detail/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}&formName=complaince_library`,
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
        alert("Error deleting data:", error);
      }
    }
  }

  useEffect(() => {
    if (sessionData.url && sessionData.sub_institute_id) {
      fetchComplianceData();
    }
  }, [sessionData.url, sessionData.sub_institute_id]);

  // 🔹 Handle search filters
  const handleColumnFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value.toLowerCase(),
    }));
  };

  useEffect(() => {
    // Add srno + normalize attachment for search
    let withExtras = dataList.map((item, index) => ({
      ...item,
      srno: (index + 1).toString(),
      attachment: item.attachment?.name || item.attachment || 'N/A',
    }));

    let filtered = [...withExtras];

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filtered = filtered.filter((item) => {
          const val = (item[key] || "").toString().toLowerCase();
          return val.includes(filters[key]);
        });
      }
    });

    setFilteredData(filtered);
  }, [filters, dataList]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || '');
    handleChange('attachment', file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      formPayload.append('type', 'API');
      formPayload.append('formName', 'complaince_library');
      formPayload.append('user_id', sessionData.user_id);
      formPayload.append('syear', sessionData.syear);
      formPayload.append('sub_institute_id', sessionData.sub_institute_id);
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('standard_name', formData.departmentName);
      formPayload.append('assigned_to', formData.assignedTo);
      formPayload.append('duedate', formData.dueDate);
      if (formData.attachment) formPayload.append('attachment', formData.attachment);

      const res = await fetch(`${sessionData.url}/settings/institute_detail`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionData.token}` },
        body: formPayload,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Something went wrong');
        alert(result.message || 'Something went wrong');
      } else {
        alert(result.message || 'Something went wrong');
        console.log('API Response:', result);
        setFormData({ name: '', description: '', departmentName: '', assignedTo: '', dueDate: '', attachment: null });
        setFileName('');
        fetchComplianceData();
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting data.');
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Sr No.', 'Name', 'Description', 'Standard Name', 'Assigned To', 'Due Date', 'Attachment'],
      ...dataList.map((item, i) => [
        i + 1,
        item.name,
        item.description,
        item.department_name || item.departmentName,
        userOptions.find((u) => u.id.toString() === (item.assigned_to || item.assignedTo)?.toString())?.name || '',
        item.due_date || item.dueDate,
        item.attachment?.name || item.attachment || 'N/A',
      ]),
    ]
      .map((e) => e.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'submitted-data.csv');
  };

  // 🔹 Table columns with search inputs
  const columns = [
    {
      name: (
        <div>
          <div>Sr No.</div>
          <input type="text" placeholder="Search..."
            onChange={(e) => handleColumnFilter("srno", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
        </div>
      ),
      selector: (row) => row.srno,
      width: '100px',
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Name</div>
          <input type="text" placeholder="Search..."
            onChange={(e) => handleColumnFilter("name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
        </div>
      ),
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Description</div>
          <input type="text" placeholder="Search..."
            onChange={(e) => handleColumnFilter("description", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
        </div>
      ),
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Standard Name</div>
          <input type="text" placeholder="Search..."
            onChange={(e) => handleColumnFilter("department_name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
        </div>
      ),
      selector: (row) => row.department_name || row.departmentName,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Assigned To</div>
          <input type="text" placeholder="Search..."
            onChange={(e) => handleColumnFilter("assigned_to", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
        </div>
      ),
      selector: (row) =>
        userOptions.find((u) => u.id.toString() === (row.assigned_to || row.assignedTo)?.toString())?.name || '',
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Due Date</div>
          <input type="text" placeholder="Search..."
            onChange={(e) => handleColumnFilter("due_date", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
        </div>
      ),
      selector: (row) => row.due_date || row.dueDate,
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div>
          <div>Attachment</div>
          <input type="text" placeholder="Search..."
            onChange={(e) => handleColumnFilter("attachment", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }} />
        </div>
      ),
      selector: (row) => row.attachment,
      sortable: true,
      wrap: true,
    },
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
      wrap: true,
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
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg mb-10">
        {[
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Description', name: 'description', type: 'textarea' },
          { label: 'Department Name', name: 'departmentName', type: 'text' },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {type === 'textarea' ? (
              <textarea
                value={formData[name]}
                onChange={(e) => handleChange(name, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            ) : (
              <input
                type="text"
                value={formData[name]}
                onChange={(e) => handleChange(name, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            )}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select
            value={formData.assignedTo}
            onChange={(e) => handleChange('assignedTo', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
          <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <span className="text-gray-600 truncate">{fileName || 'Choose file'}</span>
          </label>
        </div>

        <div className="col-span-1 md:col-span-3 flex justify-center">
          <button type="submit" className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60">
            Submit
          </button>
        </div>
      </form>

      {/* Action Buttons */}
      {/* <div className="my-6 w-full flex justify-end gap-2 mb-4">
        <button onClick={() => window.print()} className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded hover:bg-blue-700 transition">
          <span className="mdi mdi-printer text-white text-lg"></span>
        </button>
        <button onClick={exportToCSV} className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded hover:bg-blue-700 transition">
          <span className="mdi mdi-file-excel text-white text-lg"></span>
        </button>
        <button onClick={exportToCSV} className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded hover:bg-blue-700 transition">
          <span className="text-white font-bold">PDF</span>
        </button>
      </div> */}

      <DataTable
        columns={columns}
        data={(filteredData.length > 0 ? filteredData : dataList).length > 0
          ? (filteredData.length > 0 ? filteredData : dataList)
          : [{}]}  // 👈 blank row show
        customStyles={customStyles}
        pagination
        striped
        highlightOnHover
        responsive
        noDataComponent={null}  // 👈 remove default "No records"
        persistTableHead        // 👈 keep headers always
      />

    </div>
  );
};

export default SystemConfiguration; 