// 'use client'

// import React, { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// import FilterSidebar from './components/FilterSidebar'
// import SearchToolbar from './components/SearchToolbar'
// import CourseGrid from './components/CourseGrid'
// import Icon from '@/components/AppIcon'
// import { Button } from '../../../components/ui/button'
// import AddCourseDialog from './components/AddCourseDialog'
// import ViewDetail from '../LMS/ViewChepter/ViewDetail'
// // type Course = {
// //   id: number
// //   title: string
// //   description: string
// //   thumbnail: string
// //   contentType: string
// //   category: string
// //   difficulty: string
// //   short_name: string
// //   subject_type: string
// //   progress: number
// //   instructor: string
// //   isNew: boolean
// //   isMandatory: boolean
// // }
// type Course = {
//   id: number
//   subject_id: number
//   standard_id: number
//   title: string
//   description: string
//   thumbnail: string
//   contentType: string
//   category: string
//   difficulty: string
//   short_name: string
//   subject_type: string
//   progress: number
//   instructor: string
//   isNew: boolean
//   isMandatory: boolean
// }

// type Filters = {
//   contentType: string[]
//   categories: string[]
//   skillLevel: string[]
//   duration: string[]
//   completionStatus: string[]
// }

// const API_URL =
//   'https://hp.triz.co.in/lms/course_master?type=API&sub_institute_id=1&syear=2025&user_id=1&user_profile_name=admin'

// const DEFAULT_THUMBNAIL =
//   'https://erp.triz.co.in/storage/SubStdMapping/SubStdMap_2020-12-29_05-56-03.svg'

// const LearningCatalog: React.FC = () => {
//   const router = useRouter()

//   const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [isViewOpen, setIsViewOpen] = useState(false)
//   const [subjectId, setSubjectId] = useState(0)
//   const [standardId, setStandarId] = useState(0)
//   const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)
//   const [isFilterVisible, setIsFilterVisible] = useState(false)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [sortBy, setSortBy] = useState('relevance')
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
//   const [filters, setFilters] = useState<Filters>({
//     contentType: [],
//     categories: [],
//     skillLevel: [],
//     duration: [],
//     completionStatus: [],
//   })

//   const [courses, setCourses] = useState<Course[]>([])
//   const [loading, setLoading] = useState(true)
//   const [hasMore, setHasMore] = useState(true)

//   // Filter helper
//   const getFilteredCourses = (allCourses: Course[]): Course[] => {
//     let filtered = [...allCourses]

//     if (searchQuery) {
//       filtered = filtered.filter(
//         (course) =>
//           course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     }

//     if (filters.contentType.length > 0) {
//       filtered = filtered.filter((course) =>
//         filters.contentType.includes(course.contentType)
//       )
//     }

//     if (filters.categories.length > 0) {
//       filtered = filtered.filter((course) =>
//         filters.categories.includes(course.category)
//       )
//     }

//     if (filters.skillLevel.length > 0) {
//       filtered = filtered.filter((course) =>
//         filters.skillLevel.includes(course.difficulty)
//       )
//     }

//     if (filters.completionStatus.length > 0) {
//       filtered = filtered.filter((course) => {
//         if (
//           filters.completionStatus.includes('completed') &&
//           course.progress === 100
//         )
//           return true
//         if (
//           filters.completionStatus.includes('in-progress') &&
//           course.progress > 0 &&
//           course.progress < 100
//         )
//           return true
//         if (
//           filters.completionStatus.includes('not-started') &&
//           course.progress === 0
//         )
//           return true
//         return false
//       })
//     }

//     return filtered
//   }

//   const fetchCourses = async () => {
//     try {
//       setLoading(true)

//       const sessionData = sessionStorage.getItem('courses')
//       if (sessionData) {
//         const parsed = JSON.parse(sessionData)
//         setCourses(getFilteredCourses(parsed))
//         setLoading(false)
//         return
//       }

//       const res = await fetch(API_URL)
//       if (!res.ok) throw new Error('Failed to fetch courses')
//       const data = await res.json()
//       const mappedCourses: Course[] = []

//       // if (data?.lms_subject) {
//       //   Object.keys(data.lms_subject).forEach((category) => {
//       //     data.lms_subject[category].forEach((item: any, index: number) => {
//       //       const course: Course = {
//       //         id: item.subject_id ?? index,
//       //         title: item.standard_name ?? 'Untitled',
//       //         description: item.subject_name ?? 'No description available',
//       //         thumbnail: item.display_image?.trim() || DEFAULT_THUMBNAIL,
//       //         contentType: 'video',
//       //         category: item.content_category || category,
//       //         difficulty: 'beginner',
//       //         short_name: item.short_name ?? 'N/A',
//       //         subject_type: item.subject_type ?? 'N/A',
//       //         progress: 0,
//       //         instructor: 'Admin',
//       //         isNew: true,
//       //         isMandatory: false,
//       //       }

