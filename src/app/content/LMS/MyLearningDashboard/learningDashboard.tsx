import React, { useState } from 'react';
// import Header from '../../components/ui/Header';
import Breadcrumb from "../../../../components/ui/BreadcrumbNavigation";
import { Button } from "./../../../../components/ui/button";
import ProgressOverviewCard from "@/app/content/LMS/MyLearningDashboard/ProgressOverviewCard";
import CourseCard from "@/app/content/LMS/MyLearningDashboard/CourseCard";
import SkillProgressTracker from "@/app/content/LMS/MyLearningDashboard/SkillProgressTracker";
import LearningCalendar from "@/app/content/LMS/MyLearningDashboard/LearningCalendar";
import LearningStats from "@/app/content/LMS/MyLearningDashboard/LearningStats";
import QuickActions from "@/app/content/LMS/MyLearningDashboard/QuickActions";
import { Plus, Search, BookOpen, CheckCircle, Award, Clock } from "lucide-react";

// Type definitions
interface Trend {
  type: 'up' | 'down' | 'neutral';
  value: string;
}

interface OverviewStat {
  title: string;
  value: number;
  total: number | null;
  icon: string;
  color: 'primary' | 'success' | 'secondary' | 'warning' | 'danger';
  trend: Trend;
  description: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  progress?: number;
  timeRemaining?: number;
  nextLesson?: string;
  completedDate?: string;
  matchScore?: number;
  skills: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  lessons: number;
  enrolledCount: number;
  rating: number;
}

interface Tab {
  id: 'progress' | 'completed' | 'recommended';
  label: string;
  count: number;
}

