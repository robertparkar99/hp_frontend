import React, { useState } from 'react';
import Image from '../../../../components/AppImage';
import Icon from '@/components/AppIcon';
import {Button} from '../../../../components/ui/button';
import ProgressIndicator from '../../../../components/ui/BreadcrumbNavigation';

const CourseCard = ({ course, onEnroll, onViewDetails, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const getContentTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-700';
      case 'ppt':
        return 'bg-orange-100 text-orange-700';
      case 'mixed':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0">
            <Image
              src={course.thumbnail}
              alt={course.title}
              className="w-24 h-16 object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black/20 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Icon name={getContentTypeIcon(course.contentType)} size={20} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground text-lg truncate pr-4">
                {course.title}
              </h3>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeColor(course.contentType)}`}>
                  {course.contentType.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {course.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Icon name="Clock" size={14} className="mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Icon name="Users" size={14} className="mr-1" />
                  {course.enrolledCount} enrolled
                </div>
                <div className="flex items-center">
                  <Icon name="Star" size={14} className="mr-1" />
                  {course.rating}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {course.progress > 0 && (
                  <div className="w-24">
                    <ProgressIndicator
                      current={course.progress}
                      total={100}
                      size="sm"
                      showPercentage={false}
                    />
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(course.id)}
                >
                  View Details
                </Button>
                {course.progress === 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onEnroll(course.id)}
                  >
                    Enroll
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Image
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Content Type Overlay */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeColor(course.contentType)}`}>
            <Icon name={getContentTypeIcon(course.contentType)} size={12} className="inline mr-1" />
            {course.contentType.toUpperCase()}
          </span>
        </div>
        
        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>
        
        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-200">
            <Button
              variant="default"
              onClick={() => onViewDetails(course.id)}
              className="transform scale-95 hover:scale-100 transition-transform"
            >
              <Icon name="Eye" size={16} className="mr-2" />
              Quick Preview
            </Button>
          </div>
        )}
        
        {/* Progress Bar */}
        {/* {course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <ProgressIndicator
              current={course.progress}
              total={100}
              size="sm"
              showPercentage={false}
              className="rounded-none"
            />
          </div>
        )} */}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Icon name="Clock" size={14} className="mr-1" />
            {course.duration}
          </div>
          <div className="flex items-center">
            <Icon name="Users" size={14} className="mr-1" />
            {course.enrolledCount}
          </div>
          <div className="flex items-center">
            <Icon name="Star" size={14} className="mr-1" />
            {course.rating}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(course.id)}
            className="flex-1"
          >
            View Details
          </Button>
          {course.progress === 0 ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => onEnroll(course.id)}
              className="flex-1"
            >
              Enroll
            </Button>
          ) : course.progress === 100 ? (
            <Button
              variant="success"
              size="sm"
              className="flex-1"
              disabled
            >
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Completed
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewDetails(course.id)}
              className="flex-1"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;