import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  onDepartmentChange?: (value: string) => void;
  onRoleChange?: (value: string) => void;
  onDateChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
}

export const FilterBar = ({
  onDepartmentChange,
  onRoleChange,
  onDateChange,
  onStatusChange,
}: FilterBarProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Department</label>
        <Select defaultValue="all" onValueChange={onDepartmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Job Role</label>
        <Select defaultValue="all" onValueChange={onRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="mid">Mid-Level</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Date of Joining</label>
        <Select defaultValue="all" onValueChange={onDateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="current-year">Current Year</SelectItem>
            <SelectItem value="last-6-months">Last 6 Months</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Status</label>
        <Select defaultValue="all" onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resigned">Resigned</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
