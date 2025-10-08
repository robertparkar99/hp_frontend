// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { CheckCircle2, Clock, ArrowRight } from "lucide-react"
// import { cn } from "@/lib/utils"

// interface StepCardProps {
//   title: string
//   description: string
//   status: "pending" | "in-progress" | "completed"
//   estimatedTime?: string
//   priority?: "low" | "medium" | "high"
//   onStart?: () => void
//   onContinue?: () => void
// }

// export const StepCard = ({
//   title,
//   description,
//   status,
//   estimatedTime,
//   priority = "medium",
//   onStart,
//   onContinue
// }: StepCardProps) => {
//   const getStatusIcon = () => {
//     switch (status) {
//       case "completed":
//         return <CheckCircle2 className="h-5 w-5 text-success" />
//       case "in-progress":
//         return <Clock className="h-5 w-5 text-warning" />
//       default:
//         return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
//     }
//   }

//   const getStatusBadge = () => {
//     switch (status) {
//       case "completed":
//         return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Completed</Badge>
//       case "in-progress":
//         return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">In Progress</Badge>
//       default:
//         return <Badge variant="outline" className="bg-muted text-muted-foreground">Pending</Badge>
//     }
//   }

//   const getPriorityBadge = () => {
//     if (status === "completed") return null
    
//     const variants = {
//       low: "bg-blue-50 text-blue-700 border-blue-200",
//       medium: "bg-yellow-50 text-yellow-700 border-yellow-200", 
//       high: "bg-red-50 text-red-700 border-red-200"
//     }
    
//     return (
//       <Badge variant="outline" className={variants[priority]}>
//         {priority} priority
//       </Badge>
//     )
//   }

//   return (
//     <Card className={cn(
//       "transition-all duration-200 hover:shadow-md",
//       status === "completed" && "bg-success/5 border-success/20",
//       status === "in-progress" && "bg-warning/5 border-warning/20"
//     )}>
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="flex items-center gap-3">
//             {getStatusIcon()}
//             <div>
//               <h3 className="font-semibold">{title}</h3>
//               <p className="text-sm text-muted-foreground mt-1">{description}</p>
//             </div>
//           </div>
//           <div className="flex flex-col gap-2">
//             {getStatusBadge()}
//             {getPriorityBadge()}
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="flex items-center justify-between">
//           {estimatedTime && (
//             <span className="text-sm text-muted-foreground">
//               Estimated time: {estimatedTime}
//             </span>
//           )}
//           <div className="ml-auto">
//             {status === "pending" && onStart && (
//               <Button onClick={onStart} size="sm">
//                 Start <ArrowRight className="ml-1 h-4 w-4" />
//               </Button>
//             )}
//             {status === "in-progress" && onContinue && (
//               <Button onClick={onContinue} size="sm" variant="outline">
//                 Continue <ArrowRight className="ml-1 h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// StepCard.tsx
"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, ArrowRight, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepCardProps {
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  estimatedTime?: string
  priority?: "low" | "medium" | "high"
  category?: string
  stepNumber?: number
  onStart?: () => void
  onContinue?: () => void
}

export const StepCard = ({
  title,
  description,
  status,
  estimatedTime,
  priority = "medium",
  category,
  stepNumber,
  onStart,
  onContinue
}: StepCardProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
          badge: "Completed",
          badgeClass: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
          cardClass: "border-green-200 bg-green-50/30"
        }
      case "in-progress":
        return {
          icon: <div className="relative">
            <Clock className="h-6 w-6 text-amber-500" />
            <div className="absolute inset-0 animate-ping">
              <Clock className="h-6 w-6 text-amber-400 opacity-75" />
            </div>
          </div>,
          badge: "In Progress",
          badgeClass: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
          cardClass: "border-amber-200 bg-amber-50/20"
        }
      default:
        return {
          icon: null,
          badge: "Pending",
          badgeClass: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
          cardClass: "border-slate-200 hover:border-slate-300"
        }
    }
  }

  const getPriorityConfig = () => {
    if (status === "completed") return null
    
    const config = {
      low: { class: "bg-blue-100 text-blue-700 border-blue-200", label: "Low Priority" },
      medium: { class: "bg-amber-100 text-amber-700 border-amber-200", label: "Medium Priority" },
      high: { class: "bg-red-100 text-red-700 border-red-200", label: "High Priority" }
    }
    
    return config[priority]
  }

  const statusConfig = getStatusConfig()
  const priorityConfig = getPriorityConfig()

  return (
    <Card className={cn(
      "group relative overflow-hidden border transition-all duration-300 hover:shadow-lg",
      statusConfig.cardClass
    )}>
      {/* Step number indicator */}
      {stepNumber && (
        <div className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-600">
          {stepNumber}
        </div>
      )}
      
      <CardHeader className="pb-3 pt-4 pl-12">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {statusConfig.icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
                {category && (
                  <Badge variant="outline" className="bg-white text-slate-600 border-slate-300 text-xs">
                    {category}
                  </Badge>
                )}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <Badge className={cn("text-xs font-medium", statusConfig.badgeClass)}>
              {statusConfig.badge}
            </Badge>
            {priorityConfig && (
              <Badge variant="outline" className={cn("text-xs", priorityConfig.class)}>
                {priorityConfig.label}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pl-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            {estimatedTime && (
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {estimatedTime}
              </span>
            )}
          </div>
          <div className="ml-auto">
            {status === "pending" && onStart && (
              <Button 
                onClick={onStart} 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <PlayCircle className="mr-1 h-4 w-4" />
                Start
              </Button>
            )}
            {status === "in-progress" && onContinue && (
              <Button 
                onClick={onContinue} 
                size="sm" 
                variant="outline"
                className="border-amber-200 text-amber-700 "
              >
                Continue
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}