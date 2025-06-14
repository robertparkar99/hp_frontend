"use client";

import React, { useEffect, useState, useMemo } from 'react';
import AddDialog from "./addDialouge";
import EditDialog from "./editDialouge";

interface TableData {
  id: number;
  jobrole: string;
  description: string;
  company_information: string;
  contact_information: string;
  location: string;
  job_posting_date: string;
  application_deadline: string;
  salary_range: string;
  required_skill_experience: string;
  responsibilities: string;
  benefits: string;
  keyword_tags: string;
  internal_tracking: string;
}

interface TableViewProps {
  tableData: TableData[];
}

const TableView: React.FC<TableViewProps> = ({ tableData }) => {

  // New states for table control
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

  // State to store the ID of the job role selected for editing
  const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);

  // State to trigger a refresh of the data (e.g., after an edit/delete operation)
  const [refreshKey, setRefreshKey] = useState(0);
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
  // Filtered and paginated data
  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData;
    const lowerSearch = searchTerm.toLowerCase();
    return tableData.filter(row =>
      row.jobrole.toLowerCase().includes(lowerSearch) ||
      row.description.toLowerCase().includes(lowerSearch) ||
      row.company_information.toLowerCase().includes(lowerSearch) ||
      row.contact_information.toLowerCase().includes(lowerSearch) ||
      row.location.toLowerCase().includes(lowerSearch) ||
      row.job_posting_date.toLowerCase().includes(lowerSearch) ||
      row.application_deadline.toLowerCase().includes(lowerSearch) ||
      row.salary_range.toLowerCase().includes(lowerSearch) ||
      row.required_skill_experience.toLowerCase().includes(lowerSearch) ||
      row.responsibilities.toLowerCase().includes(lowerSearch) ||
      row.benefits.toLowerCase().includes(lowerSearch) ||
      row.keyword_tags.toLowerCase().includes(lowerSearch) ||
      row.internal_tracking.toLowerCase().includes(lowerSearch)

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
        // Refresh the tree view by incrementing the refresh key
        setRefreshKey(prev => prev + 1);
        setSelectedJobRole(null);
      } catch (error) {
        console.error("Error deleting job role:", error);
        alert("Error deleting job role");
      }
    }
  };

  return (
    <div className='bg-[#fff] mx-2 rounded-sm'>
      <div className="flex justify-between items-right mb-2 px-4 pt-4 text-right">
        <button className="bg-blue-500 text-white px-4 py-2 rounded mr-4" onClick={() => setDialogOpen({ ...dialogOpen, add: true })}>Add Jobrole</button>
      </div>

      <div className="mb-2 flex items-center gap-2 px-4">
        <label>Rows per page:</label>
        <select
          value={rowsPerPage}
          onChange={e => {
            const val = e.target.value === 'all' ? -1 : parseInt(e.target.value, 10);
            setRowsPerPage(val);
            setCurrentPage(1); // reset page on page size change
          }}
          className="border rounded px-2 py-1"
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
            className="border rounded px-3 py-1 w-64"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset to first page on search
            }}
          /> <br />
          {totalRows} records found
        </span>
      </div>

      <div className="w-full p-[10px] overflow-x-auto">
        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
          <table id="example" className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Jobrole</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>description</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>company information</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>contact information</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>location</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>job posting date</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>application deadline</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>salary range</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>required skill experience</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>responsibilities</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>benefits</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>keyword tags</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>internal tracking</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-left p-4">No records found</td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.jobrole}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.description
                      ? row.description.slice(0, 50) + (row.description.length > 50 ? "..." : "")
                      : "-"}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.company_information}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.contact_information}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.location}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.job_posting_date}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.application_deadline}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.salary_range}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.required_skill_experience}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.responsibilities}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.benefits}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.keyword_tags}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.internal_tracking}</td>
                    <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
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
        <div className="flex justify-center items-center gap-2 mt-4">
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
      )}
      {dialogOpen.add && (
        <AddDialog skillId={null}
          onClose={() => setDialogOpen({ ...dialogOpen, add: false })}
          onSuccess={() => {
            setDialogOpen({ ...dialogOpen, add: false });
          }}
        />
      )}
      {dialogOpen.edit && selectedJobRole && (
        <EditDialog
          jobRoleId={selectedJobRole}
          onClose={() => setDialogOpen({ ...dialogOpen, edit: false })}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1); // Trigger data refresh (e.g., re-fetch from API)
            setDialogOpen({ ...dialogOpen, edit: false });
            setSelectedJobRole(null); // Clear selected job role
          }}
        />
      )}
    </div>
  )
};

export default TableView;