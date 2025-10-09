// 'use client'

// import React, { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// import FilterSidebar from './components/FilterSidebar'
// import SearchToolbar from './components/SearchToolbar'
// import CourseGrid from './components/CourseGrid'
// import Icon from '@/components/AppIcon'
// import { Button } from '../../../components/ui/button'
// import AddCourseDialog from './components/AddCourseDialog'
// import AiCourseDialog from './components/AiCourseDialog'
// import ViewDetail from '../LMS/ViewChepter/ViewDetail'

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
//   display_name: string
//   sort_order: string
//   status: string
//   subject_category?: string
// }

// type Filters = {
//   subjectTypes: string[]
//   categories: string[]
// }

// const DEFAULT_THUMBNAIL =
//   'https://erp.triz.co.in/storage/SubStdMapping/SubStdMap_2020-12-29_05-56-03.svg'

// const LearningCatalog: React.FC = () => {
//   const router = useRouter()

//   const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [isViewOpen, setIsViewOpen] = useState(false)
//   const [subjectId, setSubjectId] = useState(0)
//   const [standardId, setStandardId] = useState(0)
//   const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)
//   const [isFilterVisible, setIsFilterVisible] = useState(false)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [sortBy, setSortBy] = useState('relevance')
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
//   const [filters, setFilters] = useState<Filters>({
//     subjectTypes: [],
//     categories: [],
//   })

//   const [courses, setCourses] = useState<Course[]>([])
//   const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
//   const [loading, setLoading] = useState(true)
//   const [hasMore, setHasMore] = useState(true)
//   const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

//   // ✅ Session data
//   const [sessionData, setSessionData] = useState<any>(null)

//   useEffect(() => {
//     const userData = localStorage.getItem('userData')
//     if (userData) {
//       const parsed = JSON.parse(userData)
//       console.log('✅ Loaded session data:', parsed)
//       setSessionData(parsed)
//     } else {
//       console.warn('⚠️ No session data found in localStorage')
//     }
//   }, [])

//   // ✅ Build API URL
//   const buildApiUrl = () => {
//     if (!sessionData) return ''
//     return `${sessionData.APP_URL}/lms/course_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_id=${sessionData.user_id}&user_profile_name=${sessionData.user_profile_name}`
//   }

//   // ✅ Fetch courses
//   const fetchCourses = async () => {
//     if (!sessionData) return
//     try {
//       setLoading(true)

//       const apiUrl = buildApiUrl()
//       console.log('📡 Fetching courses from:', apiUrl)

//       const res = await fetch(apiUrl)
//       if (!res.ok) throw new Error(`❌ Failed to fetch courses. Status: ${res.status}`)

//       const data = await res.json()
//       console.log('📦 Raw API data:', data)

//       const mappedCourses: Course[] = []

//       if (data?.lms_subject) {
//         Object.keys(data.lms_subject).forEach((category) => {
//           data.lms_subject[category].forEach((item: any, index: number) => {
//             const course: Course = {
//               id: item.subject_id ?? index,
//               subject_id: item.subject_id ?? 0,
//               standard_id: item.standard_id ?? 0,
//               title: item.subject_name ?? 'Untitled',
//               description: item.standard_name ?? 'No description available',
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
//               display_name: item.display_name ?? item.standard_name ?? 'Untitled',
//               sort_order: item.sort_order ?? '1',
//               status: item.status ?? '1',
//               subject_category: category // Add subject_category for filtering
//             }
//             mappedCourses.push(course)
//           })
//         })
//       }

//       console.log('✅ Mapped courses:', mappedCourses)
//       setCourses(mappedCourses)
//       setFilteredCourses(mappedCourses)
//     } catch (error) {
//       console.error('🚨 Error fetching courses:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (sessionData) {
//       fetchCourses()
//     }
//   }, [sessionData])

//   // ✅ Apply filters to courses
//   useEffect(() => {
//     const applyFilters = () => {
//       let result = [...courses]

//       // Search query filter
//       if (searchQuery) {
//         const query = searchQuery.toLowerCase()
//         result = result.filter(course =>
//           // course.display_name?.toLowerCase().includes(query) ||
//           // course.subject_category?.toLowerCase().includes(query) ||
//           // course.subject_type?.toLowerCase().includes(query)
//           // course.display_name?.toLowerCase().includes(query) ||
//           course.subject_category?.toLowerCase().includes(query) ||
//           course.subject_type?.toLowerCase().includes(query) ||
//           course.title?.toLowerCase().includes(query) || // subject_name
//           course.description?.toLowerCase().includes(query) || // standard_name
//           course.short_name?.toLowerCase().includes(query) // short_name
//         )
//       }

