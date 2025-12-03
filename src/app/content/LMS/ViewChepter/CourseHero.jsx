import React, { useState } from "react";
import { 
  ArrowUpDown, 
  Settings, 
  Upload, 
  Download, 
  List, 
  Video, 
  Play 
} from "lucide-react";
import Image from "../../../../components/AppImage";
import { Button } from "../../../../components/ui/button";

// ✅ Default image if no thumbnail
const DEFAULT_IMAGE =
  "https://erp.triz.co.in/storage/SubStdMapping/SubStdMap_2020-12-29_05-56-03.svg";

// ✅ Example fallback course (for local testing)
const SAMPLE_COURSE = {
  title: "Employee Onboarding Training",
  description: "Learn about company policies, work culture, and best practices.",
  category: "HR Training",
  level: "Beginner",
  thumbnail: "",
  moduleCount: 6,
  resourcesCount: 4,
  progress: 0,
  zoomLink: "https://zoom.us/j/1234567890?pwd=ExampleGeneratedLink",
};

const CourseHero = ({ course = SAMPLE_COURSE, sessionData, onSortModules }) => {
  const [imgSrc, setImgSrc] = useState(course.thumbnail?.trim() || DEFAULT_IMAGE);
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'name-asc', 'name-desc', 'date-asc', 'date-desc'

  const totalModules = course.moduleCount || 0;
  const totalResources = course.resourcesCount || 0;
  const zoomLink = course.zoomLink?.trim();

  // ✅ Function to handle module sorting
  const handleSortModules = () => {
    const sortOptions = ['default', 'name-asc', 'name-desc', 'date-asc', 'date-desc'];
    const currentIndex = sortOptions.indexOf(sortOrder);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    const nextSortOrder = sortOptions[nextIndex];
    
    setSortOrder(nextSortOrder);
    
    // Call parent component's sort function if provided
    if (onSortModules) {
      onSortModules(nextSortOrder);
    }
  };

  // ✅ Function to open or create a Zoom meeting
  const handleZoomMeeting = async () => {
    const role = sessionData?.user_profile_name?.toUpperCase();

    if (role === "ADMIN") {
      try {
        const response = await fetch("/api/zoom/create-meeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id }),
        });

        const data = await response.json();
        if (data?.zoomLink) {
          window.open(data.zoomLink, "_blank", "noopener,noreferrer");
        } else {
          alert("❌ Failed to create Zoom meeting.");
        }
      } catch (err) {
        console.error("Zoom creation error:", err);
        alert("⚠️ Unable to create Zoom meeting right now.");
      }
    } else if (role === "HR") {
      if (zoomLink) {
        window.open(zoomLink, "_blank", "noopener,noreferrer");
      } else {
        alert("❌ Zoom meeting link not available.");
      }
    }
  };

  // ✅ Get sort button tooltip text
  const getSortTooltip = () => {
    switch (sortOrder) {
      case 'default': return 'Sort by: Default';
      case 'name-asc': return 'Sort by: Name (A-Z)';
      case 'name-desc': return 'Sort by: Name (Z-A)';
      case 'date-asc': return 'Sort by: Date (Oldest first)';
      case 'date-desc': return 'Sort by: Date (Newest first)';
      default: return 'Sort modules';
    }
  };

  // ✅ Get sort button icon rotation based on current sort order
  const getSortIconRotation = () => {
    switch (sortOrder) {
      case 'name-asc': return 'rotate-0';
      case 'name-desc': return 'rotate-180';
      case 'date-asc': return 'rotate-0';
      case 'date-desc': return 'rotate-180';
      default: return '';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
      {/* ✅ Header Action Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground">Course Overview</h2>
        <div className="flex items-center gap-1">
          {/* Sort Modules */}
          <button
            className={`p-2 rounded-full hover:bg-muted transition ${
              sortOrder !== 'default' ? 'bg-primary/10 text-primary' : ''
            }`}
            title={getSortTooltip()}
            onClick={handleSortModules}
          >
            <ArrowUpDown 
              size={18} 
              className={`text-muted-foreground transition-transform ${
                getSortIconRotation()
              } ${sortOrder !== 'default' ? 'text-primary' : ''}`}
            />
          </button>

          {/* Customize Fields */}
          <button
            className="p-2 rounded-full hover:bg-muted transition"
            title="Manage custom module fields"
          >
            <Settings size={18} className="text-muted-foreground" />
          </button>

   
        

          {/* Import / Export */}
          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-full hover:bg-muted transition"
              title="Import module data"
            >
              <Upload size={18} className="text-muted-foreground" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-muted transition"
              title="Export module data"
            >
              <Download size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Main Course Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Thumbnail */}
        <div className="lg:w-1/3 h-48 lg:h-64 overflow-hidden">
          <Image
            src={imgSrc}
            alt={course.title}
            width={280}
            height={280}
            className="object-cover"
            onError={() => setImgSrc(DEFAULT_IMAGE)}
          />
        </div>

        {/* Course Info */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                  {course.category}
                </span>
                <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded">
                  {course.level}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {course.title}
              </h1>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {course.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6">
              {/* Modules */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <List size={18} className="text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-blue-800 flex items-center gap-1">
                    Modules
                    <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {totalModules}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">Learning Units</p>
                </div>
              </div>

              {/* Resources */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Download size={18} className="text-green-500" />
                </div>
                <div>
                  <div className="font-medium text-green-800 flex items-center gap-1">
                    Resources
                    <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {totalResources}
                    </span>
                  </div>
                  <p className="text-sm text-green-600">Study Materials</p>
                </div>
              </div>
            </div>

            {/* Zoom Meeting Info */}
            {zoomLink ? (
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Video size={16} className="text-indigo-500" />
                </div>
                <div>
                  <div className="font-medium text-indigo-700">Zoom Meeting Ready</div>
                  <a
                    href={zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-500 hover:underline break-all"
                  >
                    {zoomLink}
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-5">
                No Zoom meeting link found.
              </p>
            )}

            {/* Role-based Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              {["ADMIN", "HR"].includes(sessionData?.user_profile_name?.toUpperCase()) ? (
                <Button
                  variant="default"
                  size="sm"
                  className={`flex-1 border ${
                    sessionData?.user_profile_name?.toUpperCase() === "ADMIN"
                      ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-indigo-200"
                      : "bg-green-100 hover:bg-green-200 text-green-700 border-green-200"
                  }`}
                  onClick={handleZoomMeeting}
                >
                  {sessionData?.user_profile_name?.toUpperCase() === "ADMIN" ? (
                    <>
                      <Video size={14} className="mr-2" />
                      Start Zoom Meeting
                    </>
                  ) : (
                    <>
                      <Play size={14} className="mr-2" />
                      Join Zoom Meeting
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHero;