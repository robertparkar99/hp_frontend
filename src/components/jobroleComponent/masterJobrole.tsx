"use client";

import React, { useEffect, useState, useMemo } from 'react';
import AddDialog from "./addDialouge";
import Loading from "../../components/utils/loading"; // Import the Loading component

interface TableData {
    id: number;
    track: string;
    jobrole: string;
    description: string;
}

interface MasterTableProps {
    tableData: TableData[];
}

const MasterTable: React.FC<MasterTableProps> = ({ tableData }) => {
    // New states for table control
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [dialogOpen, setDialogOpen] = useState({
        add: false,
    });
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
            setLoading(false);
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
            row.track.toLowerCase().includes(lowerSearch) ||
            row.jobrole.toLowerCase().includes(lowerSearch) ||
            row.description.toLowerCase().includes(lowerSearch)
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

    const handleClick = async (id: number,jobrole:string) => {
        // alert(id);
        setLoading(true);
        const payload = {
            type: "API",
            method_field: 'POST',
            token: sessionData.token,
            sub_institute_id: sessionData.subInstituteId,
            org_type: sessionData.orgType,
            user_profile_name: sessionData.userProfile,
            user_id: sessionData.userId,
            formType: 'master',
            jobroleId : id,
            jobrole : jobrole,
        };

        try {
            const res = await fetch(`${sessionData.url}/jobrole_library`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData.token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if(data){
                setLoading(false);
                alert(data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Error submitting form");
        }
    }

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
                                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Track</th>
                                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Jobrole</th>
                                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Description</th>
                                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">No records found</td>
                                </tr>
                            ) : (
                                paginatedData.map((row, index) => (
                                    <tr key={`${row.id}-${index}`}>
                                        <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.track}</td>
                                        <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>{row.jobrole}</td>
                                        <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'> {row.description
                                            ? row.description.slice(0, 50) + (row.description.length > 50 ? "..." : "")
                                            : "-"}</td>
                                        <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleClick(row.id,row.jobrole)}
                                                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full p-2 transition-colors"
                                                    title="Import Job Role"
                                                >
                                                    <i className="mdi mdi-application-import"></i>
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
        </div>
    )
};

export default MasterTable;