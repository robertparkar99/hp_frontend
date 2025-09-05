// // "use client"

// // import React, { useState, useEffect } from "react"
// // import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog"
// // import { Button } from "../../../../components/ui/button"

// // const AddChepterDialog = ({ open, onOpenChange, onSave, course, sessionInfo }) => {
// //   const [chapterName, setChapterName] = useState("")
// //   const [chapterDesc, setChapterDesc] = useState("")
// //   const [availability, setAvailability] = useState(true)
// //   const [showHide, setShowHide] = useState(true)
// //   const [sortOrder, setSortOrder] = useState(1)
// //   const [loading, setLoading] = useState(false)

// //   // ✅ Pre-fill data if editing
// //   useEffect(() => {
// //     if (course) {
// //       setChapterName(course.title || "")
// //       setChapterDesc(course.description || "")
// //       setAvailability(course.availability === 1)
// //       setShowHide(course.show_hide === 1)
// //       setSortOrder(course.sort_order || 1)
// //     } else {
// //       setChapterName("")
// //       setChapterDesc("")
// //       setAvailability(true)
// //       setShowHide(true)
// //       setSortOrder(1)
// //     }
// //   }, [course])

// //   const handleSave = async () => {
// //     try {
// //       setLoading(true)

// //       const formData = new FormData()
// //       formData.append("grade", String(sessionInfo.grade))
// //       formData.append("standard", String(sessionInfo.standard_id))
// //       formData.append("subject", String(sessionInfo.subject_id))
// //       formData.append("type", sessionInfo.type)
// //       formData.append("sub_institute_id", String(sessionInfo.sub_institute_id))
// //       formData.append("syear", String(sessionInfo.syear))
// //       formData.append("user_id", String(sessionInfo.user_id))
// //       formData.append("user_profile_name", sessionInfo.user_profile_name)
// //       formData.append("token", sessionInfo.token)

// //       // ✅ Editable fields from form
// //       formData.append("chapter_name[0]", chapterName)
// //       formData.append("chapter_desc[0]", chapterDesc)
// //       formData.append("availability[0]", availability ? "1" : "0")
// //       formData.append("show_hide[0]", showHide ? "1" : "0")
// //       formData.append("sort_order[0]", String(sortOrder))

// //       console.log("📌 Payload being sent:", Object.fromEntries(formData.entries()))

// //       const res = await fetch("https://hp.triz.co.in/lms/chapter_master", {
// //         method: "POST",
// //         body: formData,
// //       })

// //       if (!res.ok) throw new Error("Failed to save chapter")
// //       const result = await res.json()
// //       console.log("✅ API Response:", result)

// //       onSave()
// //       onOpenChange(false)
// //     } catch (error) {
// //       console.error("❌ Error saving chapter:", error)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent className="max-w-2xl w-full">
// //         <DialogHeader>
// //           <DialogTitle>{course ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
// //         </DialogHeader>

// //         <div className="flex flex-col space-y-4">
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             {/* Chapter Name */}
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Chapter Name</label>
// //               <input
// //                 type="text"
// //                 placeholder="Enter chapter name"
// //                 value={chapterName}
// //                 onChange={(e) => setChapterName(e.target.value)}
// //                 className="border p-2 rounded w-full"
// //               />
// //             </div>

// //             {/* Chapter Description */}
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Chapter Description</label>
// //               <textarea
// //                 placeholder="Enter chapter description"
// //                 value={chapterDesc}
// //                 onChange={(e) => setChapterDesc(e.target.value)}
// //                 className="border p-2 rounded w-full"
// //               />
// //             </div>

// //             {/* Availability */}
// //             <div>
// //               <label className="flex items-center space-x-2">
// //                 <input
// //                   type="checkbox"
// //                   checked={availability}
// //                   onChange={(e) => setAvailability(e.target.checked)}
// //                 />
// //                 <span>Available</span>
// //               </label>
// //             </div>

// //             {/* Show/Hide */}
// //             <div>
// //               <label className="flex items-center space-x-2">
// //                 <input
// //                   type="checkbox"
// //                   checked={showHide}
// //                   onChange={(e) => setShowHide(e.target.checked)}
// //                 />
// //                 <span>Show in frontend</span>
// //               </label>
// //             </div>

// //             {/* Sort Order */}
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Sort Order</label>
// //               <input
// //                 type="number"
// //                 value={sortOrder}
// //                 onChange={(e) => setSortOrder(Number(e.target.value))}
// //                 className="border p-2 rounded w-full"
// //               />
// //             </div>
// //           </div>

// //           {/* Save Button */}
// //           <Button onClick={handleSave} disabled={loading}>
// //             {loading ? "Saving..." : course ? "Update Chapter" : "Add Chapter"}
// //           </Button>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   )
// // }

