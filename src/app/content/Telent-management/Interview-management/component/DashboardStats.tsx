import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const stats = [
  {
    title: "Active Candidates",
    value: "48",
    change: "+8 this week",
    icon: Users,
    color: "text-success",
  },
  {
    title: "Pending Feedback",
    value: "6",
    change: "Due within 24h",
    icon: Clock,
    color: "text-warning",
  },
  {
    title: "Completed Interviews",
    value: "156",
    change: "This month",
    icon: CheckCircle,
    color: "text-success",
  },
];

export function DashboardStats() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [interviewsTodayCount, setInterviewsTodayCount] = useState<number>(0);
  const [activeCandidatesCount, setActiveCandidatesCount] = useState<number>(0);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState<number>(0);

  // Fetch session data on mount
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

  // Fetch active candidates count
  useEffect(() => {
    if (sessionData) {
      const fetchActiveCandidates = async () => {
        try {
          const response = await fetch(`${sessionData.url}/api/job-applications?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`);
          const data = await response.json();
          if (data.data) {
            setActiveCandidatesCount(data.data.length);
          }
        } catch (error) {
          console.error('Error fetching active candidates:', error);
        }
      };
      fetchActiveCandidates();
    }
  }, [sessionData]);

  // Fetch today's interviews count
  useEffect(() => {
    if (sessionData) {
      const fetchInterviewsData = async () => {
        try {
          const response = await fetch(`${sessionData.url}/api/interview-details?sub_institute_id=${sessionData.sub_institute_id}&type=API&token=${sessionData.token}`);
          const data = await response.json();
          if (data.data) {
            const today = new Date().toDateString();
            const filteredData = data.data.filter((item: any) => {
              if (!item.interview_date) return false;
              return new Date(item.interview_date).toDateString() === today;
            });
            setInterviewsTodayCount(filteredData.length);
          }
        } catch (error) {
          console.error('Error fetching interviews data:', error);
        }
      };
      fetchInterviewsData();
    }
  }, [sessionData]);

  // Fetch pending feedback count
  useEffect(() => {
    if (sessionData) {
      const fetchPendingFeedback = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/pending-feedback?sub_institute_id=3&type=API&token=1078|LFXrQZWcwl5wl9lhhC5EyFNDvKLPHxF9NogOmtW652502ae5`);
          const data = await response.json();
          if (data.status && data.count !== undefined) {
            setPendingFeedbackCount(data.count);
          }
        } catch (error) {
          console.error('Error fetching pending feedback:', error);
        }
      };
      fetchPendingFeedback();
    }
  }, [sessionData]);

  const dynamicStats = [
    {
      title: "Interviews Today",
      value: interviewsTodayCount.toString(),
      change: "+2 from yesterday", // Keeping static as per original
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      title: "Active Candidates",
      value: activeCandidatesCount.toString(),
      change: "+8 this week",
      icon: Users,
      color: "text-success",
    },
    {
      title: "Pending Feedback",
      value: pendingFeedbackCount.toString(),
      change: "Due within 24h",
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Completed Interviews",
      value: "156",
      change: "This month",
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dynamicStats.map((stat) => (
        <Card key={stat.title} className="widget-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-xl">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}