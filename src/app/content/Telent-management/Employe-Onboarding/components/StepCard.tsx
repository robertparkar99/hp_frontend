import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepCardProps {
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  estimatedTime?: string
  priority?: "low" | "medium" | "high"
  onStart?: () => void
  onContinue?: () => void
}

export const StepCard = ({
  title,
  description,
  status,
  estimatedTime,
  priority = "medium",
  onStart,
  onContinue
}: StepCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-warning" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Completed</Badge>
      case "in-progress":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">In Progress</Badge>
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Pending</Badge>
    }
  }

  const getPriorityBadge = () => {
    if (status === "completed") return null
    
    const variants = {
      low: "bg-blue-50 text-blue-700 border-blue-200",
      medium: "bg-yellow-50 text-yellow-700 border-yellow-200", 
      high: "bg-red-50 text-red-700 border-red-200"
    }
    
    return (
      <Badge variant="outline" className={variants[priority]}>
        {priority} priority
      </Badge>
    )
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      status === "completed" && "bg-success/5 border-success/20",
      status === "in-progress" && "bg-warning/5 border-warning/20"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {estimatedTime && (
            <span className="text-sm text-muted-foreground">
              Estimated time: {estimatedTime}
            </span>
          )}
          <div className="ml-auto">
            {status === "pending" && onStart && (
              <Button onClick={onStart} size="sm">
                Start <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            {status === "in-progress" && onContinue && (
              <Button onClick={onContinue} size="sm" variant="outline">
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}