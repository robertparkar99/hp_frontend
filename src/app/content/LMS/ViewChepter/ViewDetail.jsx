// "use client"

// import React, { useState, useEffect } from "react"
// import { Button } from "../../../../components/ui/button"
// import Icon from "@/components/AppIcon"

// import ChepterGrid from "./ChepterGrid"
// import AddChepterDialog from "./AddChepterDialog"
// import CourseHero from "./CourseHero"
// import CourseTabNavigation from "./CourseTabNavigation"

// export default function ViewDetailPage({ subject_id, standard_id, grade = 2 }) {
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [chapterToEdit, setChapterToEdit] = useState(null)
//   const [chapterToDelete, setChapterToDelete] = useState(null)
//   const [viewMode, setViewMode] = useState("grid")
//   const [chapters, setChapters] = useState([])
//   const [courseDetails, setCourseDetails] = useState(null)
//   const [contentData, setContentData] = useState({})
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState("modules")

//   // ✅ Session data state (removed `type`)
//   const [sessionData, setSessionData] = useState({
//     url: "",
//     token: "",
//     grade: "",
//     sub_institute_id: "",
//     syear: "",
//     user_id: "",
//     user_profile_name: "",
//   })

//   // ✅ Load session info from localStorage
//   useEffect(() => {
//     const userData = localStorage.getItem("userData")
//     if (userData) {
//       const {
//         APP_URL,
//         token,

//         sub_institute_id,
//         syear,
//         user_profile_name,
//         user_id,
//       } = JSON.parse(userData)

//       setSessionData({
//         url: APP_URL,
//         token,

//         sub_institute_id,
//         syear,
//         user_profile_name,
//         user_id,
//       })
//     }
//   }, [])

//   // ✅ Fetch chapters from API
//   const fetchChapters = async () => {
//     if (!sessionData.url || !sessionData.token) return

//     try {
//       setLoading(true)

//       // 🔹 Hardcoded type=API
//       const API_URL = `${sessionData.url}/lms/chapter_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_profile_name=${sessionData.user_profile_name}&user_id=${sessionData.user_id}&standard_id=${standard_id}&subject_id=${subject_id}&token=${sessionData.token}`

//       console.log("📌 Fetching chapters from:", API_URL)
//       console.log("🔑 Using token:", sessionData.token)

//       const res = await fetch(API_URL, { cache: "no-store" })
//       if (!res.ok) {
//         const errText = await res.text()
//         throw new Error(`Failed to fetch chapters: ${res.status} - ${errText}`)
//       }

//       const data = await res.json()
//       console.log("📊 API Response:", data)

//       if (data.course_details) {
//         setCourseDetails(data.course_details)
//       }

//       if (data.content_data) {
//         setContentData(data.content_data)
//       }

//       const mapped = (data?.data || []).map((item) => {
//         const chapterId = item.id.toString()
//         const chapterContent =
//           data.content_data?.[chapterId] || data.content_data?.[item.id]

//         return {
//           id: item.id,
//           title: item.chapter_name ?? "Untitled Chapter",
//           description: item.chapter_desc ?? "",
//           standard_id: item.standard_id,
//           subject_id: item.subject_id,
//           total_content: item.total_content,
//           availability: item.availability,
//           show_hide: item.show_hide,
//           thumbnail: "/placeholder.jpg",
//           category: "Module",
//           level: "Grade " + grade,
//           rating: 4.5,
//           reviewCount: 12,
//           enrolledCount: 120,
//           instructor: { name: "Admin", title: "Course Creator" },
//           duration: "3h 20m",
//           progress: 0,
//           contents: chapterContent,
//         }
//       })

//       setChapters(mapped)
//     } catch (error) {
//       console.error("❌ Error fetching chapters:", error)
//       setChapters([])
//       setContentData({})
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ✅ Refetch when sessionData or subject/standard changes
//   useEffect(() => {
//     if (sessionData.url && sessionData.token && subject_id && standard_id) {
//       fetchChapters()
//     }
//   }, [sessionData, subject_id, standard_id])

//   // Handlers
//   const handleEditChapter = (chapter) => {
//     setChapterToEdit(chapter)
//     setIsAddDialogOpen(true)
//   }

//   const handleDeleteChepter = (chapter) => {
//     setChapterToDelete(chapter)
//     fetchChapters()
//   }

//   const handleSaveChapter = () => {
//     setIsAddDialogOpen(false)
//     setChapterToEdit(null)
//     setChapterToDelete(null)
//     fetchChapters()
//   }

//   // ✅ Format course details for CourseHero
//   const formatCourseForHero = () => {
//     if (!courseDetails) return null

//     const resourcesCount = Object.values(contentData).reduce(
//       (total, chapterContent) =>
//         total +
//         Object.values(chapterContent).reduce(
//           (sum, items) => sum + items.length,
//           0
//         ),
//       0
//     )

