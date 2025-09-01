import React from 'react';
import Image from '../../../../components/AppImage';
import Icon from '@/components/AppIcon';
import {Button} from '../../../../components/ui/button';
import ProgressIndicator from '../../../../components/ui/BreadcrumbNavigation';

const RecommendationSidebar = () => {
  const learningPath = {
    title: "Leadership Development Track",
    description: "Complete this curated path to advance your leadership skills",
    progress: 65,
    totalCourses: 8,
    completedCourses: 5,
    courses: [
      {
        id: 1,
        title: "Effective Communication",
        status: "completed",
        duration: "2h 30m"
      },
      {
        id: 2,
        title: "Team Management",
        status: "completed",
        duration: "3h 15m"
      },
      {
        id: 3,
        title: "Strategic Thinking",
        status: "in-progress",
        duration: "4h 20m",
        progress: 40
      },
      {
        id: 4,
        title: "Conflict Resolution",
        status: "not-started",
        duration: "2h 45m"
      }
    ]
  };

  const trendingCourses = [
    {
      id: 1,
      title: "AI in the Workplace",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop",
      contentType: "video",
      rating: 4.8,
      enrolledCount: 1247,
      isNew: true
    },
    {
      id: 2,
      title: "Data Privacy Compliance 2024",
      thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop",
      contentType: "mixed",
      rating: 4.6,
      enrolledCount: 892,
      isMandatory: true
    },
    {
      id: 3,
      title: "Remote Team Leadership",
      thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop",
      contentType: "ppt",
      rating: 4.7,
      enrolledCount: 654
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'in-progress':
        return 'Play';
      case 'not-started':
        return 'Circle';
      default:
        return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'in-progress':
        return 'text-primary';
      case 'not-started':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return 'Play';
      case 'ppt':
        return 'FileText';
      case 'mixed':
        return 'Layers';
      default:
        return 'BookOpen';
    }
  };

  return (
    <div className="space-y-6">
      {/* My Learning Path */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">My Learning Path</h3>
          <Button variant="ghost" size="sm">
            <Icon name="ExternalLink" size={14} />
          </Button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-foreground mb-2">{learningPath.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">
            {learningPath.description}
          </p>
          
          <ProgressIndicator
            current={learningPath.progress}
            total={100}
            label={`${learningPath.completedCourses}/${learningPath.totalCourses} courses completed`}
            size="sm"
          />
        </div>

        <div className="space-y-3">
          {learningPath.courses.map(course => (
            <div key={course.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Icon
                name={getStatusIcon(course.status)}
                size={16}
                className={getStatusColor(course.status)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {course.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {course.duration}
                </p>
                {course.status === 'in-progress' && course.progress && (
                  <div className="mt-1">
                    <ProgressIndicator
                      current={course.progress}
                      total={100}
                      size="sm"
                      showPercentage={false}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="w-full mt-4">
          View Full Path
        </Button>
      </div>

      {/* Trending Courses */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Trending Now</h3>
          <Icon name="TrendingUp" size={16} className="text-primary" />
        </div>

        <div className="space-y-4">
          {trendingCourses.map(course => (
            <div key={course.id} className="group cursor-pointer">
              <div className="relative mb-2">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-20 object-cover rounded-md"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  {course.isNew && (
                    <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                      NEW
                    </span>
                  )}
                  {course.isMandatory && (
                    <span className="px-1.5 py-0.5 bg-error text-error-foreground text-xs font-medium rounded">
                      REQUIRED
                    </span>
                  )}
                </div>

                {/* Content Type Icon */}
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                    <Icon
                      name={getContentTypeIcon(course.contentType)}
                      size={12}
                      className="text-white"
                    />
                  </div>
                </div>
              </div>

              <h4 className="font-medium text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                {course.title}
              </h4>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Icon name="Star" size={12} className="mr-1" />
                    {course.rating}
                  </div>
                  <div className="flex items-center">
                    <Icon name="Users" size={12} className="mr-1" />
                    {course.enrolledCount}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="w-full mt-4">
          <Icon name="TrendingUp" size={14} className="mr-2" />
          See All Trending
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-4">Your Progress</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Courses Completed</span>
            <span className="font-medium text-foreground">23</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Hours Learned</span>
            <span className="font-medium text-foreground">47.5h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Certificates Earned</span>
            <span className="font-medium text-foreground">8</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Streak</span>
            <span className="font-medium text-foreground">12 days</span>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full mt-4">
          <Icon name="BarChart3" size={14} className="mr-2" />
          View Analytics
        </Button>
      </div>
    </div>
  );
};

export default RecommendationSidebar;