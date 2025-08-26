
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Calendar,
  Clock,
  Trophy,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Printer,
  Download,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ==================== TYPES ====================
type EmployeeData = {
  id: number;
  employee_no: string;
  full_name: string;
  jobrole: string;
  department_id: number;
  supervisor_opt: string;
  image: string;
  status: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  joined_date: string;
  total_experience: string;
  qualification: string;
  occupation: string;
};

type SkillData = {
  jobrole_skill_id: number;
  jobrole: string;
  skill: string;
  skill_id: number;
  title: string;
  category: string;
  sub_category: string;
  description: string;
  proficiency_level: number | null;
};

type CertificateData = {
  id: number;
  document_title: string;
  file_name: string;
  created_at: string;
  document_type: string;
};

type Task = {
  id: number;
  task_title: string;
  task_date: string;
  status: "PENDING" | "COMPLETED" | "IN-PROGRESS";
};

type TaskDetail = {
  total_task: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
};

type ApiResponse = {
  employeeData: EmployeeData;
  skillData: SkillData[];
  certificateData: CertificateData[];
  taskDetail: TaskDetail[];
  taskData: Task[];
};

// ==================== COMPONENT ====================
const EmployeeReport = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const handlePrint = () => window.print();
  const handleDownload = () => console.log("Downloading PDF...");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/user/employee_report?type=API&token=76|LnoeslSRYnAvDf7kJeg1vif0ylZZsCxNJ2SRKNwX29663c2d&sub_institute_id=1&syear=2025&employee_id=2"
        );

        if (!res.ok) throw new Error("Failed to fetch employee data");

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading employee report...</p>
      </div>
    );
  }

  if (!data || !data.employeeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Failed to load employee report.</p>
      </div>
    );
  }

  const { employeeData, skillData, certificateData, taskDetail, taskData } = data;

  // ✅ Prepare tasks & metrics
  const metrics = taskDetail?.[0] || {
    total_task: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
  };

  // ✅ Example: find expiring certs (dummy rule: expiring if older than 2 years)
  const expiringCerts = certificateData.filter((c) => {
    const created = new Date(c.created_at);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    return created < twoYearsAgo;
  });

  return (
    <div className="min-h-screen bg-muted/30  ">
      {/* Print Actions */}
      <div className="print:hidden mb-6 max-w-5xl mx-auto px-6">
        <div className="flex justify-end gap-3">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Report Container */}
      <div className="max-w-6xl mx-auto bg-card shadow-lg print:shadow-none print:max-w-none">
        {/* Header */}
        <div className="border-b-2 border-primary/20 p-8 print:p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Employee Report</h1>
              <p className="text-muted-foreground">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Employee ID: {employeeData.employee_no}</p>
              <p>Department ID: {employeeData.department_id}</p>
            </div>
          </div>

          {/* Employee Info */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={employeeData.image} alt={employeeData.full_name} />
              <AvatarFallback>
                {employeeData.full_name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{employeeData.full_name}</h2>
              <p className="text-lg text-muted-foreground mb-2">{employeeData.jobrole}</p>
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    employeeData.status.toLowerCase() === "active" ? "default" : "secondary"
                  }
                >
                  {employeeData.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Manager: {employeeData.supervisor_opt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CONTENT ==================== */}
        <div className="p-8 print:p-6 space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              Personal & Employment Information
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{employeeData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{employeeData.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {employeeData.address}, {employeeData.city},{" "}
                      {employeeData.state}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date of Joining
                    </p>
                    <p className="font-medium">
                      {new Date(employeeData.joined_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">
                      {employeeData.total_experience} years
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Qualification</p>
                    <p className="font-medium">{employeeData.qualification}</p>
                  </div>
                </div>

              </div>
            </div>
          </section>
          {/* Skills & Certifications */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">
              Skills & Certifications
            </h3>
            <div className="grid grid-cols-2 gap-8">
              {/* Skills */}
              <div>
                <h4 className="font-semibold mb-3">Technical Skills</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 
                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  {skillData.length > 0 ? (
                    skillData.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="font-medium truncate pr-4">{skill.title}</span>
                        {skill.proficiency_level !== null ? (
                          <span
                            className="flex items-center justify-center 
               w-6 h-6 text-[12px] font-medium
               border border-blue-600 text-blue-600
               rounded-full"
                          >
                            {skill.proficiency_level}
                          </span>
                        ) : (
                          <div className="flex justify-end">
                            <span className="block w-4 h-0.5 bg-gray-400 rounded"></span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills available.</p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="font-semibold mb-3">Certifications</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 
                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  {certificateData.length > 0 ? (
                    certificateData.map((cert, index) => {
                      const fileUrl = `https://s3-triz.fra1.digitaloceanspaces.com/public/hp_staff_document/${cert.file_name}`;
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary">
                            {cert.document_title} ({cert.document_type})
                          </a>
                          <span className="text-xs text-muted-foreground">
                            {new Date(cert.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No certifications available.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Current Tasks & Performance */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">
              Current Tasks & Performance
            </h3>
            <div className="grid grid-cols-2 gap-8">
              {/* Active Tasks */}
              <div>
                <h4 className="font-semibold mb-3">Active Tasks</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2
                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  {taskData && taskData.length > 0 ? (
                    taskData.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        {/* Task Title */}
                        <p className="text-sm font-medium w-90 break-words">
                          {task.task_title}
                        </p>

                        {/* Task Status */}
                        <Badge
                          className={`text-xs capitalize text-center w-24 py-1 truncate
    ${task.status === "COMPLETED"
                              ? "border border-green-400 bg-green-100 text-green-700"
                              : task.status === "PENDING"
                                ? "border border-gray-300 bg-gray-100 text-gray-600"
                                : task.status === "IN-PROGRESS"
                                  ? "border border-yellow-400 bg-yellow-100 text-yellow-700"
                                  : "border border-gray-300 bg-gray-100 text-gray-600"
                            }
    hover:bg-inherit focus:bg-inherit focus:ring-0 focus:outline-none
  `}
                        >
                          {task.status}
                        </Badge>

                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tasks available.</p>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-semibold mb-3">Performance Metrics</h4>
                <div className="max-h-64 overflow-y-auto pr-2 
                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{metrics.total_task}</div>
                        <p className="text-sm text-muted-foreground">Total Tasks</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-warning">{metrics.pending_count}</div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-success">{metrics.approved_count}</div>
                        <p className="text-sm text-muted-foreground">Approved</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-destructive">{metrics.rejected_count}</div>
                        <p className="text-sm text-muted-foreground">Rejected</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>


                {/* Key Insights */}
                {/* <div className="mt-4 p-4 bg-muted/30 rounded col-span-2">
                  <h5 className="font-medium text-foreground mb-2">Key Insights</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Excellent role-skill alignment</li>
                    <li>• Strong task completion track record</li>
                    <li>• {expiringCerts.length} certification(s) expiring soon</li>
                    <li>• Recommended for advanced React training</li>
                  </ul>
                </div> */}
              </div>
            </div>
          </section>

          {/* Summary & Recommendations */}
          {/* <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
              Summary & Recommendations
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    <li>• Strong academic qualification ({employeeData.qualification})</li>
                    <li>• Experienced ({employeeData.total_experience}+ years)</li>
                    <li>• Reliable and active status</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" stroke="#ff5733" />
                    Development Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    <li>• Upskill in leadership and management</li>
                    <li>• Explore advanced certifications in teaching</li>
                    <li>• Potential for cross-department training</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section> */}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 text-center text-sm text-muted-foreground">
          <p>This report is confidential and intended for internal use only.</p>
          <p>Generated on {new Date().toLocaleDateString()} by HR Management System</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReport;
