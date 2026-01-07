"use client";

import { useState, useEffect } from "react";
import DataTable,{TableStyles,TableColumn} from "react-data-table-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, Calendar, MessageSquare, Download, Star } from "lucide-react";
import dynamic from 'next/dynamic';
import Feedback from './Feedback';

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
  candidate_name: string;
  position: number;
  status: string;
  stage: string | null;
  applied_date: string;
  next_interview: string | null;
  score: string | null;
  panel_id: number | null;
}

interface Filters {
  [key: string]: string;
}
interface SessionData {
  url?: string;
  token?: string;
  sub_institute_id?: string | number;
  org_type?: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Interview Scheduled":
      return "bg-blue-100 text-blue-800";
    case "Under Review":
    case "Pending Review":
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
   const [candidates, setCandidates] = useState<Candidate[]>([]);
   const [filteredData, setFilteredData] = useState<Candidate[]>([]);
   const [currentView, setCurrentView] = useState<'candidates' | 'feedback'>('candidates');
   const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
   const [sessionData, setSessionData] = useState<SessionData>({});
   const [loading, setLoading] = useState<boolean>(true);

  // ---------- Load session ----------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type } =
          JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id, org_type });
      }
    }
  }, []);

  const fetchCandidates = async () => {
    if (!sessionData.sub_institute_id || !sessionData.url || !sessionData.token) return;
    setLoading(true);
    try {
      const response = await fetch(`${sessionData.url}/api/candidate?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`);
      const data = await response.json();
      if (data.status) {
        setCandidates(data.data);
        setFilteredData(data.data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [sessionData.sub_institute_id, sessionData.url, sessionData.token]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      const filtered = candidates.filter(candidate =>
        candidate.candidate_name.toLowerCase().includes(term.toLowerCase()) ||
        candidate.position.toString().toLowerCase().includes(term.toLowerCase()) ||
        candidate.status.toLowerCase().includes(term.toLowerCase()) ||
        (candidate.stage || '').toLowerCase().includes(term.toLowerCase()) ||
        candidate.applied_date.toLowerCase().includes(term.toLowerCase()) ||
        (candidate.next_interview || '').toLowerCase().includes(term.toLowerCase()) ||
        (candidate.score || '').toLowerCase().includes(term.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(candidates);
    }
  };

  const handleColumnFilter = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value.toLowerCase(),
    }));
  };

  useEffect(() => {
    let filtered = [...candidates];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.stage || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.applied_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.next_interview || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.score || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply column filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].trim() !== "") {
        filtered = filtered.filter((item) => {
          let value = '';
          if (key === 'position') {
            value = item.position.toString().toLowerCase();
          } else if (key === 'applied_date') {
            value = new Date(item.applied_date).toLocaleDateString().toLowerCase();
          } else if (key === 'next_interview') {
            value = (item.next_interview || '').toLowerCase();
          } else if (key === 'score') {
            value = (item.score || '').toLowerCase();
          } else if (key === 'stage') {
            value = (item.stage || '').toLowerCase();
          } else {
            value = (item[key as keyof Candidate] as string || '').toLowerCase();
          }
          return value.includes(filters[key]);
        });
      }
    });

    setFilteredData(filtered);
  }, [filters, searchTerm, candidates]);

  const columns :TableColumn<Candidate>[]= [
    {
      name: (
        <div>
          <div>Candidate Name</div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleColumnFilter("candidate_name", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => row.candidate_name,
      cell: (row: Candidate) => {
        const parts = row.candidate_name.split(' ');
        const email = parts.pop() || '';
        const name = parts.join(' ');
        return (
          <div>
            <p className="font-medium">{name}</p>
            {/* <p className="text-sm text-muted-foreground">{email}</p> */}
          </div>
        );
      },
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
      selector: (row: Candidate) => row.position.toString(),
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
      selector: (row: Candidate) => row.stage || "-",
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
            onChange={(e) => handleColumnFilter("applied_date", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => new Date(row.applied_date).toLocaleDateString(),
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
            onChange={(e) => handleColumnFilter("next_interview", e.target.value)}
            style={{ width: "100%", padding: "4px", fontSize: "12px" }}
          />
        </div>
      ),
      selector: (row: Candidate) => row.next_interview ? new Date(row.next_interview).toLocaleString() : "-",
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
      selector: (row: Candidate) => row.score || "-",
      cell: (row: Candidate) => (
        <div className="flex items-center">
          <span className="font-medium">{row.score ? parseFloat(row.score) : '-'}</span>
          {row.score && <span className="text-muted-foreground">/10</span>}
        </div>
      ),
      sortable: true,
      minWidth: "100px"
    },
    {
      name: "Actions",
      cell: (row: Candidate) => (
        <div className="flex w-full space-x-1">
          <Button size="sm" variant="outline" className="h-6 px-2 w-16">
            <Eye className="h-3 w-3 ]" />
            View
          </Button>
          {/* <Button size="sm" variant="outline" className="h-6 px-2 w-25">
            <Calendar className="h-2 w-2 ml-2" />
            Schedule
          </Button> */}
          <Button size="sm" variant="outline" className="h-6 px-2 w-24">
            <MessageSquare className="h-3 w-3 " />
            Message
          </Button>
          <Button size="sm" variant="outline" className="h-6 px-2 w-23" onClick={() => { setSelectedCandidate(row); setCurrentView('feedback'); }}>
            <Star className="h-3 w-3" />
            Feedback
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
      minWidth: "290px"
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

  if (currentView === 'feedback' && selectedCandidate) {
    return <Feedback candidate={selectedCandidate} onBack={() => setCurrentView('candidates')} onRefresh={fetchCandidates} />;
  }

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
           data={filteredData.length > 0 ? filteredData : candidates}
           title="Candidates"
           excludedFields={["panel_id"]}
           buttonText={
             <>
               <span className="mdi mdi-printer-outline"></span>
             </>
           }
         />
         <ExcelExportButton
           sheets={[{ data: filteredData.length > 0 ? filteredData : candidates, sheetName: "Candidates" }]}
           fileName="candidates"
           buttonText={
             <>
               <span className="mdi mdi-file-excel"></span>
             </>
           }
         />
         <PdfExportButton
           data={filteredData.length > 0 ? filteredData : candidates}
           fileName="candidates"
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
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="mt-2 text-muted-foreground">Loading candidates...</div>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}