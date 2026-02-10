

import React, { useState } from "react"
import Icon from "../../../../components/AppIcon"
import { Button } from "../../../../components/ui/button"

const CourseTabNavigation = ({ activeTab, onTabChange, chapters, isCourseCompleted, onMarkCourseCompleted, isButtonEnabled }) => {
  const [completionStatus, setCompletionStatus] = useState(isCourseCompleted ? 'completed' : 'pending');

  // ✅ Calculate dynamic counts
  const modulesCount = chapters?.length || 0

  // Count all resources across chapters
  const resourcesCount =
    chapters?.reduce((acc, ch) => {
      return (
        acc +
        Object.values(ch.contents || {}).reduce(
          (sum, arr) => sum + (arr?.length || 0),
          0
        )
      )
    }, 0) || 0

  const handleMarkCompleted = () => {
    if (onMarkCourseCompleted) {
      onMarkCourseCompleted();
    }
  };

  const tabs = [
    {
      id: "modules",
      label: "Modules",
      icon: "List",
      description: "Course content and lessons",
      count: modulesCount,
    },
    {
      id: "resources",
      label: "Resources",
      icon: "Download",
      description: "Downloads and materials",
      count: resourcesCount,
    },
  ]

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-card">
      <div className="flex overflow-x-auto justify-between items-center">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={`group flex-shrink-0 px-6 py-4 rounded-none border-b-2 transition-all duration-200 ${
                  isActive
                    ? "border-blue-500 text-blue-500 bg-blue-500/10 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-600/10"
                    : "border-transparent text-muted-foreground hover:text-blue-400 hover:bg-blue-400/5"
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon name={tab.icon} size={18} />
                  <div className="text-left">
                    <div className="font-medium flex items-center gap-1">
                      {tab.label}
                      {tab.count !== null && (
                        <span
                          className={`ml-1 text-xs px-2 py-0.5 rounded-full transition-colors duration-200 ${
                            isActive
                              ? "bg-blue-500 text-white group-hover:bg-blue-600"
                              : "bg-muted text-foreground group-hover:bg-blue-400 group-hover:text-white"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-75 hidden sm:block">
                      {tab.description}
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Mark as Complete Button */}
        {completionStatus !== 'completed' && (
          <div className="pr-4">
            <Button
              size="sm"
              variant={isButtonEnabled ? "default" : "outline"}
              className={`h-8 px-3 ${isButtonEnabled ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}`}
              onClick={handleMarkCompleted}
              disabled={!isButtonEnabled}
              title={isButtonEnabled ? "Mark course as completed" : "View all content first"}
            >
              <Icon name="CheckCircle" size={13} className="mr-1" />
              Mark AS Completed
            </Button>
          </div>
        )}

        {completionStatus === 'completed' && (
          <div className="pr-4">
            <span className="text-green-600 font-medium">Completed</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseTabNavigation
