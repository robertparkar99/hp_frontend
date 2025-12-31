// 'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
   is_external?: boolean
   external_url?: string
   platform?: string
   jobrole?: string
}

type Filters = {
  subjectTypes: string[]
  categories: string[]
}

type ExternalCourse = {
  id: number
  title: string
  description: string
  thumbnail: string
  platform: string
  instructor: string
  duration: string
  level: string
  rating: number
  students: string
  url: string
  category: string
  price: string
  language: string
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
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [isExternalCourseDialogOpen, setIsExternalCourseDialogOpen] = useState(false)
  const [activePlatformTab, setActivePlatformTab] = useState('udemy')
  const [jobRoles, setJobRoles] = useState<any[]>([])

  // ✅ Session data
  const [sessionData, setSessionData] = useState<any>(null)

  // ✅ External course data state
  const [externalCourses, setExternalCourses] = useState<ExternalCourse[]>([])
  const [externalCoursesLoading, setExternalCoursesLoading] = useState(false)
  const [externalSearchQuery, setExternalSearchQuery] = useState('react')
  const [externalPage, setExternalPage] = useState(0)

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
  const buildApiUrl = useCallback(() => {
    if (!sessionData) return ''
    return `${sessionData.APP_URL}/lms/course_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_id=${sessionData.user_id}&user_profile_name=${sessionData.user_profile_name}`
  }, [sessionData])

  // ✅ Fetch courses
  const fetchCourses = useCallback(async () => {
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
      const jobRolesSet = new Set()

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
              subject_category: category, // Add subject_category for filtering
              jobrole: item.jobrole ?? undefined
            }
            mappedCourses.push(course)

            // Collect unique jobroles
            if (item.jobrole) {
              jobRolesSet.add(item.jobrole)
            }
          })
        })
      }

      console.log('✅ Mapped courses:', mappedCourses)
      // Sort courses by id (timestamp) in descending order to show latest first
      const sortedCourses = [...mappedCourses].sort((a, b) => b.id - a.id)
      setCourses(sortedCourses)
      setFilteredCourses(sortedCourses)

      // Set job roles from the API data
      const uniqueJobRoles = Array.from(jobRolesSet).map((jobrole, index) => ({
        id: index + 1,
        jobrole: jobrole,
        name: jobrole,
        description: '',
        department: '',
        industries: ''
      }))
      setJobRoles(uniqueJobRoles)
    } catch (error) {
      console.error('🚨 Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }, [sessionData])


  // ✅ Fetch external courses from Udemy API using fetch
  const fetchExternalCourses = async (searchTerm: string = 'react', page: number = 0) => {
    try {
      setExternalCoursesLoading(true)
      
      const url = `https://paid-udemy-course-for-free.p.rapidapi.com/search?s=${encodeURIComponent(searchTerm)}&page=${page}`
      
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '49ecf82631msh4cac5e931f05d72p18ab4cjsn166508163000',
          'x-rapidapi-host': 'paid-udemy-course-for-free.p.rapidapi.com'
        }
      }

      console.log('📡 Fetching external courses with search:', searchTerm, 'page:', page)
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 External courses API response:', data)

      // Transform API response to match our ExternalCourse type
      if (data && Array.isArray(data)) {
        const transformedCourses: ExternalCourse[] = data.map((course: any, index: number) => ({
          id: course.id || Date.now() + index,
          title: course.title || 'Untitled Course',
          description: course.headline || course.description || 'No description available',
          thumbnail: course.image_480x270 || course.image_240x135 || 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
          platform: 'Udemy',
          instructor: course.visible_instructors?.[0]?.display_name || 'Unknown Instructor',
          duration: 'Self-paced',
          level: course.instructional_level || 'All Levels',
          rating: course.rating || 4.0,
          students: course.num_subscribers ? `${(course.num_subscribers / 1000).toFixed(1)}K` : '1K+',
          url: course.url || `https://www.udemy.com${course.url}`,
          category: course.primary_category?.title || course.primary_subcategory?.title || 'Development',
          price: course.price || 'Free',
          language: course.locale?.simple_english_title || 'English'
        }))
        
        setExternalCourses(transformedCourses)
      } else {
        console.warn('⚠️ Unexpected API response format:', data)
        setExternalCourses([])
      }
    } catch (error) {
      console.error('🚨 Error fetching external courses:', error)
      // Fallback to empty array in case of error
      setExternalCourses([])
    } finally {
      setExternalCoursesLoading(false)
    }
  }

  useEffect(() => {
    if (sessionData) {
      fetchCourses()
    }
  }, [sessionData, fetchCourses])

  // ✅ Apply filters to courses
  useEffect(() => {
    const applyFilters = () => {
      let result = [...courses]

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        result = result.filter(course =>
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

  // ✅ Handle adding external course
  const handleAddExternalCourse = (externalCourse: ExternalCourse) => {
    console.log("🌐 Adding external course:", externalCourse);
    
    const newExternalCourse: Course = {
      id: externalCourse.id,
      subject_id: externalCourse.id,
      standard_id: 0,
      title: externalCourse.title,
      description: externalCourse.description,
      thumbnail: externalCourse.thumbnail,
      contentType: 'external',
      category: externalCourse.category,
      difficulty: externalCourse.level?.toLowerCase() || 'intermediate',
      short_name: externalCourse.platform?.substring(0, 3).toUpperCase() || 'EXT',
      subject_type: 'external',
      progress: 0,
      instructor: externalCourse.instructor,
      isNew: true,
      isMandatory: false,
      display_name: externalCourse.title,
      sort_order: '1',
      status: '1',
      subject_category: 'external',
      is_external: true,
      external_url: externalCourse.url,
      platform: externalCourse.platform
    };

    // Add to courses list and sort by id to show latest first
    setCourses(prev => [...prev, newExternalCourse].sort((a, b) => b.id - a.id));
    setIsExternalCourseDialogOpen(false);
    
    // Show success message
    alert(`✅ Course "${externalCourse.title}" from ${externalCourse.platform} added successfully!`);
  }

  // ✅ Handle external dialog open - fetch courses when dialog opens
  const handleExternalDialogOpen = (open: boolean) => {
    setIsExternalCourseDialogOpen(open)
    if (open) {
      fetchExternalCourses(externalSearchQuery, externalPage)
    }
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
                        onClick={() => handleExternalDialogOpen(true)}
                        className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        External Course
                      </Button>
                      
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

          {/* External Course Dialog */}
          <ExternalCourseDialog
            open={isExternalCourseDialogOpen}
            onOpenChange={handleExternalDialogOpen}
            onAddCourse={handleAddExternalCourse}
            courses={externalCourses}
            loading={externalCoursesLoading}
            searchQuery={externalSearchQuery}
            onSearchChange={setExternalSearchQuery}
            onSearch={() => fetchExternalCourses(externalSearchQuery, 0)}
            page={externalPage}
            onPageChange={setExternalPage}
            onLoadMore={() => fetchExternalCourses(externalSearchQuery, externalPage + 1)}
          />

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

// External Course Dialog Component
const ExternalCourseDialog = ({ 
  open, 
  onOpenChange, 
  onAddCourse,
  courses,
  loading,
  searchQuery,
  onSearchChange,
  onSearch,
  page,
  onPageChange,
  onLoadMore
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCourse: (course: any) => void
  courses: any[]
  loading: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: () => void
  page: number
  onPageChange: (page: number) => void
  onLoadMore: () => void
}) => {
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'udemy': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${open ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="mdi mdi-link text-green-600 text-2xl"></span>
              Add External Course from Udemy
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Browse and add courses from Udemy platform
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <span className="mdi mdi-close"></span>
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Search Bar */}
          <div className="p-6 border-b bg-gray-50">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search Udemy courses (e.g., react, python, marketing)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="mdi mdi-magnify absolute right-3 top-2.5 text-gray-400"></span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="mdi mdi-loading animate-spin"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <span className="mdi mdi-magnify"></span>
                    Search
                  </>
                )}
              </button>
            </form>
            <p className="text-sm text-gray-600 mt-2">
              Search through thousands of Udemy courses to add to your catalog
            </p>
          </div>

          {/* Course Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <span className="mdi mdi-loading animate-spin text-4xl text-blue-600 mb-4"></span>
                  <p className="text-gray-600">Loading courses from Udemy&hellip;</p>
                </div>
              </div>
            ) : courses.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-gray-600">
                    Found {courses.length} courses for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-sm text-gray-500">
                    Page {page + 1}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course: any) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="relative">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop'
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(course.platform)}`}>
                            {course.platform}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2 py-1 text-xs font-medium bg-black/70 text-white rounded">
                            {course.level}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                          {course.title}
                        </h4>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span className="mdi mdi-account mr-1"></span>
                          {course.instructor}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <span className="mdi mdi-clock-outline mr-1"></span>
                            {course.duration}
                          </div>
                          <div className="flex items-center">
                            <span className="mdi mdi-star text-yellow-500 mr-1"></span>
                            {course.rating}
                            <span className="mx-1">•</span>
                            <span className="mdi mdi-account-group mr-1"></span>
                            {course.students}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {course.category}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {course.price}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => onAddCourse(course)}
                          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="mdi mdi-plus"></span>
                          Add to Catalog
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="mdi mdi-loading animate-spin"></span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <span className="mdi mdi-plus"></span>
                        Load More Courses
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <span className="mdi mdi-magnify text-4xl text-gray-300 mb-4"></span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">Try searching for different topics like &ldquo;react&rdquo;, &ldquo;python&rdquo;, or &ldquo;marketing&rdquo;</p>
                <button
                  onClick={onSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search Courses
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningCatalog