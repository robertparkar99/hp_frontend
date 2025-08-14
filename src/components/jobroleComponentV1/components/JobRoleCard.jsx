
'use client'
import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import {Button} from '../../../components/ui/button';
import JobRoleForm from "./JobRoleForm";

const JobRoleCard = ({ role, onEdit, onDelete, onView, jobRoles = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const getLevelBadgeColor = (level) => {
    const colors = {
      Entry: "bg-success/10 text-success",
      Mid: "bg-warning/10 text-warning",
      Senior: "bg-primary/10 text-primary",
      Executive: "bg-error/10 text-error",
    };
    return colors[level] || "bg-muted text-muted-foreground";
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleEditClick = () => setIsEditOpen(true);
  const handleCancel = () => setIsEditOpen(false);
  const handleSave = (updatedRole) => {
    onEdit(updatedRole);
    setIsEditOpen(false);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-standard relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(role.level)}`}>
                {role.level}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="Building2" size={14} />
                <span>{role.department}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Users" size={14} />
                <span>{role.employeeCount} employees</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Calendar" size={14} />
                <span>Updated {role.lastUpdated}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(role)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="Eye" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="Edit" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
            onClick={() => onDelete(role.id)}
              className="text-muted-foreground hover:text-error"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-foreground text-sm leading-relaxed">
            {isExpanded ? role.description : truncateText(role.description)}
          </p>
          {role.description && role.description.length > 120 && (
            <button
              onClick={toggleExpanded}
              className="text-primary text-sm hover:text-primary/80 transition-micro mt-1"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Key Performance Expectations</h4>
          {role.performanceExpectations?.length > 0 ? (
            <ul className="space-y-1">
              {role.performanceExpectations.slice(0, 3).map((expectation, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <Icon name="CheckCircle2" size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <span>{expectation}</span>
                </li>
              ))}
              {role.performanceExpectations.length > 3 && (
                <li className="text-sm text-primary">
                  +{role.performanceExpectations.length - 3} more expectations
                </li>
              )}
            </ul>
          ) : (
            <span className="text-sm text-muted-foreground">No performance expectations listed.</span>
          )}
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Required Skills</h4>
          {role.requiredSkills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {role.requiredSkills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
              {role.requiredSkills.length > 5 && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  +{role.requiredSkills.length - 5} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No required skills listed.</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>ID: {role.id}</span>
            <span>•</span>
            <span>Created: {role.createdDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            {role.isActive ? (
              <span className="flex items-center space-x-1 text-success text-xs">
                <Icon name="CheckCircle" size={12} />
                <span>Active</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-muted-foreground text-xs">
                <Icon name="XCircle" size={12} />
                <span>Inactive</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Inline modal with JobRoleForm */}
      {/* {isEditOpen && (
 <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
    <div className="bg-white p-6 rounded shadow-xl w-full max-w-4xl flex flex-col">
      <JobRoleForm
        role={role}
        isEditing
        jobRoles={[role]}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  // </div>
)} */}
     
      {/* ✅ Modal (inline) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 overflow-hidden">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-4xl h-[70vh] overflow-y-auto flex flex-col no-scrollbar">
            <JobRoleForm
              role={role}
              isEditing
              jobRoles={[role]}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* ✅ Inline global CSS for hiding scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </>
  );
};

export default JobRoleCard;