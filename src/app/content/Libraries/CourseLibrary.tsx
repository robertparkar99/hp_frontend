"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import Image from "../../../components/AppImage";
import { Atom } from "react-loading-indicators";

type Course = {
  id: number;
  subject_id: number;
  standard_id: number;
  title: string;
  description: string;
  thumbnail: string;
  contentType: string;
  category: string;
  difficulty: string;
  short_name: string;
  subject_type: string;
  progress: number;
  instructor: string;
  isNew: boolean;
  isMandatory: boolean;
  display_name: string;
  sort_order: string;
  status: string;
  subject_category?: string;
  is_external?: boolean;
  external_url?: string;
  platform?: string;
};

const DEFAULT_THUMBNAIL =
  "https://erp.triz.co.in/storage/SubStdMapping/SubStdMap_2020-12-29_05-56-03.svg";

const CourseLibrary: React.FC<{ onViewDetails?: (subject_id: number, standard_id: number) => void }> = ({ onViewDetails }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);

  useEffect(() => {
    // Load courses from localStorage and mock data
    const loadCourses = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // const mockCourses: Course[] = [
      //   {
      //     id: 1,
      //     subject_id: 1,
      //     standard_id: 1,
      //     title: "Introduction to Programming",
      //     description: "Learn the basics of programming with hands-on examples",
      //     thumbnail: DEFAULT_THUMBNAIL,
      //     contentType: "video",
      //     category: "Technology",
      //     difficulty: "beginner",
      //     short_name: "Intro Prog",
      //     subject_type: "Computer Science",
      //     progress: 0,
      //     instructor: "John Doe",
      //     isNew: true,
      //     isMandatory: false,
      //     display_name: "Introduction to Programming",
      //     sort_order: "1",
      //     status: "1",
      //     subject_category: "Technology",
      //   },
      //   {
      //     id: 2,
      //     subject_id: 2,
      //     standard_id: 2,
      //     title: "Advanced Data Structures",
      //     description: "Master complex data structures and algorithms",
      //     thumbnail: DEFAULT_THUMBNAIL,
      //     contentType: "video",
      //     category: "Technology",
      //     difficulty: "advanced",
      //     short_name: "Adv DS",
      //     subject_type: "Computer Science",
      //     progress: 0,
      //     instructor: "Jane Smith",
      //     isNew: false,
      //     isMandatory: true,
      //     display_name: "Advanced Data Structures",
      //     sort_order: "2",
      //     status: "1",
      //     subject_category: "Technology",
      //   },
      //   {
      //     id: 3,
      //     subject_id: 3,
      //     standard_id: 3,
      //     title: "Project Management Fundamentals",
      //     description: "Essential skills for managing projects effectively",
      //     thumbnail: DEFAULT_THUMBNAIL,
      //     contentType: "video",
      //     category: "Business",
      //     difficulty: "intermediate",
      //     short_name: "PM Fund",
      //     subject_type: "Management",
      //     progress: 0,
      //     instructor: "Mike Johnson",
      //     isNew: true,
      //     isMandatory: false,
      //     display_name: "Project Management Fundamentals",
      //     sort_order: "3",
      //     status: "1",
      //     subject_category: "Business",
      //   },
      //   {
      //     id: 4,
      //     subject_id: 4,
      //     standard_id: 4,
      //     title: "Digital Marketing Strategies",
      //     description: "Learn modern digital marketing techniques",
      //     thumbnail: DEFAULT_THUMBNAIL,
      //     contentType: "video",
      //     category: "Marketing",
      //     difficulty: "intermediate",
      //     short_name: "Digital Mkt",
      //     subject_type: "Marketing",
      //     progress: 0,
      //     instructor: "Sarah Wilson",
      //     isNew: false,
      //     isMandatory: false,
      //     display_name: "Digital Marketing Strategies",
      //     sort_order: "4",
      //     status: "1",
      //     subject_category: "Marketing",
      //   },
      //   {
      //     id: 5,
      //     subject_id: 5,
      //     standard_id: 5,
      //     title: "Financial Analysis",
      //     description: "Understanding financial statements and analysis",
      //     thumbnail: DEFAULT_THUMBNAIL,
      //     contentType: "video",
      //     category: "Finance",
      //     difficulty: "advanced",
      //     short_name: "Fin Analysis",
      //     subject_type: "Finance",
      //     progress: 0,
      //     instructor: "Robert Brown",
      //     isNew: true,
      //     isMandatory: true,
      //     display_name: "Financial Analysis",
      //     sort_order: "5",
      //     status: "1",
      //     subject_category: "Finance",
      //   },
      //   {
      //     id: 6,
      //     subject_id: 6,
      //     standard_id: 6,
      //     title: "Leadership Skills",
      //     description: "Develop essential leadership and management skills",
      //     thumbnail: DEFAULT_THUMBNAIL,
      //     contentType: "video",
      //     category: "Leadership",
      //     difficulty: "intermediate",
      //     short_name: "Leadership",
      //     subject_type: "Management",
      //     progress: 0,
      //     instructor: "Emily Davis",
      //     isNew: false,
      //     isMandatory: false,
      //     display_name: "Leadership Skills",
      //     sort_order: "6",
      //     status: "1",
      //     subject_category: "Leadership",
      //   },
      // ];

      // Load generated courses from localStorage
      const generatedCourses: Course[] = JSON.parse(localStorage.getItem("generatedCourses") || "[]");

      // Combine mock courses and generated courses
      const allCourses = [ ...generatedCourses];

      setCourses(allCourses);
      setLoading(false);
    };

    loadCourses();
  }, []);

  const handleEnroll = (course: Course) => {
    console.log(`📚 Enrolling in course ${course.id}`);
    // Implement enrollment logic here
  };

  const handleViewDetails = (subject_id: number, standard_id: number) => {
    // Find the course
    const course = courses.find(c => c.subject_id === subject_id && c.standard_id === standard_id);
    if (course) {
      // Show custom course detail page for all courses
      setSelectedCourse(course);
      setShowCourseDetail(true);
    }
  };

  const handleCloseCourseDetail = () => {
    setShowCourseDetail(false);
    setSelectedCourse(null);
  };

  const handleLoadMore = async () => {
    // Implement load more logic if needed
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const handleEditCourse = (course: Course) => {
    console.log(`✏️ Editing course ${course.id}`);
    // Implement edit logic here
  };

  // Custom Course Detail Component (similar to ViewDetail.jsx)
  const CourseDetailView = ({ course, onClose }: { course: Course; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState("resources");

    // Build resources data - only show generated course if it exists
    const mockResources: Record<string, Array<{id: number, title: string, filename: string, type: string}>> = {};

    // Add generated course URL to resources if it exists
    if (course.external_url) {
      mockResources["Generated Course"] = [{
        id: Date.now(),
        title: `${course.title} - Generated Presentation`,
        filename: course.external_url,
        type: "Presentation"
      }];
    }

    const totalResources = Object.values(mockResources).reduce((sum, items) => sum + items.length, 0);

    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course Library
          </Button>

          {/* Course Header */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-32 h-32 object-cover rounded-lg"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL;
                  }}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{course.title}</h1>
                <p className="text-muted-foreground mb-4">{course.description}</p>
                {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>
                    <p className="text-muted-foreground">{course.category}</p>
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span>
                    <p className="text-muted-foreground capitalize">{course.difficulty}</p>
                  </div>
                  <div>
                    <span className="font-medium">Instructor:</span>
                    <p className="text-muted-foreground">{course.instructor}</p>
                  </div>
                  <div>
                    <span className="font-medium">Resources:</span>
                    <p className="text-muted-foreground">{totalResources} items</p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border mb-6">
            {/* <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button> */}
            <button
              onClick={() => setActiveTab("resources")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "resources"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Resources ({totalResources})
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-card border border-border rounded-lg p-6">
            {/* {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground mb-4">
                    {course.description || "This course provides comprehensive learning materials and resources to help you master the subject."}
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="font-semibold mb-2">What You'll Learn</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Fundamental concepts and principles</li>
                        <li>Practical applications and examples</li>
                        <li>Best practices and methodologies</li>
                        <li>Hands-on exercises and projects</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Course Features</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Comprehensive study materials</li>
                        <li>Interactive resources and guides</li>
                        <li>Reference documents and PDFs</li>
                        <li>Self-paced learning approach</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {activeTab === "resources" && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Course Resources</h2>
                {Object.entries(mockResources).map(([category, resources]) => (
                  <div key={category} className="mb-8 border-2 border-blue-200 rounded-lg p-5 bg-blue-50/30">
                    <h3 className="font-bold text-lg mb-4 text-blue-800">
                      {category}
                      <span className="ml-3 text-sm text-blue-600 font-medium">
                        ({resources.length} resources)
                      </span>
                    </h3>
                    <div className="grid gap-4">
                      {resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between p-4 bg-white border-2 border-blue-100 rounded-lg hover:border-blue-300 transition-colors duration-200"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-base mb-1">
                              {resource.title}
                            </p>
                            <a
                              href={resource.filename}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 underline text-sm"
                            >
                              {resource.filename.split('/').pop()} ({resource.type})
                            </a>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(resource.filename, '_blank')}
                          >
                            View PDF
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {totalResources === 0 && (
                  <div className="text-center py-12 border-2 border-blue-200 border-dashed rounded-lg bg-blue-50/20">
                    <div className="text-blue-400 mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No resources available</h3>
                    <p className="text-gray-500">Resources will appear here once they are added to this course.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  };

  // Show course detail view if selected
  if (showCourseDetail && selectedCourse) {
    return <CourseDetailView course={selectedCourse} onClose={handleCloseCourseDetail} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }

  // Simplified Course Card styled like CourseGrid cards
  const LibraryCourseCard = ({ course }: { course: Course }) => (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
      <div className="relative">
        <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={course.thumbnail}
            alt={course.title}
            width={400}
            height={192}
            className="object-cover w-full h-full"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL;
            }}
          />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground text-lg mb-4 line-clamp-2">
          {course.title}
        </h3>

        <div className="flex space-x-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(course.subject_id, course.standard_id)}
            className="min-w-[180px] flex-1"
          >
            View Details
          </Button>
          <Button
            size="sm"
            onClick={() => handleEnroll(course)}
            className="min-w-[70px] flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Enroll
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Course Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map(course => (
          <LibraryCourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default CourseLibrary;