//       // Category filter
//       if (filters.categories.length > 0) {
//         result = result.filter(course =>
//           filters.categories.includes((course.category ?? '').toLowerCase().replace(/\s+/g, '-'))
//         )
//       }

//       // Subject type filter
//       if (filters.subjectTypes.length > 0) {
//         result = result.filter(course =>
//           filters.subjectTypes.includes(course.subject_type?.toLowerCase().replace(/\s+/g, '-'))
//         )
//       }

//       setFilteredCourses(result)
//     }

//     applyFilters()
//   }, [courses, searchQuery, filters])

//   // ✅ Handlers
//   const handleFilterChange = (key: keyof Filters, values: string[]) => {
//     setFilters(prev => ({
//       ...prev,
//       [key]: values
//     }))
//   }

//   const handleClearAllFilters = () => {
//     setFilters({
//       subjectTypes: [],
//       categories: [],
//     })
//     setSearchQuery('')
//   }

//   const handleEnroll = (courseId: number) => {
//     console.log(`📚 Enrolling in course ${courseId}`)
//   }

//   const handleViewDetails = (subject_id: number, standard_id: number) => {
//     if (subject_id && standard_id) {
//       setSubjectId(subject_id)
//       setStandardId(standard_id)
//       setIsViewOpen(true)
//     }
//   }

//   const handleCloseViewDetail = () => {
//     setIsViewOpen(false)
//     // Refresh courses after returning from view detail
//     if (sessionData) {
//       fetchCourses()
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
//     // After saving, refresh the course list
//     if (sessionData) {
//       fetchCourses()
//     }
//     setCourseToEdit(null)
//     setIsAddDialogOpen(false)
//   }

//   const handleEditCourse = (course: Course) => {
//     setCourseToEdit(course)
//     setIsAddDialogOpen(true)
//   }

//   return (
//     <>
//       {!isViewOpen ? (
//         <div className="min-h-screen bg-background rounded-xl">
//           <main>
//             <div className="max-w-full o px-4 sm:px-6 lg:px-8 py-8">
//               {/* Header */}
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h1 className="text-2xl font-bold text-foreground">
//                     Learning Catalog
//                   </h1>
//                   <p className="text-muted-foreground mt-2 text-sm">
//                     Discover and enroll in courses to advance your skills and career
//                   </p>
//                 </div>

//                 <div className="flex gap-2">
//                   {sessionData &&
//                     sessionData.user_profile_name &&
//                     ["ADMIN", "HR"].includes(sessionData.user_profile_name.toUpperCase()) ? (
//                     <>
//                     <Button

//                         onClick={() => {
//                           setCourseToEdit(null)
//                           setIsAddDialogOpen(true)
//                         }}
//                         className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
//                       >
//                         <Icon name="Plus" size={16} className="mr-2" />
//                        External Course
//                       </Button>
//                       <Button
//                         onClick={() => setIsAiDialogOpen(true)}
//                         className="flex items-center gap-2 bg-[#e8f0ff] text-blue-700 hover:bg-blue-100 transition-colors"
//                       >
//                         <span className="mdi mdi-creation text-xl"></span>
//                         Build with AI
//                       </Button>

//                       <Button

//                         onClick={() => {
//                           setCourseToEdit(null)
//                           setIsAddDialogOpen(true)
//                         }}
//                         className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
//                       >
//                         <Icon name="Plus" size={16} className="mr-2" />
//                         Create Course
//                       </Button>
//                     </>
//                   ) : null}

//                   <Button
//                     variant="outline"
//                     className="lg:hidden"
//                     onClick={() => setIsFilterDrawerOpen(true)}
//                   >
//                     <Icon name="Filter" size={16} className="mr-2" />
//                     Filters
//                   </Button>
//                 </div>
//               </div>

//               {/* Body */}
//               <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
//                 {isFilterVisible && (
//                   <div className="lg:col-span-3 hidden lg:block">
//                     <FilterSidebar
//                       filters={filters}
//                       onFilterChange={handleFilterChange}
//                       onClearAll={handleClearAllFilters}
//                     />
//                   </div>
//                 )}

//                 <div className={isFilterVisible ? 'lg:col-span-6' : 'lg:col-span-9'}>
//                   <SearchToolbar
//                     searchQuery={searchQuery}
//                     onSearchChange={setSearchQuery}
//                     viewMode={viewMode}
//                     onViewModeChange={setViewMode}
//                     resultsCount={filteredCourses.length}
//                     filters={filters}
//                     onFilterChange={handleFilterChange}
//                     onClearAll={handleClearAllFilters}
//                   />