//       //       mappedCourses.push(course)
//       //     })
//       //   })
//       // }
//       if (data?.lms_subject) {
//         Object.keys(data.lms_subject).forEach((category) => {
//           data.lms_subject[category].forEach((item: any, index: number) => {
//             const course: Course = {
//               id: item.subject_id ?? index, // keep for unique key
//               subject_id: item.subject_id ?? 0,
//               standard_id: item.standard_id ?? 0,
//               title: item.standard_name ?? 'Untitled',
//               description: item.subject_name ?? 'No description available',
//               thumbnail: item.display_image?.trim() || DEFAULT_THUMBNAIL,
//               contentType: 'video',
//               category: item.content_category || category,
//               difficulty: 'beginner',
//               short_name: item.short_name ?? 'N/A',
//               subject_type: item.subject_type ?? 'N/A',
//               progress: 0,
//               instructor: 'Admin',
//               isNew: true,
//               isMandatory: false,
//             }

//             mappedCourses.push(course)
//           })
//         })
//       }


//       setCourses(getFilteredCourses(mappedCourses))
//       sessionStorage.setItem('courses', JSON.stringify(mappedCourses))
//     } catch (error) {
//       console.error('Error fetching courses:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchCourses()
//   }, [searchQuery, sortBy, filters])

//   // Handlers
//   const handleFilterChange = (key: keyof Filters, values: string[]) => {
//     setFilters((prev) => ({ ...prev, [key]: values }))
//   }

//   const handleClearAllFilters = () => {
//     setFilters({
//       contentType: [],
//       categories: [],
//       skillLevel: [],
//       duration: [],
//       completionStatus: [],
//     })
//     setSearchQuery('')
//   }

//   const handleEnroll = (courseId: number) => {
//     console.log(`Enrolling in course ${courseId}`)
//   }

//   const handleViewDetails = (subject_id: number, standard_id: number) => {
//     if(subject_id && standard_id){
//       setSubjectId(subject_id);
//       setStandarId(standard_id);
//       setIsViewOpen(true);
//     }
//   }

//   const handleLoadMore = async () => {
//     return new Promise<void>((resolve) => {
//       setTimeout(() => {
//         setHasMore(false)
//         resolve()
//       }, 1000)
//     })
//   }

//   const handleSaveCourse = (data: Partial<Course>) => {
//     if (courseToEdit) {
//       // Edit existing course
//       setCourses((prev) =>
//         prev.map((c) => (c.id === courseToEdit.id ? { ...c, ...data } : c))
//       )
//     } else {
//       // Add new course
//       const newCourse: Course = {
//         id: Date.now(),
//         subject_id: data.subject_id ?? 0,   // new field
//         standard_id: data.standard_id ?? 0, // new field
//         title: data.title || 'Untitled',
//         description: data.description || '',
//         thumbnail: data.thumbnail || DEFAULT_THUMBNAIL,
//         contentType: data.contentType || 'video',
//         category: data.category || 'General',
//         difficulty: data.difficulty || 'beginner',
//         short_name: data.short_name || 'N/A',
//         subject_type: data.subject_type || 'N/A',
//         progress: data.progress ?? 0,
//         instructor: data.instructor || 'Admin',
//         isNew: true,
//         isMandatory: false,
//       }
//       setCourses((prev) => [newCourse, ...prev])
//     }

//     setCourseToEdit(null)
//     setIsAddDialogOpen(false)
//   }

//   const handleEditCourse = (course: Course) => {
//     setCourseToEdit(course)
//     setIsAddDialogOpen(true)
//   }

//   return (<>
//   {!isViewOpen ? (
//     <div className="min-h-screen bg-background">
//       <main>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-foreground">
//                 Learning Catalog
//               </h1>
//               <p className="text-muted-foreground mt-2">
//                 Discover and enroll in courses to advance your skills and career
//               </p>
//             </div>

//             <div className="flex gap-2">
//               <Button
//                 onClick={() => {
//                   setCourseToEdit(null)
//                   setIsAddDialogOpen(true)
//                 }}
//                 className="flex items-center gap-2"
//               >
//                 <Icon name="Plus" size={16} className="mr-2" />
//                 Add Course
//               </Button>

//               <Button
//                 variant="outline"
//                 className="lg:hidden"
//                 onClick={() => setIsFilterDrawerOpen(true)}
//               >
//                 <Icon name="Filter" size={16} className="mr-2" />
//                 Filters
//               </Button>
//             </div>
//           </div>

//           {/* Body */}
//           <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
//             {isFilterVisible && (
//               <div className="lg:col-span-3 hidden lg:block">
//                 <FilterSidebar
//                   filters={filters}
//                   onFilterChange={handleFilterChange}
//                   onClearAll={handleClearAllFilters}
//                 />
//               </div>
//             )}

//             <div className={isFilterVisible ? 'lg:col-span-6' : 'lg:col-span-9'}>
//               <SearchToolbar
//                 searchQuery={searchQuery}
//                 onSearchChange={setSearchQuery}
//                 viewMode={viewMode}
//                 onViewModeChange={setViewMode}
//                 resultsCount={courses.length}
//                 filters={filters}
//                 onFilterChange={handleFilterChange}
//                 onClearAll={handleClearAllFilters}
//               />

