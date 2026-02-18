'use client';

import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { saveAs } from 'file-saver';
import Icon from '@/components/AppIcon';
import Button from "@/components/taskComponent/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from 'next/dynamic';

const ExcelExportButton = dynamic(
  () => import('@/components/exportButtons/excelExportButton').then(mod => mod.ExcelExportButton),
  { ssr: false }
);

const PdfExportButton = dynamic(
  () => import('@/components/exportButtons/PdfExportButton').then(mod => mod.PdfExportButton),
  { ssr: false }
);

const PrintButton = dynamic(
  () => import('@/components/exportButtons/printExportButton').then(mod => mod.PrintButton),
  { ssr: false }
);

const SystemConfiguration = () => {
  const [formData, setFormData] = useState({
    departmentId: '',
    employeeId: '',
    incidentDateTime: '',
    location: '',
    misconductType: '',
    description: '',
    witnessIds: '',
    actionTaken: '',
    remarks: '',
  });
  const [editFormData, setEditFormData] = useState({
    departmentId: '',
    employeeId: '',
    incidentDateTime: '',
    location: '',
    misconductType: '',
    description: '',
    witnessIds: '',
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editUserOptions, setEditUserOptions] = useState([]);

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
  // const fetchDepartments = async () => {
  //   try {
  //     const res = await fetch(
  //       `${sessionData.url}/table_data?table=hrms_departments&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`
  //     );
  //     const data = await res.json();
  //     if (Array.isArray(data)) {
  //       setDepartmentOptions(
  //         data.map((dept) => ({
  //           id: dept.id,
  //           name: dept.department || 'Unnamed',
  //         }))
  //       );
  //     }
  //   } catch (error) {
  //     console.error('❌ Error fetching departments:', error);
  //   }
  // };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.sub_institute_id}`
      );

      const json = await res.json();

      console.log("Fetched departments:", json);

      if (json.status && json.data && typeof json.data === "object") {

        // Convert department_name → id mapping
        const departmentList = Object.keys(json.data)
          .map((deptName) => {
            const deptArr = json.data[deptName];

            if (Array.isArray(deptArr) && deptArr.length > 0) {
              return {
                id: deptArr[0].department_id,   // ✔ Correct department ID
                name: deptArr[0].department_name, // ✔ Correct department name
              };
            }
            return null;
          })
          .filter(Boolean);

        setDepartmentOptions(departmentList);
      } else {
        setDepartmentOptions([]);
      }
    } catch (error) {
      console.error("❌ Error fetching departments:", error);
      setDepartmentOptions([]);
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

  // ✅ Fetch employees for edit form
  const fetchEditUsers = async (departmentId = '') => {
    try {
      let url = `${sessionData.url}/table_data?table=tbluser&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`;
      if (departmentId) {
        url += `&filters[department_id]=${departmentId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEditUserOptions(
          data.map((user) => {
            let displayName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
            if (!displayName) displayName = user.user_name || '';
            return { id: user.id, name: displayName };
          })
        );
      } else {
        setEditUserOptions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching users for edit:', error);
      setEditUserOptions([]);
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
    if (!id) return;

    if (window.confirm("Are you sure you want to delete this Data?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/settings/discliplinary_management/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`,
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

  // ✅ Edit record
  const handleEditClick = (id) => {
    const itemToEdit = dataList.find((item) => item.id === id);
    if (itemToEdit) {
      setEditingId(id);
      setEditFormData({
        departmentId: itemToEdit.department_id || itemToEdit.departmentId || "",
        employeeId: itemToEdit.employee_id || itemToEdit.employeeId || "",
        incidentDateTime: itemToEdit.incident_datetime || itemToEdit.incidentDateTime || "",
        location: itemToEdit.location || "",
        misconductType: itemToEdit.misconduct_type || itemToEdit.misconductType || "",
        description: itemToEdit.description || "",
        witnessIds: itemToEdit.witness_id || itemToEdit.witness_id || "",
        actionTaken: itemToEdit.action_taken || itemToEdit.actionTaken || "",
        remarks: itemToEdit.remarks || "",
      });

      // Fetch users for the department in edit form
      if (itemToEdit.department_id || itemToEdit.departmentId) {
        fetchEditUsers(itemToEdit.department_id || itemToEdit.departmentId);
      }

      setIsEditModalOpen(true);
    }
  };

  // ✅ Update record
  const handleUpdate = async (e) => {
    e.preventDefault();

    // Check if session data is loaded
    if (!sessionData.url || !sessionData.token) {
      alert('Session data not loaded. Please refresh the page.');
      return;
    }

    try {
      const payload = {
        type: "API",
        token: sessionData.token,
        sub_institute_id: sessionData.sub_institute_id,
        department_id: editFormData.departmentId,
        employee_id: editFormData.employeeId,
        incident_datetime: editFormData.incidentDateTime,
        location: editFormData.location,
        misconduct_type: editFormData.misconductType,
        description: editFormData.description,
        witness_id: editFormData.witnessIds,
        action_taken: editFormData.actionTaken,
        remarks: editFormData.remarks
      };

      console.log('Updating payload:', payload); // Debug log

      const res = await fetch(
        `${sessionData.url}/settings/discliplinary_management/${editingId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      console.log('Update API response:', result); // Debug log

      alert(result.message || "Data updated successfully");
      setIsEditModalOpen(false);
      setEditingId(null);
      fetchComplianceData();
    } catch (error) {
      console.error("Error updating form:", error);
      alert("An error occurred while updating data.");
    }
  };

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));

    // If department changes, fetch employees for that department
    if (field === 'departmentId') {
      fetchEditUsers(value);
      setEditFormData((prev) => ({ ...prev, employeeId: '' }));
    }
  };

  const handleColumnFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value.toLowerCase(),
    }));
  };

  useEffect(() => {
    let withExtras = dataList.map((item, index) => ({
      ...item,
      srno: (index + 1).toString(),
      attachment: item.attachment?.name || item.attachment || "N/A",
      assigned_to_name: userOptions.find(
        (u) => u.id.toString() === (item.assigned_to || "")?.toString()
      )?.name || "",
    }));

    let filtered = [...withExtras];

    // Apply filters only if they have values
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].trim() !== "") {
        filtered = filtered.filter((item) => {
          // Handle different field names in the data
          let val = "";
          if (key === "srno") {
            val = item.srno || "";
          } else if (key === "department_name") {
            val = item.department_name || item.department_id || "";
          } else if (key === "employee_name") {
            val = item.employee_name || item.employee_id || "";
          } else if (key === "witness_name") {
            val = item.witness_name || item.witness_id || "";
          } else if (key === "reported_by") {
            val = item.reported_by_name || item.user_id || "";
          } else if (key === "date_of_report") {
            val = item.date_of_report || item.created_date || "";
          } else {
            val = (item[key] || "").toString();
          }

          return val.toString().toLowerCase().includes(filters[key]);
        });
      }
    });

    setFilteredData(filtered);
  }, [filters, dataList, userOptions]);

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if session data is loaded
    if (!sessionData.url || !sessionData.token) {
      alert('Session data not loaded. Please refresh the page.');
      return;
    }

    try {
      // Create a regular object instead of FormData
      const payload = {
        type: 'API',
        token: sessionData.token,
        user_id: sessionData.user_id,
        sub_institute_id: sessionData.sub_institute_id,
        department_id: formData.departmentId,
        employee_id: formData.employeeId,
        incident_datetime: formData.incidentDateTime,
        location: formData.location,
        misconduct_type: formData.misconductType,
        description: formData.description,
        witness_id: formData.witnessIds,
        action_taken: formData.actionTaken,
        remarks: formData.remarks,
        reported_by: sessionData.user_id,
        date_of_report: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      console.log('Submitting payload:', payload); // Debug log

      const res = await fetch(`${sessionData.url}/settings/discliplinary_management`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log('API response:', result); // Debug log

      if (res.ok) {
        alert(result.message || 'Data submitted successfully');
        setFormData({
          departmentId: '',
          employeeId: '',
          incidentDateTime: '',
          location: '',
          misconductType: '',
          description: '',
          witnessIds: '',
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
      selector: (row, i) => i + 1,
      sortable: true
    },
    {
      name: (
        <div>
          <div>Department</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("department_name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.department_name || row.department_id || "",
      sortable: true
    },
    {
      name: (
        <div>
          <div>Employee</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("employee_name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.employee_name || row.employee_id || "",
      sortable: true
    },
    {
      name: (
        <div>
          <div>Incident Date-Time</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("incident_datetime", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.incident_datetime || '',
      sortable: true
    },
    {
      name: (
        <div>
          <div>Location</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("location", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.location || '',
      sortable: true
    },
    {
      name: (
        <div>
          <div>Misconduct Type</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("misconduct_type", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.misconduct_type || '',
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
      selector: row => row.description || '',
      sortable: true
    },
    {
      name: (
        <div>
          <div>Witnesses</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("witness_name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.witness_name || row.witness_id || '',
      sortable: true
    },
    {
      name: (
        <div>
          <div>Action Taken</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("action_taken", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.action_taken || '',
      sortable: true
    },
    {
      name: (
        <div>
          <div>Remarks</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("remarks", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.remarks || '',
      sortable: true
    },
    {
      name: (
        <div>
          <div>Reported By Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("reported_by", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.reported_by_name || row.user_id,
      sortable: true
    },
    {
      name: (
        <div>
          <div>Date of Report</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("date_of_report", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: row => row.date_of_report || row.created_date || '',
      sortable: true
    },
    // {
    //   name: (
    //     <div>
    //       <div>Sub Institute ID</div>
    //       <input
    //         type="text"
    //         placeholder="Search..."
    //         onChange={(e) => handleColumnFilter("sub_institute_id", e.target.value)}
    //         style={{ width: "100%", padding: "4px", fontSize: "12px" }}
    //       />
    //     </div>
    //   ),
    //   selector: row => row.sub_institute_id,
    //   sortable: true
    // },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => row.id && handleEditClick(row.id)}
            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-2 px-2 rounded"
          >

            <Icon name="Edit" size={14} />
          </button>
          <button
            onClick={() => row.id && handleDeleteClick(row.id)}
            className="bg-red-500 hover:bg-red-700 text-white text-xs py-2 px-2 rounded"
          >

            <Icon name="Trash2" size={14} />
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

  // Create maps for display names
  const departmentMap = {};
  departmentOptions.forEach(dept => {
    departmentMap[dept.id] = dept.name;
  });

  const userMap = {};
  [...userOptions, ...witnessOptions].forEach(user => {
    userMap[user.id] = user.name;
  });

  const displayData = filteredData.length > 0 ? filteredData : dataList;

  // Create formatted data for print and export with display names
  const formattedData = displayData.map((row, index) => ({
    "Sr No.": index + 1,
    "Department": departmentMap[row.department_id] || row.department_name || "",
    "Employee": userMap[row.employee_id] || row.employee_name || "",
    "Incident Date-Time": row.incident_datetime || "",
    "Location": row.location || "",
    "Misconduct Type": row.misconduct_type || "",
    "Description": row.description || "",
    "Witnesses": userMap[row.witness_id] || row.witness_name || "",
    "Action Taken": row.action_taken || "",
    "Remarks": row.remarks || "",
    "Reported By Name": userMap[row.user_id] || row.reported_by_name || "",
    "Date of Report": row.date_of_report || row.created_date || "",
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg">

        {/* Department */}

        <div id="disciplinary-department">
          <label className="block text-sm font-medium text-gray-700 mb-1">Department{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <Select
            value={formData.departmentId}
            onValueChange={(val) => handleChange("departmentId", val)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>

            <SelectContent className="max-h-60 max-w-85">
              {departmentOptions.map((dept) => (
                <SelectItem
                  key={dept.id}
                  value={String(dept.id)}
                >
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        {/* Employee */}
        <div id="disciplinary-employee">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <Select
            value={formData.employeeId}
            onValueChange={(val) => handleChange("employeeId", val)}
            required
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {userOptions.map((user) => (
                <SelectItem
                  key={user.id}
                  value={String(user.id)}
                >
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Incident Date-Time */}
        <div id="disciplinary-datetime">
          <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date-Time{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <input
            type="datetime-local"
            value={formData.incidentDateTime}
            onChange={(e) => handleChange('incidentDateTime', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Location */}
        <div id="disciplinary-location">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Misconduct Type */}
        <div id="disciplinary-misconduct">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type of Misconduct{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <Select
            value={formData.misconductType}
            onValueChange={(val) => handleChange("misconductType", val)}
            required
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="Late Arrival">Late Arrival</SelectItem>
              <SelectItem value="Absenteeism">Absenteeism</SelectItem>
              <SelectItem value="Misbehavior">Misbehavior</SelectItem>
              <SelectItem value="Violation of Policy">Violation of Policy</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="md:col-span-3" id="disciplinary-description">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description of Incident{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
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
          <div id="disciplinary-witness">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Witness
            </label>
            <Select
              value={formData.witnessIds}
              onValueChange={(val) => handleChange("witnessIds", val)}
            >
              <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
                <SelectValue placeholder="Select Witness" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {witnessOptions.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={String(user.id)}
                  >
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          {/* Action Taken */}
          <div id="disciplinary-action">
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken{" "}
              <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
            <Select
              value={formData.actionTaken}
              onValueChange={(val) => handleChange("actionTaken", val)}
              required
            >
              <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
                <SelectValue placeholder="Select Action" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Suspension">Suspension</SelectItem>
                <SelectItem value="Termination">Termination</SelectItem>
                <SelectItem value="Counseling">Counseling</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Remarks */}
        <div className="md:col-span-3" id="disciplinary-remarks">
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <textarea
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Submit */}
        <div className="col-span-1 md:col-span-3 flex justify-center" id="disciplinary-submit-btn">
          <button type="submit" className="px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
            Submit
          </button>
        </div>
      </form>

      {/* Data Table */}
      <div className="mt-2 w-full overflow-hidden" id="disciplinary-data-table">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 py-4 gap-4 w-full">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Pagination controls if needed */}
          </div>
          <div className="flex items-center gap-2 flex-nowrap flex-shrink-0" id="disciplinary-export-buttons">
            <PrintButton
              data={formattedData}
              title="Incident Reports"
              excludedFields={["id"]}
              buttonText={
                <>
                  <span className="mdi mdi-printer-outline"></span>
                </>
              }
            />
            <ExcelExportButton
              sheets={[{ data: formattedData, sheetName: "Incident Reports" }]}
              fileName="incident_reports"
              buttonText={
                <>
                  <span className="mdi mdi-file-excel"></span>
                </>
              }
            />
            <PdfExportButton
              data={formattedData}
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
          data={filteredData.length > 0 ? filteredData : dataList}
          customStyles={customStyles}
          pagination
          highlightOnHover
          responsive
          noDataComponent={<div className="p-4 text-center">No data available</div>}
          persistTableHead
        />
      </div>

      {/* Edit Dialog - Now matches the original form structure */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
          <DialogHeader>
            <DialogTitle>Edit Incident Report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 p-4">
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <Select
                value={editFormData.departmentId}
                onValueChange={(val) => handleEditChange("departmentId", val)}
                required
              >
                <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {departmentOptions.map((dept) => (
                    <SelectItem
                      key={dept.id}
                      value={String(dept.id)}
                    >
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <Select
                value={editFormData.employeeId}
                onValueChange={(val) => handleEditChange("employeeId", val)}
                required
              >
                <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {editUserOptions.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={String(user.id)}
                    >
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Incident Date-Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date-Time{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <input
                type="datetime-local"
                value={editFormData.incidentDateTime}
                onChange={(e) => handleEditChange('incidentDateTime', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <input
                type="text"
                value={editFormData.location}
                onChange={(e) => handleEditChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Misconduct Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type of Misconduct{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <Select
                value={editFormData.misconductType}
                onValueChange={(val) => handleEditChange("misconductType", val)}
                required
              >
                <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="Late Arrival">Late Arrival</SelectItem>
                  <SelectItem value="Absenteeism">Absenteeism</SelectItem>
                  <SelectItem value="Misbehavior">Misbehavior</SelectItem>
                  <SelectItem value="Violation of Policy">Violation of Policy</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description of Incident{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <textarea
                value={editFormData.description}
                onChange={(e) => handleEditChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Witnesses & Action Taken */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Witness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Witness{" "}
                  <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                <Select
                  value={editFormData.witnessIds}
                  onValueChange={(val) => handleEditChange("witnessIds", val)}
                  required
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <SelectValue placeholder="Select Witness" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {witnessOptions.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={String(user.id)}
                      >
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Taken */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken{" "}
                  <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
                <Select
                  value={editFormData.actionTaken}
                  onValueChange={(val) => handleEditChange("actionTaken", val)}
                  required
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <SelectValue placeholder="Select Action" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                    <SelectItem value="Termination">Termination</SelectItem>
                    <SelectItem value="Counseling">Counseling</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Remarks */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                value={editFormData.remarks}
                onChange={(e) => handleEditChange('remarks', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="col-span-1 md:col-span-3 flex justify-center space-x-4">
              <Button
                class="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 shadow-md disabled:opacity-60"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                class="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
              >
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemConfiguration;