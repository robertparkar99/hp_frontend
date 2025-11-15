import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterPanelProps {
  selectedDepartment: string;
  selectedRole: string;
  selectedSkillCategory: string;
  onDepartmentChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSkillCategoryChange: (value: string) => void;
  onClearFilters: () => void;
}

export const FilterPanel = ({
  selectedDepartment,
  selectedRole,
  selectedSkillCategory,
  onDepartmentChange,
  onRoleChange,
  onSkillCategoryChange,
  onClearFilters
}: FilterPanelProps) => {
  const hasActiveFilters = selectedDepartment !== "all" || selectedRole !== "all" || selectedSkillCategory !== "all";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-medium">Department</Label>
          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger id="department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">Job Role</Label>
          <Select value={selectedRole} onValueChange={onRoleChange}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="analyst">Analyst</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="engineer">Engineer</SelectItem>
              <SelectItem value="specialist">Specialist</SelectItem>
              <SelectItem value="director">Director</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skill-category" className="text-sm font-medium">Skill Category</Label>
          <Select value={selectedSkillCategory} onValueChange={onSkillCategoryChange}>
            <SelectTrigger id="skill-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="soft">Soft Skills</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {selectedDepartment !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {selectedDepartment}
                <button onClick={() => onDepartmentChange("all")} className="hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedRole !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {selectedRole}
                <button onClick={() => onRoleChange("all")} className="hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedSkillCategory !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {selectedSkillCategory}
                <button onClick={() => onSkillCategoryChange("all")} className="hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