//                   <CourseGrid
//                     totalcourse={courses.length}
//                     courses={filteredCourses}
//                     viewMode={viewMode}
//                     loading={loading ? true : undefined}
//                     onEnroll={handleEnroll}
//                     onViewDetails={handleViewDetails}
//                     onLoadMore={handleLoadMore}
//                     hasMore={hasMore}
//                     onEditCourse={handleEditCourse}
//                     sessionInfo={sessionData}
//                   />
//                 </div>
//               </div>
//             </div>
//           </main>

//           <AiCourseDialog
//             open={isAiDialogOpen}
//             onOpenChange={setIsAiDialogOpen}
//             onGenerate={(data) => {
//               console.log("🚀 AI should build a course with:", data);
//               // here you can call API to actually generate a course
//             }}
//           />
//           {/* Add/Edit Dialog */}
//           <AddCourseDialog
//             open={isAddDialogOpen}
//             onOpenChange={setIsAddDialogOpen}
//             onSave={handleSaveCourse}
//             course={courseToEdit}
//           />
//         </div>
//       ) : (
//         <ViewDetail subject_id={subjectId} standard_id={standardId} onClose={handleCloseViewDetail} />
//       )}
//     </>
//   )
// }

// export default LearningCatalog;


// 'use client'

// import React, { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// import FilterSidebar from './components/FilterSidebar'
// import SearchToolbar from './components/SearchToolbar'
// import CourseGrid from './components/CourseGrid'
// import Icon from '@/components/AppIcon'
// import { Button } from '../../../components/ui/button'
// import AddCourseDialog from './components/AddCourseDialog'
// import AiCourseDialog from './components/AiCourseDialog'
// import ViewDetail from '../LMS/ViewChepter/ViewDetail'

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
//   display_name: string
//   sort_order: string
//   status: string
//   subject_category?: string
//   is_external?: boolean
//   external_url?: string
//   platform?: string
// }

// type Filters = {
//   subjectTypes: string[]
//   categories: string[]
// }

// const DEFAULT_THUMBNAIL =
//   'https://erp.triz.co.in/storage/SubStdMapping/SubStdMap_2020-12-29_05-56-03.svg'

// const LearningCatalog: React.FC = () => {
//   const router = useRouter()

//   const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [isViewOpen, setIsViewOpen] = useState(false)
//   const [subjectId, setSubjectId] = useState(0)
//   const [standardId, setStandardId] = useState(0)
//   const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)
//   const [isFilterVisible, setIsFilterVisible] = useState(false)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [sortBy, setSortBy] = useState('relevance')
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
//   const [filters, setFilters] = useState<Filters>({
//     subjectTypes: [],
//     categories: [],
//   })

//   const [courses, setCourses] = useState<Course[]>([])
//   const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
//   const [loading, setLoading] = useState(true)
//   const [hasMore, setHasMore] = useState(true)
//   const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
//   const [isExternalCourseDialogOpen, setIsExternalCourseDialogOpen] = useState(false)

//   // ✅ Session data
//   const [sessionData, setSessionData] = useState<any>(null)

//   // ✅ Dummy external courses data
//   const dummyExternalCourses = [
//     {
//       id: 1001,
//       title: "Introduction to Computer Science",
//       description: "Learn the basics of computer science and programming with Python from Harvard University.",
//       thumbnail: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop",
//       platform: "edX",
//       instructor: "Harvard University",
//       duration: "8 weeks",
//       level: "Beginner",
//       rating: 4.8,
//       students: "2.3M",
//       url: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
//       category: "Computer Science",
//       price: "Free",
//       language: "English"
//     },
//     {
//       id: 1002,
//       title: "Machine Learning Specialization",
//       description: "Master machine learning fundamentals and build practical applications with real-world projects.",
//       thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
//       platform: "Coursera",
//       instructor: "Andrew Ng",
//       duration: "3 months",
//       level: "Intermediate",
//       rating: 4.9,
//       students: "1.8M",
//       url: "https://www.coursera.org/specializations/machine-learning-introduction",
//       category: "Data Science",
//       price: "$49/month",
//       language: "English"
//     },
//     {
//       id: 1003,
//       title: "The Complete Web Development Bootcamp",
//       description: "Become a full-stack web developer with HTML, CSS, JavaScript, React, Node.js, and more.",
//       thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
//       platform: "Udemy",
//       instructor: "Dr. Angela Yu",
//       duration: "55 hours",
//       level: "Beginner",
//       rating: 4.7,
//       students: "850K",
//       url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
//       category: "Web Development",
//       price: "$84.99",
//       language: "English"
//     }
//   ]

