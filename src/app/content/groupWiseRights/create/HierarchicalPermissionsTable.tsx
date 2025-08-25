import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuPermission, Permission } from "./RightsManagement";

interface HierarchicalPermissionsTableProps {
  permissions: MenuPermission[];
  onPermissionChange: (path: number[], permissionType: keyof Permission, value: boolean) => void;
}

interface MenuRowProps {
  menu: MenuPermission;
  path: number[];
  level: number;
  onPermissionChange: (path: number[], permissionType: keyof Permission, value: boolean) => void;
  parentPermissions: Permission;
}

function MenuRow({ menu, path, level, onPermissionChange, parentPermissions }: MenuRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;
  
  const indentClass = level === 0 ? "pl-6" : level === 1 ? "pl-12" : "pl-18";
  const textClass = level === 0 ? "font-semibold" : level === 1 ? "font-medium" : "font-normal";
  
  const getLevelColor = () => {
    switch (level) {
      case 0: return "data-[state=checked]:bg-[#324F7B]";
      case 1: return "data-[state=checked]:bg-[#6B3779]";
      case 2: return "data-[state=checked]:bg-[#D391B0]";
      default: return "data-[state=checked]:bg-[#D391B0]";
    }
  };

  const handleParentToggle = (type: keyof Permission, checked: boolean) => {
    onPermissionChange(path, type, checked);

    if (menu.children) {
      const toggleChildren = (children: MenuPermission[], currentPath: number[]) => {
        children.forEach((child, index) => {
          const childPath = [...currentPath, index];
          onPermissionChange(childPath, type, checked);
          if (child.children) {
            toggleChildren(child.children, childPath);
          }
        });
      };
      toggleChildren(menu.children, path);
    }
  };

  return (
    <>
      <tr className="border-t hover:bg-muted/30 transition-colors">
        <td className={`py-4 text-sm ${textClass} text-foreground ${indentClass}`}>
          <div className="flex items-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-2"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-8 mr-2" />
            )}
            {menu.name}
          </div>
        </td>

        {/* ✅ View Column */}
        <td className="px-4 py-4 text-center">
          <Switch
            checked={menu.permissions.view}
            onCheckedChange={(checked) => handleParentToggle("view", checked)}
            aria-label={`${menu.name} - View Permission`}
            className={getLevelColor()}
          />
        </td>

        <td className="px-4 py-4 text-center">
          <Switch
            checked={menu.permissions.add}
            onCheckedChange={(checked) => handleParentToggle("add", checked)}
            aria-label={`${menu.name} - Add Permission`}
            className={getLevelColor()}
          />
        </td>
        <td className="px-4 py-4 text-center">
          <Switch
            checked={menu.permissions.edit}
            onCheckedChange={(checked) => handleParentToggle("edit", checked)}
            aria-label={`${menu.name} - Edit Permission`}
            className={getLevelColor()}
          />
        </td>
        <td className="px-4 py-4 text-center">
          <Switch
            checked={menu.permissions.delete}
            onCheckedChange={(checked) => handleParentToggle("delete", checked)}
            aria-label={`${menu.name} - Delete Permission`}
            className={getLevelColor()}
          />
        </td>
      </tr>

      {hasChildren && isExpanded && menu.children!.map((child, childIndex) => (
        <MenuRow
          key={child.name}
          menu={child}
          path={[...path, childIndex]}
          level={level + 1}
          onPermissionChange={onPermissionChange}
          parentPermissions={menu.permissions}
        />
      ))}
    </>
  );
}

export function HierarchicalPermissionsTable({ permissions, onPermissionChange }: HierarchicalPermissionsTableProps) {
  const [masterView, setMasterView] = useState(false);
  const [masterAdd, setMasterAdd] = useState(false);
  const [masterEdit, setMasterEdit] = useState(false);
  const [masterDelete, setMasterDelete] = useState(false);

  const toggleAll = (menuItems: MenuPermission[], type: keyof Permission, value: boolean, path: number[] = []) => {
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
    }
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

              {/* ✅ View Header */}
              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>View</span>
                  <Switch
                    checked={masterView}
                    onCheckedChange={(checked) => handleMasterToggle("view", checked)}
                    aria-label="Toggle all View permissions"
                    className="data-[state=checked]:bg-[#385F7B]"
                  />
                </div>
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>Add</span>
                  <Switch
                    checked={masterAdd}
                    onCheckedChange={(checked) => handleMasterToggle("add", checked)}
                    aria-label="Toggle all Add permissions"
                    className="data-[state=checked]:bg-[#324F7B]"
                  />
                </div>
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>Edit</span>
                  <Switch
                    checked={masterEdit}
                    onCheckedChange={(checked) => handleMasterToggle("edit", checked)}
                    aria-label="Toggle all Edit permissions"
                    className="data-[state=checked]:bg-[#6B3779]"
                  />
                </div>
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-foreground min-w-[120px]">
                <div className="flex items-center justify-center gap-2">
                  <span>Delete</span>
                  <Switch
                    checked={masterDelete}
                    onCheckedChange={(checked) => handleMasterToggle("delete", checked)}
                    aria-label="Toggle all Delete permissions"
                    className="data-[state=checked]:bg-[#D391B0]"
                  />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {permissions.map((menu, menuIndex) => (
              <MenuRow
                key={menu.name}
                menu={menu}
                path={[menuIndex]}
                level={0}
                onPermissionChange={onPermissionChange}
                parentPermissions={menu.permissions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}