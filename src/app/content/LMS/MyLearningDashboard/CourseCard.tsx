import React, { useState, useEffect } from 'react';
import Icon from '@/components/AppIcon';
import { Button } from "./../../../../components/ui/button";
import Image from '@/components/AppImage';
import { Progress } from "@/components/ui/progress";

const DEFAULT_IMAGE =
 "https://erp.triz.co.in/storage/SubStdMapping/SubStdMap_2020-12-29_05-56-03.svg";

// Type definitions
interface Course {
  id: number;
  subject_id?: number;
  standard_id?: number;
  title: string;
  description: string;
  thumbnail: string;
  contentType?: string;
  category?: string;
  difficulty?: string;
  short_name?: string;
  subject_type?: string;
  progress?: number;
  instructor?: string;
  isNew?: boolean;
  isMandatory?: boolean;
  display_name?: string;
  sort_order?: string;
  status?: string;
  subject_category?: string;
  is_external?: boolean;
  external_url?: string;
  platform?: string;
  jobrole?: string;
  enrollment_status?: string | null;
  duration?: number;
  rating?: number;
  userCount?: number;
}

interface CourseCardProps {
  course: Course;
  variant?: 'progress' | 'completed';
  onEnrollSuccess?: () => void;
  onContinue?: () => void;
  onViewDetails?: (subject_id: number, standard_id: number) => void;
  sessionInfo?: any;
  viewMode?: 'grid' | 'list';
  onEditCourse?: (course: Course) => void;
  onDelete?: (courseId: number) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant = 'progress',
  onEnrollSuccess,
  onContinue,
  onViewDetails,
  sessionInfo,
  viewMode = 'grid',
  onEditCourse,
  onDelete,
}) => {
  interface SessionData {
    url: string;
    token: string;
    subInstituteId: string;
    orgType: string;
    userId: string;
    syear?: string;
  }
  
  const [sessionData, setSessionData] = useState<SessionData>({
    url: '',
    token: '',
    subInstituteId: '',
    orgType: '',
    userId: '',
  });
  
  const [imgSrc, setImgSrc] = useState(course.thumbnail?.trim() || DEFAULT_IMAGE);
  const [contentData, setContentData] = useState<any>(null);
  const [contentType, setContentType] = useState("none");
  const [loading, setLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(() => {
    return course.enrollment_status !== null;
  });
  const [completed, setCompleted] = useState(() => {
    if (course.enrollment_status === 'completed') {
      return true;
    }
    if (typeof window !== 'undefined') {
      const completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
      return completedCourses.includes(`${course.subject_id}-${course.standard_id}`);
    }
    return false;
  });
  const [correctSubjectId, setCorrectSubjectId] = useState<number | null>(null);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const isDefault = imgSrc === DEFAULT_IMAGE;

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      const { APP_URL, token, sub_institute_id, org_type, user_id } = parsedData;
      setSessionData({
        url: APP_URL || '',
        token: token || '',
        subInstituteId: sub_institute_id || '',
        orgType: org_type || '',
        userId: user_id || '',
      });
    }
  }, []);

  // Sync completed state with localStorage
  useEffect(() => {
    const checkCompletion = () => {
      if (course.enrollment_status === 'completed') {
        setCompleted(true);
        return;
      }
      if (typeof window !== 'undefined') {
        const completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
        const isCompleted = completedCourses.includes(`${course.subject_id}-${course.standard_id}`);
        setCompleted(isCompleted);
        if (isCompleted && course.enrollment_status !== 'completed') {
          course.enrollment_status = 'completed';
        }
      }
    };

    checkCompletion();
    window.addEventListener('storage', checkCompletion);
    return () => window.removeEventListener('storage', checkCompletion);
  }, [course.subject_id, course.standard_id, course.enrollment_status]);

  useEffect(() => {
    const fetchContentData = async () => {
      if (!course.subject_id || !course.standard_id) {
        setContentType("none");
        setJobRoles([]);
        return;
      }

      if (!sessionData.url || !sessionData.token || !sessionData.subInstituteId) {
        setContentType("none");
        return;
      }

      setLoading(true);
      try {
        const apiUrl = `${sessionData.url}/lms/chapter_master?type=API&sub_institute_id=${sessionData.subInstituteId}&syear=${sessionData.syear || '2024'}&user_profile_name=${sessionData.orgType || 'STUDENT'}&user_id=${sessionData.userId}&standard_id=${course.standard_id}&subject_id=${course.subject_id}&token=${sessionData.token}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.content_data && Object.keys(data.content_data).length > 0) {
          setContentData(data.content_data);
          const detectedType = determineContentType(data.content_data);
          setContentType(detectedType);
        } else {
          setContentType("none");
          setContentData(null);
        }

        if (data && data.course_details && data.course_details.subject_id) {
          setCorrectSubjectId(data.course_details.subject_id);
        }
        if (data && data.job_roles && Array.isArray(data.job_roles)) {
          setJobRoles(data.job_roles);
        } else {
          setJobRoles([]);
        }
      } catch (error) {
        console.error("Error fetching content data:", error);
        setContentType("none");
        setContentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [course.subject_id, course.standard_id, sessionData]);

  const determineContentType = (contentData: any): string => {
    if (!contentData || typeof contentData !== 'object' || Object.keys(contentData).length === 0) {
      return "none";
    }

    const allFileTypes = new Set<string>();
    let totalFiles = 0;

    const findAllFileTypes = (obj: any, path = 'root') => {
      if (!obj || typeof obj !== 'object') return;

      if (obj.file_type && typeof obj.file_type === 'string') {
        const fileType = obj.file_type.toLowerCase().trim();
        allFileTypes.add(fileType);
        totalFiles++;
      }

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

    findAllFileTypes(contentData);

    if (totalFiles === 0) {
      return "none";
    }

    const uniqueFileTypes = Array.from(allFileTypes);

    if (uniqueFileTypes.length === 1) {
      const fileType = uniqueFileTypes[0];
      const fileTypeMap: Record<string, string> = {
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
      
      const key = String(fileType);
      return fileTypeMap[key] || fileType.toUpperCase();
    }

    return "MIXED";
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(correctSubjectId || course.subject_id || 0, course.standard_id || 0);
    }
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const enrollmentData = {
        user_id: sessionData.userId,
        sub_institute_id: sessionData.subInstituteId,
        type: "API",
        token: sessionData.token,
        course_id: course.id,
        subject_id: correctSubjectId || course.subject_id,
        standard_id: course.standard_id,
        start_date: startDate,
        end_date: endDate,
        status: "enrolled"
      };

      const response = await fetch(`${sessionData.url}/api/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(enrollmentData),
      });

      const data = await response.json();

      if (data.message && data.message.toLowerCase().includes("success")) {
        setIsEnrolled(true);
        course.enrollment_status = 'enrolled';

        const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        if (!enrolledCourses.some((c: any) => c.id === course.id)) {
          course.contentType = contentType;
          enrolledCourses.push(course);
          localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
        }

        alert("Successfully enrolled in the course!");
        if (onEnrollSuccess) onEnrollSuccess();
        handleViewDetails();
      } else {
        throw new Error(data.message || "Enrollment failed");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(`Failed to enroll: ${(error as Error).message}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  const getContentTypeIcon = (type: string): string => {
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

  const getContentTypeColor = (type: string): string => {
    const lowerType = type?.toLowerCase();
    switch (lowerType) {
      case "video":
      case "mp4":
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case "ppt":
      case "pptx":
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case "pdf":
        return 'bg-red-100 text-red-700 border-red-200';
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return 'bg-green-100 text-green-700 border-green-200';
      case "doc":
      case "docx":
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case "xls":
      case "xlsx":
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case "mp3":
      case "wav":
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case "link":
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case "mixed":
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case "none":
        return 'bg-gray-100 text-gray-500 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getContentTypeLabel = (type: string): string => {
    return type || "NONE";
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatTimeRemaining = (minutes?: number): string => {
    if (!minutes) return "0 min left";
    if (minutes < 60) return `${minutes} min left`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) {
      return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  const getJobRole = (): string => {
    if (course.jobrole) return course.jobrole;
    if (course.title) {
      const match = course.title.match(/^(CWF:|Skill:)\s*([^-]+)/);
      if (match && match[2]) {
        return match[2].trim();
      }
    }
    return 'N/A';
  };

  // List View
  if (viewMode === "list") {
    return (
      <div
        className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${isEnrolled ? 'cursor-pointer' : ''}`}
        onClick={isEnrolled ? handleViewDetails : undefined}
      >
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0">
            <Image
              src={imgSrc}
              alt={course.title}
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
                    <Icon name={getContentTypeIcon(contentType)} size={10} className="mr-1" />
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
            </div>

            <p className="text-muted-foreground text-sm mb-1 line-clamp-1">
              {course.description}
            </p>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
              <span className="font-medium mr-1">Job Role:</span> {jobRoles.length > 0 ? jobRoles.map((role: any) => role.jobrole || role.name).join(', ') : getJobRole()}
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
                  <span className="font-medium">{formatDuration(course.duration)}</span>
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
                {course.progress && course.progress > 0 && (
                  <div className="w-24">
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEditCourse?.(course)}>
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete?.(course.id)}>
                    <Icon name="Trash" size={16} className="text-red-600" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEnroll}
                    disabled={isEnrolling || isEnrolled || completed}
                    className={`${completed ? 'bg-blue-600 hover:bg-blue-700' : isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'} text-white`}
                  >
                    {isEnrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                        Enrolling...
                      </>
                    ) : completed ? (
                      <>
                        <Icon name="Award" size={14} className="mr-2" />
                        Completed
                      </>
                    ) : isEnrolled ? (
                      <>
                        <Icon name="CheckCircle" size={14} className="mr-2" />
                        Enrolled
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

  // Grid View
  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col ${isEnrolled ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      onClick={isEnrolled ? handleViewDetails : undefined}
    >
      <div className="relative">
        <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={imgSrc}
            alt={course.title}
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
                <Icon name={getContentTypeIcon(contentType)} size={12} className="mr-1" />
                {getContentTypeLabel(contentType)}
              </>
            )}
          </div>
        </div>

        <div className="absolute top-3 right-3 z-30 flex space-x-1">
          {/* <Button variant="ghost" size="icon" className="h-8 w-8 p-0 relative z-30 bg-white/80" onClick={(e) => { e.stopPropagation(); onEditCourse?.(course); }}>
            <Icon name="Edit" size={16} />
          </Button> */}
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0 relative z-30 bg-white/80" onClick={(e) => { e.stopPropagation(); onDelete?.(course.id); }}>
            <Icon name="Trash" size={16} className="text-red-600" />
          </Button>
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
          <span className="font-medium mr-1">Job Role:</span> {jobRoles.length > 0 ? jobRoles.map((role: any) => role.jobrole || role.name).join(', ') : getJobRole()}
        </p>

        <div className="flex items-center justify-between mt-auto p-3 rounded-lg">
          <div className="flex justify-between items-center w-full text-xs">
            <div className="flex items-center">
              <Icon name="Clock" size={12} className="mr-1 text-muted-foreground" />
              <span className="font-medium">{formatDuration(course.duration)}</span>
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

        {/* {variant === 'progress' && course.progress && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <Progress value={course.progress} className="mb-2 h-2" />
            <div className="flex justify-between items-center text-white text-xs">
              <span>{Math.round(course.progress)}% complete</span>
              <span>{course.duration && formatTimeRemaining(course.duration)}</span>
            </div>
          </div>
        )} */}

        <div className="flex justify-center mt-4">
          <Button
            size="sm"
            onClick={handleEnroll}
            disabled={isEnrolling || isEnrolled || completed}
            className={`w-full ${
              completed
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : isEnrolled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            {isEnrolling ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            ) : completed ? (
              <>
                <Icon name="Award" size={14} className="mr-1" />
                Completed
              </>
            ) : isEnrolled ? (
              <>
                <Icon name="CheckCircle" size={14} className="mr-1" />
                Enrolled
              </>
            ) : (
              "Enroll"
            )}
          </Button>
        </div>

        {variant === 'progress' && isEnrolled && !completed && (
          <Button
            variant="default"
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation();
              onContinue?.();
            }}
          >
            <Icon name="Play" size={16} className="mr-2" />
            Continue Learning
          </Button>
        )}

        {variant === 'completed' && (
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2 text-green-600">
              <Icon name="CheckCircle" size={16} />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Review
              </Button>
              <Button variant="outline" className="flex-1">
                <Icon name="Award" size={16} className="mr-2" />
                Certificate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
