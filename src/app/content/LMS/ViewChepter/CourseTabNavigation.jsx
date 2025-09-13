

import React from "react"
import Icon from "../../../../components/AppIcon"
import { Button } from "../../../../components/ui/button"

const CourseTabNavigation = ({ activeTab, onTabChange, chapters }) => {
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
      <div className="flex overflow-x-auto">
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
    </div>
  )
}

export default CourseTabNavigation
