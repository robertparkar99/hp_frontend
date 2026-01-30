"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight, Eye, Plus, Edit, Trash2, BarChart3 } from "lucide-react";
import { MenuPermission, Permission } from "./RightsManagement";

interface HierarchicalPermissionsTableProps {
  permissions: MenuPermission[];
  onPermissionChange: (
    path: number[],
    permissionType: keyof Permission,
    value: boolean
  ) => void;
}

interface MenuRowProps {
  menu: MenuPermission;
  path: number[];
  level: number;
  onPermissionChange: (
    path: number[],
    permissionType: keyof Permission,
    value: boolean
  ) => void;
  isEven?: boolean;
}

// Recursive row renderer
function MenuRow({
  menu,
  path,
  level,
  onPermissionChange,
  isEven = false,
}: MenuRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;

  const indentClass =
    level === 0 ? "pl-6" : level === 1 ? "pl-12" : "pl-18";
  const textClass =
    level === 0 ? "font-semibold" : level === 1 ? "font-medium" : "font-normal";

  const rowClass = isEven
    ? "bg-muted/20 hover:bg-muted/40 transition-colors duration-150"
    : "bg-background hover:bg-muted/20 transition-colors duration-150";

  const getLevelColor = () => {
    switch (level) {
      case 0:
        return "data-[state=checked]:bg-[#324F7B]";
      case 1:
        return "data-[state=checked]:bg-[#6B3779]";
      case 2:
        return "data-[state=checked]:bg-[#D391B0]";
      default:
        return "data-[state=checked]:bg-[#D391B0]";
    }
  };

  // ✅ Only update this row
  const handleDirectToggle = (type: keyof Permission, checked: boolean) => {
    onPermissionChange(path, type, checked);
  };

  // ✅ Update this row + all children
  const handleCascadeToggle = (type: keyof Permission, checked: boolean) => {
    onPermissionChange(path, type, checked);

    if (menu.children) {
      const toggleChildren = (
        children: MenuPermission[],
        currentPath: number[]
      ) => {
        children.forEach((child, index) => {
          const childPath = [...currentPath, index];
          onPermissionChange(childPath, type, checked);
          if (child.children) toggleChildren(child.children, childPath);
        });
      };
      toggleChildren(menu.children, path);
    }
  };

  return (
    <>
      <tr className={`${rowClass} border-b border-border/30`}>
        <td
          className={`py-4 text-base ${textClass} text-foreground ${indentClass}`}
        >
          <div className="flex items-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-2 hover:bg-muted transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 transition-transform" />
                )}
              </Button>
            ) : (
              <div className="w-8 mr-2" />
            )}
            {menu.name}
          </div>
        </td>

        {/* View */}
        <td className="px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Switch
              checked={menu.permissions.view}
              onCheckedChange={(checked) =>
                hasChildren
                  ? handleCascadeToggle("view", checked)
                  : handleDirectToggle("view", checked)
              }
              aria-label={`${menu.name} - View`}
              className={`${getLevelColor()} transition-all duration-200`}
            />
          </div>
        </td>

        {/* Add */}
        <td className="px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Switch
              checked={menu.permissions.add}
              onCheckedChange={(checked) =>
                hasChildren
                  ? handleCascadeToggle("add", checked)
                  : handleDirectToggle("add", checked)
              }
              aria-label={`${menu.name} - Add`}
              className={`${getLevelColor()} transition-all duration-200`}
            />
          </div>
        </td>

        {/* Edit */}
        <td className="px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Switch
              checked={menu.permissions.edit}
              onCheckedChange={(checked) =>
                hasChildren
                  ? handleCascadeToggle("edit", checked)
                  : handleDirectToggle("edit", checked)
              }
              aria-label={`${menu.name} - Edit`}
              className={`${getLevelColor()} transition-all duration-200`}
            />
          </div>
        </td>

        {/* Delete */}
        <td className="px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Switch
              checked={menu.permissions.delete}
              onCheckedChange={(checked) =>
                hasChildren
                  ? handleCascadeToggle("delete", checked)
                  : handleDirectToggle("delete", checked)
              }
              aria-label={`${menu.name} - Delete`}
              className={`${getLevelColor()} transition-all duration-200`}
            />
          </div>
        </td>

        {/* Dashboard */}
        <td className="px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Switch
              checked={menu.permissions.dashboard}
              onCheckedChange={(checked) =>
                hasChildren
                  ? handleCascadeToggle("dashboard", checked)
                  : handleDirectToggle("dashboard", checked)
              }
              aria-label={`${menu.name} - Dashboard`}
              className={`${getLevelColor()} transition-all duration-200`}
            />
          </div>
        </td>
      </tr>

      {/* Recursive children */}
      {hasChildren &&
        isExpanded &&
        menu.children!.map((child, i) => (
          <MenuRow
            key={child.id}
            menu={child}
            path={[...path, i]}
            level={level + 1}
            onPermissionChange={onPermissionChange}
            isEven={isEven} // Keep the same parity for children
          />
        ))}
    </>
  );
}

