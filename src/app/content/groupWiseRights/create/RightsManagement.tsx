import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { RoleSelector } from "./RoleSelector";
import { HierarchicalPermissionsTable } from "./HierarchicalPermissionsTable";

export type Role = "Admin" | "HR" | "Employee";

export interface Permission {
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface MenuPermission {
  name: string;
  permissions: Permission;
  children?: MenuPermission[];
}

const defaultPermissions: Record<Role, MenuPermission[]> = {
  Admin: [
    {
      name: "Organization",
      permissions: { add: true, edit: true, delete: true },
      children: [
        {
          name: "Department Structure",
          permissions: { add: true, edit: true, delete: true },
          children: [
            { name: "Team Details", permissions: { add: true, edit: true, delete: true } },
            { name: "Roles & Designations", permissions: { add: true, edit: true, delete: true } }
          ]
        },
        {
          name: "Policies & Information",
          permissions: { add: true, edit: true, delete: true },
          children: [
            { name: "Leave Policy", permissions: { add: true, edit: true, delete: true } },
            { name: "Code of Conduct", permissions: { add: true, edit: true, delete: true } }
          ]
        }
      ]
    },
    {
      name: "User Management",
      permissions: { add: true, edit: true, delete: true },
      children: [
        {
          name: "Access Rights",
          permissions: { add: true, edit: true, delete: true },
          children: [
            { name: "Admin Rights", permissions: { add: true, edit: true, delete: true } },
            { name: "Employee Rights", permissions: { add: true, edit: true, delete: true } }
          ]
        },
        {
          name: "Profiles",
          permissions: { add: true, edit: true, delete: true },
          children: [
            { name: "Personal Information", permissions: { add: true, edit: true, delete: true } },
            { name: "Job Information", permissions: { add: true, edit: true, delete: true } }
          ]
        }
      ]
    },
    {
      name: "System Settings",
      permissions: { add: true, edit: true, delete: true },
      children: [
        {
          name: "Authentication",
          permissions: { add: true, edit: true, delete: true },
          children: [
            { name: "Login Page", permissions: { add: true, edit: true, delete: true } },
            { name: "Forgot Password", permissions: { add: true, edit: true, delete: true } }
          ]
        },
        {
          name: "Modules",
          permissions: { add: true, edit: true, delete: true },
          children: [
            { name: "Right Module Pages", permissions: { add: true, edit: true, delete: true } },
            { name: "Feature Settings", permissions: { add: true, edit: true, delete: true } }
          ]
        }
      ]
    }
  ],
  HR: [
    {
      name: "Organization",
      permissions: { add: false, edit: true, delete: false },
      children: [
        {
          name: "Department Structure",
          permissions: { add: true, edit: true, delete: false },
          children: [
            { name: "Team Details", permissions: { add: true, edit: true, delete: false } },
            { name: "Roles & Designations", permissions: { add: true, edit: true, delete: false } }
          ]
        },
        {
          name: "Policies & Information",
          permissions: { add: false, edit: true, delete: false },
          children: [
            { name: "Leave Policy", permissions: { add: false, edit: true, delete: false } },
            { name: "Code of Conduct", permissions: { add: false, edit: true, delete: false } }
          ]
        }
      ]
    },
    {
      name: "User Management",
      permissions: { add: true, edit: true, delete: false },
      children: [
        {
          name: "Access Rights",
          permissions: { add: false, edit: false, delete: false },
          children: [
            { name: "Admin Rights", permissions: { add: false, edit: false, delete: false } },
            { name: "Employee Rights", permissions: { add: false, edit: true, delete: false } }
          ]
        },
        {
          name: "Profiles",
          permissions: { add: true, edit: true, delete: false },
          children: [
            { name: "Personal Information", permissions: { add: true, edit: true, delete: false } },
            { name: "Job Information", permissions: { add: true, edit: true, delete: false } }
          ]
        }
      ]
    },
    {
      name: "System Settings",
      permissions: { add: false, edit: false, delete: false },
      children: [
        {
          name: "Authentication",
          permissions: { add: false, edit: false, delete: false },
          children: [
            { name: "Login Page", permissions: { add: false, edit: false, delete: false } },
            { name: "Forgot Password", permissions: { add: false, edit: false, delete: false } }
          ]
        },
        {
          name: "Modules",
          permissions: { add: false, edit: true, delete: false },
          children: [
            { name: "Right Module Pages", permissions: { add: false, edit: true, delete: false } },
            { name: "Feature Settings", permissions: { add: false, edit: false, delete: false } }
          ]
        }
      ]
    }
  ],
  Employee: [
    {
      name: "Organization",
      permissions: { add: false, edit: false, delete: false },
      children: [
        {
          name: "Department Structure",
          permissions: { add: false, edit: false, delete: false },
          children: [
            { name: "Team Details", permissions: { add: false, edit: false, delete: false } },
            { name: "Roles & Designations", permissions: { add: false, edit: false, delete: false } }
          ]
        },
        {
          name: "Policies & Information",
          permissions: { add: false, edit: false, delete: false },
          children: [
            { name: "Leave Policy", permissions: { add: false, edit: false, delete: false } },
            { name: "Code of Conduct", permissions: { add: false, edit: false, delete: false } }
          ]
        }
      ]
    },
    {
      name: "User Management",
      permissions: { add: false, edit: false, delete: false },
      children: [
        {
          name: "Access Rights",
          permissions: { add: false, edit: false, delete: false },
          children: [
            { name: "Admin Rights", permissions: { add: false, edit: false, delete: false } },
            { name: "Employee Rights", permissions: { add: false, edit: false, delete: false } }
          ]
        },
        {
          name: "Profiles",
          permissions: { add: false, edit: true, delete: false },
          children: [
            { name: "Personal Information", permissions: { add: false, edit: true, delete: false } },
            { name: "Job Information", permissions: { add: false, edit: false, delete: false } }
          ]
        }
      ]
    },
    {
      name: "System Settings",
      permissions: { add: false, edit: false, delete: false },
      children: [
        {
          name: "Authentication",
          permissions: { add: false, edit: false, delete: false },
          children: [
            { name: "Login Page", permissions: { add: false, edit: false, delete: false } },
            { name: "Forgot Password", permissions: { add: false, edit: false, delete: false } }
          ]
        },
        {
          name: "Modules",
          permissions: { add: false, edit: false, delete: false },
          children: [
            { name: "Right Module Pages", permissions: { add: false, edit: false, delete: false } },
            { name: "Feature Settings", permissions: { add: false, edit: false, delete: false } }
          ]
        }
      ]
    }
  ]
};

export function RightsManagement() {
  const [selectedRole, setSelectedRole] = useState<Role>("Admin");
  const [permissions, setPermissions] = useState<Record<Role, MenuPermission[]>>(defaultPermissions);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState<Record<Role, MenuPermission[]>>(defaultPermissions);
  const { toast } = useToast();

  const currentPermissions = permissions[selectedRole];

  const handlePermissionChange = (path: number[], permissionType: keyof Permission, value: boolean) => {
    setPermissions(prev => {
      const updatedPermissions = JSON.parse(JSON.stringify(prev));
      let target = updatedPermissions[selectedRole];
      
      // Navigate to the correct nested menu item
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]].children;
      }
      
      // Update the permission
      target[path[path.length - 1]].permissions[permissionType] = value;
      
      return updatedPermissions;
    });
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    setOriginalPermissions(permissions);
    setHasChanges(false);
    toast({
      title: "Changes saved successfully",
      description: `Permissions for ${selectedRole} role have been updated.`,
      duration: 3000,
    });
  };

  const handleResetToDefaults = () => {
    setPermissions(originalPermissions);
    setHasChanges(false);
    toast({
      title: "Reset to defaults",
      description: "All changes have been reverted to the last saved state.",
      variant: "destructive",
      duration: 3000,
    });
  };

  useEffect(() => {
    // Check if current permissions differ from original
    const currentRolePermissions = permissions[selectedRole];
    const originalRolePermissions = originalPermissions[selectedRole];
    
    const hasRoleChanges = JSON.stringify(currentRolePermissions) !== JSON.stringify(originalRolePermissions);
    setHasChanges(hasRoleChanges);
  }, [permissions, originalPermissions, selectedRole]);

  return (
    <div className="bg-background  mt-5  scrollbar-hide">
      <div className="">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">
              Rights Management
            </CardTitle>
            <p className="text-muted-foreground">
              Manage user permissions and access rights for different roles across all system modules.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <RoleSelector
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
            />
            
            <HierarchicalPermissionsTable
              permissions={currentPermissions}
              onPermissionChange={handlePermissionChange}
            />
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-4">
                <Button
                  onClick={handleSaveChanges}
                  disabled={!hasChanges}
                  className="min-w-[140px]"
                >
                  {hasChanges ? (
                    "Save Changes"
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      All Saved
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleResetToDefaults}
                  disabled={!hasChanges}
                >
                  Reset to Defaults
                </Button>
              </div>
              
              {hasChanges && (
                <div className="text-sm text-muted-foreground">
                  You have unsaved changes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}