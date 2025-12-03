import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Filter,
  Calendar,
  FileText,
  PieChart,
  Users,
  Star
} from "lucide-react"

const reportCategories = [
  {
    title: "Performance Analytics",
    icon: BarChart3,
    reports: [
      { name: "Performance Distribution", description: "Overall performance scores across organization", lastGenerated: "2024-01-15" },
      { name: "Review Completion Rates", description: "Track review completion by department", lastGenerated: "2024-01-14" },
      { name: "Performance Trends", description: "Quarterly performance trending analysis", lastGenerated: "2024-01-10" }
    ]
  },
  {
    title: "Compensation Reports",
    icon: TrendingUp,
    reports: [
      { name: "Salary Benchmarking", description: "Compare compensation against market rates", lastGenerated: "2024-01-12" },
      { name: "Pay Equity Analysis", description: "Analyze compensation equality across demographics", lastGenerated: "2024-01-08" },
      { name: "Promotion Impact", description: "Financial impact of recent promotions", lastGenerated: "2024-01-05" }
    ]
  },
  {
    title: "Succession Planning",
    icon: Users,
    reports: [
      { name: "Succession Coverage", description: "Critical role coverage assessment", lastGenerated: "2024-01-11" },
      { name: "Talent Pipeline", description: "Future leadership pipeline analysis", lastGenerated: "2024-01-09" },
      { name: "Skills Gap Analysis", description: "Identify organizational skill gaps", lastGenerated: "2024-01-07" }
    ]
  }
]

export default function Reports() {
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

  return (
    <div className="flex h-screen bg-background">
     
      
      <div className="flex-1 flex flex-col overflow-hidden">
       
        
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
                <p className="text-muted-foreground text-sm">Generate insights from your talent management data</p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Button>
                <Button variant="gradient">
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg ">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">47</div>
                      <div className="text-sm text-muted-foreground">Total Reports</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-success/10">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">8.4</div>
                      <div className="text-sm text-muted-foreground">Avg Performance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <PieChart className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">87%</div>
                      <div className="text-sm text-muted-foreground">Review Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Star className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">23</div>
                      <div className="text-sm text-muted-foreground">High Performers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {userRole === 'employee' && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Your Personal Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Performance History", description: "Your performance timeline and trends", icon: TrendingUp },
                      { name: "Career Progress", description: "Skills development and career advancement", icon: Star },
                      { name: "Salary History", description: "Compensation progression over time", icon: TrendingUp },
                      { name: "Goal Achievement", description: "Track your goal completion rates", icon: BarChart3 }
                    ].map((report, index) => (
                      <div key={index} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <report.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{report.name}</h3>
                              <p className="text-sm text-muted-foreground">{report.description}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Report Categories */}
            {userRole !== 'employee' && (
              <div className="space-y-6">
                {reportCategories.map((category, categoryIndex) => (
                  <Card key={categoryIndex} className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <category.icon className="h-5 w-5" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {category.reports.map((report, reportIndex) => (
                          <div key={reportIndex} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-medium">{report.name}</h3>
                                <p className="text-sm text-muted-foreground">{report.description}</p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                  Last generated: {report.lastGenerated}
                                </div>
                                <Badge variant="outline">Ready</Badge>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <FileText className="h-4 w-4" />
                                  View
                                </Button>
                                <Button variant="secondary" size="sm" className="flex-1">
                                  <Download className="h-4 w-4" />
                                  Export
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Recent Activity */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Report Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Performance Distribution report generated", user: "Sarah Johnson", time: "2 hours ago", type: "generated" },
                    { action: "Salary Benchmarking report exported", user: "Michael Chen", time: "4 hours ago", type: "exported" },
                    { action: "Succession Coverage report viewed", user: "Jennifer Lee", time: "6 hours ago", type: "viewed" },
                    { action: "Skills Gap Analysis scheduled", user: "David Park", time: "1 day ago", type: "scheduled" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'generated' ? 'bg-success' :
                          activity.type === 'exported' ? 'bg-primary' :
                          activity.type === 'viewed' ? 'bg-warning' : 'bg-accent'
                        }`}></div>
                        <div>
                          <span className="text-sm font-medium">{activity.action}</span>
                          <div className="text-xs text-muted-foreground">by {activity.user}</div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}