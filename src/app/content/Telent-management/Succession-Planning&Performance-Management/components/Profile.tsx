import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Star,
  TrendingUp,
  Award,
  Target,
  BookOpen
} from "lucide-react"

export default function Profile() {
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

  const getProfileData = () => {
    switch (userRole) {
      case 'hr-manager':
        return {
          email: 'sarah.johnson@company.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          joinDate: 'March 2019',
          department: 'Human Resources',
          title: 'HR Manager',
          manager: 'David Wilson - VP of People',
          directReports: 8
        }
      case 'line-manager':
        return {
          email: 'michael.chen@company.com',
          phone: '+1 (555) 234-5678',
          location: 'San Francisco, CA',
          joinDate: 'January 2020',
          department: 'Engineering',
          title: 'Engineering Manager',
          manager: 'Jennifer Park - Director of Engineering',
          directReports: 12
        }
      default:
        return {
          email: 'alex.rodriguez@company.com',
          phone: '+1 (555) 345-6789',
          location: 'Austin, TX',
          joinDate: 'June 2022',
          department: 'Engineering',
          title: 'Software Developer',
          manager: 'Michael Chen - Engineering Manager',
          directReports: 0
        }
    }
  }

  const profileData = getProfileData()

  return (
    <div className="flex h-screen bg-background">
 
      
      <div className="flex-1 flex flex-col overflow-hidden">
     
        
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Profile</h1>
                <p className="text-muted-foreground text-sm">Manage your personal information and career development</p>
              </div>
              
              <Button variant="outline">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="shadow-card lg:col-span-1">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                        {userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-2xl font-bold">{userName}</h2>
                      <p className="text-muted-foreground">{profileData.title}</p>
                      <Badge variant="secondary" className="mt-2">{profileData.department}</Badge>
                    </div>

                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profileData.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profileData.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profileData.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Joined {profileData.joinDate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Reports to: {profileData.manager}</span>
                      </div>
                      {profileData.directReports > 0 && (
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profileData.directReports} direct reports</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card className="shadow-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Latest Review Score</span>
                          <span className="text-sm text-muted-foreground">8.7/10</span>
                        </div>
                        <Progress value={87} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Goal Achievement</span>
                          <span className="text-sm text-muted-foreground">85%</span>
                        </div>
                        <Progress value={85} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Career Progress</span>
                          <span className="text-sm text-muted-foreground">75%</span>
                        </div>
                        <Progress value={75} className="h-3" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-success" />
                          <span className="font-medium text-success">Recent Achievement</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Completed Q4 objectives with 115% target achievement
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-5 w-5 text-primary" />
                          <span className="font-medium text-primary">Recognition</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Employee of the Month - December 2023
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills & Development */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Skills & Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Technical Skills</h3>
                    <div className="space-y-3">
                      {[
                        { skill: "React/TypeScript", level: 90 },
                        { skill: "Node.js", level: 85 },
                        { skill: "Database Design", level: 80 },
                        { skill: "System Architecture", level: 75 }
                      ].map((item, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.skill}</span>
                            <span className="text-sm text-muted-foreground">{item.level}%</span>
                          </div>
                          <Progress value={item.level} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Soft Skills</h3>
                    <div className="space-y-3">
                      {[
                        { skill: "Communication", level: 88 },
                        { skill: "Problem Solving", level: 92 },
                        { skill: "Team Collaboration", level: 85 },
                        { skill: "Leadership", level: 65 }
                      ].map((item, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.skill}</span>
                            <span className="text-sm text-muted-foreground">{item.level}%</span>
                          </div>
                          <Progress value={item.level} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning & Development */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learning & Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { course: "Advanced React Patterns", status: "completed", progress: 100 },
                    { course: "Leadership Fundamentals", status: "in-progress", progress: 65 },
                    { course: "System Design", status: "enrolled", progress: 0 },
                    { course: "Project Management", status: "recommended", progress: 0 }
                  ].map((course, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium">{course.course}</h4>
                          <Badge 
                            variant={
                              course.status === 'completed' ? 'secondary' :
                              course.status === 'in-progress' ? 'outline' :
                              course.status === 'enrolled' ? 'secondary' : 'outline'
                            }
                            className={
                              course.status === 'completed' ? 'bg-success text-success-foreground' :
                              course.status === 'in-progress' ? 'bg-warning text-warning-foreground' : ''
                            }
                          >
                            {course.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                        
                        {course.progress > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-muted-foreground">Progress</span>
                              <span className="text-sm text-muted-foreground">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        )}
                      </div>
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