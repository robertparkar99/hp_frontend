"use client";

import React, { useState, useEffect } from "react";
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

const DEFAULT_IMAGE =
  "https://erp.triz.co.in/storage/SubStdMapping/SubStdMap_2020-12-29_05-56-03.svg";

const CourseCard = ({
  course,
  onEditCourse,
  onDelete,
  onViewDetails,
  onEnroll,
  sessionInfo,
  viewMode = "grid",
  alt = "Course Thumbnail",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(course.thumbnail?.trim() || DEFAULT_IMAGE);
  const [contentData, setContentData] = useState(null);
  const [contentType, setContentType] = useState("none");
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [correctSubjectId, setCorrectSubjectId] = useState(null);
  const [jobRoles, setJobRoles] = useState([]);
  const isDefault = imgSrc === DEFAULT_IMAGE;

  useEffect(() => {
    const fetchContentData = async () => {
      if (!course.subject_id || !course.standard_id) {
        setContentType("none");
        setJobRoles([]);
        return;
      }

      if (!sessionInfo || !sessionInfo.token || !sessionInfo.sub_institute_id) {
        setContentType("none");
        return;
      }

      setLoading(true);
      try {
        const apiUrl = `${sessionInfo.APP_URL}/lms/chapter_master?type=API&sub_institute_id=${sessionInfo.sub_institute_id}&syear=${sessionInfo.syear}&user_profile_name=${sessionInfo.user_profile_name}&user_id=${sessionInfo.user_id}&standard_id=${course.standard_id}&subject_id=${course.subject_id}&token=${sessionInfo.token}`;

        console.log("🔄 Fetching content data for:", course.title);

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📥 API Response for", course.title, ":", data);

        if (data && data.content_data && Object.keys(data.content_data).length > 0) {
          setContentData(data.content_data);
          const detectedType = determineContentType(data.content_data);
          setContentType(detectedType);
          console.log("✅ Final content type for", course.title, ":", detectedType);
        } else {
          console.warn("⚠️ No content_data found for", course.title);
          setContentType("none");
          setContentData(null);
        }

        // Set correct subject_id from API response
        if (data && data.course_details && data.course_details.subject_id) {
          setCorrectSubjectId(data.course_details.subject_id);
        }
        // Set job roles
        if (data && data.job_roles && Array.isArray(data.job_roles)) {
          setJobRoles(data.job_roles);
        } else {
          setJobRoles([]);
        }
      } catch (error) {
        console.error("❌ Error fetching content data for", course.title, ":", error);
        setContentType("none");
        setContentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [course.subject_id, course.standard_id, sessionInfo]);

  // Enhanced content type detection that shows actual file types
  const determineContentType = (contentData) => {
    if (!contentData || typeof contentData !== 'object' || Object.keys(contentData).length === 0) {
      console.log("❌ No content data available");
      return "none";
    }

    console.log("🔍 Starting file type analysis for content_data:", contentData);

    const allFileTypes = new Set();
    let totalFiles = 0;

    // Recursive function to find ALL file_type properties
    const findAllFileTypes = (obj, path = 'root') => {
      if (!obj || typeof obj !== 'object') return;

      // Check if current object has file_type property
      if (obj.file_type && typeof obj.file_type === 'string') {
        const fileType = obj.file_type.toLowerCase().trim();
        allFileTypes.add(fileType);
        totalFiles++;
        console.log(`📄 Found file_type at ${path}:`, fileType);
      }

      // Recursively search through ALL properties
      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item && typeof item === 'object') {
              findAllFileTypes(item, `${path}.${key}[${index}]`);
            }
          });
        } else if (value && typeof value === 'object') {
          findAllFileTypes(value, `${path}.${key}`);
        }
      });
    };

    // Start searching from the content_data root
    findAllFileTypes(contentData);

    console.log("📊 File type analysis completed:", {
      totalFilesFound: totalFiles,
      uniqueFileTypes: Array.from(allFileTypes)
    });

    if (totalFiles === 0) {
      console.log("❌ No file_type properties found in content_data");
      return "none";
    }

    // Get all unique file types
    const uniqueFileTypes = Array.from(allFileTypes);
    
    // If only ONE file type is found, show that specific type
    if (uniqueFileTypes.length === 1) {
      const fileType = uniqueFileTypes[0];
      console.log("✅ Single file type detected:", fileType);
      
      // Map common file types to readable formats
      const fileTypeMap = {
        'pdf': 'PDF',
        'mp4': 'MP4',
        'jpg': 'JPG',
        'jpeg': 'JPG',
        'png': 'PNG',
        'gif': 'GIF',
        'mp3': 'MP3',
        'doc': 'DOC',
        'docx': 'DOC',
        'ppt': 'PPT',
        'pptx': 'PPT',
        'xls': 'XLS',
        'xlsx': 'XLS',
        'link': 'LINK',
        'url': 'LINK',
        'website': 'LINK'
      };
      
      return fileTypeMap[fileType] || fileType.toUpperCase();
    }
    
    // If MULTIPLE different file types are found, show "mixed"
    console.log("🔄 Multiple file types detected, showing MIXED");
    return "MIXED";
  };

  // Debug effect to see file types
  useEffect(() => {
    if (contentData) {
      console.log("=== FILE TYPE DEBUG ===");
      console.log("Content Data Structure:", contentData);
      
      const quickScan = (obj, path = 'root') => {
        const results = [];
        if (obj && typeof obj === 'object') {
          if (obj.file_type) {
            results.push({
              path: path,
              file_type: obj.file_type,
              title: obj.title || 'No title'
            });
          }
          Object.entries(obj).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                results.push(...quickScan(item, `${path}.${key}[${index}]`));
              });
            } else if (value && typeof value === 'object') {
              results.push(...quickScan(value, `${path}.${key}`));
            }
          });
        }
        return results;
      };
      
      const found = quickScan(contentData);
      console.log("Found file_types:", found);
      console.log("=== END DEBUG ===");
    }
  }, [contentData]);

  const handleViewDetails = () => {
    onViewDetails(correctSubjectId || course.subject_id, course.standard_id);
  };

  const handleEnroll = async () => {
    if (!onEnroll) return;
    
    setEnrolling(true);
    try {
      await onEnroll(course);
    } catch (error) {
      console.error("Error enrolling in course:", error);
    } finally {
      setEnrolling(false);
    }
  };

  const getContentTypeIcon = (type) => {
    const lowerType = type?.toLowerCase();
    
    switch (lowerType) {
      case "video":
      case "mp4":
      case "avi":
      case "mov":
        return "Play";
      
      case "ppt":
      case "pptx":
        return "Presentation";
      
      case "pdf":
        return "FileText";
      
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "Image";
      
      case "doc":
      case "docx":
        return "FileText";
      
      case "xls":
      case "xlsx":
        return "Table";
      
      case "mp3":
      case "wav":
        return "Music";
      
      case "link":
        return "Link";
      
      case "mixed":
        return "Layers";
      
      case "none":
        return "FileX";
      
      default:
        return "File";
    }
  };

  const getContentTypeColor = (type) => {
    const lowerType = type?.toLowerCase();
    
    switch (lowerType) {
      case "video":
      case "mp4":
        return "bg-blue-100 text-blue-700 border-blue-200";
      
      case "ppt":
      case "pptx":
        return "bg-orange-100 text-orange-700 border-orange-200";
      
      case "pdf":
        return "bg-red-100 text-red-700 border-red-200";
      
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "bg-green-100 text-green-700 border-green-200";
      
      case "doc":
      case "docx":
        return "bg-blue-100 text-blue-700 border-blue-200";
      
      case "xls":
      case "xlsx":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      
      case "mp3":
      case "wav":
        return "bg-purple-100 text-purple-700 border-purple-200";
      
      case "link":
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
      
      case "mixed":
        return "bg-purple-100 text-purple-700 border-purple-200";
      
      case "none":
        return "bg-gray-100 text-gray-500 border-gray-300";
      
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getContentTypeLabel = (type) => {
    return type || "NONE";
  };

  const handleEditClick = () => {
    if (onEditCourse) onEditCourse(course);
  };

  const handleDeleteClick = () => {
    if (onDelete) onDelete(course.id);
  };

  const formatTime = (minutes) => {
    if (!minutes) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get job role from course object or extract from title
  const getJobRole = () => {
    if (course.jobrole) return course.jobrole;
    
    // Extract from title if it follows the format "CWF: JobRole - Department" or "Skill: JobRole - Department"
    if (course.title) {
      // Match pattern: "CWF: JobRole - Department" or "Skill: JobRole - Department"
      const match = course.title.match(/^(CWF:|Skill:)\s*([^-]+)/);
      if (match && match[2]) {
        return match[2].trim();
      }
    }
    
    return 'N/A';
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
            <div className="absolute -top-2 -left-2 z-20">
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getContentTypeColor(contentType)}`}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                  </div>
                ) : (
                  <>
                    <Icon
                      name={getContentTypeIcon(contentType)}
                      size={10}
                      className="mr-1"
                    />
                    {getContentTypeLabel(contentType)}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center flex-1 min-w-0">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mr-2 flex-shrink-0">
                  {course.category || course.subject_category}
                </span>
                <h3 className="font-semibold text-foreground text-lg truncate">
                  {course.title}
                </h3>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
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
            <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
              {jobRoles.length > 0 ? jobRoles.map(role => role.jobrole || role.name).join(', ') : getJobRole()}
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

            <div className="flex items-center justify-between p-3 rounded-lg">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-sm">
                  <Icon name="Clock" size={14} className="mr-1 text-muted-foreground" />
                  <span className="font-medium">{formatTime(course.duration)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Icon name="Star" size={14} className="mr-1 text-amber-500" />
                  <span className="font-medium">{course.rating || "4.3"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Icon name="Users" size={14} className="mr-1 text-muted-foreground" />
                  <span className="font-medium">{course.userCount || "2.1K"}</span>
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
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleViewDetails}>
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                        Enrolling...
                      </>
                    ) : (
                      "Enroll Now"
                    )}
                  </Button>
                </div>
              </div>
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

        <div className="absolute top-3 left-3 z-20">
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getContentTypeColor(contentType)}`}>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                Loading...
              </div>
            ) : (
              <>
                <Icon
                  name={getContentTypeIcon(contentType)}
                  size={12}
                  className="mr-1"
                />
                {getContentTypeLabel(contentType)}
              </>
            )}
          </div>
        </div>

        <div className="absolute top-3 right-3 z-30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {["ADMIN", "HR"].includes(sessionInfo?.user_profile_name?.toUpperCase()) ? (
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 relative z-30">
                  <Icon name="MoreHorizontal" size={18} />
                </Button>
              ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-40">
              <DropdownMenuItem onClick={handleEditClick}>
                <Icon name="Edit" size={14} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteClick}>
                <Icon name="Trash" size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center mb-2">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mr-2 flex-shrink-0">
            {course.category || course.subject_category}
          </span>
          <h3 className="font-semibold text-foreground text-lg line-clamp-2 flex-1">
            {course.title}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm mb-1 line-clamp-2">
          <span className="font-medium mr-1">Department:</span> {course.description}
        </p>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          <span className="font-medium mr-1">Job Role:</span> {jobRoles.length > 0 ? jobRoles.map(role => role.jobrole || role.name).join(', ') : getJobRole()}
        </p>
        
        {/* <div className="text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <span className="font-medium mr-1">Short Name:</span>
            {course.short_name}
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-1">Course Type:</span>
            {course.subject_type}
          </div>
        </div> */}

        <div className="flex items-center justify-between mt-auto p-3 rounded-lg">
          <div className="flex justify-between items-center w-full text-xs">
            <div className="flex items-center">
              <Icon name="Clock" size={12} className="mr-1 text-muted-foreground" />
              <span className="font-medium">{formatTime(course.duration)}</span>
            </div>
            <div className="flex items-center">
              <Icon name="Star" size={12} className="mr-1 text-amber-500" />
              <span className="font-medium">{course.rating || "4.3"}</span>
            </div>
            <div className="flex items-center">
              <Icon name="Users" size={12} className="mr-1 text-muted-foreground" />
              <span className="font-medium">{course.userCount || "2.1K"}</span>
            </div>
          </div>
        </div>

   <div className="flex space-x-2">
  <Button variant="outline" size="sm" onClick={handleViewDetails} className="min-w-[180px] flex-1">
    View Details
  </Button>
  <Button 
    size="sm" 
    onClick={handleEnroll}
    disabled={enrolling}
    className="min-w-[70px] flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
  >
    Enroll
  </Button>
</div>
      </div>
    </div>
  );
};

export default CourseCard;
