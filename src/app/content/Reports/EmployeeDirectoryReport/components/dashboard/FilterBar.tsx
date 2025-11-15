"use client";

import * as React from "react";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  departments,
  jobRoles,
  skills,
  locations,
  employmentStatus,
} from "../../data/mockData";

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
  onReset?: () => void;
}

export interface FilterState {
  department: string;
  jobRole: string;
  skill: string;
  location: string;
  status: string;
  dateRange?: DateRange;
}

export const FilterBar = ({ onFilterChange, onReset }: FilterBarProps) => {
  const [filters, setFilters] = React.useState<FilterState>({
    department: "all",
    jobRole: "all",
    skill: "all",
    location: "all",
    status: "all",
  });

  const [date, setDate] = React.useState<DateRange | undefined>();

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    const newFilters = { ...filters, dateRange: newDate };
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    setFilters({
      department: "all",
      jobRole: "all",
      skill: "all",
      location: "all",
      status: "all",
    });
    setDate(undefined);
    onReset?.();
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Department */}
        <div>
           <label className="text-sm font-medium mb-2 block">Department</label>
        <Select
          value={filters.department}
          onValueChange={(v) => handleFilterChange("department", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Department</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept.toLowerCase()}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
</div>
<div>
 <label className="text-sm font-medium mb-2 block">Job Role</label>
        {/* Job Role */}
        <Select
          value={filters.jobRole}
          onValueChange={(v) => handleFilterChange("jobRole", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jobRole</SelectItem>
            {jobRoles.map((role) => (
              <SelectItem key={role} value={role.toLowerCase()}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
</div>
<div>
      <label className="text-sm font-medium mb-2 block">Skill</label>
        {/* Skill */}
        <Select
          value={filters.skill}
          onValueChange={(v) => handleFilterChange("skill", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Skills" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skill</SelectItem>
            {skills.map((skill) => (
              <SelectItem key={skill} value={skill.toLowerCase()}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
<div>
    <label className="text-sm font-medium mb-2 block">Location</label>
        {/* Location */}
        <Select
          value={filters.location}
          onValueChange={(v) => handleFilterChange("location", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location.toLowerCase()}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
</div>
        {/* Status */}
        <div>
           <label className="text-sm font-medium mb-2 block">status</label>
        <Select
          value={filters.status}
          onValueChange={(v) => handleFilterChange("status", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="all">All Status</SelectItem>
            {employmentStatus.map((status) => (
              <SelectItem key={status} value={status.toLowerCase()}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
</div>
        {/* ✅ Date Range Picker */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date Range</label>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
                  </>
                ) : (
                  format(date.from, "LLL dd")
                )
              ) : (
                <span>Date Range</span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleDateChange}
              defaultMonth={date?.from}
              numberOfMonths={2}
              classNames={{
                months: "flex flex-row space-x-4",
                month: "space-y-4",
                caption: "flex justify-center pt-4 relative items-center w-full min-h-[32px]",
                caption_label: "text-sm font-medium pl-9 pt-1",
                nav: "flex items-center justify-between w-full absolute top-6 pr-7 ",
                nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1 mt-6",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative",
                day: cn(
                  "h-9 w-9 p-0 font-normal rounded-md",
                  "hover:bg-gray-100",
                  "aria-selected:opacity-100"
                ),
                day_range_start: "bg-blue-400 text-white hover:bg-blue-500 rounded-md",
                day_range_end: "bg-blue-400 text-white hover:bg-blue-500 rounded-md",
                day_selected: "bg-blue-400 text-white hover:bg-blue-500",
                day_today: "bg-gray-100 text-gray-900",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "bg-gray-100 text-gray-900 hover:bg-gray-200",
                day_hidden: "invisible",
              }}
              components={{
                PreviousMonthButton: ({ children, ...props }) => (
                  <button {...props} className="absolute left-1 h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ),
                NextMonthButton: ({ children, ...props }) => (
                  <button {...props} className="absolute right-6 h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ),
              }}
            />
          </PopoverContent>
        </Popover>
        </div>
      </div>
    </Card>
  );
};