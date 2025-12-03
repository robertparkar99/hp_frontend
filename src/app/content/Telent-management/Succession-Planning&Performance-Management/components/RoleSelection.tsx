import { Users, UserCheck, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const roles = [
  {
    id: "hr-manager",
    title: "HR Manager",
    description: "Access to all talent management features, analytics, and organizational insights.",
    icon: Users,
    color: "primary"
  },
  {
    id: "line-manager", 
    title: "Line Manager",
    description: "Manage team performance reviews, appraisals, and succession planning.",
    icon: UserCheck,
    color: "secondary"
  },
  {
    id: "employee",
    title: "Employee",
    description: "View your performance data, career development, and appraisal outcomes.",
    icon: User,
    color: "accent"
  }
]

export default function RoleSelection() {
  const navigate = useNavigate()

  const selectRole = (role: string) => {
    // Store role in localStorage for demo purposes
    localStorage.setItem('userRole', role)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to TalentHub
          </h1>
          <p className="text-xl text-muted-foreground">
            Your comprehensive talent management platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon
            return (
              <Card 
                key={role.id} 
                className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer group"
                onClick={() => selectRole(role.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-6">{role.description}</p>
                  <Button 
                    variant="gradient" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      selectRole(role.id)
                    }}
                  >
                    Continue as {role.title}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            This is a demo interface. In production, role assignment would be handled by authentication.
          </p>
        </div>
      </div>
    </div>
  )
}