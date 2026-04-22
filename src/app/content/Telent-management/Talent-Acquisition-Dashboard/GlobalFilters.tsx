import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export const GlobalFilters = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Global Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <Select defaultValue="all-dept">
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-dept">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-loc">
            
          </Select>

          <Select defaultValue="monthly">
            <SelectTrigger>
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-level">
            <SelectTrigger>
              <SelectValue placeholder="Job Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-level">All Levels</SelectItem>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>


        </div>
      </CardContent>
    </Card>
  );
};