//               <CourseGrid
//                 courses={courses}
//                 viewMode={viewMode}
//                 loading={loading ? true : undefined} // avoids React warning
//                 onEnroll={handleEnroll}
//                 onViewDetails={handleViewDetails}
//                 onLoadMore={handleLoadMore}
//                 hasMore={hasMore}
//                 onEditCourse={handleEditCourse} // Pass edit handler
//               />
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Add/Edit Dialog */}
//       <AddCourseDialog
//         open={isAddDialogOpen}
//         onOpenChange={setIsAddDialogOpen}
//         onSave={handleSaveCourse}
//         course={courseToEdit} // Pass course to edit
//       />
//     </div>
//     ) : (
//     <ViewDetail subject_id={subjectId} standard_id={standardId} />
//   )}
//     </>
//   )
// }

// export default LearningCatalog


'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import FilterSidebar from './components/FilterSidebar'
import SearchToolbar from './components/SearchToolbar'
import CourseGrid from './components/CourseGrid'
import Icon from '@/components/AppIcon'
import { Button } from '../../../components/ui/button'
import AddCourseDialog from './components/AddCourseDialog'
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
}

type Filters = {
  contentType: string[]
  categories: string[]
  skillLevel: string[]
  duration: string[]
  completionStatus: string[]
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
    contentType: [],
    categories: [],
    skillLevel: [],
    duration: [],
    completionStatus: [],
  })

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

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

  // ✅ Filtering helper
  const getFilteredCourses = (allCourses: Course[]): Course[] => {
    let filtered = [...allCourses]

    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filters.contentType.length > 0) {
      filtered = filtered.filter((course) =>
        filters.contentType.includes(course.contentType)
      )
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter((course) =>
        filters.categories.includes(course.category)
      )
    }

    if (filters.skillLevel.length > 0) {
      filtered = filtered.filter((course) =>
        filters.skillLevel.includes(course.difficulty)
      )
    }

    if (filters.completionStatus.length > 0) {
      filtered = filtered.filter((course) => {
        if (filters.completionStatus.includes('completed') && course.progress === 100) return true
        if (filters.completionStatus.includes('in-progress') && course.progress > 0 && course.progress < 100) return true
        if (filters.completionStatus.includes('not-started') && course.progress === 0) return true
        return false
      })
    }

    return filtered
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
              title: item.standard_name ?? 'Untitled',
              description: item.subject_name ?? 'No description available',
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
            }
            mappedCourses.push(course)
          })
        })
      }

      console.log('✅ Mapped courses:', mappedCourses)

      setCourses(getFilteredCourses(mappedCourses))
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
  }, [sessionData, searchQuery, sortBy, filters])

  // ✅ Handlers
  const handleFilterChange = (key: keyof Filters, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }))
  }

  const handleClearAllFilters = () => {
    setFilters({
      contentType: [],
      categories: [],
      skillLevel: [],
      duration: [],
      completionStatus: [],
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

  const handleLoadMore = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setHasMore(false)
        resolve()
      }, 1000)
    })
  }

  const handleSaveCourse = (data: Partial<Course>) => {
    if (courseToEdit) {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseToEdit.id ? { ...c, ...data } : c))
      )
    } else {
      const newCourse: Course = {
        id: Date.now(),
        subject_id: data.subject_id ?? 0,
        standard_id: data.standard_id ?? 0,
        title: data.title || 'Untitled',
        description: data.description || '',
        thumbnail: data.thumbnail || DEFAULT_THUMBNAIL,
        contentType: data.contentType || 'video',
        category: data.category || 'General',
        difficulty: data.difficulty || 'beginner',
        short_name: data.short_name || 'N/A',
        subject_type: data.subject_type || 'N/A',
        progress: data.progress ?? 0,
        instructor: data.instructor || 'Admin',
        isNew: true,
        isMandatory: false,
      }
      setCourses((prev) => [newCourse, ...prev])
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
        <div className="min-h-screen bg-background">
          <main>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Learning Catalog
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Discover and enroll in courses to advance your skills and career
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setCourseToEdit(null)
                      setIsAddDialogOpen(true)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Add Course
                  </Button>

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
                    resultsCount={courses.length}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearAll={handleClearAllFilters}
                  />

                  <CourseGrid
                    courses={courses}
                    viewMode={viewMode}
                    loading={loading ? true : undefined}
                    onEnroll={handleEnroll}
                    onViewDetails={handleViewDetails}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    onEditCourse={handleEditCourse}
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Add/Edit Dialog */}
          <AddCourseDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSave={handleSaveCourse}
            course={courseToEdit}
          />
        </div>
      ) : (
        <ViewDetail subject_id={subjectId} standard_id={standardId} />
      )}
    </>
  )
}

export default LearningCatalog
