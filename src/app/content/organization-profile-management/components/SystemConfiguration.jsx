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
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [userOptions, setUserOptions] = useState([]);
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
            let displayName = `${user.first_name || ""} ${user.middle_name || ""
              } ${user.last_name || ""}`.trim();
            if (!displayName) displayName = user.user_name || "";
            return { id: user.id, name: displayName };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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
      setEditFormData({
        id: itemToEdit.id,
        name: itemToEdit.name || "",
        description: itemToEdit.description || "",
        departmentName: itemToEdit.standard_name || "",
        assignedTo: itemToEdit.assigned_to || "",
        dueDate: itemToEdit.duedate || "",
        attachment: null,
      });
      setEditFileName(itemToEdit.attachment || "");
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
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

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
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
          const val = (item[key] || "").toString().toLowerCase();
          return val.includes(filters[key]);
        });
      }
    });

    setFilteredData(filtered);
  }, [filters, dataList, userOptions]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || "");
    handleChange("attachment", file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        userOptions.find(
          (u) =>
            u.id.toString() === (item.assigned_to || "")?.toString()
        )?.name || "",
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
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg mb-10"
      >
        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Description", name: "description", type: "textarea" },
          { label: "Department Name", name: "departmentName", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name} className={type === "textarea" ? "md:col-span-2" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            {type === "textarea" ? (
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

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
            className="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Data Table */}
      {displayData.length > 0 && ( <>
        <div className="mt-2">
         {/* Header row with pagination left and export buttons right */}
         <div className="flex justify-between items-center mb-4 py-4">
            {/* Left side - Pagination controls */}
            <div className="space-x-4">
                {/* <select
                    onChange={(e) => handlePerPageChange(Number(e.target.value), 1)}
                    className="rounded-lg p-1 border-2 border-[#CDE4F5] bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white w-full focus:rounded-none transition-colors duration-2000 drop-shadow-[0px_5px_5px_rgba(0,0,0,0.12)]"
                    value={paginationPerPageVal}
                >
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                </select>
                <br />
                <span className="text-sm">Total records : {filteredData.length}</span> */}
            </div>

            {/* Right side - Export buttons */}
            <div className="flex space-x-2">
                <PrintButton
                    data={displayData}
                    title="Job Roles Report"
                    excludedFields={["id", "internal_id"]}
                    buttonText={
                        <>
                            <span className="mdi mdi-printer-outline"></span>
                        </>
                    }
                />
                <ExcelExportButton
                    sheets={[{ data: displayData, sheetName: "Submissions" }]}
                    fileName="Skills Jobrole"
                    onClick={() => console.log("Export initiated")}
                    buttonText={
                        <>
                            <span className="mdi mdi-file-excel"></span>
                        </>
                    }
                />
                <PdfExportButton
                    data={displayData}
                    fileName="Skills Jobrole"
                    onClick={() => console.log("PDF export initiated")}
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
              data={displayData.length > 0 ? displayData : [{}]}
              customStyles={customStyles}
              pagination
              highlightOnHover
              responsive
              noDataComponent={<div className="p-4 text-center">No data available</div>}
              persistTableHead
            />
          </div>
        </>)}

          {/* Edit Dialog */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
              <DialogHeader>
                <DialogTitle>Edit Task Assignment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {[
                  { label: "Name", name: "name", type: "text" },
                  { label: "Description", name: "description", type: "textarea" },
                  { label: "Department Name", name: "departmentName", type: "text" },
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
                    Assigned To
                  </label>
                  <select
                    value={editFormData.assignedTo}
                    onChange={(e) => handleEditChange("assignedTo", e.target.value)}
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
                    class="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 shadow-md disabled:opacity-60"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" class="px-8 py-2 rounded-full text-white font-semibold transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md disabled:opacity-60">
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