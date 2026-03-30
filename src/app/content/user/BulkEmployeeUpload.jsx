"use client";

import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, Users, Loader2, CheckCircle, XCircle } from "lucide-react";

// Excel column mapping for Employee data
const EMPLOYEE_COLUMN_MAPPING = {
  // User identification
  "user_name": "user_name",
  "User Name": "user_name",
  "Username": "user_name",
  
  // Password fields
  "password": "password",
  "Password": "password",
  "plain_password": "plain_password",
  "Plain Password": "plain_password",
  
  // Name fields
  "name_suffix": "name_suffix",
  "Name Suffix": "name_suffix",
  "Suffix": "name_suffix",
  "first_name": "first_name",
  "First Name": "first_name",
  "middle_name": "middle_name",
  "Middle Name": "middle_name",
  "last_name": "last_name",
  "Last Name": "last_name",
  
  // Contact fields
  "email": "email",
  "Email": "email",
  "Email Address": "email",
  "mobile": "mobile",
  "Mobile": "mobile",
  "Phone": "mobile",
  "Mobile Number": "mobile",
  "gender": "gender",
  "Gender": "gender",
  "birthdate": "birthdate",
  "Birthdate": "birthdate",
  "Date of Birth": "birthdate",
  "DOB": "birthdate",
  
  // Address fields
  "address": "address",
  "Address": "address",
  "city": "city",
  "City": "city",
  "state": "state",
  "State": "state",
  "pincode": "pincode",
  "Pincode": "pincode",
  "Pin Code": "pincode",
  "Zip": "pincode",
  "Zip Code": "pincode",
  
  // Profile and role
  "user_profile_id": "user_profile_id",
  "User Profile ID": "user_profile_id",
  "Profile ID": "user_profile_id",
  
  // Date fields
  "join_year": "join_year",
  "Join Year": "join_year",
  "joining_year": "join_year",
  "joined_date": "joined_date",
  "Joined Date": "joined_date",
  "Join Date": "joined_date",
  "Date of Joining": "joined_date",
  "Joining Date": "joined_date",
  
  // Organization fields
  "sub_institute_id": "sub_institute_id",
  "Sub Institute ID": "sub_institute_id",
  "Substitute ID": "sub_institute_id",
  "client_id": "client_id",
  "Client ID": "client_id",
  "is_admin": "is_admin",
  "Is Admin": "is_admin",
  "Admin": "is_admin",
  
  // Status
  "status": "status",
  "Status": "status",
  
  // Department
  "department_id": "department_id",
  "Department ID": "department_id",
  "Department": "department_name",
  "Department Name": "department_name",
  
  // Employee ID
  "employee_id": "employee_id",
  "Employee ID": "employee_id",
  "EmployeeId": "employee_id",
  
  // Work schedule - days
  "monday": "monday",
  "Monday": "monday",
  "tuesday": "tuesday",
  "Tuesday": "tuesday",
  "wednesday": "wednesday",
  "Wednesday": "wednesday",
  "thursday": "thursday",
  "Thursday": "thursday",
  "friday": "friday",
  "Friday": "friday",
  "saturday": "saturday",
  "Saturday": "saturday",
  "sunday": "sunday",
  "Sunday": "sunday",
  
  // Work schedule - in/out times
  "monday_in_date": "monday_in_date",
  "Monday In Date": "monday_in_date",
  "monday_out_date": "monday_out_date",
  "Monday Out Date": "monday_out_date",
  "tuesday_in_date": "tuesday_in_date",
  "Tuesday In Date": "tuesday_in_date",
  "tuesday_out_date": "tuesday_out_date",
  "Tuesday Out Date": "tuesday_out_date",
  "wednesday_in_date": "wednesday_in_date",
  "Wednesday In Date": "wednesday_in_date",
  "wednesday_out_date": "wednesday_out_date",
  "Wednesday Out Date": "wednesday_out_date",
  "thursday_in_date": "thursday_in_date",
  "Thursday In Date": "thursday_in_date",
  "thursday_out_date": "thursday_out_date",
  "Thursday Out Date": "thursday_out_date",
  "friday_in_date": "friday_in_date",
  "Friday In Date": "friday_in_date",
  "friday_out_date": "friday_out_date",
  "Friday Out Date": "friday_out_date",
  "saturday_in_date": "saturday_in_date",
  "Saturday In Date": "saturday_in_date",
  "saturday_out_date": "saturday_out_date",
  "Saturday Out Date": "saturday_out_date",
  "sunday_in_date": "sunday_in_date",
  "Sunday In Date": "sunday_in_date",
  "sunday_out_date": "sunday_out_date",
  "Sunday Out Date": "sunday_out_date",
  
  // Experience
  "total_experience": "total_experience",
  "Total Experience": "total_experience",
  "Experience": "total_experience",
  
  // Allocated standards
  "allocated_standards": "allocated_standards",
  "Allocated Standards": "allocated_standards",
  "Standards": "allocated_standards",
  
  // Legacy mappings (kept for backward compatibility)
  "Full Name": "full_name",
  "Name": "full_name",
  "Employee Name": "full_name",
  "Designation": "designation",
  "Job Role": "jobRole",
  "JobRole": "jobRole",
  "Location": "location",
  "Profile": "profile_name",
  "Profile Name": "profile_name",
  "Occupation": "occupation",
};

