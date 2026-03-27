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
  "Full Name": "full_name",
  "Name": "full_name",
  "Employee Name": "full_name",
  "First Name": "first_name",
  "Last Name": "last_name",
  "Email": "email",
  "Email Address": "email",
  "Mobile": "mobile",
  "Phone": "mobile",
  "Mobile Number": "mobile",
  "Department": "department_name",
  "Department Name": "department_name",
  "Designation": "designation",
  "Job Role": "jobRole",
  "JobRole": "jobRole",
  "Address": "address",
  "Location": "location",
  "Profile": "profile_name",
  "Profile Name": "profile_name",
  "Status": "status",
  "Join Date": "join_date",
  "Joining Date": "join_date",
  "Date of Joining": "join_date",
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

  // Filter out rows with no full name or email
  const validRows = useMemo(() => {
    return mappedData.filter(row => row.full_name && row.full_name !== "");
  }, [mappedData]);

  // =====================
  // EXCEL UPLOAD HANDLER
  // =====================

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (rows.length > 0) {
        // Get column headers from first row
        const headers = Object.keys(rows[0]);
        setColumnHeaders(headers);
      }

      setRawExcelData(rows);
      setIsUploadComplete(false);
      setUploadResults([]);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk Employee Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          {!isUploadComplete && (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-green-600 mb-3" />

              <p className="font-medium mb-4 text-foreground">
                Upload Excel File
              </p>

              {/* Hidden file input with custom button styling */}
              <label className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline">
                <Upload className="w-4 h-4" />
                <span>Choose File</span>
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
          {mappedData.length > 0 && !isUploadComplete && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-foreground">
                    Rows detected: {mappedData.length}
                    {validRows.length !== mappedData.length && (
                      <span className="text-red-500 ml-2">
                        ({mappedData.length - validRows.length} filtered - no name)
                      </span>
                    )}
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
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              )}

              {/* Data Table Preview */}
              <div className="overflow-x-auto mb-4 max-h-64">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-foreground">#</th>
                      <th className="px-3 py-2 text-foreground">Full Name</th>
                      <th className="px-3 py-2 text-foreground">Email</th>
                      <th className="px-3 py-2 text-foreground">Mobile</th>
                      <th className="px-3 py-2 text-foreground">Department</th>
                      <th className="px-3 py-2 text-foreground">Designation</th>
                      <th className="px-3 py-2 text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="px-3 py-2 text-foreground">{index + 1}</td>
                        <td className="px-3 py-2 text-foreground">{row.full_name || "-"}</td>
                        <td className="px-3 py-2 text-foreground">{row.email || "-"}</td>
                        <td className="px-3 py-2 text-foreground">{row.mobile || "-"}</td>
                        <td className="px-3 py-2 text-foreground">{row.department_name || "-"}</td>
                        <td className="px-3 py-2 text-foreground">{row.designation || row.jobRole || "-"}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            row.status === 'Active' ? 'bg-green-100 text-green-800' :
                            row.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                            row.status === 'Away' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {row.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mappedData.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ...and {mappedData.length - 10} more rows
                  </p>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleBulkUpload}
                disabled={uploading || validRows.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 w-full justify-center"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Employees...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload {validRows.length} Employees</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-4">Upload Results</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-foreground">
                          Row {result.rowIndex}: {result.name}
                        </span>
                      </div>
                      {result.success ? (
                        <span className="text-green-600 text-sm">Successfully uploaded</span>
                      ) : (
                        <span className="text-red-500 text-sm">{result.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <p className="font-medium text-foreground">
                  Summary: {uploadResults.filter(r => r.success).length} of {uploadResults.length} employees uploaded successfully
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
