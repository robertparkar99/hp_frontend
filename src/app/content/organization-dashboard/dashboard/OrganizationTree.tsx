"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Users, User,Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrgNode {
  id: string;
  department: string;
  employees: number;
  children?: OrgNode[];
}

interface TreeNodeProps {
  node: OrgNode;
  level: number;
}

function TreeNode({ node, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    
    <div className="space-y-2 ">
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors cursor-pointer",
          level > 0 && "ml-6 border-l-4 border-l-primary/20"
        )}
        style={{ marginLeft: level * 24 }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center">
          <Building2 className="h-5 w-5 text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">
            {node.department}
          </h4>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{node.employees}</span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface OrganizationTreeProps {
  departments: Record<string, any>;
}

export function OrganizationTree({ departments }: OrganizationTreeProps) {
  // Convert API -> OrgNode[]
  const buildTree = () => {
    if (!departments) return [];

    const nodes: OrgNode[] = [];
    Object.keys(departments).forEach((key) => {
      if (key === "sub_department") return;
      const dept = departments[key];
      nodes.push({
        id: dept.id.toString(),
        department: dept.department,
        employees: dept.total_employees || 0,
        children: departments.sub_department?.[dept.id]?.map((sub: any) => ({
          id: sub.id.toString(),
          department: sub.department,
          employees: sub.total_employees || 0,
        })),
      });
    });
    return nodes;
  };

  const treeData = buildTree();

  return (
    <Card className="h-100 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-5 w-5 text-blue-400" />
          Organization Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-80 overflow-y-auto ">
        <div className="h-full overflow-y-auto p-6 pt-0 scrollbar-hide">
          {treeData.map((node) => (
            <TreeNode key={node.id} node={node} level={0} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
