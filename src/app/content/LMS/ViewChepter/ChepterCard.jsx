"use client";

import React, { useState } from "react";
import Icon from "@/components/AppIcon";
import { Button } from "../../../../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../../components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import AddContentDialog from "./AddContentDialoge";

const ChapterCard = ({
  course = {},
  contents = {},
  onEditCourse,
  onDeleteCourse,
  onDeleteContent,
  onEditContent,
  onQuestionContent,
  onSaveContent,
  onViewCourse,
  sessionInfo,
  courseDisplayName,
  standardName,
}) => {
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const id = course.id || course.chapter_id;
  const title = course.title || course.chapter_name || "Untitled Chapter";
  const description = course.description || course.chapter_desc || "";
  const standard_id = course.standard_id || "";
  const subject_id = course.subject_id || "";

  const totalContentCount = Object.values(contents).reduce(
    (sum, items) => sum + items.length,
    0
  );

  // Color palette
  const categoryColors = {
    default: " border-blue-200",
    video: "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200",
    pdf: "bg-gradient-to-r from-red-50 to-orange-50 border-red-200",
    document: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
    audio: "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200",
    link: " border-blue-200"
  };

  // Handle preview content - opens in new tab
  // const handleViewContent = async (content) => {
  //   if (!content || !content.id) {
  //     alert("No content available to preview.");
  //     return;
  //   }

  //   try {
  //     // Fetch content details to get the filename
  //     const url = `${sessionInfo.url}/lms/content_master/${content.id}/edit?type=API&sub_institute_id=${sessionInfo.sub_institute_id || 1}`;
  //     const response = await fetch(url);

  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch content details: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     const filename = data.content_data?.filename;

  //     if (!filename) {
  //       alert("No file available for this content.");
  //       return;
  //     }

  //     // Construct the full URL with the S3 path
  //     const fileUrl = `https://s3-triz.fra1.digitaloceanspaces.com/public/hp_lms_content_file/${filename}`;

  //     // Open the file in a new tab
  //     window.open(fileUrl, '_blank', 'noopener,noreferrer');

  //     // Also call the onViewCourse callback if provided
  //     if (onViewCourse) {
  //       onViewCourse(content);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching content details:", error);
  //     alert("Failed to load content. Please try again.");
  //   }
  // };
  const handleViewContent = async (content) => {
    if (!content || !content.id) {
      alert("No content available to preview.");
      return;
    }

    try {
      // Fetch content details
      const url = `${sessionInfo.url}/lms/content_master/${content.id}/edit?type=API&sub_institute_id=${sessionInfo.sub_institute_id || 1
        }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch content details: ${response.status}`);
      }

      const data = await response.json();
      const filename = data.content_data?.filename;

      if (!filename) {
        alert("No file available for this content.");
        return;
      }

      let fileUrl;

      // ✅ Check if filename itself is a full URL (link case)
      if (filename.startsWith("http://") || filename.startsWith("https://")) {
        fileUrl = filename;
      } else {
        // ✅ Otherwise assume it's a stored file and build the S3 path
        fileUrl = `https://s3-triz.fra1.digitaloceanspaces.com/public/hp_lms_content_file/${filename}`;
      }

      // Open in a new tab
      window.open(fileUrl, "_blank", "noopener,noreferrer");

      // Callback
      if (onViewCourse) {
        onViewCourse(content);
      }
    } catch (error) {
      console.error("Error fetching content details:", error);
      alert("Failed to load content. Please try again.");
    }
  };


  // delete content
  const handleDeleteContent = async (contentId) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    try {
      const formData = new FormData();
      formData.append("type", "API");
      formData.append("user_id", sessionInfo?.user_id || "");
      formData.append("sub_institute_id", sessionInfo?.sub_institute_id || "");
      formData.append("token", sessionInfo?.token || "");

      const res = await fetch(`${sessionInfo.url}/lms/content_master/${contentId}`, {
        method: "POST",
        headers: { "X-HTTP-Method-Override": "DELETE" },
        body: formData,
      });

      const data = await res.json();
      alert(data.message || "Content deleted.");
      if (onDeleteContent) onDeleteContent(contentId);
    } catch (err) {
      console.error("❌ Error deleting content:", err);
      alert("Failed to delete content.");
    }
  };

  // delete chapter
  const handleDeleteClick = async () => {
    if (!id) return alert("Chapter ID not found!");
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "API");
      formData.append("sub_institute_id", sessionInfo?.sub_institute_id || "1");
      formData.append("user_id", sessionInfo?.user_id || "1");
      formData.append("token", sessionInfo?.token || "");

      const response = await fetch(`${sessionInfo.url}/lms/chapter_master/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionInfo.token}`,
          "X-HTTP-Method-Override": "DELETE",
        },
        body: formData,
      });

      const data = await response.json();
      alert(data.message);
      if (onDeleteCourse) onDeleteCourse(id);
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert("Something went wrong while deleting the chapter.");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "video":
        return () => <span className="mdi mdi-video text-lg text-pink-600"></span>;
      case "pdf":
        return () => <span className="mdi mdi-file-pdf-box text-lg text-red-600"></span>;
      case "ppt":
        return () => <span className="mdi mdi-file-powerpoint text-lg text-orange-600"></span>;
      case "mp3":
      case "audio":
        return () => <span className="mdi mdi-music-note text-lg text-purple-600"></span>;
      case "link":
        return () => <span className="mdi mdi-link text-lg text-amber-600"></span>;
      default:
        return () => <span className="mdi mdi-file-document-outline text-lg text-blue-600"></span>;
    }
  };

  const getCategoryColor = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "video": return categoryColors.video;
      case "pdf": return categoryColors.pdf;
      case "ppt": return categoryColors.document;
      case "mp3":
      case "audio": return categoryColors.audio;
      case "link": return categoryColors.link;
      default: return categoryColors.default;
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedContent(null);
  };

  return (
    <>
      {/* ✅ Add/Edit Dialog */}
      <AddContentDialog
        open={openDialog}
        onOpenChange={handleDialogClose}
        content={selectedContent}
        chapterId={id}
        chapterName={title}
        sessionInfo={sessionInfo}
        courseDisplayName={courseDisplayName}
        standardName={standardName}
        onSave={onSaveContent}
        standard_id={standard_id}
        subject_id={subject_id}
      />

      <Accordion type="multiple" className="space-y-4">
        <Card key={id} className="overflow-hidden border-2 border-blue-100 shadow-md hover:shadow-lg transition-shadow">
          <AccordionItem value={String(id)} className="border-0">
            <CardHeader className="py-3 ">
              {/* <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-cyan-50"> */}
              <div className="flex items-center justify-between">
                <AccordionTrigger className="hover:no-underline flex-1 text-left [&>svg]:ml-auto ">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Icon name="BookOpen" size={18} className="text-blue-600" />
                    </div>
                  <div className="flex items-center gap-2">
  <CardTitle className="text-base flex items-center gap-2">{title}</CardTitle>

  {totalContentCount > 0 && (
    <Badge
      variant="secondary"
      className="text-[13px] text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-full border border-blue-200"
    >
      {totalContentCount} {totalContentCount === 1 ? "item" : "items"}
    </Badge>
  )}

  {/* 🔖 Elegant Bookmark */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      setBookmarked((prev) => !prev);
    }}
    className="p-1 rounded-md transition-all hover:scale-105"
    title={bookmarked ? "Remove Bookmark" : "Add Bookmark"}
  >
    <Icon
      name="Bookmark"
      size={18}
      className={
        bookmarked
          ? "stroke-yellow-500 fill-yellow-300 drop-shadow-sm"
          : "stroke-yellow-400 fill-transparent hover:stroke-yellow-500"
      }
    />
  </button>