export default function BulkEmployeeUpload({
  isOpen,
  setIsOpen,
  sessionData,
  userJobroleLists,
  userDepartmentLists,
  userLOR,
  userProfiles,
  onUploadComplete,
}) {
  const [rawExcelData, setRawExcelData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  // Map Excel data to expected employee format
  const mappedData = useMemo(() => {
    return rawExcelData.map((row) => {
      const mappedRow = {
        status: "Active",
        join_date: new Date().toISOString().split('T')[0],
      };

      // Map each column from Excel to the expected format
      Object.entries(EMPLOYEE_COLUMN_MAPPING).forEach(([excelColumn, targetField]) => {
        // Try to find the column in the Excel file (case-insensitive)
        const excelKey = Object.keys(row).find(
          (key) => key.toLowerCase().trim() === excelColumn.toLowerCase()
        );
        if (excelKey && row[excelKey] !== undefined && row[excelKey] !== null) {
          let value = row[excelKey];

          // Normalize status
          if (targetField === "status") {
            const normalizedValue = String(value).toLowerCase().trim();
            if (normalizedValue.includes("active") || normalizedValue.includes("working")) {
              value = "Active";
            } else if (normalizedValue.includes("inactive") || normalizedValue.includes("left") || normalizedValue.includes("resigned")) {
              value = "Inactive";
            } else if (normalizedValue.includes("away")) {
              value = "Away";
            } else {
              value = "Active";
            }
          }

          mappedRow[targetField] = value;
        }
      });

      // Generate a default image placeholder
      mappedRow.image = `https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39`;

      return mappedRow;
    });
  }, [rawExcelData]);

  // Show all data - no filtering
  const validRows = useMemo(() => {
    return mappedData;
  }, [mappedData]);

  // =====================
  // EXCEL UPLOAD HANDLER
  // =====================

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Starting file upload for:", file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Get the raw range to see all data including empty cells
        const range = XLSX.utils.decode_range(sheet['!ref'] || "A1");
        console.log("Sheet range:", sheet['!ref']);
        console.log("Total rows in sheet (including empty):", range.e.r + 1);
        console.log("Total columns in sheet:", range.e.c + 1);
        
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", blankrows: true });

        console.log("Excel file loaded:", file.name);
        console.log("Total rows parsed:", rows.length);
        if (rows.length > 0) {
          console.log("First row sample:", JSON.stringify(rows[0]));
          console.log("Row 1 keys:", Object.keys(rows[0]));
          console.log("Row 1 values:", Object.values(rows[0]));
        }
        if (rows.length > 1) {
          console.log("Second row sample:", JSON.stringify(rows[1]));
        }

        if (rows.length > 0) {
          // Get column headers from first row
          const headers = Object.keys(rows[0]);
          console.log("Column headers detected:", headers);
          setColumnHeaders(headers);
        }

        setRawExcelData(rows);
        setIsUploadComplete(false);
        setUploadResults([]);
        
        console.log("State updated - rawExcelData has", rows.length, "rows");
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Error parsing Excel file: " + error.message);
      }
    };
    reader.onerror = () => {
      console.error("Error reading file");
      alert("Error reading file");
    };
    reader.readAsArrayBuffer(file);
  };

  // =====================
  // BULK UPLOAD API CALL
  // =====================

  const handleBulkUpload = async () => {
    if (validRows.length === 0) {
      alert("No valid employee data to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: validRows.length });
    setUploadResults([]);

    const results = [];

    try {
      // Process each employee one by one
      for (let i = 0; i < validRows.length; i++) {
        const employee = validRows[i];
        
        try {
          // Build the API URL
          const apiUrl = `${sessionData.APP_URL}/user/add_user?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id || 1}&org_type=${encodeURIComponent(sessionData.org_type || 'Financial Services')}&user_id=${sessionData.user_id}&user_profile_name=${encodeURIComponent(sessionData.user_profile_name || 'Admin')}&syear=${sessionData.syear || '2025'}`;

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...employee,
              action: "add",
            }),
          });

          if (response.ok) {
            results.push({
              rowIndex: i + 1,
              name: employee.full_name,
              success: true,
            });
          } else {
            const errorData = await response.json();
            results.push({
              rowIndex: i + 1,
              name: employee.full_name,
              success: false,
              error: errorData.message || "Failed to upload",
            });
          }
        } catch (error) {
          results.push({
            rowIndex: i + 1,
            name: employee.full_name,
            success: false,
            error: error.message || "Unknown error",
          });
        }

        setUploadProgress({ current: i + 1, total: validRows.length });
        setUploadResults([...results]);
      }

      setIsUploadComplete(true);
      
      // Call the completion callback
      if (onUploadComplete) {
        const successCount = results.filter(r => r.success).length;
        onUploadComplete(successCount);
      }

    } catch (error) {
      console.error("Error uploading employees:", error);
      alert("Error uploading employees. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleClearData = () => {
    setRawExcelData([]);
    setColumnHeaders([]);
    setUploadResults([]);
    setIsUploadComplete(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after closing
    setTimeout(() => {
      handleClearData();
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk Employee Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-x-hidden">
          {/* Upload Section */}
          {!isUploadComplete && (
            <div className="border-2 border-dashed border-blue-200 bg-gradient-to-b from-blue-50/50 to-white rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              </div>

              <p className="font-semibold text-lg mb-2 text-slate-700">
                Upload Excel File
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Each row = one employee record
              </p>

              {/* Hidden file input with custom button styling */}
              <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-200">
                <Upload className="w-4 h-4" />
                <span>Choose Excel File</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              <p className="text-sm text-muted-foreground mt-2">
                Each row = one employee record
              </p>

              {/* Expected Columns Info */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg text-left">
                <p className="text-sm font-medium text-foreground mb-2">Expected Excel Columns:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>•user_name *</span>
                  <span>• password</span>
                  <span>• name_suffix</span>
                  <span>• first_name</span>
                  <span>• middle_name</span>
                  <span>• last_name</span>
                  <span>• email</span>
                  <span>• mobile</span>
                  <span>• gender</span>
                  <span>• birthdate</span>
                  <span>• address</span>
                  <span>• city</span>
                  <span>• state</span>
                  <span>• pincode</span>
                  <span>• user_profile_id</span>
                  <span>• join_year</span>
                  <span>• plain_password</span>
                  <span>• sub_institute_id</span>
                  <span>• client_id</span>
                  <span>• is_admin</span>
                  <span>• status</span>
                  <span>• allocated_standards</span>
                  <span>• department_id</span>
                  <span>• joined_date</span>
                  <span>• employee_id</span>
                  <span>• mondaye</span>
                  <span>• tuesday</span>
                  <span>• wednesday</span>
                  <span>• thursday</span>
                  <span>• friday</span>
                  <span>• saturday</span>
                  <span>• sunday</span>
                  <span>• monday_in_date</span>
                  <span>• monday_out_date</span>
                  <span>• tuesday_in_date</span>
                  <span>• tuesday_out_date</span>
                  <span>• wednesday_in_date</span>
                  <span>• wednesday_out_date</span>
                  <span>• thursday_in_date</span>
                  <span>• thursday_out_date</span>
                  <span>• friday_in_date</span>
                  <span>• friday_out_date</span>
                  <span>• saturday_in_date</span>
                  <span>• saturday_out_date</span>
                  <span>• sunday_in_date</span>
                  <span>• sunday_out_date</span>
                  <span>• total_experience</span>
              

                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Full Name is required. Other fields are optional.
                </p>
              </div>
            </div>
          )}

          {/* Excel Data Preview */}
          {rawExcelData.length > 0 && !isUploadComplete && (
            <div className="bg-muted/30 rounded-lg p-4 overflow-x-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-foreground">
                    Rows detected: {rawExcelData.length}
                  </p>
                  {uploading && uploadProgress && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Uploading: {uploadProgress.current} / {uploadProgress.total}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClearData}
                  disabled={uploading}
                  className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  Clear Data
                </button>
              </div>

              {/* Progress Bar */}
              {uploading && uploadProgress && (
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              )}

              {/* Data Table Preview - Dynamic Columns */}
              <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm overflow-x-hidden">
                {/* Table Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-border flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {rawExcelData.length} {rawExcelData.length === 1 ? 'Record' : 'Records'}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Preview before upload
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-48"
                      onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        const tableBody = document.getElementById('preview-table-body');
                        if (tableBody) {
                          const rows = tableBody.querySelectorAll('tr');
                          rows.forEach((row) => {
                            const text = row.textContent?.toLowerCase() || '';
                            row.style.display = text.includes(searchTerm) ? '' : 'none';
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto max-h-[450px] overflow-y-auto custom-scrollbar max-w-full">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 border-b border-r border-slate-200 w-14">
                          <div className="flex items-center gap-1">
                            <span>#</span>
                          </div>
                        </th>
                        {columnHeaders.length > 0 ? (
                          columnHeaders.map((header, idx) => (
                            <th key={idx} className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 border-b border-r border-slate-200 whitespace-nowrap min-w-[120px]">
                              <div className="flex items-center gap-1">
                                <span>{header}</span>
                              </div>
                            </th>
                          ))
                        ) : (
                          <>
                            <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 border-b border-r border-slate-200">Full Name</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 border-b border-r border-slate-200">Email</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 border-b border-r border-slate-200">Mobile</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 border-b border-r border-slate-200">Department</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 border-b border-r border-slate-200">Designation</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 border-b border-slate-200">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody id="preview-table-body" className="divide-y divide-slate-100">
                      {/* Display all rows from rawExcelData with dynamic columns */}
                      {rawExcelData.map((row, index) => {
                        const statusText = String(row.status || row.Status || 'active').toLowerCase();
                        const isActive = statusText.includes('active') || statusText.includes('working');
                        const isInactive = statusText.includes('inactive') || statusText.includes('left') || statusText.includes('resigned');
                        const isAway = statusText.includes('away');
                        
                        return (
                          <tr key={index} className={`hover:bg-blue-50/70 transition-all duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-semibold text-xs bg-slate-50/80 border-r border-slate-200">
                              {index + 1}
                            </td>
                            {columnHeaders.length > 0 ? (
                              columnHeaders.map((header, idx) => (
                                <td key={idx} className="px-4 py-3 text-slate-700 whitespace-nowrap border-r border-slate-100 last:border-r-0">
                                  {row[header] !== undefined && row[header] !== null && row[header] !== "" ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                      {String(row[header])}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic text-xs">-</span>
                                  )}
                                </td>
                              ))
                            ) : (
                              <>
                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap border-r border-slate-100 font-medium">
                                  {row.full_name || row.Name || row.name || row['Full Name'] || <span className="text-slate-400 italic">-</span>}
                                </td>
                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap border-r border-slate-100">
                                  {row.email || row.Email || <span className="text-slate-400 italic">-</span>}
                                </td>
                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap border-r border-slate-100">
                                  {row.mobile || row.Mobile || row.phone || <span className="text-slate-400 italic">-</span>}
                                </td>
                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap border-r border-slate-100">
                                  {row.department_name || row.Department || row.department || <span className="text-slate-400 italic">-</span>}
                                </td>
                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap border-r border-slate-100">
                                  {row.designation || row.Designation || row.jobRole || <span className="text-slate-400 italic">-</span>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                    isActive 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                      : isInactive 
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : isAway
                                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                      isActive ? 'bg-emerald-500' : isInactive ? 'bg-rose-500' : isAway ? 'bg-amber-500' : 'bg-slate-500'
                                    }`} />
                                    {row.status || row.Status || 'Active'}
                                  </span>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="px-4 py-2 bg-slate-50 border-t border-border flex items-center justify-between text-xs text-slate-500">
                  <span>Showing {rawExcelData.length} entries</span>
                  <span>Scroll for more →</span>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleBulkUpload}
                disabled={uploading || validRows.length === 0}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center shadow-lg shadow-blue-200 hover:shadow-xl"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Uploading Employees...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">Upload {validRows.length} Employees</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Upload Results
              </h3>
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                {uploadResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      result.success 
                        ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50' 
                        : 'bg-rose-50/70 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                        <span className="font-medium text-slate-800">
                          Row {result.rowIndex}: {result.name}
                        </span>
                      </div>
                      {result.success ? (
                        <span className="text-emerald-600 text-sm font-medium bg-emerald-100 px-3 py-1 rounded-full">Successfully uploaded</span>
                      ) : (
                        <span className="text-rose-500 text-sm font-medium bg-rose-100 px-3 py-1 rounded-full">{result.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-5 p-4 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-700">
                    Summary
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2 text-emerald-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {uploadResults.filter(r => r.success).length} Success
                    </span>
                    <span className="flex items-center gap-2 text-rose-600 font-medium">
                      <XCircle className="w-4 h-4" />
                      {uploadResults.filter(r => !r.success).length} Failed
                    </span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(uploadResults.filter(r => r.success).length / uploadResults.length) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {uploadResults.filter(r => r.success).length} of {uploadResults.length} employees uploaded successfully
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {isUploadComplete ? "Close" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
