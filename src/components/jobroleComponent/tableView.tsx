import React, { useEffect, useState, useMemo } from 'react';
import EditDialog from "./editDialouge";
import dynamic from 'next/dynamic';
import DataTable from "react-data-table-component";
import AddDialog from "@/components/jobroleComponent/addDialouge";

const ExcelExportButton = dynamic(
    () => import('../exportButtons/excelExportButton').then(mod => mod.ExcelExportButton),
    { ssr: false }
);

const PdfExportButton = dynamic(
    () => import('../exportButtons/PdfExportButton').then(mod => mod.PdfExportButton),
    { ssr: false }
);

const PrintButton = dynamic(
    () => import('../exportButtons/printExportButton').then(mod => mod.PrintButton),
    { ssr: false }
);

interface TableViewProps {
    refreshKey?: number;
}

interface JobroleData {
    id?: number;
    jobrole: string;
    description?: string;
    performance_expectation?: string;
}
const TableView: React.FC<TableViewProps> = ({ refreshKey }) => {
    // States
    const [industries, setIndustries] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [subDepartments, setSubDepartments] = useState<any[]>([]);
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSubDepartments, setSelectedSubDepartments] = useState<string[]>([]);
    const [paginationPerPageVal, setPaginationPerPageVal] = useState(100);
    const [tableData, setTableData] = useState<JobroleData[]>([]);
    const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showResetFilters, setShowResetFilters] = useState(false);
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
        {}
    );

    const [dialogOpen, setDialogOpen] = useState({
        view: false,
        add: false,
        edit: false,
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
            fetchIndustries();
        }
    }, [paginationPerPageVal, currentPage, sessionData.url, sessionData.token, refreshKey]);
    async function fetchIndustries() {
        try {
            const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=industries&searchWord="industries"`);
            const data = await res.json();
            setIndustries(data.searchData || []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            alert("Failed to load departments");
        }
    }
    async function fetchData(industry: string = '', department: string = '', subDepartments: string[] = []) {
        setLoading(true);
        const subDeptQuery = subDepartments.length > 0
            ? `&sub_department=${subDepartments.join(',')}`
            : '';

        const res = await fetch(
            `${sessionData.url}/jobrole_library?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&industry=${industry}&department=${department}${subDeptQuery}`
        );
        const data = await res.json();
        if (data) {
            setLoading(false);
        }
        setTableData(data.tableData || []);

    }

    const handleCloseModel = () => {
        setDialogOpen({ ...dialogOpen, edit: false });
        fetchData(selectedIndustry, selectedDepartment, selectedSubDepartments);
    }


    const handleEditClick = (id: number) => {
        setSelectedJobRole(id);
        setDialogOpen({ ...dialogOpen, edit: true });
    };
    const resetFilters = () => {
        setColumnFilters({});
        setShowResetFilters(false);
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
                fetchData(selectedIndustry, selectedDepartment, selectedSubDepartments);
                setSelectedJobRole(null);
            } catch (error) {
                console.error("Error deleting job role:", error);
                alert("Error deleting job role");
            }
        }
    };

    const fetchDepartments = async (industries: string = '') => {
        try {
            const res = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=department&searchWord=${industries}`);
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
            fetchData(selectedIndustry, department);
        } catch (error) {
            console.error("Error fetching sub-departments:", error);
            alert("Failed to load sub-departments");
        }
    };
    const fetchIndustriesData = async (industry: string) => {
        setSelectedIndustry(industry);
        fetchData(industry);
        fetchDepartments(industry);
    }
    const handleSubDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedOptions: string[] = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedOptions.push(options[i].value);
            }
        }
        setSelectedSubDepartments(selectedOptions);
        fetchData(selectedIndustry, selectedDepartment, selectedOptions);
    };

    const handleColumnFilter = (column: string, value: string) => {
        setColumnFilters((prev) => ({
            ...prev,
            [column]: value,
        }));
    };

    const handlePerPageChange = (newPerPage: any, page: number) => {
        setPaginationPerPageVal(Number(newPerPage));
        setCurrentPage(1);
        // alert(newPerPage);
        console.log(newPerPage);
    };

    interface ColumnFilters {
        [key: string]: string;
    }

    const filteredData: JobroleData[] = tableData.filter((item: JobroleData) => {
        return Object.entries(columnFilters as ColumnFilters).every(([column, filterValue]) => {
            if (!filterValue) return true;

            const columnValue: string = String(
                item[column as keyof JobroleData] || ""
            ).toLowerCase();
            return columnValue.includes(filterValue.toLowerCase());
        });
    });

    const columns = [
        {
            name: (
                <div>
                    <div>Jobrole</div>
                    <input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => handleColumnFilter("jobrole", e.target.value)}
                        style={{ width: "100%", padding: "4px", fontSize: "12px" }}
                    />
                </div>
            ),
            selector: (row: JobroleData) => row.jobrole ?? "",
            sortable: true,
            wrap: true,
        },
        {
            name: (
                <div>
                    <div>Jobrole Description</div>
                    <input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => handleColumnFilter("description", e.target.value)}
                        style={{ width: "100%", padding: "4px", fontSize: "12px" }}
                    />
                </div>
            ),
            selector: (row: JobroleData) =>
                row.description
                    ? (row.description.length > 100
                        ? `${row.description.substring(0, 100)}...`
                        : row.description)
                    : "N/A",
            sortable: true,
            wrap: true,
            cell: (row: JobroleData) => (
                <span data-title={row.description || "N/A"}>
                    {row.description
                        ? row.description.length > 100
                            ? `${row.description.substring(0, 100)}...`
                            : row.description
                        : "N/A"}
                </span>
            ),
        },
        {
            name: (
                <div>
                    <div>Performance Expectation</div>
                    <input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => handleColumnFilter("performance_expectation", e.target.value)}
                        style={{ width: "100%", padding: "4px", fontSize: "12px" }}
                    />
                </div>
            ),
            selector: (row: JobroleData) =>
                row.performance_expectation
                    ? (row.performance_expectation.length > 100
                        ? `${row.performance_expectation.substring(0, 100)}...`
                        : row.performance_expectation)
                    : "N/A",
            sortable: true,
            wrap: true,
            cell: (row: JobroleData) => (
                <span data-titleHead={row.performance_expectation || "N/A"}>
                    {row.performance_expectation
                        ? row.performance_expectation.length > 100
                            ? `${row.performance_expectation.substring(0, 100)}...`
                            : row.performance_expectation
                        : "N/A"}
                </span>
            ),
        },
        {
            name: "Actions",
            cell: (row: JobroleData) => (
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
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontSize: "14px",
                fontWeight: "bold",
                backgroundColor: "#4876ab",
                color: "white",
                whiteSpace: "nowrap",
                textAlign: "left" as const,
            },
        },
        cells: {
            style: {
                fontSize: "13px",
                textAlign: "left" as const,
            },
        },
    };

    return (
        <>
            {/* <div className='relative bg-[#fff] mx-6 rounded-lg'> */}
            {/* Department and Sub-department Filters */}
            {/* <div className="flex justify-center gap-8 py-6 inset-shadow-sm inset-shadow-[#EBF7FF] rounded-lg"> */}
            {/* Department Select */}
            {/* <div className="flex flex-col items-center w-[320px]">
                        <label htmlFor="Department" className="self-start mb-1 px-3">Jobrole Industries</label>
                        <select
                            name="industries"
                            className="rounded-lg p-2 border-2 border-[#CDE4F5] bg-[#ebf7ff] text-[#444444] focus:outline-none focus:border-blue-200 focus:bg-white w-full focus:rounded-none transition-colors duration-2000 drop-shadow-[0px_5px_5px_rgba(0,0,0,0.12)]"
                            onChange={e => fetchIndustriesData(e.target.value)}
                            value={selectedIndustry}
                        >
                            <option value="">Choose a Industries to Filter</option>
                            {industries.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>
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
                    </div> */}

            {/* Sub-department Multi-Select */}
            {/* <div className="flex flex-col items-center w-[320px]">
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
                    </div> */}
            {/* </div> */}

            {/* <hr className='mb-[26px] text-[#ddd] border-2 border-[#449dd5] rounded' /> */}
            {/* </div> */}
            <div className="w-[100%]">
                {tableData.length > 0 && (
                    <div className="mt-2 bg-white px-4 rounded-lg shadow-lg">
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
                            <div className="w-[320px] mr-auto">
                                    {/* <label htmlFor="Department" className="self-start mb-1 px-3">Jobrole Department</label> */}
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

                            {/* Right side - Export buttons */}
                            <div className="flex space-x-2">


                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
                                    onClick={() => setDialogOpen({ ...dialogOpen, add: true })}
                                    data-titleHead="Add New Jobrole"
                                >
                                    +
                                </button>
                                <PrintButton
                                    data={tableData}
                                    title="Job Roles Report"
                                    excludedFields={["id", "internal_id"]}
                                    buttonText={
                                        <>
                                            <span className="mdi mdi-printer-outline"></span>
                                        </>
                                    }
                                />
                                <ExcelExportButton
                                    sheets={[{ data: tableData, sheetName: "Submissions" }]}
                                    fileName="Skills Jobrole"
                                    onClick={() => console.log("Export initiated")}
                                    buttonText={
                                        <>
                                            <span className="mdi mdi-file-excel"></span>
                                        </>
                                    }
                                />
                                <PdfExportButton
                                    data={tableData}
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
                            data={filteredData.length > 0 ? filteredData : tableData}
                            pagination
                            highlightOnHover
                            responsive
                            striped
                            paginationPerPage={paginationPerPageVal}
                            paginationRowsPerPageOptions={[100, 500, 1000]}
                            onChangeRowsPerPage={handlePerPageChange}
                            customStyles={customStyles}
                            progressPending={loading}
                            noDataComponent={
                                <div className="w-full">
                                    <table className="rdt-table w-full">
                                        <thead>
                                            <tr>
                                                {columns.map((col, idx) => (
                                                    <th key={idx} style={customStyles.headCells.style}>
                                                        {col.name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                                                    {showResetFilters ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div>No records found matching your search criteria</div>
                                                            <button
                                                                onClick={resetFilters}
                                                                className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
                                                            >
                                                                Reset Filters
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        "No records available"
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            }
                            paginationDefaultPage={currentPage}
                            onChangePage={setCurrentPage}
                        />
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
                        fetchData(selectedIndustry, selectedDepartment, selectedSubDepartments);
                    }}
                />
            )}

            {dialogOpen.add && (
                <AddDialog skillId={null}
                    onClose={() => setDialogOpen({ ...dialogOpen, add: false })}
                    onSuccess={() => {
                        setDialogOpen({ ...dialogOpen, add: false });
                    }}
                />
            )}
        </>
    );
};

export default TableView;
