import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Users, 
  Calendar, 
  HelpCircle, 
  Upload,
  MessageSquare
} from "lucide-react"

const quickActions = [
  {
    title: "Upload Documents",
    description: "Submit required paperwork",
    icon: Upload,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    action: "upload"
  },
  {
    title: "Meet Your Team",
    description: "Connect with colleagues",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
    action: "team"
  },
  {
    title: "Schedule 1:1",
    description: "Book time with your manager",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    action: "schedule"
  },
  {
    title: "Training Center",
    description: "Complete required courses",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    action: "training"
  },
  {
    title: "Ask Questions",
    description: "Get help from HR",
    icon: MessageSquare,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    action: "help"
  },
  {
    title: "FAQ",
    description: "Find quick answers",
    icon: HelpCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    action: "faq"
  }
]

interface QuickActionsProps {
  onActionClick?: (action: string) => void
}

export const QuickActions = ({ onActionClick }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.action}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-muted/50 transition-colors"
                onClick={() => onActionClick?.(action.action)}
              >
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}