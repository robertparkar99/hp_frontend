import { useState } from "react";
import {
  BarChart3,
  Building2,
  Users,
  Settings,
  PieChart,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SideNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    title: "Overview",
    icon: BarChart3,
    href: "#",
    active: true,
  },
  {
    title: "Organization",
    icon: Building2,
    href: "#",
    active: false,
  },
  {
    title: "User Management",
    icon: Users,
    href: "#",
    active: false,
  },
  {
    title: "Responsibilities",
    icon: UserCheck,
    href: "#",
    active: false,
  },
  {
    title: "Analytics",
    icon: PieChart,
    href: "#",
    active: false,
  },
  {
    title: "Settings",
    icon: Settings,
    href: "#",
    active: false,
  },
];

export function SideNavigation({ isOpen, onToggle }: SideNavigationProps) {
  return (
    <aside
      className={cn(
        "bg-dashboard-nav text-dashboard-nav-foreground transition-all duration-300 relative z-30",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute -right-3 top-6 bg-card shadow-dashboard-md border border-border rounded-full w-6 h-6 p-0 hover:bg-card-hover"
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 text-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-foreground" />
        )}
      </Button>

      {/* Navigation Content */}
      <div className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.title}
            variant="ghost"
            className={cn(
              "w-full justify-start text-dashboard-nav-foreground hover:bg-dashboard-nav-active/10 hover:text-dashboard-nav-active transition-colors",
              item.active && "bg-dashboard-nav-active text-white",
              !isOpen && "justify-center px-2"
            )}
          >
            <item.icon className={cn("h-5 w-5", isOpen && "mr-3")} />
            {isOpen && <span>{item.title}</span>}
          </Button>
        ))}
      </div>

      {/* Organization Info */}
      {isOpen && (
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-dashboard-nav-active/10 rounded-lg">
          <div className="text-xs text-dashboard-nav-foreground/70">
            Current Organization
          </div>
          <div className="text-sm font-medium text-dashboard-nav-foreground truncate">
            Acme Corporation
          </div>
        </div>
      )}
    </aside>
  );
}