//     return {
//       id: courseDetails.id,
//       title: courseDetails.display_name || "Untitled Course",
//       description: `${courseDetails.subject_category} Subject`,
//       thumbnail: courseDetails.display_image || "/placeholder.jpg",
//       category: courseDetails.subject_category || "General",
//       level: "Grade " + grade,
//       moduleCount: chapters.length,
//       resourcesCount,
//       details: {
//         subjectCode: courseDetails.subject_code,
//         subjectType: courseDetails.subject_type,
//         elective: courseDetails.elective_subject === "Yes",
//         allowGrades: courseDetails.allow_grades === "Yes",
//         allowContent: courseDetails.allow_content === "Yes",
//         contentType: courseDetails.add_content,
//       },
//     }
//   }

//   // ✅ Calculate total resources
//   const calculateTotalResources = () => {
//     return Object.values(contentData).reduce(
//       (total, chapterContent) =>
//         total +
//         Object.values(chapterContent).reduce(
//           (sum, items) => sum + items.length,
//           0
//         ),
//       0
//     )
//   }

//   // ✅ Tab content
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "modules":
//         return loading ? (
//           <div className="text-center py-10">Loading...</div>
//         ) : chapters.length > 0 ? (
//           <ChepterGrid
//             courses={chapters}
//             viewMode={viewMode}
//             onEditCourse={handleEditChapter}
//             onDeleteCourse={handleDeleteChepter}
//             sessionInfo={sessionData}
//             courseDisplayName={courseDetails?.display_name || "Untitled Course"}
//           />
//         ) : (
//           <div className="text-center text-muted-foreground py-10">
//             No chapters found for this subject/standard.
//           </div>
//         )

//       case "resources":
//         return (
//           <div className="p-4">
//             <h2 className="text-xl font-semibold mb-4">
//               Resources ({calculateTotalResources()} total)
//             </h2>
//             {chapters.map((ch) => {
//               const chapterContent = contentData?.[ch.id] || {}
//               const chapterResourceCount = Object.values(chapterContent).reduce(
//                 (sum, items) => sum + items.length,
//                 0
//               )

//               return chapterResourceCount > 0 ? (
//                 <div key={ch.id} className="mb-6 border-b pb-4">
//                   <h3 className="font-bold text-lg mb-3">
//                     {ch.title}
//                     <span className="ml-2 text-sm text-muted-foreground">
//                       ({chapterResourceCount} resources)
//                     </span>
//                   </h3>
//                   <div className="grid gap-4">
//                     {Object.entries(chapterContent).map(([category, items]) =>
//                       items.length > 0 ? (
//                         <div
//                           key={category}
//                           className="bg-muted/20 p-4 rounded-lg"
//                         >
//                           <h4 className="font-semibold mb-2 text-foreground">
//                             {category}
//                           </h4>
//                           <ul className="space-y-2">
//                             {items.map((res) => (
//                               <li
//                                 key={res.id}
//                                 className="flex items-center justify-between p-2 bg-background rounded"
//                               >
//                                 <div>
//                                   <p className="font-medium text-foreground">
//                                     {res.title}
//                                   </p>
//                                   <p className="text-sm text-muted-foreground">
//                                     {res.description}
//                                   </p>
//                                 </div>
//                                 <a
//                                   href={`${res.file_folder}/${res.filename}`}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="text-primary hover:text-primary/80 text-sm font-medium"
//                                 >
//                                   Download ({res.file_type})
//                                 </a>
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       ) : null
//                     )}
//                   </div>
//                 </div>
//               ) : null
//             })}
//           </div>
//         )

//       default:
//         return (
//           <div className="text-center py-10">📖 Overview tab coming soon...</div>
//         )
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mt-8 mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">
//               Module Catalog
//             </h1>
//             <p className="text-muted-foreground mt-2">
//               Browse and manage Module
//             </p>
//           </div>

//           <Button
//             onClick={() => {
//               setChapterToEdit(null)
//               setChapterToDelete(null)
//               setIsAddDialogOpen(true)
//             }}
//             className="flex items-center gap-2"
//           >
//             <Icon name="Plus" size={16} /> Add Module
//           </Button>
//         </div>

//         {/* ✅ Course Hero */}
//         {courseDetails && (
//           <CourseHero
//             course={formatCourseForHero()}
//             onStartCourse={() => console.log("Start course")}
//             onContinueCourse={() => console.log("Continue course")}
//           />
//         )}

//         {/* ✅ Tab Navigation */}
//         <div className="mt-4">
//           <CourseTabNavigation
//             activeTab={activeTab}
//             onTabChange={setActiveTab}
//             chapters={chapters}
//             contentData={contentData}
//           />
//         </div>

//         {/* ✅ Tab Content */}
//         <div className="bg-card border border-border rounded-lg p-6 mt-8">
//           {renderTabContent()}
//         </div>