</div>

                  </div>
                </AccordionTrigger>
                <div className="flex items-center gap-2 ml-2">
                  {/* Add content */}
                  {["ADMIN", "HR"].includes(sessionInfo.user_profile_name?.toUpperCase()) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                      title="create content"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContent(null);
                        setOpenDialog(true);
                      }}
                    >
                      <Icon name="Plus" size={13} />
                      {/* Add */}
                    </Button>
                  ) : null}
                  {/*Question bank open*/}
                  {["ADMIN", "HR"].includes(sessionInfo.user_profile_name?.toUpperCase()) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800"
                      title="Question Bank"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onQuestionContent) {
                          onQuestionContent(id, course.standard_id);
                        }
                      }}
                    >
                      <Icon name="FileQuestion" size={13} />
                      {/* Add */}
                    </Button>
                  ) : null}

                  {/* Edit chapter */}
                  {["ADMIN", "HR"].includes(sessionInfo.user_profile_name?.toUpperCase()) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800"
                      title="Edit module"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEditCourse) onEditCourse(course);
                      }}
                    >
                      <Icon name="Edit" size={13} />
                      {/* Edit */}
                    </Button>
                  ) : null}
                  {/* Delete chapter */}
                  {["ADMIN", "HR"].includes(sessionInfo.user_profile_name?.toUpperCase()) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800" title="Delete content"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick();
                      }}
                      disabled={loading}
                    >
                      <Icon name="Trash" size={13} />
                      {/* Delete */}
                    </Button>
                  ) : null}

                  {/* ✨ New Optional Actions */}
                  <Button size="sm" variant="outline" className="h-8 px-2 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" title="Manage Contributors">
                    <Icon name="Users" size={14} />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 px-2 bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100" title="AI Assist">
                    <Icon name="Bot" size={14} />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 px-2 bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100" title="Analytics">
                    <Icon name="BarChart2" size={14} />
                  </Button>

                </div>
              </div>
            </CardHeader>

            <AccordionContent>
              <CardContent className="pt-4">
                <Accordion type="multiple" className="space-y-3">
                  {Object.entries(contents).map(([category, items]) => (
                    <Card key={category} className={`border-2 ${getCategoryColor(category)}`}>
                      <AccordionItem value={category} className="border-0">
                        <CardHeader className="py-2">
                          <AccordionTrigger className="hover:no-underline [&>svg]:text-blue-600">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 rounded-full">
                                <Icon name="FolderOpen" size={14} className="text-blue-600" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-sm font-semibold ">{category}</h4>
                                {/* <p className="text-xs text-blue-600 bg-blue-100 hover:bg-blue-200">{items.length} {items.length === 1 ? 'item' : 'items'}</p> */}
                                <p className="text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-full border border-blue-200">
                                  {items.length} {items.length === 1 ? 'item' : 'items'}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                        </CardHeader>

                        <AccordionContent>
                          <CardContent className="pt-2 space-y-3">
                            {items.map((content, index) => {
                              const FileIcon = getFileIcon(content.file_type);
                              const itemColor = getCategoryColor(content.file_type);

                              return (
                                <Card key={content.id} className={`border ${itemColor} hover:shadow-md transition-shadow`}>
                                  <CardContent className="px-4 py-3">
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-4 flex-1">
                                        {/* <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-blue-700 text-xs font-semibold shadow-sm border border-blue-200">
                                            {index + 1}
                                          </span> */}
                                        <span className={`flex items-center justify-center w-7 h-7 rounded-full bg-white text-xs font-semibold shadow-sm border ${index % 2 === 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}`}>
                                          {index + 1}
                                        </span>
                                        <div className="p-1.5 bg-white rounded-full shadow-sm">
                                          <FileIcon />
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="text-sm font-medium text-gray-800">{content.title}</h5>
                                          <p className="text-xs text-gray-600 mt-1">
                                            {content.description}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 w-7 p-0 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                                          onClick={() => handleViewContent(content)}
                                          title="Preview"
                                        >
                                          <Icon name="Eye" size={13} />
                                        </Button>
                                        {["ADMIN", "HR"].includes(sessionInfo.user_profile_name?.toUpperCase()) ? (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-7 p-0 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedContent(content);
                                              setOpenDialog(true);
                                            }}
                                            title="Edit"
                                          >
                                            <Icon name="Edit" size={13} />
                                          </Button>
                                        ) : null}
                                        {["ADMIN", "HR"].includes(sessionInfo.user_profile_name?.toUpperCase()) ? (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-7 p-0 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                                            onClick={() => handleDeleteContent(content.id)}
                                            title="Delete"
                                          >
                                            <Icon name="Trash" size={13} />
                                          </Button>
                                        ) : null}


                                        <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-800" title="Download">
                                          <Icon name="Download" size={13} />
                                        </Button>

                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </CardContent>
                        </AccordionContent>
                      </AccordionItem>
                    </Card>
                  ))}
                </Accordion>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>
      </Accordion>
    </>
  );
};

export default ChapterCard;