// // export default AddChepterDialog



// "use client";

// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
// import { Button } from "../../../../components/ui/button";

// const AddChepterDialog = ({ open, onOpenChange, onSave, course, sessionInfo }) => {
//   const [chapterName, setChapterName] = useState("");
//   const [chapterDesc, setChapterDesc] = useState("");
//   const [availability, setAvailability] = useState(true);
//   const [showHide, setShowHide] = useState(true);
//   const [sortOrder, setSortOrder] = useState(1);
//   const [loading, setLoading] = useState(false);

//   // Pre-fill data if editing
//   useEffect(() => {
//     if (course) {
//       setChapterName(course.title || "");
//       setChapterDesc(course.description || "");
//       setAvailability(course.availability === 1 || course.availability === "1");
//       setShowHide(course.show_hide === 1 || course.show_hide === "1");
//       setSortOrder(course.sort_order || 1);
//     } else {
//       setChapterName("");
//       setChapterDesc("");
//       setAvailability(true);
//       setShowHide(true);
//       setSortOrder(1);
//     }
//   }, [course]);

//   // Build FormData (for add or edit)
//   const buildFormData = (isEdit = false) => {
//     const formData = new FormData();
//     formData.append("grade", String(sessionInfo.grade));
//     formData.append("standard", String(sessionInfo.standard_id));
//     formData.append("subject", String(sessionInfo.subject_id));
//     formData.append("type", sessionInfo.type);
//     formData.append("sub_institute_id", String(sessionInfo.sub_institute_id));
//     formData.append("syear", String(sessionInfo.syear));
//     formData.append("user_id", String(sessionInfo.user_id));
//     formData.append("user_profile_name", sessionInfo.user_profile_name);
//     formData.append("token", sessionInfo.token);

//     // formData.append("chapter_name", chapterName);
//     // formData.append("chapter_desc", chapterDesc);
//     // formData.append("availability", availability ? "1" : "0");
//     // formData.append("show_hide", showHide ? "1" : "0");
//     // formData.append("sort_order", String(sortOrder));
//     formData.append("chapter_name[0]", chapterName)
//     formData.append("chapter_desc[0]", chapterDesc)
//     formData.append("availability[0]", availability ? "1" : "0")
//     formData.append("show_hide[0]", showHide ? "1" : "0")
//     formData.append("sort_order[0]", String(sortOrder))
//     // Include chapter_id for edits
//     if (isEdit && course && course.id) {
//       formData.append("chapter_id", course.id);
//     }

//     return formData;
//   };

//   // Add Chapter
//   const handleAddChapter = async () => {
//     try {
//       setLoading(true);
//       const formData = buildFormData(false);

//       const apiUrl = `https://hp.triz.co.in/lms/chapter_master`;
//       const res = await fetch(apiUrl, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error("Failed to add chapter");

//       const result = await res.json();
//       onSave(result);
//       onOpenChange(false);
//     } catch (err) {
//       console.error("❌ Error adding chapter:", err);
//       alert("Error adding chapter: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Edit Chapter
//   const handleEditChapter = async () => {
//     if (!course || !course.id) return alert("❌ Chapter ID not found!");


//     try {
//       setLoading(true);
//       const formData = buildFormData(true); // include chapter_id

//       const apiUrl2 = `https://hp.triz.co.in/lms/chapter_master/${course.id}`;
//       console.log('in course id', apiUrl2);

