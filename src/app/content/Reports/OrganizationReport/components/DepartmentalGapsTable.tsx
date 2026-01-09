
"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepartmentItem {
  department: string;
  headcount: number;
  hires: number;
  attrition: number;
  growth: number;
  color: string;
}

const colors = [
  "#0da2e7", "#10b77f", "#f9a825", "#7c3bed", "#e92063",
  "#fb923c", "#06b6d4", "#84cc16", "#f59e0b", "#ef4444"
];

const GrowthIndicator = ({ value }: { value: number }) => {
  if (value > 15) {
    return (
      <div className="flex items-center justify-end gap-1 text-[#4ade80]">
        <span className="font-medium">{value.toFixed(1)}%</span>
        <ArrowUp className="h-4 w-4" />
      </div>
    );
  }
  if (value < 10) {
    return (
      <div className="flex items-center justify-end gap-1 text-[#fbbf24]">
        <span className="font-medium">{value.toFixed(1)}%</span>
        <ArrowDown className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-end gap-1 text-muted-foreground">
      <span className="font-medium">{value.toFixed(1)}%</span>
      <Minus className="h-4 w-4" />
    </div>
  );
};

const AttritionIndicator = ({ value }: { value: number }) => {
  const isHigh = value > 6;
  return (
    <div className="text-right">
      <span className={cn(
        "font-medium",
        isHigh ? "text-[#e92063]" : "text-[#4ade80]"
      )}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
};

export const DepartmentalGapsTable = () => {
  const [departmentData, setDepartmentData] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
      });
    }
  }, []);

  useEffect(() => {
    if (!sessionData.url) return;

    const fetchDepartmentGap = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${sessionData.url}/api/reports/departments/summary?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch department summary");
        }

        const data = await res.json();

        const dataWithColors: DepartmentItem[] = data
          .map((item: any, index: number) => ({
            ...item,
            color: colors[index % colors.length],
          }))
          .sort((a: DepartmentItem, b: DepartmentItem) => a.department.localeCompare(b.department));

        setDepartmentData(dataWithColors);
      } catch (error) {
        console.error("Error fetching department summary data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentGap();
  }, [sessionData.url]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Departmental Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading department summary data...</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
              <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Headcount</TableHead>
              <TableHead className="text-right">New Hires</TableHead>
              <TableHead className="text-right">Attrition Rate</TableHead>
              <TableHead className="text-right">Growth %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departmentData.map((dept, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: dept.color }}
                    />
                    {dept.department}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {dept.headcount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">{dept.hires}</TableCell>
                <TableCell className="text-right">
                  <AttritionIndicator value={dept.attrition} />
                </TableCell>
                <TableCell className="text-right">
                  <GrowthIndicator value={dept.growth} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};