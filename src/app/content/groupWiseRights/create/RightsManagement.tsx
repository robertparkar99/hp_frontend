"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { RoleSelector } from "./RoleSelector";
import { HierarchicalPermissionsTable } from "./HierarchicalPermissionsTable";

export interface Permission {
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  dashboard: boolean;   // ✅ new
}

export interface MenuPermission {
  id: number;
  name: string;
  permissions: Permission;
  children?: MenuPermission[];
}

export interface RoleApi {
  id: number;
  name: string;
  description: string;
}

interface SessionData {
  url: string;
  token: string;
  sub_institute_id: string;
}

interface ApiMenuData {
  id: number;
  menu_name: string;
  parent_id: number;
  level: number;
  can_view: number;
  can_add: number;
  can_edit: number;
  can_delete: number;
  dashboard_right: number;
}

interface ApiResponse {
  level_1: ApiMenuData[];
  level_2: ApiMenuData[] | Record<string | number, ApiMenuData[]>;
  level_3: ApiMenuData[] | Record<string | number, ApiMenuData[]>;
}

export function RightsManagement() {
  const [roles, setRoles] = useState<RoleApi[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<number>(1);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [permissions, setPermissions] = useState<Record<string, MenuPermission[]>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, MenuPermission[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentPermissions = permissions[selectedRole] || [];

  // ✅ Load session data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          const { APP_URL, token, sub_institute_id } = parsedData;

          if (APP_URL && token && sub_institute_id) {
            setSessionData({
              url: APP_URL,
              token,
              sub_institute_id: String(sub_institute_id),
            });
          }
        } catch (error) {
          console.error("Error parsing userData:", error);
        }
      }
    }
  }, []);

  // ✅ Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      if (!sessionData) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${sessionData.url}/table_data?table=tbluserprofilemaster&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[status]=1`,
          {
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data: RoleApi[] = await response.json();
        setRoles(data);

        if (data.length > 0) {
          setSelectedRole(data[0].name);
          setSelectedProfileId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch roles.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [sessionData, toast]);

  // ✅ Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!sessionData || !selectedProfileId) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${sessionData.url}/user/ajax_groupwiserights?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&profile_id=${selectedProfileId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const apiData: ApiResponse = await response.json();
        console.log("API Permissions Response:", apiData); // 🔍 Debugging log

        const transformedPermissions = transformApiDataToPermissions(apiData);

        setPermissions((prev) => ({
          ...prev,
          [selectedRole]: transformedPermissions,
        }));

        setOriginalPermissions((prev) => ({
          ...prev,
          [selectedRole]: JSON.parse(JSON.stringify(transformedPermissions)),
        }));
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch permissions.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedRole) fetchPermissions();
  }, [sessionData, selectedRole, selectedProfileId, toast]);

  // ✅ Transform API → UI
  const transformApiDataToPermissions = (apiData: ApiResponse): MenuPermission[] => {
    const level1 = apiData.level_1 || [];
    const level2 = apiData.level_2 || {};
    const level3 = apiData.level_3 || {};

    return level1.map((menu1) => {
      const menu: MenuPermission = {
        id: menu1.id,
        name: menu1.menu_name,
        permissions: {
          view: Boolean(menu1.can_view),
          add: Boolean(menu1.can_add),
          edit: Boolean(menu1.can_edit),
          delete: Boolean(menu1.can_delete),
          dashboard: Boolean(menu1.dashboard_right), // default since API does not provide
        },
        children: [],
      };

      const rawLevel2 = level2[menu1.id] || {};
      const level2Children: ApiMenuData[] = Object.values(rawLevel2);

      menu.children = level2Children.map((menu2) => {
        const child2: MenuPermission = {
          id: menu2.id,
          name: menu2.menu_name,
          permissions: {
            view: Boolean(menu2.can_view),
            add: Boolean(menu2.can_add),
            edit: Boolean(menu2.can_edit),
            delete: Boolean(menu2.can_delete),
            dashboard: Boolean(menu2.dashboard_right),
          },
          children: [],
        };

        const rawLevel3 = level3[menu2.id] || {};
        const level3Children: ApiMenuData[] = Object.values(rawLevel3);

        child2.children = level3Children.map((menu3) => ({
          id: menu3.id,
          name: menu3.menu_name,
          permissions: {
            view: Boolean(menu3.can_view),
            add: Boolean(menu3.can_add),
            edit: Boolean(menu3.can_edit),
            delete: Boolean(menu3.can_delete),
            dashboard: Boolean(menu3.dashboard_right),  // ✅ new
          },
        }));

        return child2;
      });

      return menu;
    });
  };

  const handlePermissionChange = (path: number[], type: keyof Permission, value: boolean) => {
    setPermissions((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      let target = updated[selectedRole];
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]].children;
      }
      target[path[path.length - 1]].permissions[type] = value;
      return updated;
    });
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();

      formData.append("type", "API");
      formData.append("token", sessionData?.token || "");
      formData.append("sub_institute_id", sessionData?.sub_institute_id || "");
      formData.append("profile_id", String(selectedProfileId));

      currentPermissions.forEach((menu) => {
        appendPermissionsToFormData(formData, menu);
      });

      const response = await fetch(`${sessionData?.url}/user/add_groupwise_rights`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionData?.token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

      setOriginalPermissions((prev) => ({
        ...prev,
        [selectedRole]: JSON.parse(JSON.stringify(permissions[selectedRole])),
      }));

      setHasChanges(false);
      toast({ title: "Saved", description: "Permissions updated." });
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "Failed to save permissions.",
        variant: "destructive",
      });
    }
  };

  const appendPermissionsToFormData = (formData: FormData, menu: MenuPermission) => {
    if (menu.permissions.view) formData.append(`view[${menu.id}][]`, "1");
    if (menu.permissions.add) formData.append(`add[${menu.id}][]`, "1");
    if (menu.permissions.edit) formData.append(`edit[${menu.id}][]`, "1");
    if (menu.permissions.delete) formData.append(`delete[${menu.id}][]`, "1");
    if (menu.permissions.dashboard) formData.append(`dashboard[${menu.id}][]`, "1");

    if (menu.children) {
      menu.children.forEach((child) => appendPermissionsToFormData(formData, child));
    }
  };

  const flattenPermissions = (menus: MenuPermission[]): any[] => {
    const result: any[] = [];
    const process = (menu: MenuPermission) => {
      result.push({
        menu_id: menu.id,
        can_view: menu.permissions.view ? 1 : 0,
        can_add: menu.permissions.add ? 1 : 0,
        can_edit: menu.permissions.edit ? 1 : 0,
        can_delete: menu.permissions.delete ? 1 : 0,
        can_dashboard: menu.permissions.dashboard ? 1 : 0,
      });
      if (menu.children) menu.children.forEach(process);
    };
    menus.forEach(process);
    return result;
  };

  const handleResetToDefaults = () => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: JSON.parse(JSON.stringify(originalPermissions[selectedRole])),
    }));
    setHasChanges(false);
    toast({
      title: "Reset",
      description: "Reverted to last saved state.",
      variant: "destructive",
    });
  };

  const handleRoleChange = (role: string) => {
    const roleData = roles.find((r) => r.name === role);
    if (roleData) {
      setSelectedRole(role);
      setSelectedProfileId(roleData.id);
    }
  };

  useEffect(() => {
    if (selectedRole && permissions[selectedRole] && originalPermissions[selectedRole]) {
      const changed =
        JSON.stringify(permissions[selectedRole]) !==
        JSON.stringify(originalPermissions[selectedRole]);
      setHasChanges(changed);
    }
  }, [permissions, originalPermissions, selectedRole]);

  return (
    <div className="bg-background mt-5 scrollbar-hide">
      <div className="text-2xl font-bold">Rights Management</div>
      <p className="text-muted-foreground">
        Manage user permissions and access rights for different roles.
      </p>

      <div className="space-y-6">
        {!sessionData && <div>Loading session...</div>}
        {sessionData && roles.length === 0 && !isLoading && <div>No roles found.</div>}
        {isLoading && <div>Loading...</div>}

        {roles.length > 0 && (
          <>
            <RoleSelector
              roles={roles.map((r) => r.name)}
              selectedRole={selectedRole}
              onRoleChange={handleRoleChange}
            />

            {currentPermissions.length > 0 ? (
              <>
                <HierarchicalPermissionsTable
                  permissions={currentPermissions}
                  onPermissionChange={handlePermissionChange}
                />

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-4">
                    <Button
                      onClick={handleSaveChanges}
                      disabled={!hasChanges || isLoading}
                      className="min-w-[140px]"
                    >
                      {hasChanges ? "Save Changes" : <><CheckCircle className="mr-2 h-4 w-4" />All Saved</>}
                    </Button>

                    <Button variant="outline" onClick={handleResetToDefaults} disabled={!hasChanges || isLoading}>
                      Reset to Defaults
                    </Button>
                  </div>

                  {hasChanges && <div className="text-sm text-muted-foreground">You have unsaved changes</div>}
                </div>
              </>
            ) : (
              <div>Loading permissions...</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
