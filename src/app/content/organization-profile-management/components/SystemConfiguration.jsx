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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import Icon from '@/components/AppIcon';


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
    frequency: "",
    customFrequency: "",
    attachment: null,
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    description: "",
    departmentName: "",
    assignedTo: "",
    dueDate: "",
    frequency: "",
    customFrequency: "",
    attachment: null,
  });

  const [dataList, setDataList] = useState([]);
  const [filters, setFilters] = useState({});
  const [fileName, setFileName] = useState("");
  const [editFileName, setEditFileName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [editUserOptions, setEditUserOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
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
      fetchDepartments();
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
          let displayName = `${user.first_name || ""} ${user.middle_name || ""} ${user.last_name || ""
            }`.trim();
          if (!displayName) displayName = user.user_name || "";
          return {
            id: user.id,
            name: displayName,
            department_id: user.department_id || null,
          };
        });
        setAllUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

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
  //           name: dept.department || "Unnamed Department",
  //         }))
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching departments:", error);
  //   }
  // };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.sub_institute_id}`
      );

      const json = await res.json();

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

  // Filter data based on all active filters
  const filteredData = dataList.filter((item, index) => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;

      // Handle serial number search
      if (key === 'srno') {
        const serialNumber = index + 1;
        return serialNumber.toString().toLowerCase().includes(filterValue.toLowerCase());
      }

      // Handle other columns
      const cellValue = item[key] ? item[key].toString().toLowerCase() : '';
      return cellValue.includes(filterValue.toLowerCase());
    });
  });

  useEffect(() => {
    if (sessionData.url && sessionData.sub_institute_id) {
      fetchComplianceData();
    }
  }, [sessionData.url, sessionData.sub_institute_id]);

  // Department-based filtering
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
            headers: { Authorization: `Bearer ${sessionData.token}` },
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

      const dept = departmentOptions.find(
        (d) => d.name === itemToEdit.standard_name
      );

      setEditFormData({
        id: itemToEdit.id,
        name: itemToEdit.name || "",
        description: itemToEdit.description || "",
        departmentName: dept ? dept.name : "",
        assignedTo: itemToEdit.assigned_to?.toString() || "",
        dueDate: itemToEdit.duedate || "",
        frequency: itemToEdit.frequency || "",
        customFrequency: itemToEdit.custom_frequency_details || "",
        attachment: null,
      });

      setEditFileName(itemToEdit.attachment || "");
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!sessionData.url || !sessionData.token) {
      alert("Session data not loaded. Please refresh the page.");
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
      formPayload.append("frequency", editFormData.frequency);

      if (editFormData.frequency === "Custom") {
        formPayload.append(
          "custom_frequency_details",
          editFormData.customFrequency
        );
      }

      if (editFormData.attachment) {
        formPayload.append("attachment", editFormData.attachment);
      }

      const res = await fetch(
        `${sessionData.url}/settings/institute_detail/${editingId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
            "X-HTTP-Method-Override": "PUT",
          },
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
    if (field === "departmentName") {
      setEditFormData((prev) => ({ ...prev, assignedTo: "" }));
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setEditFileName(file?.name || "");
    handleEditChange("attachment", file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || "");
    handleChange("attachment", file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionData.url || !sessionData.token) {
      alert("Session data not loaded. Please refresh the page.");
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
      formPayload.append("frequency", formData.frequency);

      if (formData.frequency === "Custom") {
        formPayload.append("custom_frequency_details", formData.customFrequency);
      }

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
          frequency: "",
          customFrequency: "",
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

  const handleColumnFilter = (columnKey, value) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  const exportToCSV = () => {
    // Create a user map for easier lookup
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
        "Frequency",
        "Custom Frequency Details",
        "Attachment",
      ],
      ...dataList.map((item, i) => [
        i + 1,
        item.name,
        item.description,
        item.standard_name || "",
        userMap[item.assigned_to] || "N/A",
        item.duedate || "",
        item.frequency || "",
        item.custom_frequency_details || "",
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
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row, index) => index + 1,
      sortable: true,
      width: "120px"
    },
    {
      name: (
        <div>
          <div>Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("name", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: row => row.name,
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
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
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
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row) => row.standard_name || "",
      sortable: true,
      wrap: true
    },
    {
      name: (
        <div>
          <div>Assigned To</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("assigned_to", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row) => {
        // Create a user map for easier lookup
        const userMap = {};
        allUsers.forEach(user => {
          userMap[user.id] = user.name;
        });
        return userMap[row.assigned_to] || "N/A";
      },
      sortable: true
    },
    {
      name: (
        <div>
          <div>Due Date</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("duedate", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row) => row.duedate || "",
      sortable: true,
      wrap: true
    },
    {
      name: (
        <div>
          <div>Frequency</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("frequency", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row) => row.frequency || "",
      sortable: true
    },
    {
      name: (
        <div>
          <div>Attachment</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("attachment", e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              fontSize: "12px",

              marginTop: "5px"
            }}
          />
        </div>
      ),
      selector: (row) => {
        if (row.attachment && row.attachment !== "" && row.attachment !== "N/A") {
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
      wrap: true
    },
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
    cells: { style: { fontSize: "13px", textAlign: "left" } },
    table: {
      style: { border: "1px solid #ddd", borderRadius: "20px", overflow: "hidden" },
    },
  };

  const displayData = filteredData.length > 0 ? filteredData : dataList;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Add Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg mb-10"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
          </label>
          <Select
            value={formData.departmentName}
            onValueChange={(value) => handleChange("departmentName", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent
             className="max-h-60 w-73"
            >
              {departmentOptions.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <select
            value={formData.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Employee </option>
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency{" "}
            <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
          <select
            value={formData.frequency}
            onChange={(e) => handleChange("frequency", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Frequency</option>
            {["One-Time", "Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"].map(
              (opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              )
            )}
          </select>
        </div>

        {formData.frequency === "Custom" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Frequency Date{" "}
              <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
            </label>
            <input
              type="date"
              value={formData.customFrequency}
              onChange={(e) => handleChange("customFrequency", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
          <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <span className="text-gray-600 truncate">{fileName || "Choose file"}</span>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
              </label>
              <textarea
                value={editFormData.description}
                onChange={(e) => handleEditChange("description", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <input
                type="date"
                value={editFormData.dueDate}
                onChange={(e) => handleEditChange("dueDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency{" "}
                <span className="mdi mdi-asterisk text-[10px] text-danger"></span></label>
              <select
                value={editFormData.frequency}
                onChange={(e) => handleEditChange("frequency", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Frequency</option>
                {["One-Time", "Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"].map(
                  (opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  )
                )}
              </select>
            </div>

            {editFormData.frequency === "Custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Frequency Date{" "}
                  <span className="mdi mdi-asterisk text-[10px] text-danger"></span>
                </label>
                <input
                  type="date"
                  value={editFormData.customFrequency}
                  onChange={(e) => handleEditChange("customFrequency", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
              <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
                <input type="file" className="hidden" onChange={handleEditFileChange} />
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
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
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