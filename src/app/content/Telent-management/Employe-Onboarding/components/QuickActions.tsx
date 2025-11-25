// QuickActions.tsx
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Users, 
  Calendar, 
  HelpCircle, 
  Upload,
  MessageSquare,
  Shield,
  Building
} from "lucide-react"

const quickActions = [
  {
    title: "Upload Documents",
    description: "Submit required paperwork",
    icon: Upload,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    hoverColor: "hover:bg-blue-50",
    action: "upload"
  },
  {
    title: "Meet Your Team",
    description: "Connect with colleagues",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-100",
    hoverColor: "hover:bg-green-50",
    action: "team"
  },
  {
    title: "Schedule 1:1",
    description: "Book time with your manager",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    hoverColor: "hover:bg-purple-50",
    action: "schedule"
  },
  {
    title: "Training Center",
    description: "Complete required courses",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    hoverColor: "hover:bg-orange-50",
    action: "training"
  },
  {
    title: "Security Setup",
    description: "Configure access & permissions",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-100",
    hoverColor: "hover:bg-red-50",
    action: "security"
  },
  {
    title: "Office Tour",
    description: "Explore your workspace",
    icon: Building,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    hoverColor: "hover:bg-indigo-50",
    action: "tour"
  }
]

interface QuickActionsProps {
  onActionClick?: (action: string) => void
}

export const QuickActions = ({ onActionClick }: QuickActionsProps) => {
  return (
    <Card className="border-1 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.action}
                variant="ghost"
                className={cn(
                  "h-auto p-4 flex items-start gap-3 transition-all duration-200 border border-transparent hover:border-slate-200 group",
                  action.hoverColor
                )}
                onClick={() => onActionClick?.(action.action)}
              >
                <div className={`p-3 rounded-xl ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}