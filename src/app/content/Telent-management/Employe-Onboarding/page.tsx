// "use client"
// import { useState } from "react"
// // import { Header } from "../Employe-Onboarding/components/Header"
// import { WelcomeHero } from "../Employe-Onboarding/components/WelcomeHero"
// import { ProgressCard } from "../Employe-Onboarding/components/ProgressCard"
// import { StepCard } from "../Employe-Onboarding/components/StepCard"
// import { QuickActions } from "../Employe-Onboarding/components/QuickActions"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Calendar, Clock, CheckCircle2, Users } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"

// const Index = () => {
//   const { toast } = useToast()
//   const [currentStep, setCurrentStep] = useState(0)

//   const onboardingSteps = [
//     {
//       title: "Complete Personal Information",
//       description: "Fill out your basic details and emergency contacts",
//       status: "completed" as const,
//       estimatedTime: "10 mins",
//       priority: "high" as const
//     },
//     {
//       title: "Upload Required Documents",
//       description: "Submit ID, tax forms, and other necessary paperwork",
//       status: "in-progress" as const,
//       estimatedTime: "15 mins",
//       priority: "high" as const
//     },
//     {
//       title: "Set Up Direct Deposit",
//       description: "Configure your payroll and benefits preferences",
//       status: "pending" as const,
//       estimatedTime: "10 mins",
//       priority: "medium" as const
//     },
//     {
//       title: "Complete Security Training",
//       description: "Learn about company policies and security protocols",
//       status: "pending" as const,
//       estimatedTime: "30 mins",
//       priority: "medium" as const
//     },
//     {
//       title: "Meet Your Team",
//       description: "Schedule introductory meetings with key colleagues",
//       status: "pending" as const,
//       estimatedTime: "60 mins",
//       priority: "low" as const
//     }
//   ]

//   const completedSteps = onboardingSteps.filter(step => step.status === "completed").length
//   const totalSteps = onboardingSteps.length
//   const progress = Math.round((completedSteps / totalSteps) * 100)

//   const upcomingEvents = [
//     {
//       title: "HR Orientation",
//       time: "Today at 2:00 PM",
//       type: "Meeting"
//     },
//     {
//       title: "Team Lunch",
//       time: "Tomorrow at 12:30 PM", 
//       type: "Social"
//     },
//     {
//       title: "Security Training",
//       time: "Friday at 10:00 AM",
//       type: "Training"
//     }
//   ]

//   const handleStepAction = (stepIndex: number) => {
//     toast({
//       title: "Step Started",
//       description: `Starting: ${onboardingSteps[stepIndex].title}`,
//     })
//     setCurrentStep(stepIndex)
//   }

//   const handleQuickAction = (action: string) => {
//     toast({
//       title: "Action Selected",
//       description: `Opening ${action} section...`,
//     })
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* <Header 
//         userName="Sarah Johnson"
//         onLogoutClick={() => toast({ title: "Logged out" })}
//       /> */}
      
//       <main className="container mx-auto px-6 py-6 space-y-8">
//         {/* Welcome Hero Section */}
//         <WelcomeHero 
//           userName="Sarah"
//           companyName="TechFlow Inc."
//           onGetStarted={() => handleStepAction(1)}
//         />

//         {/* Progress Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <ProgressCard
//             title="Onboarding Progress"
//             description="Complete all steps to finish your setup"
//             progress={progress}
//             totalSteps={totalSteps}
//             completedSteps={completedSteps}
//             variant={progress === 100 ? "success" : "default"}
//             icon={<CheckCircle2 className="h-5 w-5" />}
//           />
          
//           <ProgressCard
//             title="Training Modules"
//             description="Required courses and certifications"
//             progress={25}
//             totalSteps={8}
//             completedSteps={2}
//             variant="warning"
//             icon={<Clock className="h-5 w-5" />}
//           />
          
