import { Button } from "@/components/ui/button";

interface RoleSelectorProps {
  roles: string[];
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const getRoleColors = (role: string, isSelected: boolean) => {
  if (isSelected) {
    switch (role) {
      case "Admin":
        return "bg-admin text-admin-foreground border-admin";
      case "HR":
        return "bg-hr text-hr-foreground border-hr";
      case "Employee":
        return "bg-employee text-employee-foreground border-employee";
      default:
        return "bg-primary text-primary-foreground border-primary";
    }
  }
  
  return "bg-background text-foreground border-border hover:bg-muted";
};

export function RoleSelector({ roles, selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm font-medium text-foreground mr-4">Role:</span>
      <div className="flex bg-muted rounded-lg p-2">
        {roles.map((role) => (
          <Button
            key={role}
            variant="ghost"
            size="sm"
            onClick={() => onRoleChange(role)}
            className={`
              relative px-4 py-2 mr-1 text-sm font-medium transition-all duration-200 rounded-md
              ${getRoleColors(role, selectedRole === role)}
              ${selectedRole === role ? "shadow-sm" : ""}
            `}
          >
            {role}
          </Button>
        ))}
      </div>
    </div>
  );
}