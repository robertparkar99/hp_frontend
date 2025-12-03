import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  Plus,
  Filter
} from "lucide-react"

const mockReviewData = [
  { id: 1, employee: "Alice Johnson", position: "Senior Developer", status: "completed", score: 8.9, manager: "You", dueDate: "2024-01-15" },
  { id: 2, employee: "Bob Smith", position: "Marketing Specialist", status: "pending", score: null, manager: "You", dueDate: "2024-01-20" },
  { id: 3, employee: "Carol Davis", position: "UX Designer", status: "in-progress", score: null, manager: "You", dueDate: "2024-01-18" },
  { id: 4, employee: "David Wilson", position: "Product Manager", status: "completed", score: 8.4, manager: "You", dueDate: "2024-01-10" },
]

export default function Reviews() {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground'
      case 'in-progress':
        return 'bg-warning text-warning-foreground'
      case 'pending':
        return 'bg-destructive text-destructive-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'in-progress':
        return <Clock className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* <AppSidebar /> */}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <AppHeader userRole={getRoleDisplay(userRole)} userName={userName} /> */}
        
        <main className="flex-1 overflow-y-auto ">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Performance Reviews</h1>
                <p className="text-muted-foreground text-sm">Manage and track employee performance evaluations</p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                {userRole !== 'employee' && (
                  <Button variant="gradient">
                    <Plus className="h-4 w-4" />
                    New Review
                  </Button>
                )}
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
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
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">5</div>
                      <div className="text-sm text-muted-foreground">Overdue</div>
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
                      <div className="text-2xl font-bold">8.3</div>
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews List */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {userRole === 'employee' ? 'Your Reviews' : 'Team Reviews'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReviewData.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                          <span className="text-white font-medium">
                            {review.employee.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div>
                          <div className="font-medium">{review.employee}</div>
                          <div className="text-sm text-muted-foreground">{review.position}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Score</div>
                          <div className="font-bold">
                            {review.score ? `${review.score}/10` : 'Pending'}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Due Date</div>
                          <div className="text-sm">{review.dueDate}</div>
                        </div>

                        <Badge className={getStatusColor(review.status)}>
                          {getStatusIcon(review.status)}
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </Badge>

                        <Button variant="outline" size="sm">
                          {review.status === 'completed' ? 'View' : 'Continue'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {userRole === 'employee' && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Your Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">87%</span>
                    </div>
                    <Progress value={87} className="h-3" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">9.2</div>
                        <div className="text-xs text-muted-foreground">Technical Skills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-secondary">8.8</div>
                        <div className="text-xs text-muted-foreground">Communication</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-accent">8.5</div>
                        <div className="text-xs text-muted-foreground">Leadership</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-success">9.0</div>
                        <div className="text-xs text-muted-foreground">Collaboration</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}