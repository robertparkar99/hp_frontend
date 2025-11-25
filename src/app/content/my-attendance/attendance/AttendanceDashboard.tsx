
'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, User, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceList } from './AttendanceList';
import { AttendanceStats } from './AttendanceStats';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  date: string;
  punchIn: string | null;
  punchOut: string | null;
  totalHours: number | null;
  status: 'present' | 'absent' | 'active';
  employeeName?: string;
  department?: string;
}

interface ApiAttendance {
  id: number;
  day: string;
  punchin_time: string | null;
  punchout_time: string | null;
  timestamp_diff: string | null;
  status: number;
  employee_name: string;
  department: string;
}

interface ApiResponse {
  message: string;
  daysInMonth: number;
  presentDays: number;
  absentDays: number;
  percentege: number;
  attendanceData?: ApiAttendance[]; // 👈 make optional
}

// ✅ Convert API timestamp_diff → decimal hours
const parseHours = (diff: string | null): number => {
  if (!diff) return 0;
  const [h, m, s] = diff.split(':').map(Number);
  const total = h + m / 60 + s / 3600;
  return Math.round(total * 100) / 100;
};

// ✅ Map API → local records
const mapApiToRecords = (data?: ApiAttendance[]): AttendanceRecord[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => ({
    id: item.id.toString(),
    date: format(new Date(item.day), 'EEE, MMM do'),
    punchIn: item.punchin_time,
    punchOut: item.punchout_time,
    totalHours: parseHours(item.timestamp_diff),
    status: item.status === 1 ? 'present' : 'absent',
    employeeName: item.employee_name,
    department: item.department,
  }));
};

// ✅ Helper to get public IP
const getPublicIp = async (): Promise<string> => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip || "0.0.0.0";
  } catch (err) {
    console.error("❌ Failed to fetch IP:", err);
    return "0.0.0.0";
  }
};

