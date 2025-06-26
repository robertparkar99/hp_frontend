"use client";

import React, { useEffect, useState, useMemo } from 'react';
import EditDialog from "./editDialouge";

interface TableViewProps {
  refreshKey?: number;
}

const TableView: React.FC<TableViewProps> = ({ refreshKey }) => {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [tableData, setTableData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubDepartments, setSelectedSubDepartments] = useState<string[]>([]);

  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

  const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
    userProfile: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
        userProfile: user_profile_name,
      });
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchData();
      fetchDepartments();
    }
  }, [sessionData.url, sessionData.token, refreshKey]);

  async function fetchData(department: string = '', subDepartments: string[] = []) {
    const subDeptQuery = subDepartments.length > 0 
      ? `&sub_department=${subDepartments.join(',')}` 
      : '';
    
    const res = await fetch(
      `${sessionData.url}/jobrole_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&department=${department}${subDeptQuery}`
    );
    const data = await res.json();
    setTableData(data.tableData || []);
  }

  const handleCloseModel = () => {
    setDialogOpen({ ...dialogOpen, edit: false });
    fetchData(selectedDepartment, selectedSubDepartments);
  }

  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData;
    const lowerSearch = searchTerm.toLowerCase();
    return tableData.filter(row =>
      Object.values(row).some(
        value =>
          value &&
          value.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [searchTerm, tableData]);

  // Pagination calculations
  const totalRows = filteredData.length;
  const totalPages = rowsPerPage === -1 ? 1 : Math.ceil(totalRows / rowsPerPage);
  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) return filteredData;
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, rowsPerPage, filteredData]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const handleEditClick = (id: number) => {
    setSelectedJobRole(id);
    setDialogOpen({ ...dialogOpen, edit: true });
  };

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
        fetchData(selectedDepartment, selectedSubDepartments);
        setSelectedJobRole(null);
      } catch (error) {
        console.error("Error deleting job role:", error);
        alert("Error deleting job role");
      }
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=department&searchWord="departments"`);
      const data = await res.json();
      setDepartments(data.searchData || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments");
    }
  };

  const fetchSubDepartments = async (department: string) => {
    try {
      setSelectedDepartment(department);
      setSelectedSubDepartments([]); // Reset selected sub-departments when department changes
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_department&searchWord=${encodeURIComponent(department)}`);
      const data = await res.json();
      setSubDepartments(data.searchData || []);
      fetchData(department);
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
      alert("Failed to load sub-departments");
    }
  };

  const handleSubDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedOptions: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedOptions.push(options[i].value);
      }
    }
    setSelectedSubDepartments(selectedOptions);
    fetchData(selectedDepartment, selectedOptions);
  };

  return (
    <>
      <div className='relative bg-[#fff] mx-6 rounded-lg'>
        {/* Department and Sub-department Filters */}
        <div className="flex justify-center gap-8 py-6 inset-shadow-sm inset-shadow-[#EBF7FF] rounded-lg">
          {/* Department Select */}
          <div className="flex flex-col items-center w-[320px]">
            <label htmlFor="Department" className="self-start mb-1 px-3">Jobrole Department</label>
            <select
              name="department"
              className="rounded-lg p-2 border-2 border-[#CDE4F5] bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white w-full focus:rounded-none transition-colors duration-2000 drop-shadow-[0px_5px_5px_rgba(0,0,0,0.12)]"
              onChange={e => fetchSubDepartments(e.target.value)}
              value={selectedDepartment}
            >
              <option value="">Choose a Department to Filter</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-department Multi-Select */}
          <div className="flex flex-col items-center w-[320px]">
            <label htmlFor="subDepartment" className="self-start mb-1 px-3">Jobrole Sub-Department</label>
            <select
              name="sub_department"
              className="rounded-lg p-2 resize-y overflow-hidden border-2 border-[#CDE4F5] bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white w-full focus:rounded-none transition-colors duration-2000 drop-shadow-[0px_5px_5px_rgba(0,0,0,0.12)]"
              onChange={handleSubDepartmentChange}
              multiple
              size={3}
              value={selectedSubDepartments}
            >
              <option value="" disabled>Choose Sub-Departments (Hold Ctrl for multiple)</option>
              {subDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className='mb-[26px] text-[#ddd] border-2 border-[#449dd5] rounded' />
        
        {/* Table Controls */}
        <div className="mb-2 flex items-center gap-2 px-4">
          <label>Show Entries:</label>
          <select
            value={rowsPerPage}
            onChange={e => {
              const val = e.target.value === 'all' ? -1 : parseInt(e.target.value, 10);
              setRowsPerPage(val);
              setCurrentPage(1);
            }}
            className="border-2 border-[#CDE4F5] rounded-full px-2 py-1 bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white focus:rounded-none transition-colors duration-2000 drop-shadow-[0px_5px_5px_rgba(0,0,0,0.12)] p-4"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
            <option value="all">All</option>
          </select>
          <span className="ml-auto">
            <input
              type="text"
              placeholder="Search..."
              className="rounded-lg p-2 border-2 border-[#CDE4F5] bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white w-full focus:rounded-none transition-colors duration-2000 drop-shadow-[0px_5px_5px_rgba(0,0,0,0.12)]"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </span>
        </div>

        {/* Table */}
        <div className="w-full p-[10px] overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table id="example" className="min-w-full leading-normal">
              <thead>
                <tr className='bg-[#4876ab] text-white'>
                  <th className='px-3 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider'>Department</th>
                  <th className='px-3 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap'>Sub Department</th>
                  <th className='px-3 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider'>Jobrole</th>
                  <th className='px-3 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap'>Jobrole description</th>
                  <th className='px-3 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap'>Performance Expectation</th>
                  <th className='px-3 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className="border-b dark:border-gray-700 border-gray-200">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-left p-4">No records found</td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr key={`${row.id}-${index}`} className="odd:bg-white even:bg-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700">
                      <td className='px-3 py-3 border-b border-gray-200 text-sm'>{row.department}</td>
                      <td className='px-3 py-3 border-b border-gray-200 text-sm'>{row.sub_department}</td>
                      <td className='px-3 py-3 border-b border-gray-200 text-sm'>{row.jobrole}</td>
                      <td className='px-3 py-3 border-b border-gray-200 text-sm' title={row.description}>
                        {row.description?.slice(0, 50) + (row.description?.length > 50 ? "..." : "") || "-"}
                      </td>
                      <td className='px-3 py-3 border-b border-gray-200 text-sm' title={row.performance_expectation}>
                        {row.performance_expectation?.slice(0, 50) + (row.performance_expectation?.length > 50 ? "..." : "") || "-"}
                      </td>
                      <td className='px-3 py-3 border-b border-gray-200 text-sm'>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(row.id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                          >
                            <span className="mdi mdi-pencil"></span>
                          </button>
                          <button
                            onClick={() => row.id && handleDeleteClick(row.id)}
                            className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                          >
                            <span className="mdi mdi-trash-can"></span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {rowsPerPage !== -1 && totalPages > 1 && (
          <div className="flex gap-[60%] mt-4">
            <div className="totalRecord">
              {totalRows} records found
            </div>
            <div className="pages">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                {'<<'}
              </button>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                {'<'}
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                {'>'}
              </button>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                {'>>'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {dialogOpen.edit && selectedJobRole && (
        <EditDialog
          jobRoleId={selectedJobRole}
          onClose={handleCloseModel}
          onSuccess={() => {
            setDialogOpen({ ...dialogOpen, edit: false });
            fetchData(selectedDepartment, selectedSubDepartments);
          }}
        />
      )}
    </>
  )
};

export default TableView;