// ✅ Main component
export function HierarchicalPermissionsTable({
  permissions,
  onPermissionChange,
}: HierarchicalPermissionsTableProps) {
  const [masterView, setMasterView] = useState(false);
  const [masterAdd, setMasterAdd] = useState(false);
  const [masterEdit, setMasterEdit] = useState(false);
  const [masterDelete, setMasterDelete] = useState(false);
  const [masterDashboard, setMasterDashboard] = useState(false);

  const toggleAll = (
    menuItems: MenuPermission[],
    type: keyof Permission,
    value: boolean,
    path: number[] = []
  ) => {
    menuItems.forEach((menu, index) => {
      const currentPath = [...path, index];
      onPermissionChange(currentPath, type, value);
      if (menu.children) {
        toggleAll(menu.children, type, value, currentPath);
      }
    });
  };

  const handleMasterToggle = (type: keyof Permission, value: boolean) => {
    if (type === "view") {
      setMasterView(value);
      toggleAll(permissions, "view", value);
    } else if (type === "add") {
      setMasterAdd(value);
      toggleAll(permissions, "add", value);
    } else if (type === "edit") {
      setMasterEdit(value);
      toggleAll(permissions, "edit", value);
    } else if (type === "delete") {
      setMasterDelete(value);
      toggleAll(permissions, "delete", value);
    } else if (type === "dashboard") {
      setMasterDashboard(value);
      toggleAll(permissions, "dashboard", value);
    }
  };

  return (
    <TooltipProvider>
      <div className="border rounded-xl overflow-hidden shadow-sm bg-gradient-to-br from-card to-card/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-muted/80 to-muted/40">
              <tr>
                <th className="px-6 py-5 text-left text-base font-bold text-foreground border-b border-border/50">
                  Menu Name
                </th>

                {/* View */}
                <th className="px-4 py-5 text-center text-sm font-bold text-foreground min-w-[120px] border-b border-border/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 text-primary">
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Switch
                          checked={masterView}
                          onCheckedChange={(checked) =>
                            handleMasterToggle("view", checked)
                          }
                          aria-label="Toggle all View permissions"
                          className="data-[state=checked]:bg-[#385F7B] transition-all duration-200"
                          style={{ backgroundColor: masterView ? "#385F7B" : "darkgray" }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle view permission for all menus</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>

                {/* Add */}
                <th className="px-4 py-5 text-center text-sm font-bold text-foreground min-w-[120px] border-b border-border/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Switch
                          checked={masterAdd}
                          onCheckedChange={(checked) =>
                            handleMasterToggle("add", checked)
                          }
                          aria-label="Toggle all Add permissions"
                          className="data-[state=checked]:bg-[#324F7B] transition-all duration-200"
                          style={{ backgroundColor: masterAdd ? "#385F7B" : "darkgray" }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle add permission for all menus</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>

                {/* Edit */}
                <th className="px-4 py-5 text-center text-sm font-bold text-foreground min-w-[120px] border-b border-border/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Switch
                          checked={masterEdit}
                          onCheckedChange={(checked) =>
                            handleMasterToggle("edit", checked)
                          }
                          aria-label="Toggle all Edit permissions"
                          className="data-[state=checked]:bg-[#6B3779] transition-all duration-200"
                          style={{ backgroundColor: masterEdit ? "#385F7B" : "darkgray" }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle edit permission for all menus</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>

                {/* Delete */}
                <th className="px-4 py-5 text-center text-sm font-bold text-foreground min-w-[120px] border-b border-border/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 text-red-600">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Switch
                          checked={masterDelete}
                          onCheckedChange={(checked) =>
                            handleMasterToggle("delete", checked)
                          }
                          aria-label="Toggle all Delete permissions"
                          className="data-[state=checked]:bg-[#D391B0] transition-all duration-200"
                          style={{ backgroundColor: masterDelete ? "#385F7B" : "darkgray" }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle delete permission for all menus</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>

                {/* Dashboard */}
                <th className="px-4 py-5 text-center text-sm font-bold text-foreground min-w-[120px] border-b border-border/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 text-purple-600">
                      <BarChart3 className="h-4 w-4" />
                      <span>Desk</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Switch
                          checked={masterDashboard}
                          onCheckedChange={(checked) =>
                            handleMasterToggle("dashboard", checked)
                          }
                          aria-label="Toggle all Dashboard permissions"
                          className="data-[state=checked]:bg-[#7B4F32] transition-all duration-200"
                          style={{ backgroundColor: masterDashboard ? "#385F7B" : "darkgray" }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle dashboard access for all menus</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {permissions.map((menu, menuIndex) => (
                <MenuRow
                  key={menu.id}
                  menu={menu}
                  path={[menuIndex]}
                  level={0}
                  onPermissionChange={onPermissionChange}
                  isEven={menuIndex % 2 === 0}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
