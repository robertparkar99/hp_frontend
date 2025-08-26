import { Switch } from "@/components/ui/switch";
import { MenuPermission, Permission } from "./RightsManagement";
import { useState } from "react";

interface PermissionsTableProps {
  permissions: MenuPermission[];
  onPermissionChange: (
    menuIndex: number,
    permissionType: keyof Permission,
    value: boolean
  ) => void;
}

export function PermissionsTable({
  permissions,
  onPermissionChange,
}: PermissionsTableProps) {
  const [masterAdd, setMasterAdd] = useState(false);
  const [masterEdit, setMasterEdit] = useState(false);
  const [masterDelete, setMasterDelete] = useState(false);
  const [masterView, setMasterView] = useState(false);
  const [masterDashboard, setMasterDashboard] = useState(false);

  const handleMasterToggle = (type: keyof Permission, value: boolean) => {
    if (type === "add") {
      setMasterAdd(value);
    } else if (type === "edit") {
      setMasterEdit(value);
    } else if (type === "delete") {
      setMasterDelete(value);
    } else if (type === "view") {
      setMasterView(value);
    } else if (type === "dashboard") {
      setMasterDashboard(value);
    }

    permissions.forEach((_, index) => {
      onPermissionChange(index, type, value);
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Menu Name
              </th>

              {/* View column */}
              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>View</span>
                  <Switch
                    checked={masterView}
                    onCheckedChange={(checked) =>
                      handleMasterToggle("view", checked)
                    }
                    aria-label="Toggle all View permissions"
                    className="data-[state=checked]:bg-[#2B6CB0]"
                  />
                </div>
              </th>

              {/* Add column */}
              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>Add</span>
                  <Switch
                    checked={masterAdd}
                    onCheckedChange={(checked) =>
                      handleMasterToggle("add", checked)
                    }
                    aria-label="Toggle all Add permissions"
                    className="data-[state=checked]:bg-[#324F7B]"
                  />
                </div>
              </th>

              {/* Edit column */}
              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>Edit</span>
                  <Switch
                    checked={masterEdit}
                    onCheckedChange={(checked) =>
                      handleMasterToggle("edit", checked)
                    }
                    aria-label="Toggle all Edit permissions"
                    className="data-[state=checked]:bg-[#6B3779]"
                  />
                </div>
              </th>

              {/* Delete column */}
              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>Delete</span>
                  <Switch
                    checked={masterDelete}
                    onCheckedChange={(checked) =>
                      handleMasterToggle("delete", checked)
                    }
                    aria-label="Toggle all Delete permissions"
                    className="data-[state=checked]:bg-[#D391B0]"
                  />
                </div>
              </th>

              {/* Dashboard column */}
              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>Dashboard</span>
                  <Switch
                    checked={masterDashboard}
                    onCheckedChange={(checked) =>
                      handleMasterToggle("dashboard", checked)
                    }
                    aria-label="Toggle all Dashboard permissions"
                    className="data-[state=checked]:bg-[#7B4F32]"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((menu, menuIndex) => (
              <tr
                key={menu.name}
                className="border-t hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {menu.name}
                </td>

                {/* View switch */}
                <td className="px-4 py-4 text-center">
                  <Switch
                    checked={menu.permissions.view}
                    onCheckedChange={(checked) =>
                      onPermissionChange(menuIndex, "view", checked)
                    }
                    aria-label={`${menu.name} - View Permission`}
                    className="data-[state=checked]:bg-[#2B6CB0]"
                  />
                </td>

                {/* Add switch */}
                <td className="px-4 py-4 text-center">
                  <Switch
                    checked={menu.permissions.add}
                    onCheckedChange={(checked) =>
                      onPermissionChange(menuIndex, "add", checked)
                    }
                    aria-label={`${menu.name} - Add Permission`}
                    className="data-[state=checked]:bg-[#324F7B]"
                  />
                </td>

                {/* Edit switch */}
                <td className="px-4 py-4 text-center">
                  <Switch
                    checked={menu.permissions.edit}
                    onCheckedChange={(checked) =>
                      onPermissionChange(menuIndex, "edit", checked)
                    }
                    aria-label={`${menu.name} - Edit Permission`}
                    className="data-[state=checked]:bg-[#6B3779]"
                  />
                </td>

                {/* Delete switch */}
                <td className="px-4 py-4 text-center">
                  <Switch
                    checked={menu.permissions.delete}
                    onCheckedChange={(checked) =>
                      onPermissionChange(menuIndex, "delete", checked)
                    }
                    aria-label={`${menu.name} - Delete Permission`}
                    className="data-[state=checked]:bg-[#D391B0]"
                  />
                </td>

                {/* Dashboard switch */}
                <td className="px-4 py-4 text-center">
                  <Switch
                    checked={menu.permissions.dashboard}
                    onCheckedChange={(checked) =>
                      onPermissionChange(menuIndex, "dashboard", checked)
                    }
                    aria-label={`${menu.name} - Dashboard Permission`}
                    className="data-[state=checked]:bg-[#7B4F32]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
