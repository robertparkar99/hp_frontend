

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import FilterSidebar from './components/FilterSidebar'
import SearchToolbar from './components/SearchToolbar'
import CourseGrid from './components/CourseGrid'
import Icon from '@/components/AppIcon'
import { Button } from '../../../components/ui/button'
import AddCourseDialog from './components/AddCourseDialog'
import AiCourseDialog from './components/AiCourseDialog'
import ViewDetail from '../LMS/ViewChepter/ViewDetail'

type Course = {
  id: number
  subject_id: number
  standard_id: number
  title: string
  description: string
  thumbnail: string
  contentType: string
  category: string
  difficulty: string
  short_name: string
  subject_type: string
  progress: number
  instructor: string
  isNew: boolean
  isMandatory: boolean
  display_name: string
  sort_order: string
  status: string
  subject_category?: string
}

type Filters = {
  subjectTypes: string[]
  categories: string[]
}

const DEFAULT_THUMBNAIL =
  'https://erp.triz.co.in/storage/SubStdMapping/SubStdMap_2020-12-29_05-56-03.svg'

const LearningCatalog: React.FC = () => {
  const router = useRouter()

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [subjectId, setSubjectId] = useState(0)
  const [standardId, setStandardId] = useState(0)
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<Filters>({
    subjectTypes: [],
    categories: [],
  })

  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  // ✅ Session data
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsed = JSON.parse(userData)
      console.log('✅ Loaded session data:', parsed)
      setSessionData(parsed)
    } else {
      console.warn('⚠️ No session data found in localStorage')
    }
  }, [])

  // ✅ Build API URL
  const buildApiUrl = () => {
    if (!sessionData) return ''
    return `${sessionData.APP_URL}/lms/course_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_id=${sessionData.user_id}&user_profile_name=${sessionData.user_profile_name}`
  }

  // ✅ Fetch courses
  const fetchCourses = async () => {
    if (!sessionData) return
    try {
      setLoading(true)

      const apiUrl = buildApiUrl()
      console.log('📡 Fetching courses from:', apiUrl)

      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error(`❌ Failed to fetch courses. Status: ${res.status}`)

      const data = await res.json()
      console.log('📦 Raw API data:', data)

      const mappedCourses: Course[] = []

      if (data?.lms_subject) {
        Object.keys(data.lms_subject).forEach((category) => {
          data.lms_subject[category].forEach((item: any, index: number) => {
            const course: Course = {
              id: item.subject_id ?? index,
              subject_id: item.subject_id ?? 0,
              standard_id: item.standard_id ?? 0,
              title: item.subject_name ?? 'Untitled',
              description: item.standard_name ?? 'No description available',
              thumbnail: item.display_image?.trim() || DEFAULT_THUMBNAIL,
              contentType: 'video',
              category: item.content_category || category,
              difficulty: 'beginner',
              short_name: item.short_name ?? 'N/A',
              subject_type: item.subject_type ?? 'N/A',
              progress: 0,
              instructor: 'Admin',
              isNew: true,
              isMandatory: false,
              display_name: item.display_name ?? item.standard_name ?? 'Untitled',
              sort_order: item.sort_order ?? '1',
              status: item.status ?? '1',
              subject_category: category // Add subject_category for filtering
            }
            mappedCourses.push(course)
          })
        })
      }

      console.log('✅ Mapped courses:', mappedCourses)
      setCourses(mappedCourses)
      setFilteredCourses(mappedCourses)
    } catch (error) {
      console.error('🚨 Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionData) {
      fetchCourses()
    }
  }, [sessionData])

  // ✅ Apply filters to courses
  useEffect(() => {
    const applyFilters = () => {
      let result = [...courses]

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        result = result.filter(course =>
          // course.display_name?.toLowerCase().includes(query) ||
          // course.subject_category?.toLowerCase().includes(query) ||
          // course.subject_type?.toLowerCase().includes(query)
          // course.display_name?.toLowerCase().includes(query) ||
          course.subject_category?.toLowerCase().includes(query) ||
          course.subject_type?.toLowerCase().includes(query) ||
          course.title?.toLowerCase().includes(query) || // subject_name
          course.description?.toLowerCase().includes(query) || // standard_name
          course.short_name?.toLowerCase().includes(query) // short_name
        )
      }

      // Category filter
      if (filters.categories.length > 0) {
        result = result.filter(course =>
          filters.categories.includes((course.category ?? '').toLowerCase().replace(/\s+/g, '-'))
        )
      }

      // Subject type filter
      if (filters.subjectTypes.length > 0) {
        result = result.filter(course =>
          filters.subjectTypes.includes(course.subject_type?.toLowerCase().replace(/\s+/g, '-'))
        )
      }

      setFilteredCourses(result)
    }

    applyFilters()
  }, [courses, searchQuery, filters])

  // ✅ Handlers
  const handleFilterChange = (key: keyof Filters, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: values
    }))
  }

  const handleClearAllFilters = () => {
    setFilters({
      subjectTypes: [],
      categories: [],
    })
    setSearchQuery('')
  }

  const handleEnroll = (courseId: number) => {
    console.log(`📚 Enrolling in course ${courseId}`)
  }

  const handleViewDetails = (subject_id: number, standard_id: number) => {
    if (subject_id && standard_id) {
      setSubjectId(subject_id)
      setStandardId(standard_id)
      setIsViewOpen(true)
    }
  }

  const handleCloseViewDetail = () => {
    setIsViewOpen(false)
    // Refresh courses after returning from view detail
    if (sessionData) {
      fetchCourses()
    }
  }

  const handleLoadMore = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setHasMore(false)
        resolve()
      }, 1000)
    })
  }

  const handleSaveCourse = (data: Partial<Course>) => {
    // After saving, refresh the course list
    if (sessionData) {
      fetchCourses()
    }
    setCourseToEdit(null)
    setIsAddDialogOpen(false)
  }

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course)
    setIsAddDialogOpen(true)
  }

  return (
    <>
      {!isViewOpen ? (
        <div className="min-h-screen bg-background rounded-xl">
          <main>
            <div className="max-w-full o px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Learning Catalog
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Discover and enroll in courses to advance your skills and career
                  </p>
                </div>

                <div className="flex gap-2">
                  {sessionData &&
                    sessionData.user_profile_name &&
                    ["ADMIN", "HR"].includes(sessionData.user_profile_name.toUpperCase()) ? (
                    <>
                      <Button
                        onClick={() => setIsAiDialogOpen(true)}
                        className="flex items-center gap-2 bg-[#e8f0ff] text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <span className="mdi mdi-creation text-xl"></span>
                        Build with AI
                      </Button>

                      <Button

                        onClick={() => {
                          setCourseToEdit(null)
                          setIsAddDialogOpen(true)
                        }}
                        className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Create Course
                      </Button>
                    </>
                  ) : null}

                  <Button
                    variant="outline"
                    className="lg:hidden"
                    onClick={() => setIsFilterDrawerOpen(true)}
                  >
                    <Icon name="Filter" size={16} className="mr-2" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                {isFilterVisible && (
                  <div className="lg:col-span-3 hidden lg:block">
                    <FilterSidebar
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearAll={handleClearAllFilters}
                    />
                  </div>
                )}

                <div className={isFilterVisible ? 'lg:col-span-6' : 'lg:col-span-9'}>
                  <SearchToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    resultsCount={filteredCourses.length}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearAll={handleClearAllFilters}
                  />

                  <CourseGrid
                    totalcourse={courses.length}
                    courses={filteredCourses}
                    viewMode={viewMode}
                    loading={loading ? true : undefined}
                    onEnroll={handleEnroll}
                    onViewDetails={handleViewDetails}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    onEditCourse={handleEditCourse}
                    sessionInfo={sessionData}
                  />
                </div>
              </div>
            </div>
          </main>

          <AiCourseDialog
            open={isAiDialogOpen}
            onOpenChange={setIsAiDialogOpen}
            onGenerate={(data) => {
              console.log("🚀 AI should build a course with:", data);
              // here you can call API to actually generate a course
            }}
          />
          {/* Add/Edit Dialog */}
          <AddCourseDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSave={handleSaveCourse}
            course={courseToEdit}
          />
        </div>
      ) : (
        <ViewDetail subject_id={subjectId} standard_id={standardId} onClose={handleCloseViewDetail} />
      )}
    </>
  )
}

export default LearningCatalog;