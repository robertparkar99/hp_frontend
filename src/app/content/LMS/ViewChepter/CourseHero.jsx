import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import { Button } from '../../../../components/ui/button';

const CourseHero = ({ course, onStartCourse, onContinueCourse }) => {
  // Handle case where course might be null or undefined
  if (!course) {
    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-card">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Loading course information...</p>
        </div>
      </div>
    );
  }

  const isEnrolled = course.progress > 0;
  const progressPercentage = Math.round(course.progress);

  // Calculate total resources from all chapters
  const totalResources = course.moduleCount || 0;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-card">
      <div className="flex flex-col lg:flex-row">
        {/* Course Thumbnail */}
        <div className="lg:w-1/3 h-48 lg:h-64 overflow-hidden">
          <Image
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
            fallbackSrc="/placeholder.jpg"
          />
        </div>

        {/* Course Information */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="flex flex-col h-full">
            {/* Course Title and Rating */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                  {course.category}
                </span>
                <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded">
                  {course.level}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {course.title}
              </h1>
              <div className="flex items-center gap-2">
                {/* <div className="flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-400" />
                  <span className="text-sm font-medium text-foreground">
                    {course.rating}
                  </span>
                </div> */}
                {/* <span className="text-sm text-muted-foreground">
                  ({course.reviewCount} reviews)
                </span>
                <span className="text-sm text-muted-foreground">
                  • {course.enrolledCount} students enrolled
                </span> */}
              </div>
            </div>

            {/* Course Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {course.description}
            </p>

            {/* Course Details */}
            {/* {course.details && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-sm">
                {course.details.subjectCode && (
                  <div className="flex items-center gap-2">
                    <Icon name="Hash" size={16} className="text-muted-foreground" />
                    <span className="text-foreground">Code:</span>
                    <span className="text-muted-foreground">{course.details.subjectCode}</span>
                  </div>
                )}
                {course.details.subjectType && (
                  <div className="flex items-center gap-2">
                    <Icon name="Type" size={16} className="text-muted-foreground" />
                    <span className="text-foreground">Type:</span>
                    <span className="text-muted-foreground">{course.details.subjectType}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Icon name="Book" size={16} className="text-muted-foreground" />
                  <span className="text-foreground">Content Type:</span>
                  <span className="text-muted-foreground capitalize">{course.details.contentType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={16} className="text-muted-foreground" />
                  <span className="text-foreground">Elective:</span>
                  <span className="text-muted-foreground">{course.details.elective ? 'Yes' : 'No'}</span>
                </div>
              </div>
            )} */}

            {/* Modules Count with Icon */}
            <div className="flex items-center gap-6 mb-6">
  {/* Modules Count */}
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
      <Icon name="List" size={18} className="text-accent-foreground" />
    </div>
    <div>
      <div className="font-medium text-foreground flex items-center gap-1">
        Modules
        <span className="ml-1 text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
          {totalResources}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">Learning Units</p>
    </div>
  </div>

  {/* Resources Count */}
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
      <Icon name="Download" size={18}  />
    </div>
    <div>
      <div className="font-medium text-foreground flex items-center gap-1">
        Resources
        <span className="ml-1 text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
        {course.resourcesCount || 0}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">Study Materials</p>
    </div>
  </div>
</div>
            {/* <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Icon name="BookOpen" size={18} className="text-accent-foreground" />
              </div>
              <div>
                <div className="font-medium text-foreground flex items-center gap-1">
                  Modules
                  <span className="ml-1 text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
                    {totalResources}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Resources</p>
              </div>
            </div> */}

            {/* Course Stats */}
            {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Icon name="Clock" size={16} />
                </div>
                <p className="text-sm font-medium text-foreground">{course.duration}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Icon name="BookOpen" size={16} />
                </div>
                <p className="text-sm font-medium text-foreground">{totalResources}</p>
                <p className="text-xs text-muted-foreground">Modules</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Icon name="Award" size={16} />
                </div>
                <p className="text-sm font-medium text-foreground">Certificate</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Icon name="Globe" size={16} />
                </div>
                <p className="text-sm font-medium text-foreground">English</p>
                <p className="text-xs text-muted-foreground">Language</p>
              </div>
            </div> */}

            {/* Progress Bar (if enrolled) */}
            {/* {isEnrolled && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Your Progress</span>
                  <span className="text-sm font-mono text-muted-foreground">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )} */}

            {/* Action Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              {isEnrolled ? (
                <Button
                  variant="default"
                  size="lg"
                  className="flex-1"
                  onClick={onContinueCourse}
                >
                  <Icon name="Play" size={18} className="mr-2" />
                  Continue Learning
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="lg"
                  className="flex-1"
                  onClick={onStartCourse}
                >
                  <Icon name="BookOpen" size={18} className="mr-2" />
                  Start Course
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
              >
                <Icon name="Bookmark" size={18} className="mr-2" />
                Save for Later
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHero;