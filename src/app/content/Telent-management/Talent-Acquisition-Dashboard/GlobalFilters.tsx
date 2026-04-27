import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useState, useEffect } from "react";

interface JobPosting {
  id: number;
  title: string;
  department_id: number;
}


interface GlobalFiltersProps {
  filters: {
    department: string;
    location: string;
    timePeriod: string;
    jobLevel: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const GlobalFilters = ({ filters, onFilterChange }: GlobalFiltersProps) => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const {
        APP_URL,
        token,
        sub_institute_id,
        org_type,
        user_id,
        user_profile_id,
        user_profile_name,
      } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id,
        userProfileId: user_profile_id,
        userProfileName: user_profile_name,
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionData) return;
      try {
        const response = await fetch(
          `${sessionData.url}/api/job-postings?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}`
        );

        const result = await response.json();

        if (result?.data) {
          // Remove duplicate department_id values
          const uniqueDepartments = result.data.filter(
            (item: JobPosting, index: number, self: JobPosting[]) =>
              index ===
              self.findIndex(
                (dept) => dept.department_id === item.department_id
              )
          );

          setJobPostings(uniqueDepartments);
        }
      } catch (error) {
        console.error("Error fetching job postings:", error);
      }
    };

    fetchData();
  }, [sessionData]);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Global Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {/* Department Dropdown */}
          <Select value={filters.department} onValueChange={(value) => onFilterChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all-dept">
                All Departments
              </SelectItem>

              {jobPostings.map((job, index) => (
                <SelectItem
                  key={`${job.department_id}-${index}`}
                  value={job.department_id.toString()}
                >
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

 

          {/* Time Period Dropdown */}
          <Select value={filters.timePeriod} onValueChange={(value) => onFilterChange('timePeriod', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {/* Job Level Dropdown */}
          <Select value={filters.jobLevel} onValueChange={(value) => onFilterChange('jobLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Job Level" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all-level">
                All Levels
              </SelectItem>
              <SelectItem value="Entry Level (0-2 years)">
                Entry Level
              </SelectItem>
              <SelectItem value="Mid Level (3-5 years)">
                Mid Level
              </SelectItem>
              <SelectItem value="Senior Level (6-10 years)">
                Senior Level
              </SelectItem>
              <SelectItem value="Lead Level (10+ years)">
                Lead Level
              </SelectItem>
            </SelectContent>
          </Select>


        </div>
      </CardContent>
    </Card>
  );
};