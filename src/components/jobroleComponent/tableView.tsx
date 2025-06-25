"use client";

import React, { useEffect, useState, useMemo } from 'react';
import EditDialog from "./editDialouge";

// interface TableViewProps {
//   tableData: any[];
// }
interface TableViewProps {
  refreshKey?: number;
}

const TableView: React.FC<TableViewProps> = ({ refreshKey }) => {

  // New states for table control
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [tableData, setTableData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

  // State to store the ID of the job role selected for editing
  const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);

  // State to trigger a refresh of the data (e.g., after an edit/delete operation)
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

  async function fetchData(department: string | null = '', sub_department: string | null = '') {
    // alert(searchType);
    const res = await fetch(`${sessionData.url}/jobrole_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&department=${department}&sub_department=${sub_department}`);
    const data = await res.json();

    setTableData(data.tableData || []);
  }
  const handleCloseModel = () => {
    setDialogOpen({ ...dialogOpen, edit: false });
    fetchData();
  }
  // Filtered and paginated data
  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData;
    const lowerSearch = searchTerm.toLowerCase();
    return tableData.filter(row =>
      Object.values(row).some(
        value =>
          value &&
          value
            .toString()
            .toLowerCase()
            .includes(lowerSearch)
      )
    );
  }, [searchTerm, tableData]);

  // Pagination calculations
  const totalRows = filteredData.length;
  const totalPages = rowsPerPage === -1 ? 1 : Math.ceil(totalRows / rowsPerPage);
  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) return filteredData; // Show all
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, rowsPerPage, filteredData]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // Function to handle opening the edit dialog
  const handleEditClick = (id: number) => {
    // alert(id);
    setSelectedJobRole(id);
    setDialogOpen({ ...dialogOpen, edit: true });
  };

  // Function to handle delete action (placeholder for actual deletion logic)
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
        fetchData();
        // Refresh the tree view by incrementing the refresh key
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
      const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=sub_department&searchWord=${encodeURIComponent(department)}`);
      fetchData(department);
      const data = await res.json();
      setSubDepartments(data.searchData || []);
    } catch (error) {
      console.error("Error fetching sub-departments:", error);
      alert("Failed to load sub-departments");
    }
  };

  const getFilteredData = async (sub_department: string) => {
    fetchData(selectedDepartment, sub_department);
  }
  return (<>
    <div className='relative bg-[#fff] mx-6 rounded-lg drop-shadow-[0px_5px_5px_rgba(0,0,0,0.12)] p-4'>
      {/* add department and sub department wise search 25-06-2025 by uma start */}
      <div className="flex justify-center gap-8  mb-[20px] py-4">
        {/* Department Select */}
        <div className="flex flex-col items-center w-[320px]">
          <label htmlFor="Department" className="self-start mb-1 px-3">Jobrole Department</label>
          <select
            name="department"
            className="rounded-full p-2 border-2 border-[#CDE4F5] bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white w-full focus:rounded-none transition-colors duration-2000"
            onChange={e => fetchSubDepartments(e.target.value)}
          >
            <option value="">Choose a Department to Filter</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

        </div>

        {/* Sub-department Select */}
        <div className="flex flex-col items-center w-[320px]">
          <label htmlFor="subDepartment" className="self-start mb-1 px-3">Jobrole Sub-Department</label>
          <select
            name="sub_department"
            className="rounded-full p-2 border-2 border-[#CDE4F5] bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white w-full focus:rounded-none transition-colors duration-2000"
            onChange={e => getFilteredData(e.target.value)}
            autoComplete="off"
          >
            <option value="">Choose a Sub-Department to Filter</option>
            {subDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr className='mb-[26px] text-[#ddd] border-2 border-[#449dd5] rounded' />
      {/* add department and sub department wise search 25-06-2025 by uma end */}
      <div className="mb-2 flex items-center gap-2 px-4">
        <label>Show Entries:</label>
        <select
          value={rowsPerPage}
          onChange={e => {
            const val = e.target.value === 'all' ? -1 : parseInt(e.target.value, 10);
            setRowsPerPage(val);
            setCurrentPage(1); // reset page on page size change
          }}
          className="border-2 border-[#CDE4F5] rounded-full px-2 py-1 bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white focus:rounded-none transition-colors duration-2000"
        >
          <option value="100">50</option>
          <option value="100">100</option>
          <option value="500">500</option>
          <option value="1000">1000</option>
          <option value="all">All</option>
        </select>
        <span className="ml-auto">
          <input
            type="text"
            placeholder="Search..."
            className="border-2 border-[#CDE4F5] rounded-full px-3 py-1 w-64 bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white focus:rounded-none transition-colors duration-2000"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset to first page on search
            }}
          /> <br />
        </span>

      </div>

      <div className="w-full p-[10px] overflow-x-auto">
        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
          <table id="example" className="min-w-full leading-normal">
            <thead>
              <tr className='bg-[#4876ab] text-white'>
                <th className='px-3 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold uppercase tracking-wider'>Department</th>
                <th className='px-3 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap'>Sub Department</th>
                <th className='px-3 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold uppercase tracking-wider'>Jobrole</th>
                <th className='px-3 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap'>Jobrole description</th>
                <th className='px-3 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap'>Performance Expectation</th>

                <th className='px-3 py-3 border-b-2 border-gray-200  text-left text-xs font-semibold uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className="border-b dark:border-gray-700 border-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-left p-4">No records found</td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr key={`${row.id}-${index}`} className="odd:bg-white even:bg-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700"  >
                    <td className='px-3 py-3 border-b border-gray-200 text-sm'>{row.department}</td>
                    <td className='px-3 py-3 border-b border-gray-200 text-sm'>{row.sub_department}</td>
                    <td className='px-3 py-3 border-b border-gray-200 text-sm'>{row.jobrole}</td>
                    <td className='px-3 py-3 border-b border-gray-200 text-sm' title={row.description}>{row.description
                      ? row.description.slice(0, 50) + (row.description.length > 50 ? "..." : "")
                      : "-"}</td>
                    <td className='px-3 py-3 border-b border-gray-200 text-sm' title={row.performance_expectation}>{row.performance_expectation
                      ? row.performance_expectation.slice(0, 50) + (row.performance_expectation.length > 50 ? "..." : "")
                      : "-"}</td>

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

      {/* Pagination controls */}
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


    {dialogOpen.edit && selectedJobRole && (
      // <EditDialog
      //   jobRoleId={selectedJobRole}
      //   onClose={() => setDialogOpen({ ...dialogOpen, edit: false })}
      //   onSuccess={() => {
      //     setDialogOpen({ ...dialogOpen, edit: false });
      //     setSelectedJobRole(null); // Clear selected job role
      //   }}
      // />
      <EditDialog
        jobRoleId={selectedJobRole}
        onClose={() => handleCloseModel()}
        onSuccess={() => {
          setDialogOpen({ ...dialogOpen, edit: false });
          refreshKey; // This will refresh TableView
        }}
      />
    )}
  </>
  )
};

export default TableView;