//         {/* ✅ Add/Edit Dialog */}
//         <AddChepterDialog
//           open={isAddDialogOpen}
//           onOpenChange={setIsAddDialogOpen}
//           onSave={handleSaveChapter}
//           course={chapterToEdit}
//           sessionInfo={sessionData}
//           grade={grade}
//           standard_id={standard_id}
//           subject_id={subject_id}
//         />
//       </main>
//     </div>
//   )
// }


"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../../../../components/ui/button"
import Icon from "@/components/AppIcon"

import ChepterGrid from "./ChepterGrid"
import AddChepterDialog from "./AddChepterDialog"
import CourseHero from "./CourseHero"
import CourseTabNavigation from "./CourseTabNavigation"

export default function ViewDetailPage({ subject_id, standard_id, grade = 2 }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [chapterToEdit, setChapterToEdit] = useState(null)
  const [chapterToDelete, setChapterToDelete] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [chapters, setChapters] = useState([])
  const [courseDetails, setCourseDetails] = useState(null)
  const [contentData, setContentData] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("modules")
  // ✅ Add state for standard details
  const [standardDetails, setStandardDetails] = useState(null)

  // ✅ Session data state (removed `type`)
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    grade: "",
    sub_institute_id: "",
    syear: "",
    user_id: "",
    user_profile_name: "",
  })

  // ✅ Load session info from localStorage
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

  // ✅ Fetch chapters from API
  const fetchChapters = async () => {
    if (!sessionData.url || !sessionData.token) return

    try {
      setLoading(true)

      // 🔹 Hardcoded type=API
      const API_URL = `${sessionData.url}/lms/chapter_master?type=API&sub_institute_id=${sessionData.sub_institute_id}&syear=${sessionData.syear}&user_profile_name=${sessionData.user_profile_name}&user_id=${sessionData.user_id}&standard_id=${standard_id}&subject_id=${subject_id}&token=${sessionData.token}`

      console.log("📌 Fetching chapters from:", API_URL)
      console.log("🔑 Using token:", sessionData.token)

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

      // ✅ Extract standard details from API response
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

  // ✅ Refetch when sessionData or subject/standard changes
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

  // ✅ Format course details for CourseHero
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

  // ✅ Calculate total resources
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

  // ✅ Tab content
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
            sessionInfo={sessionData}
            courseDisplayName={courseDetails?.display_name || "Untitled Course"}
            // ✅ Pass standard name to ChepterGrid
            standardName={standardDetails?.name || "Standard"}
          />
        ) : (
          <div className="text-center text-muted-foreground py-10">
            No chapters found for this subject/standard.
          </div>
        )

      case "resources":
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">
              Resources ({calculateTotalResources()} total)
            </h2>
            {chapters.map((ch) => {
              const chapterContent = contentData?.[ch.id] || {}
              const chapterResourceCount = Object.values(chapterContent).reduce(
                (sum, items) => sum + items.length,
                0
              )

              return chapterResourceCount > 0 ? (
                <div key={ch.id} className="mb-6 border-b pb-4">
                  <h3 className="font-bold text-lg mb-3">
                    {ch.title}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({chapterResourceCount} resources)
                    </span>
                  </h3>
                  <div className="grid gap-4">
                    {Object.entries(chapterContent).map(([category, items]) =>
                      items.length > 0 ? (
                        <div
                          key={category}
                          className="bg-muted/20 p-4 rounded-lg"
                        >
                          <h4 className="font-semibold mb-2 text-foreground">
                            {category}
                          </h4>
                          <ul className="space-y-2">
                            {items.map((res) => (
                              <li
                                key={res.id}
                                className="flex items-center justify-between p-2 bg-background rounded"
                              >
                                <div>
                                  <p className="font-medium text-foreground">
                                    {res.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {res.description}
                                  </p>
                                </div>
                                <a
                                  href={`${res.file_folder}/${res.filename}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 text-sm font-medium"
                                >
                                  Download ({res.file_type})
                                </a>
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
          </div>
        )

      default:
        return (
          <div className="text-center py-10">📖 Overview tab coming soon...</div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mt-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Module Catalog
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse and manage Module
            </p>
          </div>

          <Button
            onClick={() => {
              setChapterToEdit(null)
              setChapterToDelete(null)
              setIsAddDialogOpen(true)
            }}
            className="flex items-center gap-2"
          >
            <Icon name="Plus" size={16} /> Add Module
          </Button>
        </div>

        {/* ✅ Course Hero */}
        {courseDetails && (
          <CourseHero
            course={formatCourseForHero()}
            onStartCourse={() => console.log("Start course")}
            onContinueCourse={() => console.log("Continue course")}
          />
        )}

        {/* ✅ Tab Navigation */}
        <div className="mt-4">
          <CourseTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            chapters={chapters}
            contentData={contentData}
          />
        </div>

        {/* ✅ Tab Content */}
        <div className="bg-card border border-border rounded-lg p-6 mt-8">
          {renderTabContent()}
        </div>

        {/* ✅ Add/Edit Dialog */}
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
      </main>
    </div>
  )
}