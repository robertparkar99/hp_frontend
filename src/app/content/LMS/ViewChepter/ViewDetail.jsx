"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Button } from "../../../../components/ui/button"
import Icon from "@/components/AppIcon"
import Shepherd from 'shepherd.js'

import ChepterGrid from "./ChepterGrid"
import AddChepterDialog from "./AddChepterDialog"
import AddContentDialog from "./AddContentDialoge"
import CourseHero from "./CourseHero"
import CourseTabNavigation from "./CourseTabNavigation"
import QuestionBank from "../questionBank/index"
import {
    createViewDetailSteps,
    viewDetailTourOptions,
    injectViewDetailTourStyles
} from './ViewDetailTourSteps'

export default function ViewDetailPage({ subject_id, standard_id, grade = 2 ,onClose}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddContentDialogOpen, setIsAddContentDialogOpen] = useState(false)
  const [chapterToEdit, setChapterToEdit] = useState(null)
  const [chapterToDelete, setChapterToDelete] = useState(null)
  const [contentToDelete, setContentToDelete] = useState(null)
  const [contentToEdit, setContentToEdit] = useState(null)
  const [currentChapter, setCurrentChapter] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [chapters, setChapters] = useState([])
  const [courseDetails, setCourseDetails] = useState(null)
  const [contentData, setContentData] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("modules")
  // const [courseActiveTab, setCourseActiveTab] = useState("course")
  const [standardDetails, setStandardDetails] = useState(null)
  const [selectedChapterId, setSelectedChapterId] = useState(null)
  const [selectedStandardId, setSelectedStandardId] = useState(null)
  const [showFullQuestionBank, setShowFullQuestionBank] = useState(false) // New state for full view
  const [courseCompleted, setCourseCompleted] = useState(() => {
    if (typeof window !== 'undefined' && subject_id && standard_id) {
      const completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
      return completedCourses.includes(`${subject_id}-${standard_id}`);
    }
    return false;
  })
  const [contentOpened, setContentOpened] = useState(() => {
    if (typeof window !== 'undefined' && subject_id && standard_id) {
      const openedCourses = JSON.parse(localStorage.getItem('openedCourses') || '[]');
      return openedCourses.includes(`${subject_id}-${standard_id}`);
    }
    return false;
  })
  const [contentViewTrigger, setContentViewTrigger] = useState(0)

    // Tour state
    const tourInstanceRef = useRef < Shepherd.Tour | null > (null)
    const [isTourActive, setIsTourActive] = useState(false)

  // Session data state
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    sub_institute_id: "",
    syear: "",
    user_id: "",
    user_profile_name: "",
  })

  // Load session info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      const {
        APP_URL,
        token,
        sub_institute_id,
        syear,
        user_profile_name,
        user_id,
      } = JSON.parse(userData)

      setSessionData({
        url: APP_URL,
        token,
        sub_institute_id,
        syear,
        user_profile_name,
        user_id,
      })
    }
  }, [])

    // ✅ Tour: Check for trigger and initialize tour
    useEffect(() => {
        // Inject tour styles
        injectViewDetailTourStyles()

        // Check if tour was triggered from parent
        const triggerValue = sessionStorage.getItem('triggerViewDetailTour')
        const tourCompleted = sessionStorage.getItem('viewDetailTourCompleted')

        // Only start tour if triggered AND not completed
        if (triggerValue === 'true' && !tourCompleted) {
            console.log('🎯 Tour triggered for View Detail page')

            // Initialize tour after a short delay to ensure DOM is ready
            setTimeout(() => {
                initializeTour()
            }, 500)

            // Clear trigger to prevent re-triggering
            sessionStorage.removeItem('triggerViewDetailTour')
        }

        return () => {
            // Cleanup tour instance on unmount
            if (tourInstanceRef.current) {
                tourInstanceRef.current.cancel()
                tourInstanceRef.current = null
            }
        }
    }, [])

    // ✅ Initialize the View Detail tour
    const initializeTour = useCallback(() => {
        // Check if tour already exists
        if (tourInstanceRef.current) {
            console.log('Tour instance already exists')
            return
        }

        // Check if tour was completed
        if (sessionStorage.getItem('viewDetailTourCompleted') === 'true') {
            console.log('Tour already completed, skipping')
            return
        }

        console.log('🎯 Initializing View Detail tour')
        setIsTourActive(true)

        // Create new tour instance
        const tour = new Shepherd.Tour({
            ...viewDetailTourOptions,
        })

        // Create and add steps
        const steps = createViewDetailSteps(tour, () => {
            console.log('🎉 View Detail tour completed')
            setIsTourActive(false)
        })

        steps.forEach(step => {
            tour.addStep(step)
        })

        // Store tour instance
        tourInstanceRef.current = tour

        // Handle tour completion/cancel
        tour.on('complete', () => {
            console.log('Tour completed')
            setIsTourActive(false)
            tourInstanceRef.current = null
        })

        tour.on('cancel', () => {
            console.log('Tour cancelled')
            setIsTourActive(false)
            tourInstanceRef.current = null
        })

        // Start the tour
        setTimeout(() => {
            if (tourInstanceRef.current) {
                tour.start()
            }
        }, 100)
    }, [])

  // Fetch chapters from API
  const fetchChapters = async () => {
    if (!sessionData.url || !sessionData.token) return

    try {
      setLoading(true)

      const API_URL = `${sessionData.url}/lms/chapter_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_profile_name=${sessionData.user_profile_name}&user_id=${sessionData.user_id}&standard_id=${standard_id}&subject_id=${subject_id}&token=${sessionData.token}`

      console.log("📌 Fetching chapters from:", API_URL)

      const res = await fetch(API_URL, { cache: "no-store" })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Failed to fetch chapters: ${res.status} - ${errText}`)
      }

      const data = await res.json()
      console.log("📊 API Response:", data)

      if (data.course_details) {
        setCourseDetails(data.course_details)
      }

      if (data.content_data) {
        setContentData(data.content_data)
      }

      if (data.standard_details) {
        setStandardDetails(data.standard_details)
      }

      const mapped = (data?.data || []).map((item) => {
        const chapterId = item.id.toString()
        const chapterContent =
          data.content_data?.[chapterId] || data.content_data?.[item.id]

        return {
          id: item.id,
          title: item.chapter_name ?? "Untitled Chapter",
          description: item.chapter_desc ?? "",
          standard_id: item.standard_id,
          subject_id: item.subject_id,
          total_content: item.total_content,
          availability: item.availability,
          show_hide: item.show_hide,
          thumbnail: "/placeholder.jpg",
          category: "Module",
          level: "Grade " + grade,
          rating: 4.5,
          reviewCount: 12,
          enrolledCount: 120,
          instructor: { name: "Admin", title: "Course Creator" },
          duration: "3h 20m",
          progress: 0,
          contents: chapterContent,
        }
      })

      setChapters(mapped)
    } catch (error) {
      console.error("❌ Error fetching chapters:", error)
      setChapters([])
      setContentData({})
      setStandardDetails(null)
    } finally {
      setLoading(false)
    }
  }

  // Refetch when sessionData or subject/standard changes
  useEffect(() => {
    if (sessionData.url && sessionData.token && subject_id && standard_id) {
      fetchChapters()
    }
  }, [sessionData, subject_id, standard_id])

  // Handlers
  const handleEditChapter = (chapter) => {
    setChapterToEdit(chapter)
    setIsAddDialogOpen(true)
  }

  const handleDeleteChepter = (chapter) => {
    setChapterToDelete(chapter)
    fetchChapters()
  }

  const handleSaveChapter = () => {
    setIsAddDialogOpen(false)
    setChapterToEdit(null)
    setChapterToDelete(null)
    fetchChapters()
  }

  const handleEditContent = (content, chapter) => {
    setContentToEdit(content)
    setCurrentChapter(chapter)
    setIsAddContentDialogOpen(true)
  }

  const handleDeleteContent = (contentId) => {
    setContentToDelete(contentId)
    fetchChapters()
  }

  const handleSaveContent = () => {
    setIsAddContentDialogOpen(false)
    setContentToEdit(null)
    setContentToDelete(null)
    setCurrentChapter(null)
    fetchChapters()
  }

  const handleContentDialogClose = () => {
    setIsAddContentDialogOpen(false)
    setContentToEdit(null)
    setCurrentChapter(null)
  }

  // Handle opening question bank in full view
  const handleOpenQuestionBank = (chapter_id, standard_id) => {
    setSelectedChapterId(chapter_id)
    setSelectedStandardId(standard_id)
    setShowFullQuestionBank(true)
  }

  // Handle closing question bank and returning to modules
  const handleCloseQuestionBank = () => {
    setShowFullQuestionBank(false)
    setSelectedChapterId(null)
    setSelectedStandardId(null)
    setActiveTab("modules")
  }
  // Add this handler inside your component
    const handleCloseModule = () => {
        if (onClose) {
      onClose();
      } // 👈 go back to course tab
 };

  // Check if all chapters are read (all content viewed)
  const checkAllChaptersRead = () => {
    if (chapters.length === 0) return false;

    return chapters.every(chapter => {
      const chapterId = chapter.id;
      const chapterContent = contentData[chapterId] || {};

      // Get all content items for this chapter
      const allContent = Object.values(chapterContent).flat();

      if (allContent.length === 0) return true; // No content means it's "read"

      // Check if all content is viewed
      const viewedContent = localStorage.getItem(`viewed_content_${chapterId}`);
      if (!viewedContent) return false;

      const viewedIds = JSON.parse(viewedContent);
      return allContent.every(content => viewedIds[content.id]);
    });
  };

  // Memoized check for button enabled state
  const isButtonEnabled = useMemo(() => checkAllChaptersRead(), [chapters, contentData, contentViewTrigger]);

  const handleMarkCompleted = async () => {
    if (!checkAllChaptersRead()) {
      alert("Please read all content first.");
      return;
    }

    try {
      // Call the completion API
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // 2 days from now

      const completionData = {
        user_id: sessionData.user_id,
        sub_institute_id: sessionData.sub_institute_id,
        type: "API",
        token: sessionData.token,
        course_id: subject_id,
        status: "completed",
        start_date: startDate,
        end_date: endDate
      };

      console.log("Calling completion API:", completionData);

      const response = await fetch(`${sessionData.url}/api/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(completionData),
      });

      const data = await response.json();
      console.log("Completion API response:", data);

      if (data.status === true || response.ok) {
        alert("Successfully completed the course.");
        setCourseCompleted(true);

        // Update localStorage for completed courses
        const completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
        const courseKey = `${subject_id}-${standard_id}`;
        if (!completedCourses.includes(courseKey)) {
          completedCourses.push(courseKey);
          localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
        }

        // Update enrollment_status in localStorage for enrolled courses
        const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        const updatedEnrolledCourses = enrolledCourses.map(course => {
          if (course.subject_id === subject_id && course.standard_id === standard_id) {
            return { ...course, enrollment_status: 'completed' };
          }
          return course;
        });
        localStorage.setItem('enrolledCourses', JSON.stringify(updatedEnrolledCourses));

        // Notify parent component to refresh
        if (onClose) {
          onClose();
        }
      } else {
        alert("Failed to mark course as completed. Please try again.");
      }
    } catch (error) {
      console.error("Error completing course:", error);
      alert("Error completing course. Please try again.");
    }
  };

  // Format course details for CourseHero
  const formatCourseForHero = () => {
    if (!courseDetails) return null

    const resourcesCount = Object.values(contentData).reduce(
      (total, chapterContent) =>
        total +
        Object.values(chapterContent).reduce(
          (sum, items) => sum + items.length,
          0
        ),
      0
    )

    return {
      id: courseDetails.id,
      title: courseDetails.display_name || "Untitled Course",
      description: `${courseDetails.subject_category} Subject`,
      thumbnail: courseDetails.display_image || "/placeholder.jpg",
      category: courseDetails.subject_category || "General",
      level: "Grade " + grade,
      moduleCount: chapters.length,
      resourcesCount,
      details: {
        subjectCode: courseDetails.subject_code,
        subjectType: courseDetails.subject_type,
        elective: courseDetails.elective_subject === "Yes",
        allowGrades: courseDetails.allow_grades === "Yes",
        allowContent: courseDetails.allow_content === "Yes",
        contentType: courseDetails.add_content,
      },
    }
  }

  // Calculate total resources
  const calculateTotalResources = () => {
    return Object.values(contentData).reduce(
      (total, chapterContent) =>
        total +
        Object.values(chapterContent).reduce(
          (sum, items) => sum + items.length,
          0
        ),
      0
    )
  }

  // Tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "modules":
        return loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : chapters.length > 0 ? (
          <ChepterGrid
            courses={chapters}
            viewMode={viewMode}
            onEditCourse={handleEditChapter}
            onDeleteCourse={handleDeleteChepter}
            onDeleteContent={handleDeleteContent}
            onSaveContent={handleSaveContent}
            onEditContent={handleEditContent}
            onQuestionContent={handleOpenQuestionBank}
            onViewCourse={() => {
              setContentOpened(true);
              setContentViewTrigger(prev => prev + 1); // Trigger re-check of completion status
              const openedCourses = JSON.parse(localStorage.getItem('openedCourses') || '[]');
              const courseKey = `${subject_id}-${standard_id}`;
              if (!openedCourses.includes(courseKey)) {
                openedCourses.push(courseKey);
                localStorage.setItem('openedCourses', JSON.stringify(openedCourses));
              }
            }}
            sessionInfo={sessionData}
            courseDisplayName={courseDetails?.display_name || "Untitled Course"}
            standardName={standardDetails?.name || "Standard"}
            onContentViewed={() => setContentViewTrigger(prev => prev + 1)}
          />
        ) : (
          <div className="text-center text-muted-foreground py-10">
            No chapters found for this subject/standard.
          </div>
        )
      case "resources":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Resources ({calculateTotalResources()} total)
            </h2>
            {chapters.map((ch) => {
              const chapterContent = contentData?.[ch.id] || {}
              const chapterResourceCount = Object.values(chapterContent).reduce(
                (sum, items) => sum + items.length,
                0
              )

              return chapterResourceCount > 0 ? (
                <div key={ch.id} className="mb-8 border-2 border-blue-200 rounded-lg p-5 bg-blue-50/30">
                  <h3 className="font-bold text-lg mb-4 text-blue-800">
                    {ch.title}
                    <span className="ml-3 text-sm text-blue-600 font-medium">
                      ({chapterResourceCount} resources)
                    </span>
                  </h3>
                  <div className="grid gap-4">
                    {Object.entries(chapterContent).map(([category, items]) =>
                      items.length > 0 ? (
                        <div
                          key={category}
                          className="border-2 border-blue-100 bg-blue-50/10 p-5 rounded-lg shadow-sm"
                        >
                          <h4 className="text-sm font-semibold text-blue-700 mb-3">{category}</h4>
                          <ul className="space-y-3">
                            {items.map((res) => (
                              <li
                                key={res.id}
                                className="flex items-center justify-between p-4 bg-white border-2 border-blue-100 rounded-lg hover:border-blue-300 transition-colors duration-200"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 text-base">
                                    {res.title}
                                  </p>
                                  <a
                                    href={res.filename.startsWith("http://") || res.filename.startsWith("https://")
                                      ? res.filename
                                      : `https://s3-triz.fra1.digitaloceanspaces.com/public/hp_lms_content_file/${res.filename}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 underline"
                                    onClick={() => {
                                      // Mark content as viewed
                                      const viewedContent = JSON.parse(localStorage.getItem(`viewed_content_${ch.id}`) || '{}');
                                      viewedContent[res.id] = true;
                                      localStorage.setItem(`viewed_content_${ch.id}`, JSON.stringify(viewedContent));

                                      setContentOpened(true);
                                      setContentViewTrigger(prev => prev + 1);
                                      const openedCourses = JSON.parse(localStorage.getItem('openedCourses') || '[]');
                                      const courseKey = `${subject_id}-${standard_id}`;
                                      if (!openedCourses.includes(courseKey)) {
                                        openedCourses.push(courseKey);
                                        localStorage.setItem('openedCourses', JSON.stringify(openedCourses));
                                      }
                                    }}
                                  >
                                    {res.filename}
                                  </a>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null
                          )}
                  </div>
                </div>
              ) : null
            })}

            {calculateTotalResources() === 0 && (
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
        )
      default:
        return (
          <div className="text-center py-10">📖 Overview tab coming soon...</div>
        )
    }
  }

  // If we're showing the full question bank view, render only that
  if (showFullQuestionBank) {
    return (
      <div className="min-h-screen bg-background p-6 pt-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={handleCloseQuestionBank}
              className="flex items-center gap-2"
            >
                        <Icon name="ArrowLeft" style={{ width: '24px', height: '24px' }} />

            </Button>
          </div>
          <QuestionBank
            chapter_id={selectedChapterId}
            standard_id={selectedStandardId}
            subject_id={subject_id}
            courseDisplayName={courseDetails?.display_name || "Untitled Course"}
          />
        </div>
      </div>
    )
  }

  // Otherwise, render the normal course/module view
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
              <div id="vd-back-button">
                  <Button
                      variant="ghost"
                      onClick={handleCloseModule}
                      className="flex items-center"
                  >
                      <Icon name="ArrowLeft" style={{ width: '24px', height: '24px' }} />
                  </Button>
              </div>
              <div id="vd-course-header" className="flex items-center justify-between mt-8 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Module Catalog
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Browse and manage Module
            </p>
          </div>
          {/* <div className="flex items-center gap-2">
            {!courseCompleted && (
              <Button
                onClick={handleMarkCompleted}
                disabled={!contentOpened}
                className={`flex items-center gap-2 ${contentOpened ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
              >
                <Icon name="CheckCircle" size={16} /> Mark As Completed
              </Button>
            )}
            {courseCompleted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <Icon name="CheckCircle" size={16} /> Course Completed
              </div>
            )}
            {["ADMIN", "HR"].includes(sessionData.user_profile_name?.toUpperCase()) ? (
              <Button
                onClick={() => {
                  setChapterToEdit(null)
                  setChapterToDelete(null)
                  setIsAddDialogOpen(true)
                }}
                className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
              >
                <Icon name="Plus" size={16} /> Create Module
              </Button>
            ) : null}
          </div> */}
        </div>

        {/* Course Hero */}
        {courseDetails && (
                  <div id="vd-course-hero">
                      <CourseHero
                          course={formatCourseForHero()}
                          sessionData={sessionData}
                          onStartCourse={() => console.log("Start course")}
                          onContinueCourse={() => console.log("Continue course")}
                      />
                  </div>
        )}

        {/* Tab Navigation */}
              <div id="vd-tab-navigation" className="mt-4">
          <CourseTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            chapters={chapters}
            contentData={contentData}
            isCourseCompleted={courseCompleted}
            onMarkCourseCompleted={handleMarkCompleted}
            isButtonEnabled={isButtonEnabled}
            checkingCompletion={false}
          />
        </div>

        {/* Tab Content */}
              <div id="vd-module-grid" className="bg-card border border-border rounded-lg p-6 mt-8">
          {renderTabContent()}
        </div>

        {/* Add/Edit Chapter Dialog */}
        <AddChepterDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSave={handleSaveChapter}
          course={chapterToEdit}
          sessionInfo={sessionData}
          grade={grade}
          standard_id={standard_id}
          subject_id={subject_id}
        />

        {/* Add/Edit Content Dialog */}
        <AddContentDialog
          open={isAddContentDialogOpen}
          onOpenChange={handleContentDialogClose}
          onSave={handleSaveContent}
          content={contentToEdit}
          chapterId={currentChapter?.id}
          chapterName={currentChapter?.title}
          sessionInfo={sessionData}
          courseDisplayName={courseDetails?.display_name || "Untitled Course"}
          standardName={standardDetails?.name || "Standard"}
        />
      </main>
    </div>
  )
}

