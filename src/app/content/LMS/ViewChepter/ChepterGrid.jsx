
import React, { useState } from "react";
import ChepterCard from "./ChepterCard";
import Icon from "@/components/AppIcon";
import { Button } from "../../../../components/ui/button";

const ChepterGrid = ({
  courses,
  loading,
  onEnroll,
  onViewDetails,
  onLoadMore,
  hasMore,
  onEditCourse,
  onDeleteCourse,
  onDeleteContent,
  onSaveContent,
  onEditContent,
  onQuestionContent,
  sessionInfo,
  courseDisplayName,
  standardName,
  viewMode = "list" // Added default value for viewMode
}) => {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (onLoadMore) {
      setLoadingMore(true);
      await onLoadMore();
      setLoadingMore(false);
    }
  };

  // ✅ Skeleton loader for LIST view only
  const SkeletonCard = () => (
    <div className="animate-pulse mb-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <div className="w-24 h-16 bg-muted rounded-md flex-shrink-0" />
          <div className="flex-1">
            <div className="h-5 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-2/3 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-12" />
              </div>
              <div className="flex space-x-2">
                <div className="h-8 bg-muted rounded w-20" />
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="BookOpen" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No courses found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          We couldn't find any courses matching your current filters. Try adjusting your search criteria or browse our featured courses.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button variant="outline">
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Clear Filters
          </Button>
          <Button variant="default">
            <Icon name="Compass" size={16} className="mr-2" />
            Browse All Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ✅ Always list view */}
      <div className="space-y-4">
        {courses.map((course) => (
          <ChepterCard
            key={course.id}
            course={course}
            viewMode={viewMode}
            onEnroll={onEnroll}
            onViewDetails={onViewDetails}
            onEditCourse={onEditCourse}
            onDeleteCourse={onDeleteCourse}
            onDeleteContent={onDeleteContent}
            onSaveContent={onSaveContent}
            onEditContent={onEditContent}
            onQuestionContent={onQuestionContent}
            sessionInfo={sessionInfo}
            contents={course.contents}   // ✅ Pass chapter contents directly
            courseDisplayName={courseDisplayName}  // ✅ Pass course display name
            standardName={standardName}
          />
        ))}
      </div>

      {/* Load More Button - only show if onLoadMore function is provided */}
      {hasMore && onLoadMore && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Loading more courses...
              </>
            ) : (
              <>
                <Icon name="ChevronDown" size={16} className="mr-2" />
                Load More Courses
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
        Showing {courses.length} courses
        {hasMore && ` of ${courses.length + 50}`}
      </div>
    </div>
  );
};

export default ChepterGrid;


