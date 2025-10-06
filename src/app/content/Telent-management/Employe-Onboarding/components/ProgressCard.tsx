import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, Users } from "lucide-react"

interface ProgressCardProps {
  title: string
  description: string
  progress: number
  totalSteps: number
  completedSteps: number
  variant?: "default" | "success" | "warning"
  icon?: React.ReactNode
}

export const ProgressCard = ({
  title,
  description,
  progress,
  totalSteps,
  completedSteps,
  variant = "default",
  icon
}: ProgressCardProps) => {
  const getIcon = () => {
    if (icon) return icon
    if (progress === 100) return <CheckCircle2 className="h-5 w-5 text-success" />
    if (progress > 0) return <Clock className="h-5 w-5 text-primary" />
    return <Users className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {getIcon()}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={progress} variant={variant} />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedSteps} of {totalSteps} completed
            </span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}