//   useEffect(() => {
//     const userData = localStorage.getItem('userData')
//     if (userData) {
//       const parsed = JSON.parse(userData)
//       console.log('✅ Loaded session data:', parsed)
//       setSessionData(parsed)
//     } else {
//       console.warn('⚠️ No session data found in localStorage')
//     }
//   }, [])

//   // ✅ Build API URL
//   const buildApiUrl = () => {
//     if (!sessionData) return ''
//     return `${sessionData.APP_URL}/lms/course_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_id=${sessionData.user_id}&user_profile_name=${sessionData.user_profile_name}`
//   }

//   // ✅ Fetch courses
//   const fetchCourses = async () => {
//     if (!sessionData) return
//     try {
//       setLoading(true)

//       const apiUrl = buildApiUrl()
//       console.log('📡 Fetching courses from:', apiUrl)

//       const res = await fetch(apiUrl)
//       if (!res.ok) throw new Error(`❌ Failed to fetch courses. Status: ${res.status}`)

//       const data = await res.json()
//       console.log('📦 Raw API data:', data)

//       const mappedCourses: Course[] = []

//       if (data?.lms_subject) {
//         Object.keys(data.lms_subject).forEach((category) => {
//           data.lms_subject[category].forEach((item: any, index: number) => {
//             const course: Course = {
//               id: item.subject_id ?? index,
//               subject_id: item.subject_id ?? 0,
//               standard_id: item.standard_id ?? 0,
//               title: item.subject_name ?? 'Untitled',
//               description: item.standard_name ?? 'No description available',
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
//               display_name: item.display_name ?? item.standard_name ?? 'Untitled',
//               sort_order: item.sort_order ?? '1',
//               status: item.status ?? '1',
//               subject_category: category // Add subject_category for filtering
//             }
//             mappedCourses.push(course)
//           })
//         })
//       }

//       console.log('✅ Mapped courses:', mappedCourses)
//       setCourses(mappedCourses)
//       setFilteredCourses(mappedCourses)
//     } catch (error) {
//       console.error('🚨 Error fetching courses:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (sessionData) {
//       fetchCourses()
//     }
//   }, [sessionData])

//   // ✅ Apply filters to courses
//   useEffect(() => {
//     const applyFilters = () => {
//       let result = [...courses]

//       // Search query filter
//       if (searchQuery) {
//         const query = searchQuery.toLowerCase()
//         result = result.filter(course =>
//           course.subject_category?.toLowerCase().includes(query) ||
//           course.subject_type?.toLowerCase().includes(query) ||
//           course.title?.toLowerCase().includes(query) || // subject_name
//           course.description?.toLowerCase().includes(query) || // standard_name
//           course.short_name?.toLowerCase().includes(query) // short_name
//         )
//       }

//       // Category filter
//       if (filters.categories.length > 0) {
//         result = result.filter(course =>
//           filters.categories.includes((course.category ?? '').toLowerCase().replace(/\s+/g, '-'))
//         )
//       }

//       // Subject type filter
//       if (filters.subjectTypes.length > 0) {
//         result = result.filter(course =>
//           filters.subjectTypes.includes(course.subject_type?.toLowerCase().replace(/\s+/g, '-'))
//         )
//       }

//       setFilteredCourses(result)
//     }

//     applyFilters()
//   }, [courses, searchQuery, filters])

//   // ✅ Handlers
//   const handleFilterChange = (key: keyof Filters, values: string[]) => {
//     setFilters(prev => ({
//       ...prev,
//       [key]: values
//     }))
//   }

//   const handleClearAllFilters = () => {
//     setFilters({
//       subjectTypes: [],
//       categories: [],
//     })
//     setSearchQuery('')
//   }

//   const handleEnroll = (courseId: number) => {
//     console.log(`📚 Enrolling in course ${courseId}`)
//   }

//   const handleViewDetails = (subject_id: number, standard_id: number) => {
//     if (subject_id && standard_id) {
//       setSubjectId(subject_id)
//       setStandardId(standard_id)
//       setIsViewOpen(true)
//     }
//   }

//   const handleCloseViewDetail = () => {
//     setIsViewOpen(false)
//     // Refresh courses after returning from view detail
//     if (sessionData) {
//       fetchCourses()
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
//     // After saving, refresh the course list
//     if (sessionData) {
//       fetchCourses()
//     }
//     setCourseToEdit(null)
//     setIsAddDialogOpen(false)
//   }

//   const handleEditCourse = (course: Course) => {
//     setCourseToEdit(course)
//     setIsAddDialogOpen(true)
//   }

//   // ✅ Handle adding external course
//   const handleAddExternalCourse = (externalCourse: any) => {
//     console.log("🌐 Adding external course:", externalCourse);
    