export function AttendanceDashboard() {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
    firstName: '',
    middleName: '',
    lastName: '',
  });

  // ✅ Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const {
        APP_URL,
        token,
        sub_institute_id,
        org_type,
        user_id,
        first_name,
        middle_name,
        last_name,
      } = JSON.parse(userData);

      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
        firstName: first_name || '',
        middleName: middle_name || '',
        lastName: last_name || '',
      });
    }
  }, []);

  // ✅ Clock updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Fetch attendance data
  const fetchAttendance = async () => {
    try {
      if (!sessionData.url || !sessionData.token || !sessionData.subInstituteId || !sessionData.userId) return;

      const res = await fetch(
        `${sessionData.url}/hrms-attendance?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}&formType=MyAttendance`,
        { cache: 'no-store' }
      );

      if (!res.ok) throw new Error('Failed to fetch');
      const json: ApiResponse = await res.json();
      setApiData(json);
    } catch (err) {
      console.error('Error fetching API attendance:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [sessionData]);

  // ✅ Update punch state based on API data
  useEffect(() => {
    if (!apiData?.attendanceData) return;

    const records = mapApiToRecords(apiData.attendanceData);

    if (records.length > 0) {
      const latest = records[0];
      if (latest.punchIn && !latest.punchOut) {
        setIsPunchedIn(true);
        setPunchInTime(new Date(latest.punchIn));
      } else {
        setIsPunchedIn(false);
        setPunchInTime(null);
      }
    }
  }, [apiData]);

  // ✅ API: Punch In
  const punchInApi = async (now: Date) => {
    try {
      setIsProcessing(true);
      const ip = await getPublicIp();

      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('token', sessionData.token);
      formData.append('user_id', sessionData.userId);
      formData.append('client_id', '0');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('outdate', format(now, 'yyyy-MM-dd'));
      formData.append('punchin_time', format(now, 'yyyy-MM-dd HH:mm:ss'));
      formData.append('address_in', ip);

      const res = await fetch(`${sessionData.url}/hrms-in-time/store`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data?.status === "0") {
        alert(data.message || "Already punch in");
        setIsProcessing(false);
        return null;
      }

      await fetchAttendance();
      setIsProcessing(false);
      return data;
    } catch (error) {
      setIsProcessing(false);
      console.error('❌ Punch In Error:', error);
      throw error;
    }
  };

  // ✅ API: Punch Out
  const punchOutApi = async (now: Date) => {
    try {
      setIsProcessing(true);
      const ip = await getPublicIp();

      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('token', sessionData.token);
      formData.append('user_id', sessionData.userId);
      formData.append('client_id', '0');
      formData.append('sub_institute_id', sessionData.subInstituteId);
      formData.append('outdate', format(now, 'yyyy-MM-dd'));
      formData.append('punchout_time', format(now, 'yyyy-MM-dd HH:mm:ss'));
      formData.append('address_out', ip);

      await fetch(`${sessionData.url}/hrms-out-time/store`, {
        method: 'POST',
        body: formData,
      });

      await fetchAttendance();
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      console.error('❌ Punch Out Error:', error);
    }
  };

  // ✅ Handle Punch In/Out
  const handlePunch = async () => {
    if (isProcessing) return;
    const now = new Date();

    if (!isPunchedIn) {
      const result = await punchInApi(now);
      if (result && result.status !== "0") {
        setIsPunchedIn(true);
        setPunchInTime(now);
      }
    } else {
      await punchOutApi(now);
      setIsPunchedIn(false);
      setPunchInTime(null);
    }
  };

  const currentDate = format(currentTime, 'EEEE, MMMM do, yyyy');
  const currentTimeStr = format(currentTime, 'hh:mm:ss a');

  // ✅ Records always from API (safe)
  const allRecords: AttendanceRecord[] = apiData?.attendanceData
    ? mapApiToRecords(apiData.attendanceData)
    : [];

  // ✅ Full employee name
  const fullName = [sessionData.firstName, sessionData.middleName, sessionData.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="min-h-screen  bg-background rounded-xl w-full">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#6fb2f2] text-primary-foreground">
        <div className="absolute inset-0 opacity-20" />
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Attendance</h1>
              <p className="text-primary-foreground/90 text-lg">{currentDate}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5" />
                <span className="text-lg font-semibold">{fullName || 'Employee'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-mono">{currentTimeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Punch Card */}
        <Card className="attendance-card mb-8 hover-lift">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              Time Tracking
            </CardTitle>
            <div className="flex justify-center">
              <div
                className={`status-indicator ${
                  isPunchedIn ? 'status-active pulse-success' : 'status-inactive'
                }`}
              >
                <Timer className="w-4 h-4 mr-2" />
                {isPunchedIn ? 'Currently Checked In' : 'Ready to Check In'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            {punchInTime && isPunchedIn && (
              <div className="mb-6 p-4 bg-success-light rounded-lg border border-success/20">
                <p className="text-sm text-muted-foreground mb-1">Checked in at</p>
                <p className="text-2xl font-bold text-success">
                  {format(punchInTime, 'hh:mm a')}
                </p>
              </div>
            )}
            <Button
              onClick={handlePunch}
              size="lg"
              disabled={isProcessing}
              className={`
                bg-[#F9F9F9] text-[#228822] hover:bg-gray-200 transition-colors text-xl px-12 py-6 rounded-xl font-bold transform transition-all duration-300
                ${isPunchedIn ? 'btn-punch-out' : 'btn-punch-in'}
              `}
            >
              <Clock className="w-10 h-6 mr-3 " />
              {isPunchedIn ? 'Punch Out' : 'Punch In'}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        {apiData ? (
          <AttendanceStats attendanceRecords={allRecords} apiData={apiData} />
        ) : (
          <p className="mb-8 text-muted-foreground">Loading stats...</p>
        )}

        {/* Attendance List */}
        <Card className="attendance-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-5 h-5" />
              Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceList records={allRecords} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
