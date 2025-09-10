"use client";

import React, { useState, useEffect } from "react"; // ✅ added useEffect
import Image from "../../../../components/AppImage";
import Icon from "@/components/AppIcon";
import { Button } from "../../../../components/ui/button";
import ProgressIndicator from "../../../../components/ui/BreadcrumbNavigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../../components/ui/dropdown-menu";
// import ViewDetailPage from '@/app/content/LMS/ViewChepter/ViewDetail';

const DEFAULT_IMAGE =
  "https://erp.triz.co.in/storage/SubStdMapping/SubStdMap_2020-12-29_05-56-03.svg";

const CourseCard = ({
  course,
  onEditCourse,
  onDelete,
  onViewDetails,
  viewMode = "grid",
  alt = "Course Thumbnail",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(course.thumbnail?.trim() || DEFAULT_IMAGE);
  const isDefault = imgSrc === DEFAULT_IMAGE;

  // Log course info on render
  useEffect(() => {
    console.log("📌 CourseCard Rendered:", {
      title: course.title,
      subject_id: course.subject_id,
      standard_id: course.standard_id,
    });
  }, [course]);

const handleViewDetails = () => {
  onViewDetails(course.subject_id,course.standard_id,);
};

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "video":
        return "Play";
      case "ppt":
        return "FileText";
      case "mixed":
        return "Layers";
      default:
        return "BookOpen";
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case "video":
        return "bg-blue-100 text-blue-700";
      case "ppt":
        return "bg-orange-100 text-orange-700";
      case "mixed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleEditClick = () => {
    if (onEditCourse) onEditCourse(course);
  };

  const handleDeleteClick = () => {
    if (onDelete) onDelete(course.id);
  };

  // ---------------- LIST VIEW ----------------
  if (viewMode === "list") {
    return (
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0">
            <Image
              src={imgSrc}
              alt={alt}
              width={96}
              height={64}
              className="object-cover rounded-md"
              onError={() => setImgSrc(DEFAULT_IMAGE)}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground text-lg truncate pr-4">
                {course.title}
              </h3>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeColor(
                    course.contentType
                  )}`}
                >
                  {course.contentType.toUpperCase()}
                </span> */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <Icon name="MoreHorizontal" size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEditClick}>
                      <Icon name="Edit" size={14} className="mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteClick}>
                      <Icon name="Trash" size={14} className="mr-2 text-red-600" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-1 line-clamp-1">
              {course.description}
            </p>

            <div className="text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <span className="font-medium mr-1">Short Name:</span>
                {course.short_name}
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-1">Course Type:</span>
                {course.subject_type}
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-2">
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
              <Button variant="outline" size="sm"  onClick={handleViewDetails}>
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- GRID VIEW ----------------
  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={imgSrc}
            alt={alt}
            width={isDefault ? 200 : 400}
            height={192}
            className={isDefault ? "object-contain" : "object-cover w-full h-full"}
            onError={() => setImgSrc(DEFAULT_IMAGE)}
          />
        </div>

        {/* <div className="absolute top-3 left-3 z-20">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeColor(
              course.contentType
            )}`}
          >
            <Icon
              name={getContentTypeIcon(course.contentType)}
              size={12}
              className="inline mr-1"
            />
            {course.contentType.toUpperCase()}
          </span>
        </div> */}

        <div className="absolute top-3 right-3 z-30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0 relative z-30">
                <Icon name="MoreHorizontal" size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-40">
              <DropdownMenuItem onClick={handleEditClick}>
                <Icon name="Edit" size={14} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteClick}>
                <Icon name="Trash" size={14} className="mr-2 text-red-600" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-200 z-10">
            <Button
              variant="default"
              onClick={handleViewDetails}
              className="transform scale-95 hover:scale-100 transition-transform"
            >
              <Icon name="Eye" size={16} className="mr-2" />
              Quick Preview
            </Button>
          </div>
        )} */}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
          {course.description}
        </p>

        <div className="text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <span className="font-medium mr-1">Short Name:</span>
            {course.short_name}
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-1">Course Type:</span>
            {course.subject_type}
          </div>
        </div>

        <div className="mt-auto">
          <Button variant="outline" size="sm" onClick={handleViewDetails} className="w-full">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
