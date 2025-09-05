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
// 👇 import your dialog (update the path if needed)
import AddContentDialog from "./AddContentDialoge";

// const API_BASE = "https://hp.triz.co.in/lms";

const ChapterCard = ({
  course = {},
  contents = {},
  onEditCourse,
  onDeleteCourse,
  onViewCourse,
  sessionInfo,
  courseDisplayName,
  standardName
}) => {
  const [loading, setLoading] = useState(false);

  // state for dialog
  const [openDialog, setOpenDialog] = useState(false);

  const id = course.id || course.chapter_id;
  const title = course.title || course.chapter_name || "Untitled Chapter";
  const description = course.description || course.chapter_desc || "";

  // total content count
  const totalContentCount = Object.values(contents).reduce(
    (sum, items) => sum + items.length,
    0
  );

  // Delete handler
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
        return () => <span className="mdi mdi-video text-lg" style={{ color: "#2563eb" }}></span>; // blue
      case "pdf":
        return () => <span className="mdi mdi-file-pdf-box text-lg" style={{ color: "#dc2626" }}></span>; // red
      case "ppt":
        return () => <span className="mdi mdi-file-powerpoint text-lg" style={{ color: "#ea580c" }}></span>; // orange
      default:
        return () => <span className="mdi mdi-file-document-outline text-lg" style={{ color: "#4b5563" }}></span>; // gray
    }
  };


  // const getFileIcon = (fileType) => {
  //   switch (fileType?.toLowerCase()) {
  //     case "video":
  //       return () => <Icon name="Video" size={16} />;
  //     case "pdf":
  //       return () => <Icon name="FileText" size={16} />;
  //     case "ppt":
  //       return () => <Icon name="Presentation" size={16} />;
  //     default:
  //       return () => <Icon name="File" size={16} />;
  //   }
  // };

  return (

    <>
      {/* ADD CONTENT DIALOG */}
      <AddContentDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        chapterId={id}
        chapterName={title}
        sessionInfo={sessionInfo}
        courseDisplayName={courseDisplayName}
        standardName={standardName}
      />


      <Accordion type="multiple" className="space-y-2">
        <Card key={id} className="overflow-hidden">
          <AccordionItem value={String(id)} className="border-0">
            <CardHeader className="py-2">
              <div className="flex items-center justify-between">
                <AccordionTrigger className="hover:no-underline flex-1 text-left [&>svg]:ml-auto">
                  <div className="flex items-center gap-2">
                    <Icon name="BookOpen" size={18} className="text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{title}</CardTitle>
                        {totalContentCount > 0 && (
                          <Badge variant="secondary" className="text-[13px]">
                            {totalContentCount} items
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {description}
                      </p>

                    </div>

                  </div>

                </AccordionTrigger>
                <div className="flex items-center gap-1 ml-2">
                  {/* <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Add clicked", id);
                  }}
                >
                  <Icon name="Plus" size={13} />
                </Button> */}
                  {/* PLUS BUTTON — opens dialog */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDialog(true); // 👈 open dialog
                    }}
                  >
                    <Icon name="Plus" size={13} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEditCourse) onEditCourse(course);
                    }}
                  >
                    <Icon name="Edit" size={13} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick();
                    }}
                    disabled={loading}
                  >
                    <Icon name="Trash" size={13} />
                  </Button>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 ">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 transition-all duration-300"
                  style={{ width: "100%" }} // <-- dynamic percentage
                ></div>
              </div>
            </CardHeader>

            <AccordionContent>
              <CardContent className="pt-0">
                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(contents).map(([category, items]) => (
                    <Card key={category} className="bg-muted/30">
                      <AccordionItem value={category} className="border-0">
                        <CardHeader className="py-1">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Icon
                                name="FolderOpen"
                                size={14}
                                className="text-primary"
                              />
                              <div className="text-left">
                                <h4 className="text-sm font-semibold">
                                  {category}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {items.length} items
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                        </CardHeader>

                        <AccordionContent>
                          <CardContent className="pt-0 space-y-2">
                            {items.map((content, index) => {
                              const FileIcon = getFileIcon(content.file_type);
                              return (
                                <Card key={content.id} className="bg-background">
                                  <CardContent className="px-3 py-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-5 flex-1">
                                        {/* <span className="text-xs font-semibold text-muted-foreground w-5 text-right">
                                        {index + 1}.
                                      </span> */}
                                        <span
                                          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold"
                                        >
                                          {index + 1}
                                        </span>

                                        <FileIcon />
                                        <div className="flex-1">
                                          <h5 className="text-sm font-medium">
                                            {content.title}
                                          </h5>
                                          <p className="text-xs text-muted-foreground">
                                            {content.description}
                                          </p>
                                          <div className="flex items-center gap-1 mt-1">
                                            <Badge
                                              variant="secondary"
                                              className="text-[10px]"
                                            >
                                              {content.file_type.toUpperCase()}
                                            </Badge>
                                            {content.file_size && (
                                              <Badge
                                                variant="outline"
                                                className="text-[10px]"
                                              >
                                                {content.file_size}
                                              </Badge>
                                            )}
                                            {content.duration && (
                                              <Badge
                                                variant="outline"
                                                className="text-[10px]"
                                              >
                                                {content.duration}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          // className="h-7 px-2"
                                          onClick={() =>
                                            onViewCourse && onViewCourse(content)
                                          }
                                        >
                                          <Icon name="Eye" size={13} />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleEditContent(content.id)
                                          }
                                        >
                                          <Icon name="Edit" size={13} />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleDeleteContent(content.id)
                                          }
                                        >
                                          <Icon name="Trash" size={13} />
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