// Icon mapper for ProgressOverviewCard
const IconMapper = ({ name, size = 24, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
  const iconProps = { size, color };
  
  switch (name.toLowerCase()) {
    case 'bookopen':
    case 'book-open':
      return <BookOpen {...iconProps} />;
    case 'checkcircle':
    case 'check-circle':
      return <CheckCircle {...iconProps} />;
    case 'award':
      return <Award {...iconProps} />;
    case 'clock':
      return <Clock {...iconProps} />;
    default:
      return <BookOpen {...iconProps} />;
  }
};

const MyLearningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'progress' | 'completed' | 'recommended'>('progress');

  // Mock data for progress overview - using consistent icon names
  const overviewStats: OverviewStat[] = [
    {
      title: "Courses In Progress",
      value: 4,
      total: null,
      icon: "book-open", // consistent lowercase with hyphen
      color: "primary",
      trend: { type: "up", value: "+2 this week" },
      description: "Keep up the momentum!"
    },
    {
      title: "Completed Courses",
      value: 12,
      total: null,
      icon: "check-circle", // consistent lowercase with hyphen
      color: "success",
      trend: { type: "up", value: "+3 this month" },
      description: "Great progress!"
    },
    {
      title: "Skills Earned",
      value: 8,
      total: 15,
      icon: "award", // consistent lowercase
      color: "secondary",
      trend: { type: "up", value: "+1 this week" },
      description: "7 more to reach your goal"
    },
    {
      title: "Learning Hours",
      value: 47,
      total: 60,
      icon: "clock", // consistent lowercase
      color: "warning",
      trend: { type: "up", value: "+8 this week" },
      description: "13 hours to monthly goal"
    }
  ];

  // Mock data for courses in progress
  const coursesInProgress: Course[] = [
    {
      id: 1,
      title: "Advanced React Development",
      description: "Master advanced React patterns, hooks, and performance optimization techniques for building scalable applications.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
      progress: 75,
      timeRemaining: 180,
      nextLesson: "Custom Hooks and Context API",
      skills: ["React", "JavaScript", "Frontend Development", "Performance"],
      level: "Advanced",
      duration: 480,
      lessons: 24,
      enrolledCount: 15420,
      rating: 4.8
    },
    {
      id: 2,
      title: "Data Analysis Fundamentals",
      description: "Learn essential data analysis techniques using Python, pandas, and visualization libraries.",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
      progress: 45,
      timeRemaining: 420,
      nextLesson: "Statistical Analysis with Pandas",
      skills: ["Python", "Data Analysis", "Statistics", "Pandas"],
      level: "Intermediate",
      duration: 360,
      lessons: 18,
      enrolledCount: 8930,
      rating: 4.6
    },
    {
      id: 3,
      title: "Project Management Essentials",
      description: "Comprehensive guide to project management methodologies, tools, and best practices.",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
      progress: 30,
      timeRemaining: 600,
      nextLesson: "Agile vs Waterfall Methodologies",
      skills: ["Project Management", "Leadership", "Agile", "Communication"],
      level: "Beginner",
      duration: 300,
      lessons: 15,
      enrolledCount: 12650,
      rating: 4.7
    },
    {
      id: 4,
      title: "Machine Learning Basics",
      description: "Introduction to machine learning concepts, algorithms, and practical implementation.",
      thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop",
      progress: 15,
      timeRemaining: 840,
      nextLesson: "Linear Regression Fundamentals",
      skills: ["Machine Learning", "Python", "Statistics", "AI"],
      level: "Intermediate",
      duration: 540,
      lessons: 32,
      enrolledCount: 6780,
      rating: 4.9
    }
  ];

  // Mock data for completed courses
  const completedCourses: Course[] = [
    {
      id: 5,
      title: "JavaScript ES6+ Mastery",
      description: "Complete guide to modern JavaScript features and best practices.",
      thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop",
      progress: 100,
      completedDate: "July 20, 2025",
      skills: ["JavaScript", "ES6+", "Frontend Development"],
      level: "Intermediate",
      duration: 420,
      lessons: 28,
      enrolledCount: 18750,
      rating: 4.8
    },
    {
      id: 6,
      title: "CSS Grid and Flexbox",
      description: "Master modern CSS layout techniques for responsive web design.",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
      progress: 100,
      completedDate: "July 10, 2025",
      skills: ["CSS", "Web Design", "Responsive Design"],
      level: "Beginner",
      duration: 240,
      lessons: 16,
      enrolledCount: 14200,
      rating: 4.7
    }
  ];

  // Mock data for recommended courses
  const recommendedCourses: Course[] = [
    {
      id: 7,
      title: "Advanced TypeScript",
      description: "Deep dive into TypeScript's advanced features and patterns for large-scale applications.",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
      matchScore: 95,
      skills: ["TypeScript", "JavaScript", "Frontend Development"],
      level: "Advanced",
      duration: 360,
      lessons: 22,
      enrolledCount: 9850,
      rating: 4.9
    },
    {
      id: 8,
      title: "Node.js Backend Development",
      description: "Build scalable backend applications with Node.js, Express, and MongoDB.",
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop",
      matchScore: 88,
      skills: ["Node.js", "Express", "MongoDB", "Backend Development"],
      level: "Intermediate",
      duration: 480,
      lessons: 30,
      enrolledCount: 11200,
      rating: 4.6
    }
  ];

  const tabs: Tab[] = [
    { id: 'progress', label: 'In Progress', count: coursesInProgress.length },
    { id: 'completed', label: 'Completed', count: completedCourses.length },
    { id: 'recommended', label: 'Recommended', count: recommendedCourses.length }
  ];

  const getCurrentCourses = (): Course[] => {
    switch (activeTab) {
      case 'progress':
        return coursesInProgress;
      case 'completed':
        return completedCourses;
      case 'recommended':
        return recommendedCourses;
      default:
        return coursesInProgress;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* <Breadcrumb /> */}
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Learning Dashboard</h1>
              <p className="text-muted-foreground">
                Track your progress and continue your learning journey
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" /> Browse Courses
              </Button>
            </div>
          </div>

          {/* Progress Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {overviewStats.map((stat, index) => (
              <ProgressOverviewCard 
                key={index} 
                {...stat} 
                // Pass the IconMapper component or use a different approach
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Tabs */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">My Courses</h2>
                  <div className="flex items-center space-x-1 bg-muted p-1 rounded-xl">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                        <span className="ml-2 px-2 py-0.5 bg-muted-foreground/20 rounded-full text-xs">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {getCurrentCourses().map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      variant={activeTab}
                    />
                  ))}
                </div>

                {getCurrentCourses().length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No courses found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === 'progress' && "Start learning by enrolling in a course"}
                      {activeTab === 'completed' && "Complete your first course to see it here"}
                      {activeTab === 'recommended' && "We'll recommend courses based on your learning history"}
                    </p>
                    <Button variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Browse Courses
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <QuickActions />
            </div>

            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <SkillProgressTracker />
              <LearningCalendar />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <LearningStats />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyLearningDashboard;