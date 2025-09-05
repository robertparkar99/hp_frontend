// "use client"

// import { useState } from "react"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { Input } from '../../../../components/ui/input';
// import { Textarea } from "../../../../components/ui/textarea"
// import {Button} from '../../../../components/ui/button';

// export default function AddCourseDialog({
//   open,
//   onOpenChange,
//   onSave,
// }) {
//   const [name, setName] = useState("")
//   const [description, setDescription] = useState("")

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     onSave({ name, description })
//     setName("")
//     setDescription("")
//     onOpenChange(false)
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add New Course</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="text-sm font-medium">Course Name</label>
//             <Input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Enter course name"
//               required
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium">Description</label>
//             <Textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Enter course description"
//               required
//             />
//           </div>

//           <DialogFooter>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//             >
//               Cancel
//             </Button>
//             <Button type="submit">Save</Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';

const AddCourseDialog = ({ open, onOpenChange, onSave, course }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [contentType, setContentType] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [shortName, setShortName] = useState('');
  const [subjectType, setSubjectType] = useState('');
  const [progress, setProgress] = useState(0);
  const [instructor, setInstructor] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [isMandatory, setIsMandatory] = useState(false);

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setDescription(course.description || '');
      setThumbnail(course.thumbnail || '');
      setContentType(course.contentType || '');
      setCategory(course.category || '');
      setDifficulty(course.difficulty || '');
      setShortName(course.short_name || '');
      setSubjectType(course.subject_type || '');
      setProgress(course.progress || 0);
      setInstructor(course.instructor || '');
      setIsNew(course.isNew ?? true);
      setIsMandatory(course.isMandatory ?? false);
    } else {
      setTitle('');
      setDescription('');
      setThumbnail('');
      setContentType('');
      setCategory('');
      setDifficulty('');
      setShortName('');
      setSubjectType('');
      setProgress(0);
      setInstructor('');
      setIsNew(true);
      setIsMandatory(false);
    }
  }, [course]);

  const handleSave = () => {
    onSave({
      ...course,
      title,
      description,
      thumbnail,
      contentType,
      category,
      difficulty,
      short_name: shortName,
      subject_type: subjectType,
      progress,
      instructor,
      isNew,
      isMandatory,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Add Course'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Course Title</label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Name</label>
              <input
                type="text"
                placeholder="Short name"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject Type</label>
              <input
                type="text"
                placeholder="Subject type"
                value={subjectType}
                onChange={(e) => setSubjectType(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content Type</label>
              <input
                type="text"
                placeholder="video/ppt/mixed"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <input
                type="text"
                placeholder="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
              <input
                type="text"
                placeholder="Thumbnail URL"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instructor</label>
              <input
                type="text"
                placeholder="Instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Progress (%)</label>
              <input
                type="number"
                placeholder="Progress"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="flex flex-col justify-center">
              <label className="block text-sm font-medium mb-1">Flags</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                  />
                  <span>New</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                  />
                  <span>Mandatory</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Course Description</label>
            <textarea
              placeholder="Enter course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <Button onClick={handleSave}>{course ? 'Update' : 'Add'} Course</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;