//     const newExternalCourse: Course = {
//       id: externalCourse.id,
//       subject_id: externalCourse.id,
//       standard_id: 0,
//       title: externalCourse.title,
//       description: externalCourse.description,
//       thumbnail: externalCourse.thumbnail,
//       contentType: 'external',
//       category: externalCourse.category,
//       difficulty: externalCourse.level?.toLowerCase() || 'intermediate',
//       short_name: externalCourse.platform?.substring(0, 3).toUpperCase() || 'EXT',
//       subject_type: 'external',
//       progress: 0,
//       instructor: externalCourse.instructor,
//       isNew: true,
//       isMandatory: false,
//       display_name: externalCourse.title,
//       sort_order: '1',
//       status: '1',
//       subject_category: 'external',
//       is_external: true,
//       external_url: externalCourse.url,
//       platform: externalCourse.platform
//     };

//     // Add to courses list
//     setCourses(prev => [...prev, newExternalCourse]);
//     setIsExternalCourseDialogOpen(false);
    
//     // Show success message
//     alert(`✅ Course "${externalCourse.title}" from ${externalCourse.platform} added successfully!`);
//   }

//   return (
//     <>
//       {!isViewOpen ? (
//         <div className="min-h-screen bg-background rounded-xl">
//           <main>
//             <div className="max-w-full o px-4 sm:px-6 lg:px-8 py-8">
//               {/* Header */}
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h1 className="text-2xl font-bold text-foreground">
//                     Learning Catalog
//                   </h1>
//                   <p className="text-muted-foreground mt-2 text-sm">
//                     Discover and enroll in courses to advance your skills and career
//                   </p>
//                 </div>

//                 <div className="flex gap-2">
//                   {sessionData &&
//                     sessionData.user_profile_name &&
//                     ["ADMIN", "HR"].includes(sessionData.user_profile_name.toUpperCase()) ? (
//                     <>
//                       <Button
//                         onClick={() => setIsExternalCourseDialogOpen(true)}
//                         className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
//                       >
//                         <Icon name="Plus" size={16} className="mr-2" />
//                         External Course
//                       </Button>
                      
//                       <Button
//                         onClick={() => setIsAiDialogOpen(true)}
//                         className="flex items-center gap-2 bg-[#e8f0ff] text-blue-700 hover:bg-blue-100 transition-colors"
//                       >
//                         <span className="mdi mdi-creation text-xl"></span>
//                         Build with AI
//                       </Button>

//                       <Button
//                         onClick={() => {
//                           setCourseToEdit(null)
//                           setIsAddDialogOpen(true)
//                         }}
//                         className="flex items-center gap-2 bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors"
//                       >
//                         <Icon name="Plus" size={16} className="mr-2" />
//                         Create Course
//                       </Button>
//                     </>
//                   ) : null}

//                   <Button
//                     variant="outline"
//                     className="lg:hidden"
//                     onClick={() => setIsFilterDrawerOpen(true)}
//                   >
//                     <Icon name="Filter" size={16} className="mr-2" />
//                     Filters
//                   </Button>
//                 </div>
//               </div>

//               {/* Body */}
//               <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
//                 {isFilterVisible && (
//                   <div className="lg:col-span-3 hidden lg:block">
//                     <FilterSidebar
//                       filters={filters}
//                       onFilterChange={handleFilterChange}
//                       onClearAll={handleClearAllFilters}
//                     />
//                   </div>
//                 )}

//                 <div className={isFilterVisible ? 'lg:col-span-6' : 'lg:col-span-9'}>
//                   <SearchToolbar
//                     searchQuery={searchQuery}
//                     onSearchChange={setSearchQuery}
//                     viewMode={viewMode}
//                     onViewModeChange={setViewMode}
//                     resultsCount={filteredCourses.length}
//                     filters={filters}
//                     onFilterChange={handleFilterChange}
//                     onClearAll={handleClearAllFilters}
//                   />

//                   <CourseGrid
//                     totalcourse={courses.length}
//                     courses={filteredCourses}
//                     viewMode={viewMode}
//                     loading={loading ? true : undefined}
//                     onEnroll={handleEnroll}
//                     onViewDetails={handleViewDetails}
//                     onLoadMore={handleLoadMore}
//                     hasMore={hasMore}
//                     onEditCourse={handleEditCourse}
//                     sessionInfo={sessionData}
//                   />
//                 </div>
//               </div>
//             </div>
//           </main>

//           {/* External Course Dialog */}
//           <ExternalCourseDialog
//             open={isExternalCourseDialogOpen}
//             onOpenChange={setIsExternalCourseDialogOpen}
//             onAddCourse={handleAddExternalCourse}
//             dummyCourses={dummyExternalCourses}
//           />

