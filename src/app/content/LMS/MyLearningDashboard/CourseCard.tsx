import React, { useState, useEffect } from 'react';
import Icon from '@/components/AppIcon'
import { Button } from "./../../../../components/ui/button";
// import Image from '@/components/ui/Image';
import { Progress } from "@/components/ui/progress";

// Type definitions
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

interface CourseCardProps {
  course: Course;
  variant?: 'progress' | 'completed' | 'recommended';
  onEnrollSuccess?: () => void;   // <-- ADD THIS
}



const CourseCard: React.FC<CourseCardProps> = ({ course, variant = 'progress', onEnrollSuccess }) => {
  const [sessionData, setSessionData] = useState({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });
  useEffect(() => {
    const userData = localStorage.getItem('userData');
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
  const [isEnrolling, setIsEnrolling] = useState(false);


  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const response = await fetch(
        `${sessionData.url}/api/enroll?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}&user_id=${sessionData.userId}&id=${course.id}&status=in-progress&start_date=${startDate}&end_date=${endDate}`
      );

      const data = await response.json();
      console.log("Enroll Response:", data);

      // SUCCESS CHECK FIXED ✔
      if (data.status === true) {
        alert("Successfully enrolled in the course!");

        if (onEnrollSuccess) onEnrollSuccess(); // move to In Progress
      } else {
        alert("Enroll Failed: " + JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error("Enroll error:", error);
      alert("Error: " + error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min left`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) {
      return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-smooth group">
      <div className="relative">
        <div className="aspect-video overflow-hidden">
          {/* <Image
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          /> */}
        </div>
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${course.level === 'Beginner' ? 'bg-success/20 text-success' :
            course.level === 'Intermediate' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
            }`}>
            {course.level}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-black/70 text-white rounded-lg text-xs font-medium">
            {formatDuration(course.duration)}
          </span>
        </div>
        {variant === 'progress' && course.progress && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <Progress
              value={course.progress}
              className="mb-2 h-2"
            />
            <div className="flex justify-between items-center text-white text-xs">
              <span>{Math.round(course.progress)}% complete</span>
              <span>{course.timeRemaining && formatTimeRemaining(course.timeRemaining)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon name="Bookmark" size={20} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {course.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium"
            >
              {skill}
            </span>
          ))}
          {course.skills.length > 3 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-medium">
              +{course.skills.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={14} />
              <span>{course.enrolledCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={14} />
              <span>{course.rating}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>{course.lessons} lessons</span>
          </div>
        </div>

        {variant === 'progress' && (
          <div className="space-y-3">
            {course.nextLesson && (
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Next Lesson</p>
                <p className="text-sm font-medium text-foreground">{course.nextLesson}</p>
              </div>
            )}
            <Button
              variant="default"
              className="w-full"
            >
              <Icon name="Play" size={16} className="mr-2" />
              Continue Learning
            </Button>
          </div>
        )}

        {variant === 'completed' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-success">
              <Icon name="CheckCircle" size={16} />
              <span className="text-sm font-medium">Completed on {course.completedDate}</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="w-full">
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Review
              </Button>
              <Button variant="outline" className="w-full">
                <Icon name="Award" size={16} className="mr-2" />
                Certificate
              </Button>
            </div>
          </div>
        )}

        {variant === 'recommended' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Icon name="Target" size={14} />
                <span>{course.matchScore}% match</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Icon name="TrendingUp" size={14} />
                <span>Trending</span>
              </div>
            </div>
            <Button variant="default" className="w-full" onClick={handleEnroll} disabled={isEnrolling}>
              <Icon name="Plus" size={16} className="mr-2" />
              {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;