//           <ProgressCard
//             title="Team Connections"
//             description="Meet and connect with your colleagues"
//             progress={0}
//             totalSteps={12}
//             completedSteps={0}
//             icon={<Users className="h-5 w-5" />}
//           />
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Onboarding Steps */}
//           <div className="lg:col-span-2 space-y-6">
//             <div>
//               <h2 className="text-2xl font-semibold mb-6">Your Onboarding Journey</h2>
//               <div className="space-y-4">
//                 {onboardingSteps.map((step, index) => (
//                   <StepCard
//                     key={index}
//                     title={step.title}
//                     description={step.description}
//                     status={step.status}
//                     estimatedTime={step.estimatedTime}
//                     priority={step.priority}
//                     onStart={() => handleStepAction(index)}
//                     onContinue={() => handleStepAction(index)}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Upcoming Events */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Calendar className="h-5 w-5" />
//                   Upcoming Events
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {upcomingEvents.map((event, index) => (
//                   <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
//                     <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
//                     <div>
//                       <h4 className="font-medium text-sm">{event.title}</h4>
//                       <p className="text-xs text-muted-foreground">{event.time}</p>
//                       <Badge variant="outline" className="mt-1 text-xs">
//                         {event.type}
//                       </Badge>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Need Help */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Need Help?</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <p className="text-sm text-muted-foreground">
//                   Your HR buddy is here to help with any questions about your onboarding process.
//                 </p>
//                 <div className="flex items-center gap-3">
//                   <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
//                     MR
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium">Michelle Rodriguez</p>
//                     <p className="text-xs text-muted-foreground">HR Coordinator</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <QuickActions onActionClick={handleQuickAction} />
//       </main>
//     </div>
//   )
// }

// export default Index
"use client"
import { useState } from "react"
import { WelcomeHero } from "../Employe-Onboarding/components/WelcomeHero"
import { ProgressCard } from "../Employe-Onboarding/components/ProgressCard"
import { StepCard } from "../Employe-Onboarding/components/StepCard"
import { QuickActions } from "../Employe-Onboarding/components/QuickActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Users, 
  MessageCircle, 
  Sparkles, 
  Target,
  FileText,
  User,
  Shield,
  Handshake,
  TrendingUp,
  CalendarDays
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Index = () => {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)

  const onboardingSteps = [
    {
      title: "Complete Personal Information",
      description: "Fill out your basic details and emergency contacts",
      status: "completed" as const,
      estimatedTime: "10 mins",
      priority: "high" as const,
      icon: <User className="h-5 w-5" />
    },
    {
      title: "Upload Required Documents",
      description: "Submit ID, tax forms, and other necessary paperwork",
      status: "in-progress" as const,
      estimatedTime: "15 mins",
      priority: "high" as const,
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: "Set Up Direct Deposit",
      description: "Configure your payroll and benefits preferences",
      status: "pending" as const,
      estimatedTime: "10 mins",
      priority: "medium" as const,
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: "Complete Security Training",
      description: "Learn about company policies and security protocols",
      status: "pending" as const,
      estimatedTime: "30 mins",
      priority: "medium" as const,
      icon: <Shield className="h-5 w-5" />
    },
    {
      title: "Meet Your Team",
      description: "Schedule introductory meetings with key colleagues",
      status: "pending" as const,
      estimatedTime: "60 mins",
      priority: "low" as const,
      icon: <Handshake className="h-5 w-5" />
    }
  ]

  const completedSteps = onboardingSteps.filter(step => step.status === "completed").length
  const totalSteps = onboardingSteps.length
  const progress = Math.round((completedSteps / totalSteps) * 100)

  const upcomingEvents = [
    {
      title: "HR Orientation",
      time: "Today at 2:00 PM",
      type: "Meeting",
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Team Lunch", 
      time: "Tomorrow at 12:30 PM",
      type: "Social",
      icon: <CalendarDays className="h-4 w-4" />
    },
    {
      title: "Security Training",
      time: "Friday at 10:00 AM",
      type: "Training",
      icon: <Shield className="h-4 w-4" />
    }
  ]

  const handleStepAction = (stepIndex: number) => {
    toast({
      title: "Step Started",
      description: `Starting: ${onboardingSteps[stepIndex].title}`,
    })
    setCurrentStep(stepIndex)
  }

  const handleQuickAction = (action: string) => {
    toast({
      title: "Action Selected",
      description: `Opening ${action} section...`,
    })
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Hero Section */}
        <WelcomeHero 
          userName="Sarah"
          companyName="TechFlow Inc."
          onGetStarted={() => handleStepAction(1)}
        />

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressCard
            title="Onboarding Progress"
            description="Complete all steps to finish your setup"
            progress={progress}
            totalSteps={totalSteps}
            completedSteps={completedSteps}
            variant={progress === 100 ? "success" : "default"}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          
          <ProgressCard
            title="Training Modules"
            description="Required courses and certifications"
            progress={25}
            totalSteps={8}
            completedSteps={2}
            variant="warning"
            icon={<Target className="h-5 w-5" />}
          />
          
          <ProgressCard
            title="Team Connections"
            description="Meet and connect with your colleagues"
            progress={0}
            totalSteps={12}
            completedSteps={0}
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Onboarding Steps */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-400 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Onboarding Journey</h2>
                  <p className="text-sm text-gray-600">Complete these steps to get started</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                {completedSteps}/{totalSteps} Complete
              </Badge>
            </div>
            <div className="space-y-4">
              {onboardingSteps.map((step, index) => (
                <StepCard
                  key={index}
                  title={step.title}
                  description={step.description}
                  status={step.status}
                  estimatedTime={step.estimatedTime}
                  priority={step.priority}
                  stepNumber={index + 1}
                  icon={step.icon}
                  onStart={() => handleStepAction(index)}
                  onContinue={() => handleStepAction(index)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="p-2 bg-blue-400 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white hover:border-blue-200 transition-all duration-200">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {event.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{event.title}</h4>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card>
             <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your HR buddy is here to help with any questions about your onboarding process.
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    MR
                  </div>
                  <div>
                    <p className="text-sm font-medium">Michelle Rodriguez</p>
                    <p className="text-xs text-muted-foreground">HR Coordinator</p>
                  </div>
                </div>
              </CardContent>
            </Card> 

            {/* Quick Stats */}
            <Card >
              <CardHeader>
                <CardTitle className="text-gray-900 text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">Days to Complete</span>
                  </div>
                  <span className="font-semibold text-sm text-blue-600">5 days</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">Team Members</span>
                  </div>
                  <span className="font-semibold text-sm text-blue-600">12 people</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">Training Hours</span>
                  </div>
                  <span className="font-semibold text-sm text-blue-600">8 hrs</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions onActionClick={handleQuickAction} />
      </main>
    </div>
  )
}

export default Index