//           <AiCourseDialog
//             open={isAiDialogOpen}
//             onOpenChange={setIsAiDialogOpen}
//             onGenerate={(data) => {
//               console.log("🚀 AI should build a course with:", data);
//               // here you can call API to actually generate a course
//             }}
//           />
          
//           {/* Add/Edit Dialog */}
//           <AddCourseDialog
//             open={isAddDialogOpen}
//             onOpenChange={setIsAddDialogOpen}
//             onSave={handleSaveCourse}
//             course={courseToEdit}
//           />
//         </div>
//       ) : (
//         <ViewDetail subject_id={subjectId} standard_id={standardId} onClose={handleCloseViewDetail} />
//       )}
//     </>
//   )
// }

// // External Course Dialog Component
// const ExternalCourseDialog = ({ 
//   open, 
//   onOpenChange, 
//   onAddCourse,
//   dummyCourses 
// }: { 
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onAddCourse: (course: any) => void
//   dummyCourses: any[]
// }) => {
//   const getPlatformColor = (platform: string) => {
//     switch (platform.toLowerCase()) {
//       case 'edx': return 'bg-blue-100 text-blue-800 border-blue-200'
//       case 'coursera': return 'bg-purple-100 text-purple-800 border-purple-200'
//       case 'udemy': return 'bg-red-100 text-red-800 border-red-200'
//       default: return 'bg-gray-100 text-gray-800 border-gray-200'
//     }
//   }

//   const getPlatformIcon = (platform: string) => {
//     switch (platform.toLowerCase()) {
//       case 'edx': return 'mdi-school'
//       case 'coursera': return 'mdi-laptop'
//       case 'udemy': return 'mdi-video'
//       default: return 'mdi-link'
//     }
//   }

//   return (
//     <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${open ? 'block' : 'hidden'}`}>
//       <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
//         <div className="flex items-center justify-between p-6 border-b">
//           <h2 className="text-xl font-semibold flex items-center gap-2">
//             <span className="mdi mdi-link text-green-600 text-2xl"></span>
//             Add External Course
//           </h2>
//           <button
//             onClick={() => onOpenChange(false)}
//             className="text-gray-500 hover:text-gray-700 text-xl"
//           >
//             <span className="mdi mdi-close"></span>
//           </button>
//         </div>

//         <div className="p-6">
//           <div className="mb-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               Popular External Courses
//             </h3>
//             <p className="text-gray-600 text-sm">
//               Select from these popular courses or add a custom external course
//             </p>
//           </div>

//           {/* Dummy Course Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             {dummyCourses.map((course) => (
//               <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
//                 <div className="relative">
//                   <img 
//                     src={course.thumbnail} 
//                     alt={course.title}
//                     className="w-full h-48 object-cover"
//                   />
//                   <div className="absolute top-3 right-3">
//                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(course.platform)}`}>
//                       {course.platform}
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="p-4">
//                   <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
//                     {course.title}
//                   </h4>
                  
//                   <p className="text-gray-600 text-sm mb-3 line-clamp-2">
//                     {course.description}
//                   </p>
                  
//                   <div className="flex items-center text-sm text-gray-500 mb-2">
//                     <span className="mdi mdi-account mr-1"></span>
//                     {course.instructor}
//                   </div>
                  
//                   <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
//                     <div className="flex items-center">
//                       <span className="mdi mdi-clock-outline mr-1"></span>
//                       {course.duration}
//                     </div>
//                     <div className="flex items-center">
//                       <span className="mdi mdi-star text-yellow-500 mr-1"></span>
//                       {course.rating}
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between mb-3">
//                     <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
//                       {course.level}
//                     </span>
//                     <span className="text-sm font-semibold text-green-600">
//                       {course.price}
//                     </span>
//                   </div>
                  