//       const res = await fetch(apiUrl2, {
//         method: "POST", // backend expects POST for update
//         headers: {
//           Authorization: `Bearer ${sessionInfo.token}`,
//           'X-HTTP-Method-Override': 'PUT'
//         },
//         body: formData,
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Failed to update chapter: ${text}`);
//       }

//       const result = await res.json();
//       onSave(result);
//       onOpenChange(false);
//     } catch (err) {
//       console.error("❌ Error updating chapter:", err);
//       alert("Error updating chapter: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl w-full">
//         <DialogHeader>
//           <DialogTitle>{course ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
//         </DialogHeader>

//         <div className="flex flex-col space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Chapter Name</label>
//               <input
//                 type="text"
//                 value={chapterName}
//                 onChange={(e) => setChapterName(e.target.value)}
//                 className="border p-2 rounded w-full"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Chapter Description</label>
//               <textarea
//                 value={chapterDesc}
//                 onChange={(e) => setChapterDesc(e.target.value)}
//                 className="border p-2 rounded w-full"
//               />
//             </div>

//             <div>
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={availability}
//                   onChange={(e) => setAvailability(e.target.checked)}
//                 />
//                 <span>Available</span>
//               </label>
//             </div>

//             <div>
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={showHide}
//                   onChange={(e) => setShowHide(e.target.checked)}
//                 />
//                 <span>Show in frontend</span>
//               </label>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Sort Order</label>
//               <input
//                 type="number"
//                 value={sortOrder}
//                 onChange={(e) => setSortOrder(Number(e.target.value))}
//                 className="border p-2 rounded w-full"
//               />
//             </div>
//           </div>

//           <Button
//             onClick={course ? handleEditChapter : handleAddChapter}
//             disabled={loading}
//           >
//             {loading ? "Saving..." : course ? "Update Chapter" : "Add Chapter"}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddChepterDialog;


"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";

const AddChepterDialog = ({
  open,
  onOpenChange,
  onSave,
  course,
  sessionInfo,
  grade,
  standard_id,
  subject_id,
}) => {
  const [chapterName, setChapterName] = useState("");
  const [chapterDesc, setChapterDesc] = useState("");
  const [availability, setAvailability] = useState(true);
  const [showHide, setShowHide] = useState(true);
  const [sortOrder, setSortOrder] = useState(1);
  const [loading, setLoading] = useState(false);

  // ✅ Pre-fill data if editing
  useEffect(() => {
    if (course) {
      setChapterName(course.title || "");
      setChapterDesc(course.description || "");
      setAvailability(course.availability === 1 || course.availability === "1");
      setShowHide(course.show_hide === 1 || course.show_hide === "1");
      setSortOrder(course.sort_order || 1);
    } else {
      setChapterName("");
      setChapterDesc("");
      setAvailability(true);
      setShowHide(true);
      setSortOrder(1);
    }
  }, [course]);

  // ✅ Build formData
  const buildFormData = (isEdit = false) => {
    const formData = new FormData();

    // 🔹 From props
    formData.append("grade", String(grade));
    formData.append("standard", String(standard_id));
    formData.append("subject", String(subject_id));
    formData.append("type", "API"); // static

    // 🔹 From session
    formData.append("sub_institute_id", String(sessionInfo.sub_institute_id));
    formData.append("syear", String(sessionInfo.syear));
    formData.append("user_id", String(sessionInfo.user_id));
    formData.append("user_profile_name", sessionInfo.user_profile_name);
    formData.append("token", sessionInfo.token);

    // 🔹 Editable fields
    formData.append("chapter_name[0]", chapterName);
    formData.append("chapter_desc[0]", chapterDesc);
    formData.append("availability[0]", availability ? "1" : "0");
    formData.append("show_hide[0]", showHide ? "1" : "0");
    formData.append("sort_order[0]", String(sortOrder));

    // 🔹 For edit only
    if (isEdit && course && course.id) {
      formData.append("chapter_id", course.id);
    }

    return formData;
  };

  // ✅ Add Chapter
  const handleAddChapter = async () => {
    try {
      setLoading(true);
      const formData = buildFormData(false);

      const res = await fetch(`${sessionInfo.url}/lms/chapter_master`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add chapter");
      const result = await res.json();
      onSave(result);
      onOpenChange(false);
    } catch (err) {
      console.error("❌ Error adding chapter:", err);
      alert("Error adding chapter: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit Chapter
  const handleEditChapter = async () => {
    if (!course || !course.id) return alert("❌ Chapter ID not found!");
    try {
      setLoading(true);
      const formData = buildFormData(true);

      const res = await fetch(
        `${sessionInfo.url}/lms/chapter_master/${course.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionInfo.token}`,
            "X-HTTP-Method-Override": "PUT",
          },
          body: formData,
        }
      );
      // const res = await fetch(`${sessionInfo.url}/lms/chapter_master`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${sessionInfo.token}`,
      //     "X-HTTP-Method-Override": "PUT", // ✅ token in header
      //   },
      //   body: formData,
      // });
      console.log("🔑 Using token:", sessionInfo.token);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update chapter: ${text}`);
      }

      const result = await res.json();
      onSave(result);
      onOpenChange(false);
    } catch (err) {
      console.error("❌ Error updating chapter:", err);
      alert("Error updating chapter: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Chapter Name
              </label>
              <input
                type="text"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Chapter Description
              </label>
              <textarea
                value={chapterDesc}
                onChange={(e) => setChapterDesc(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={availability}
                  onChange={(e) => setAvailability(e.target.checked)}
                />
                <span>Available</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showHide}
                  onChange={(e) => setShowHide(e.target.checked)}
                />
                <span>Show in frontend</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          <Button
            onClick={course ? handleEditChapter : handleAddChapter}
            disabled={loading}
          >
            {loading ? "Saving..." : course ? "Update Chapter" : "Add Chapter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddChepterDialog;
