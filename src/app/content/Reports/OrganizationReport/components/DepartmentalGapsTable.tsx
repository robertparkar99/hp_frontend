
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

const departmentData = [
  { 
    department: "Engineering", 
    headcount: 320, 
    hires: 45, 
    attrition: 7.2, 
    growth: 16.4,
    color: "#0da2e7"
  },
  { 
    department: "Sales", 
    headcount: 195, 
    hires: 28, 
    attrition: 5.8, 
    growth: 12.1,
    color: "#10b77f"
  },
  { 
    department: "Marketing", 
    headcount: 165, 
    hires: 22, 
    attrition: 4.5, 
    growth: 11.8,
    color: "#f9a825"
  },
  { 
    department: "Operations", 
    headcount: 210, 
    hires: 32, 
    attrition: 3.2, 
    growth: 18.6,
    color: "#7c3bed"
  },
  { 
    department: "HR", 
    headcount: 62, 
    hires: 8, 
    attrition: 6.1, 
    growth: 9.2,
    color: "#e92063"
  },
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Departmental Summary</CardTitle>
      </CardHeader>
      <CardContent>
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
            {departmentData.map((dept) => (
              <TableRow key={dept.department} className="hover:bg-muted/50 transition-colors">
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
      </CardContent>
    </Card>
  );
};