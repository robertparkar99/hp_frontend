import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  Award, 
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"

const mockAppraisalData = [
  { 
    id: 1, 
    employee: "Alice Johnson", 
    position: "Senior Developer", 
    currentSalary: 85000,
    newSalary: 95000,
    increase: 11.8,
    bonus: 5000,
    promotion: "Lead Developer",
    status: "approved",
    effectiveDate: "2024-02-01"
  },
  { 
    id: 2, 
    employee: "Bob Smith", 
    position: "Marketing Specialist", 
    currentSalary: 65000,
    newSalary: 70000,
    increase: 7.7,
    bonus: 2000,
    promotion: null,
    status: "pending",
    effectiveDate: "2024-02-01"
  },
  { 
    id: 3, 
    employee: "Carol Davis", 
    position: "UX Designer", 
    currentSalary: 75000,
    newSalary: 82000,
    increase: 9.3,
    bonus: 3000,
    promotion: "Senior UX Designer",
    status: "under-review",
    effectiveDate: "2024-02-01"
  },
]

export default function Appraisals() {
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
      case 'approved':
        return 'bg-success text-success-foreground'
      case 'under-review':
        return 'bg-warning text-warning-foreground'
      case 'pending':
        return 'bg-destructive text-destructive-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'under-review':
        return <Clock className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex h-screen bg-background">
   
      <div className="flex-1 flex flex-col overflow-hidden">
      
        
        <main className="flex-1 overflow-y-auto ">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Appraisals & Compensation</h1>
                <p className="text-muted-foreground text-sm">Manage salary adjustments, bonuses, and promotions</p>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-success/10">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">18</div>
                      <div className="text-sm text-muted-foreground">Approved</div>
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
                      <div className="text-2xl font-bold">7</div>
                      <div className="text-sm text-muted-foreground">Under Review</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg ">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">8.5%</div>
                      <div className="text-sm text-muted-foreground">Avg Increase</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Award className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm text-black">Promotions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {userRole === 'employee' && (
              <Card className="shadow-card border-success/20 bg-gradient-to-r from-success/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <Award className="h-5 w-5" />
                    Your Appraisal Outcome - Congratulations!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success">12%</div>
                      <div className="text-sm text-muted-foreground">Salary Increase</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(85000)} → {formatCurrency(95200)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent">{formatCurrency(5000)}</div>
                      <div className="text-sm text-muted-foreground">Performance Bonus</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Paid with next salary
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">Senior Developer</div>
                      <div className="text-sm text-muted-foreground">Promotion</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Effective Feb 1, 2024
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-6">
                    <Button variant="success">
                      <Download className="h-4 w-4" />
                      Download Letter
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appraisals List */}
            {userRole !== 'employee' && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Appraisal Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAppraisalData.map((appraisal) => (
                      <div key={appraisal.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                            <span className="text-white font-medium">
                              {appraisal.employee.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          
                          <div>
                            <div className="font-medium">{appraisal.employee}</div>
                            <div className="text-sm text-muted-foreground">{appraisal.position}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Salary</div>
                            <div className="font-bold text-success">
                              +{appraisal.increase.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(appraisal.newSalary)}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Bonus</div>
                            <div className="font-bold text-accent">
                              {formatCurrency(appraisal.bonus)}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Promotion</div>
                            <div className="text-sm font-medium">
                              {appraisal.promotion || 'No change'}
                            </div>
                          </div>

                          <Badge className={getStatusColor(appraisal.status)}>
                            {getStatusIcon(appraisal.status)}
                            {appraisal.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>

                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {userRole === 'employee' && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Compensation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { year: "2024", salary: 95200, increase: 12.0, position: "Senior Developer" },
                      { year: "2023", salary: 85000, increase: 8.5, position: "Software Developer" },
                      { year: "2022", salary: 78000, increase: 6.8, position: "Junior Developer" },
                    ].map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center">
                            <span className="text-white font-bold">{record.year}</span>
                          </div>
                          <div>
                            <div className="font-medium">{record.position}</div>
                            <div className="text-sm text-muted-foreground">Annual salary</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(record.salary)}</div>
                            {index > 0 && (
                              <div className="text-sm text-success">+{record.increase}%</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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