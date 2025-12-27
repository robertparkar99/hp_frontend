import React, { useState, useEffect } from 'react';
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

interface ApiSubject {
  standard_name: string;
  subject_name: string;
  subject_code: string | null;
  short_name: string | null;
  subject_type: string;
  subject_id: number;
  standard_id: number;
  display_image: string | null;
  chapter_list: string;
  content_category: string;
  sub_institute_id: number;
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

  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });

  // Load session data
useEffect(() => {
  const userData = localStorage.getItem("userData");
  if (userData) {
    const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
    setSessionData({
      url: APP_URL,
      token,
      subInstituteId: sub_institute_id,
      orgType: org_type,
      userId: user_id,
    });
  }
}, []);

// ✅ STEP-2: Load enrolled courses from localStorage on page refresh
useEffect(() => {
  const savedEnrolled = localStorage.getItem("enrolledCourses");
  if (savedEnrolled) {
    setInProgressCourses(JSON.parse(savedEnrolled));  // Load previous enrolled courses
  }
}, []);


  const [activeTab, setActiveTab] = useState<'progress' | 'completed' | 'recommended'>('progress');
  const [apiSubjects, setApiSubjects] = useState<ApiSubject[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  const fetchCoursesAndRefresh = () => {
    // Switch to Progress tab
    setActiveTab("progress");
  };

  const refreshCourses = () => {
    // fetchCourses();        // re-fetch API data
    setActiveTab("progress"); // move user to In Progress tab
  };

const handleEnrollSuccess = (course: Course) => {
  setInProgressCourses(prev => {
    const updated = [...prev, course];
    localStorage.setItem("enrolledCourses", JSON.stringify(updated)); // SAVE
    return updated;
  });

  setApiSubjects(prev =>
    prev.filter(c => c.subject_id !== course.id)
  );

  setActiveTab("progress");
};


  useEffect(() => {
  const fetchEnrolledCourses = async () => {
    if (!sessionData.url || !sessionData.userId) return;

    try {
      const response = await fetch(
        `${sessionData.url}/api/enrolled_courses?user_id=${sessionData.userId}&type=API`
      );

      const data = await response.json();
      console.log("ENROLLED COURSES:", data);

      if (data.status === true && Array.isArray(data.courses)) {
        const mapped = data.courses.map((item: any) => ({
          id: item.subject_id,
          title: item.subject_name,
          description: item.subject_name,
          thumbnail: item.display_image,
          progress: item.progress || 0,
          skills: [item.subject_name],
          level: 'Beginner',
          duration: 0,
          lessons: 0,
          enrolledCount: 0,
          rating: 0
        }));

        setInProgressCourses(mapped);
      }

    } catch (error) {
      console.log("ERROR fetching enrolled:", error);
    }
  };

  if (sessionData.url && sessionData.userId) {
    fetchEnrolledCourses();
  }
}, [sessionData]);




  useEffect(() => {
    const fetchCourses = async () => {
      if (!sessionData.url || !sessionData.subInstituteId || !sessionData.userId) {
        console.log('Session data not ready:', sessionData);
        return;
      }

      try {
        const response = await fetch(`${sessionData.url}/lms/course_master?type=API&sub_institute_id=${sessionData.subInstituteId}&syear=2025&user_id=${sessionData.userId}&user_profile_name=Admin`);
        const data = await response.json();
        console.log('API Response:', data); // For debugging
        // Aggregate all subjects from all categories
        const allSubjects: ApiSubject[] = Object.values(data.lms_subject || {}).flat() as ApiSubject[];
        setApiSubjects(allSubjects);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    if (sessionData.url) {
      fetchCourses();
      
    }
  }, [sessionData.url, sessionData.subInstituteId, sessionData.userId]);

  const mapApiToCourse = (api: ApiSubject): Course => ({
    id: api.subject_id,
    title: api.subject_name,
    description: api.subject_name,
    thumbnail: api.display_image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    progress: 0,
    timeRemaining: 0,
    nextLesson: '',
    skills: [api.subject_name],
    level: 'Beginner' as const,
    duration: 0,
    lessons: 0,
    enrolledCount: 0,
    rating: 0
  });

  const coursesInProgress: Course[] = enrolledCourses.length > 0 ? enrolledCourses : inProgressCourses;
  const completedCourses: Course[] = [];
  const recommendedCourses = apiSubjects
  .filter(sub => !inProgressCourses.some(c => c.id === sub.subject_id))
  .map(mapApiToCourse);

  const handleEnroll = (course: Course) => {
    // Add to in progress and remove from recommended
    setApiSubjects(prev => prev.filter(c => c.subject_id !== course.id));
  };

  // Dynamic data for progress overview - using consistent icon names
  const overviewStats: OverviewStat[] = [
    {
      title: "Courses In Progress",
      value: coursesInProgress.length,
      total: null,
      icon: "book-open", // consistent lowercase with hyphen
      color: "primary",
      trend: { type: "up", value: `+${coursesInProgress.length} enrolled` },
      description: coursesInProgress.length > 0 ? "Keep up the momentum!" : "Start learning today!"
    },
    {
      title: "Completed Courses",
      value: completedCourses.length,
      total: null,
      icon: "check-circle", // consistent lowercase with hyphen
      color: "success",
      trend: { type: "up", value: `+${completedCourses.length} completed` },
      description: completedCourses.length > 0 ? "Great progress!" : "Complete your first course"
    },
    {
      title: "Skills Earned",
      value: coursesInProgress.length + completedCourses.length,
      total: apiSubjects.length + coursesInProgress.length + completedCourses.length,
      icon: "award", // consistent lowercase
      color: "secondary",
      trend: { type: "up", value: `+${coursesInProgress.length + completedCourses.length} skills` },
      description: `${apiSubjects.length + coursesInProgress.length + completedCourses.length - (coursesInProgress.length + completedCourses.length)} more to reach your goal`
    },
    {
      title: "Learning Hours",
      value: coursesInProgress.reduce((total, course) => total + (course.duration || 0), 0),
      total: 60,
      icon: "clock", // consistent lowercase
      color: "warning",
      trend: { type: "up", value: `+${coursesInProgress.reduce((total, course) => total + (course.duration || 0), 0)} hours` },
      description: `${60 - coursesInProgress.reduce((total, course) => total + (course.duration || 0), 0)} hours to monthly goal`
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
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
                {/* Course Grid */}
                <div
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto hide-scrollbar"
                  style={{
                    maxHeight: "500px",   // shows only first 4 cards approx
                    paddingRight: "6px",
                  }}
                >
                  {getCurrentCourses().map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      variant={activeTab}
                      onEnrollSuccess={() => handleEnrollSuccess(course)}
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
