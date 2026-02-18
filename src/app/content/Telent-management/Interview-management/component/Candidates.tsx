
import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { MoreHorizontal, Search, Filter, Download, Printer, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Candidate {
  id: number;
  candidate_name: string;
  position: string;
  applied_date: string;
  status: string;
  stage: string;
  next_interview?: string;
  score?: number;
  mobile: string;
  email: string;
}

const STAGES = ["Applied", "Screening", "Technical Interview", "HR Interview", "Offer", "Hired", "Rejected"];

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sessionData, setSessionData] = useState<{ url?: string; token?: string; sub_institute_id?: string | number }>({});
  const [stageFilter, setStageFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id });
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchCandidates();
    }
  }, [sessionData.url, sessionData.token, currentPage, rowsPerPage, searchTerm, stageFilter, dateRange]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "API",
        token: sessionData.token || "",
        sub_institute_id: String(sessionData.sub_institute_id),
        page: String(currentPage),
        limit: String(rowsPerPage),
        ...(searchTerm && { search: searchTerm }),
        ...(stageFilter && { stage: stageFilter }),
      });

      if (dateRange.start) params.append("start_date", dateRange.start);
      if (dateRange.end) params.append("end_date", dateRange.end);

      const response = await fetch(`${sessionData.url}/api/job-applications/list?${params}`);
      const data = await response.json();

      if (data.data) {
        const formattedCandidates: Candidate[] = data.data.map((candidate: any) => ({
          id: candidate.id,
          candidate_name: `${candidate.first_name || ""} ${candidate.middle_name || ""} ${candidate.last_name || ""}`.replace(/\s+/g, ' ').trim(),
          position: candidate.job?.title || "N/A",
          applied_date: candidate.created_at ? candidate.created_at.split("T")[0] : "N/A",
          status: candidate.status === "shortlisted" ? "Shortlisted" : (candidate.status === "selected" ? "Selected" : (candidate.status === "rejected" ? "Rejected" : "Applied")),
          stage: candidate.stage || "Applied",
          mobile: candidate.mobile || "N/A",
          email: candidate.email || "N/A",
          next_interview: candidate.next_interview_date || undefined,
          score: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
        }));

          setCandidates(formattedCandidates);
          setTotalRows(data.total || 0);
        }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelect = (state: any) => {
    const selectedIds = state.selectedRows.map((row: any) => row.id);
    setSelectedCandidates(selectedIds);
  };

  const handleSelectAll = (state: any) => {
    if (state.selectedAll) {
      setSelectedCandidates(candidates.map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleExport = (type: "print" | "excel" | "pdf") => {
    alert(`Exporting as ${type.toUpperCase()}...`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "shortlisted":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "selected":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      "Applied": "bg-blue-50 text-blue-600 border-blue-200",
      "Screening": "bg-indigo-50 text-indigo-600 border-indigo-200",
      "Technical Interview": "bg-amber-50 text-amber-600 border-amber-200",
      "HR Interview": "bg-purple-50 text-purple-600 border-purple-200",
      "Offer": "bg-emerald-50 text-emerald-600 border-emerald-200",
      "Hired": "bg-green-50 text-green-600 border-green-200",
      "Rejected": "bg-red-50 text-red-600 border-red-200"
    };
    return colors[stage] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const columns = [
    {
      name: "Name",
      selector: (row: Candidate) => row.candidate_name,
      sortable: true,
      searchable: true,
      cell: (row: Candidate) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.candidate_name}</span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      )
    },
    {
      name: "Position",
      selector: (row: Candidate) => row.position,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: Candidate) => row.status,
      sortable: true,
      cell: (row: Candidate) => (
          <Badge className={`${getStatusColor(row.status)} border-0`}>
            {row.status}
          </Badge>
        )
    },
    {
      name: "Stage",
      selector: (row: Candidate) => row.stage,
      sortable: true,
      cell: (row: Candidate) => (
        <span className={`text-xs px-2 py-1 rounded-full border ${getStageColor(row.stage)}`}>
          {row.stage}
        </span>
      )
    },
    {
      name: "Applied",
      selector: (row: Candidate) => row.applied_date,
      sortable: true,
      sortFunction: (a: Candidate, b: Candidate) => new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime()
    },
    {
      name: "Next Interview",
      selector: (row: Candidate) => row.next_interview || "-",
      sortable: true,
    },
    {
      name: "Score",
      selector: (row: Candidate) => row.score || "-",
      sortable: true,
      cell: (row: Candidate) => row.score ? (
        <div className="flex items-center gap-1">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${row.score >= 80 ? "bg-green-500" : row.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${row.score}%` }}
            />
          </div>
            <span className="text-xs text-muted-foreground">{row.score}%</span>
          </div>
        ) : "-"
    },
    {
      name: "Actions",
      cell: (row: Candidate) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
            <DropdownMenuItem>Send Email</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Update Status</DropdownMenuItem>
            <DropdownMenuItem>Reject Candidate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6" id="tour-candidates-list">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Candidates</h1>
          <p className="text-muted-foreground text-sm">
            Manage and track candidates through the hiring process
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Section */}
        <Card className="lg:col-span-1 h-fit widget-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2" id="tour-candidates-search">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="candidates-search-input"
                  placeholder="Search candidates..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2" id="tour-candidates-filters">
              <label className="text-sm font-medium">Stage</label>
              <select
                className="w-full p-2 border rounded-md"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">All Stages</option>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mb-2"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchTerm("");
                setStageFilter("");
                setDateRange({ start: "", end: "" });
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card className="lg:col-span-3 widget-card" id="tour-candidates-table">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Candidates List</CardTitle>
            <div className="flex items-center gap-2" id="tour-candidates-export">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("print")}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={candidates}
              onSelectedRowsChange={handleRowSelect}
              selectableRows
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationDefaultPage={currentPage}
              paginationPerPage={rowsPerPage}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(rowsPerPage: number, page: number) => {
                setRowsPerPage(rowsPerPage);
                setCurrentPage(page);
              }}
              progressPending={loading}
              highlightOnHover
              striped
              className="react-data-table"
              customStyles={{
                headCells: {
                  style: {
                    fontWeight: "600",
                    backgroundColor: "#f8fafc",
                    color: "#334155"
                  }
                },
                cells: {
                  style: {
                    padding: "12px 16px"
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
