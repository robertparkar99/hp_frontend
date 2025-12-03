import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  ArrowUp, 
  Star, 
  Target,
  UserPlus,
  TrendingUp,
  Clock
} from "lucide-react"

const mockSuccessionData = [
  {
    role: "Engineering Manager",
    incumbent: "Sarah Chen",
    successors: [
      { name: "Alice Johnson", readiness: "ready-now", score: 9.2, gap: "Leadership training" },
      { name: "David Wilson", readiness: "ready-1-2", score: 8.4, gap: "Team management" }
    ]
  },
  {
    role: "Senior Product Manager", 
    incumbent: "Michael Rodriguez",
    successors: [
      { name: "Carol Davis", readiness: "ready-now", score: 8.8, gap: "Strategic planning" },
      { name: "Bob Smith", readiness: "ready-1-2", score: 8.1, gap: "Product analytics" }
    ]
  },
  {
    role: "Head of Design",
    incumbent: "Jennifer Park",
    successors: [
      { name: "Alex Thompson", readiness: "ready-1-2", score: 8.6, gap: "Design leadership" }
    ]
  }
]

export default function Succession() {
  const [userRole, setUserRole] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'employee'
    setUserRole(role)
    
    const names = {
      'hr-manager': 'Sarah Johnson',
      'line-manager': 'Michael Chen', 
      'employee': 'Alex Rodriguez'
    }
    setUserName(names[role as keyof typeof names] || 'User')
  }, [])

  const getRoleDisplay = (role: string) => {
    const displays = {
      'hr-manager': 'HR Manager',
      'line-manager': 'Line Manager',
      'employee': 'Employee'
    }
    return displays[role as keyof typeof displays] || 'User'
  }

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'ready-now':
        return 'bg-success text-success-foreground'
      case 'ready-1-2':
        return 'bg-warning text-warning-foreground'
      case 'not-ready':
        return 'bg-destructive text-destructive-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getReadinessLabel = (readiness: string) => {
    switch (readiness) {
      case 'ready-now':
        return 'Ready Now'
      case 'ready-1-2':
        return 'Ready 1-2 Years'
      case 'not-ready':
        return 'Not Ready'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="flex h-screen bg-background">
    
      
      <div className="flex-1 flex flex-col overflow-hidden">
       
        
        <main className="flex-1 overflow-y-auto ">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Succession Planning</h1>
                <p className="text-sm text-muted-foreground">Identify and develop future leaders for critical roles</p>
              </div>
              
              {userRole !== 'employee' && (
                <Button variant="gradient">
                  <UserPlus className="h-4 w-4" />
                  Nominate Successor
                </Button>
              )}
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg ">
                      <Target className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-sm text-muted-foreground">Critical Roles</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Star className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">78%</div>
                      <div className="text-sm text-muted-foreground">Coverage Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">15</div>
                      <div className="text-sm text-muted-foreground">Ready Now</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">23</div>
                      <div className="text-sm text-muted-foreground">In Development</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Succession Pipeline */}
            {userRole !== 'employee' && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Succession Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockSuccessionData.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{item.role}</h3>
                            <p className="text-sm text-muted-foreground">Current: {item.incumbent}</p>
                          </div>
                          <Badge variant="outline">
                            {item.successors.length} Successor{item.successors.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.successors.map((successor, successorIndex) => (
                            <div key={successorIndex} className="p-4 rounded-lg bg-muted/30 border border-border">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                      {successor.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium">{successor.name}</div>
                                    <div className="text-sm text-muted-foreground">Score: {successor.score}/10</div>
                                  </div>
                                </div>
                                <Badge className={getReadinessColor(successor.readiness)}>
                                  {getReadinessLabel(successor.readiness)}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Readiness Score</span>
                                  <span>{(successor.score * 10).toFixed(0)}%</span>
                                </div>
                                <Progress value={successor.score * 10} className="h-2" />
                                <div className="text-xs text-muted-foreground">
                                  Development gap: {successor.gap}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employee Career Path */}
            {userRole === 'employee' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUp className="h-5 w-5" />
                      Your Career Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Current Position</div>
                            <div className="text-sm text-muted-foreground">Software Developer</div>
                          </div>
                          <Badge className="bg-success text-success-foreground">Current</Badge>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <ArrowUp className="h-6 w-6 text-muted-foreground" />
                      </div>

                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Next Role</div>
                            <div className="text-sm text-muted-foreground">Senior Software Developer</div>
                          </div>
                          <Badge className="bg-warning text-warning-foreground">75% Ready</Badge>
                        </div>
                        <Progress value={75} className="h-2 mt-2" />
                      </div>

                      <div className="flex justify-center">
                        <ArrowUp className="h-6 w-6 text-muted-foreground" />
                      </div>

                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Future Goal</div>
                            <div className="text-sm text-muted-foreground">Engineering Manager</div>
                          </div>
                          <Badge variant="outline">Long-term</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Development Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { skill: "System Architecture", progress: 85, status: "advanced" },
                        { skill: "Team Leadership", progress: 60, status: "developing" },
                        { skill: "Project Management", progress: 45, status: "beginner" },
                        { skill: "Mentoring", progress: 30, status: "beginner" }
                      ].map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{skill.skill}</span>
                            <span className="text-sm text-muted-foreground">{skill.progress}%</span>
                          </div>
                          <Progress value={skill.progress} className="h-2" />
                          <div className="text-xs text-muted-foreground capitalize">
                            {skill.status} level
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}