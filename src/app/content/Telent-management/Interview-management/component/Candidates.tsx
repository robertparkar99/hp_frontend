"use client";

import { useState, useEffect } from "react";
import DataTable,{TableStyles,TableColumn} from "react-data-table-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, Calendar, MessageSquare, Download } from "lucide-react";
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

// Define TypeScript interfaces
interface Candidate {
  id: number;
  name: string;
  email: string;
  position: string;
  status: string;
  stage: string;
  appliedDate: string;
  nextInterview: string | null;
  score: number;
}

interface Filters {
  [key: string]: string;
}

const candidatesData: Candidate[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    position: "Senior Software Engineer",
    status: "Interview Scheduled",
    stage: "Technical Interview",
    appliedDate: "2024-01-15",
    nextInterview: "2024-01-20 10:00 AM",
    score: 8.5,
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    email: "m.rodriguez@email.com",
    position: "Product Manager",
    status: "Under Review",
    stage: "Application Review",
    appliedDate: "2024-01-12",
    nextInterview: null,
    score: 7.8,
  },
  {
    id: 3,
    name: "Lisa Zhang",
    email: "lisa.zhang@email.com",
    position: "UX Designer",
    status: "Interview Scheduled",
    stage: "Final Interview",
    appliedDate: "2024-01-10",
    nextInterview: "2024-01-22 2:00 PM",
    score: 9.2,
  },
  {
    id: 4,
    name: "David Chen",
    email: "david.chen@email.com",
    position: "Data Scientist", 
    status: "Offer Extended",
    stage: "Offer Stage",
    appliedDate: "2024-01-08",
    nextInterview: null,
    score: 9.0,
  },
  {
    id: 5,
    name: "Emma Wilson",
    email: "emma.w@email.com",
    position: "Marketing Manager",
    status: "Pending Feedback",
    stage: "Phone Screening",
    appliedDate: "2024-01-14",
    nextInterview: null,
    score: 7.5,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Interview Scheduled":
      return "bg-blue-100 text-blue-800";
    case "Under Review":
      return "bg-yellow-100 text-yellow-800";
    case "Offer Extended":
      return "bg-green-100 text-green-800";
    case "Pending Feedback":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({});
  const [filteredData, setFilteredData] = useState<Candidate[]>(candidatesData);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      const filtered = candidatesData.filter(candidate =>
        candidate.name.toLowerCase().includes(term.toLowerCase()) ||
        candidate.position.toLowerCase().includes(term.toLowerCase()) ||
        candidate.email.toLowerCase().includes(term.toLowerCase()) ||
        candidate.status.toLowerCase().includes(term.toLowerCase()) ||
        candidate.stage.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(candidatesData);
    }
  };

  const handleColumnFilter = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value.toLowerCase(),
    }));
  };

  useEffect(() => {
    let filtered = [...candidatesData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply column filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].trim() !== "") {
        filtered = filtered.filter((item) => {
          const value = (item[key as keyof Candidate] || "").toString().toLowerCase();
          return value.includes(filters[key]);
        });
      }
    });

    setFilteredData(filtered);
  }, [filters, searchTerm]);

  const columns :TableColumn<Candidate>[]= [
    {
      name: (
        <div>
          <div>Candidate Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => row.name,
      cell: (row: Candidate) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.email}</p>
        </div>
      ),
      sortable: true,
      minWidth: "200px"
    },
    {
      name: (
        <div>
          <div>Position</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("position", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => row.position,
      sortable: true,
      minWidth: "180px"
    },
    {
      name: (
        <div>
          <div>Status</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("status", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => row.status,
      cell: (row: Candidate) => (
        <Badge className={getStatusBadge(row.status)}>
          {row.status}
        </Badge>
      ),
      sortable: true,
      minWidth: "160px"
    },
    {
      name: (
        <div>
          <div>Stage</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("stage", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => row.stage,
      sortable: true,
      minWidth: "150px"
    },
    {
      name: (
        <div>
          <div>Applied Date</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("appliedDate", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => new Date(row.appliedDate).toLocaleDateString(),
      sortable: true,
      minWidth: "120px"
    },
    {
      name: (
        <div>
          <div>Next Interview</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("nextInterview", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => row.nextInterview || "-",
      sortable: true,
      minWidth: "150px"
    },
    {
      name: (
        <div>
          <div>Score</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("score", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => row.score,
      cell: (row: Candidate) => (
        <div className="flex items-center">
          <span className="font-medium">{row.score}</span>
          <span className="text-muted-foreground">/10</span>
        </div>
      ),
      sortable: true,
      minWidth: "100px"
    },
    {
      name: "Actions",
      cell: (row: Candidate) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="h-8">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" className="h-8">
            <Calendar className="h-3 w-3 mr-1" />
            Schedule
          </Button>
          <Button size="sm" variant="outline" className="h-8">
            <MessageSquare className="h-3 w-3 mr-1" />
            Message
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
      minWidth: "250px"
    },
  ];

  const customStyles : TableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        backgroundColor: "#D1E7FF",
        color: "black",
        whiteSpace: "nowrap",
        textAlign: "left",
        fontWeight: "bold",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        textAlign: "left",
        padding: "12px 8px",
      },
    },
    table: {
      style: {
        borderRadius: "8px",
        overflow: "hidden",
      },
    },
    rows: {
      style: {
        '&:not(:last-of-type)': {
          borderBottom: '1px solid #e5e7eb',
        },
        '&:hover': {
          backgroundColor: '#f8fafc',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground">Candidates</h1>
          <p className="text-muted-foreground text-sm">
            Manage and track all candidate applications
          </p>
        </div>
       <div className="flex space-x-2">
            <PrintButton
              data={filteredData.length > 0 ? filteredData : candidatesData}
              title="Incident Reports"
              excludedFields={["id"]}
              buttonText={
                <>
                  <span className="mdi mdi-printer-outline"></span>
                </>
              }
            />
            <ExcelExportButton
              sheets={[{ data: filteredData.length > 0 ? filteredData : candidatesData, sheetName: "Incident Reports" }]}
              fileName="incident_reports"
              buttonText={
                <>
                  <span className="mdi mdi-file-excel"></span>
                </>
              }
            />
            <PdfExportButton
              data={filteredData.length > 0 ? filteredData : candidatesData}
              fileName="incident_reports"
              buttonText={
                <>
                  <span className="mdi mdi-file-pdf-box"></span>
                </>
              }
            />
          </div>
      </div>

      {/* Search and Filters */}
      <Card className="widget-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, position, email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <Card className="widget-card">
        <CardHeader >
          <CardTitle className="text-xl">All Candidates ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredData}
            customStyles={customStyles}
            pagination
            highlightOnHover
            responsive
            noDataComponent={
              <div className="p-8 text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">No candidates found</div>
                <div className="text-sm">Try adjusting your search or filters</div>
              </div>
            }
            persistTableHead
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
          />
        </CardContent>
      </Card>
    </div>
  );
}