//                   <button
//                     onClick={() => onAddCourse(course)}
//                     className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
//                   >
//                     <span className="mdi mdi-plus"></span>
//                     Add to Catalog
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Custom Course Form */}
//           <div className="border-t pt-6">
//             <h4 className="text-lg font-medium text-gray-900 mb-4">
//               Add Custom External Course
//             </h4>
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <p className="text-gray-600 text-sm mb-4">
//                 Can't find the course you're looking for? Add a custom external course manually.
//               </p>
//               <button
//                 onClick={() => {
//                   // For now, we'll just show a message
//                   alert("Custom course feature coming soon! For now, please use one of the pre-defined courses above.")
//                 }}
//                 className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
//               >
//                 <span className="mdi mdi-plus"></span>
//                 Add Custom Course
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end p-6 border-t bg-gray-50">
//           <button
//             onClick={() => onOpenChange(false)}
//             className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
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
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [isExternalCourseDialogOpen, setIsExternalCourseDialogOpen] = useState(false)
  const [activePlatformTab, setActivePlatformTab] = useState('all')

  // ✅ Session data
  const [sessionData, setSessionData] = useState<any>(null)

  // ✅ Platform-wise course data
  const platformCourses = {
    edx: [
      {
        id: 1001,
        title: "Introduction to Computer Science",
        description: "Learn the basics of computer science and programming with Python from Harvard University.",
        thumbnail: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop",
        platform: "edX",
        instructor: "Harvard University",
        duration: "8 weeks",
        level: "Beginner",
        rating: 4.8,
        students: "2.3M",
        url: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
        category: "Computer Science",
        price: "Free",
        language: "English"
      },
      {
        id: 1002,
        title: "Data Science Professional Certificate",
        description: "Master data science skills with Python, SQL, and machine learning from Harvard.",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
        platform: "edX",
        instructor: "Harvard University",
        duration: "6 months",
        level: "Intermediate",
        rating: 4.7,
        students: "1.2M",
        url: "https://www.edx.org/professional-certificate/harvardx-data-science",
        category: "Data Science",
        price: "$792",
        language: "English"
      },
      {
        id: 1003,
        title: "Artificial Intelligence with Python",
        description: "Learn the fundamentals of AI and machine learning using Python programming.",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
        platform: "edX",
        instructor: "MIT",
        duration: "12 weeks",
        level: "Intermediate",
        rating: 4.6,
        students: "890K",
        url: "https://www.edx.org/course/artificial-intelligence-with-python",
        category: "Artificial Intelligence",
        price: "Free",
        language: "English"
      }
    ],
    coursera: [
      {
        id: 2001,
        title: "Machine Learning Specialization",
        description: "Master machine learning fundamentals and build practical applications with real-world projects.",
        thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
        platform: "Coursera",
        instructor: "Andrew Ng",
        duration: "3 months",
        level: "Intermediate",
        rating: 4.9,
        students: "1.8M",
        url: "https://www.coursera.org/specializations/machine-learning-introduction",
        category: "Data Science",
        price: "$49/month",
        language: "English"
      },
      {
        id: 2002,
        title: "Google UX Design Professional Certificate",
        description: "Design user experiences that are easy to use and enjoyable for people.",
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
        platform: "Coursera",
        instructor: "Google",
        duration: "6 months",
        level: "Beginner",
        rating: 4.8,
        students: "1.5M",
        url: "https://www.coursera.org/professional-certificates/google-ux-design",
        category: "Design",
        price: "$39/month",
        language: "English"
      },
      {
        id: 2003,
        title: "IBM Data Science Professional Certificate",
        description: "Kickstart your career in data science with hands-on projects and tools.",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
        platform: "Coursera",
        instructor: "IBM",
        duration: "3 months",
        level: "Beginner",
        rating: 4.7,
        students: "1.1M",
        url: "https://www.coursera.org/professional-certificates/ibm-data-science",
        category: "Data Science",
        price: "$39/month",
        language: "English"
      }
    ],
    udemy: [
      {
        id: 3001,
        title: "The Complete Web Development Bootcamp",
        description: "Become a full-stack web developer with HTML, CSS, JavaScript, React, Node.js, and more.",
        thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
        platform: "Udemy",
        instructor: "Dr. Angela Yu",
        duration: "55 hours",
        level: "Beginner",
        rating: 4.7,
        students: "850K",
        url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
        category: "Web Development",
        price: "$84.99",
        language: "English"
      },
      {
        id: 3002,
        title: "The Complete Digital Marketing Course",
        description: "Master digital marketing strategy, social media marketing, SEO, YouTube, email, and more.",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
        platform: "Udemy",
        instructor: "Daragh Walsh",
        duration: "23 hours",
        level: "Beginner",
        rating: 4.5,
        students: "450K",
        url: "https://www.udemy.com/course/learn-digital-marketing-course/",
        category: "Marketing",
        price: "$74.99",
        language: "English"
      },
      {
        id: 3003,
        title: "AWS Certified Solutions Architect",
        description: "Learn AWS cloud computing and prepare for the AWS Certified Solutions Architect exam.",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
        platform: "Udemy",
        instructor: "Ryan Kroonenburg",
        duration: "27 hours",
        level: "Intermediate",
        rating: 4.6,
        students: "320K",
        url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate/",
        category: "Cloud Computing",
        price: "$89.99",
        language: "English"
      }
    ],
    khanacademy: [
      {
        id: 4001,
        title: "Advanced JavaScript Programming",
        description: "Master advanced JavaScript concepts including ES6, async programming, and modern frameworks.",
        thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop",
        platform: "Khan Academy",
        instructor: "Khan Academy",
        duration: "Self-paced",
        level: "Advanced",
        rating: 4.4,
        students: "780K",
        url: "https://www.khanacademy.org/computing/computer-programming",
        category: "Programming",
        price: "Free",
        language: "English"
      }
    ],
    skillshare: [
      {
        id: 5001,
        title: "Graphic Design Masterclass",
        description: "Learn graphic design with Photoshop, Illustrator, and InDesign through real-world projects.",
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
        platform: "Skillshare",
        instructor: "Lindsay Marsh",
        duration: "15 hours",
        level: "Beginner",
        rating: 4.3,
        students: "210K",
        url: "https://www.skillshare.com/classes/Graphic-Design-Masterclass-Learn-GREAT-Design/",
        category: "Design",
        price: "Free Trial",
        language: "English"
      }
    ]
  }

  // ✅ All courses combined for "All" tab
  const allCourses = Object.values(platformCourses).flat()

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
  const handleAddExternalCourse = (externalCourse: any) => {
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

    // Add to courses list
    setCourses(prev => [...prev, newExternalCourse]);
    setIsExternalCourseDialogOpen(false);
    
    // Show success message
    alert(`✅ Course "${externalCourse.title}" from ${externalCourse.platform} added successfully!`);
  }

  // ✅ Get current platform courses based on active tab
  const getCurrentPlatformCourses = () => {
    if (activePlatformTab === 'all') {
      return allCourses;
    }
    return platformCourses[activePlatformTab as keyof typeof platformCourses] || [];
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
                        onClick={() => setIsExternalCourseDialogOpen(true)}
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
            onOpenChange={setIsExternalCourseDialogOpen}
            onAddCourse={handleAddExternalCourse}
            activePlatformTab={activePlatformTab}
            setActivePlatformTab={setActivePlatformTab}
            platformCourses={platformCourses}
            allCourses={allCourses}
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
  activePlatformTab,
  setActivePlatformTab,
  platformCourses,
  allCourses
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCourse: (course: any) => void
  activePlatformTab: string
  setActivePlatformTab: (tab: string) => void
  platformCourses: any
  allCourses: any[]
}) => {
  const platforms = [
    { id: 'all', name: 'All Platforms', icon: 'mdi-view-grid', count: allCourses.length },
    { id: 'edx', name: 'edX', icon: 'mdi-school', count: platformCourses.edx?.length || 0 },
    { id: 'coursera', name: 'Coursera', icon: 'mdi-laptop', count: platformCourses.coursera?.length || 0 },
    { id: 'udemy', name: 'Udemy', icon: 'mdi-video', count: platformCourses.udemy?.length || 0 },
    { id: 'khanacademy', name: 'Khan Academy', icon: 'mdi-book-open', count: platformCourses.khanacademy?.length || 0 },
    { id: 'skillshare', name: 'Skillshare', icon: 'mdi-palette', count: platformCourses.skillshare?.length || 0 },
  ]

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'edx': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'coursera': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'udemy': return 'bg-red-100 text-red-800 border-red-200'
      case 'khan academy': return 'bg-green-100 text-green-800 border-green-200'
      case 'skillshare': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCurrentCourses = () => {
    if (activePlatformTab === 'all') {
      return allCourses;
    }
    return platformCourses[activePlatformTab] || [];
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${open ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="mdi mdi-link text-green-600 text-2xl"></span>
              Add External Course
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Browse courses from popular learning platforms
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
          {/* Platform Tabs */}
          <div className="border-b">
            <div className="flex overflow-x-auto px-6 py-2 gap-1">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setActivePlatformTab(platform.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activePlatformTab === platform.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mdi ${platform.icon}`}></span>
                  {platform.name}
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activePlatformTab === platform.id
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {platform.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Header */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {activePlatformTab === 'all' ? 'All Platforms' : platforms.find(p => p.id === activePlatformTab)?.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {getCurrentCourses().length} courses available
                </p>
              </div>
              {activePlatformTab !== 'all' && (
                <div className="flex items-center gap-2">
                  <span className="mdi mdi-open-in-new text-gray-400"></span>
                  <a 
                    href={`https://www.${activePlatformTab}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Visit {platforms.find(p => p.id === activePlatformTab)?.name}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Course Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentCourses().map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
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

            {/* Empty State */}
            {getCurrentCourses().length === 0 && (
              <div className="text-center py-12">
                <span className="mdi mdi-magnify text-4xl text-gray-300 mb-4"></span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">No courses available for this platform at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningCatalog