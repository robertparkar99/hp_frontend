import React, { useState } from "react";
import JobRoleCard from "./JobRoleCard";
import JobRoleForm from "./JobRoleForm";

const JobRoleManager = ({ jobRoles }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = (role) => {
    setSelectedRole(role);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSelectedRole(null);
    setIsEditing(false);
  };

  const handleSave = (updatedRole) => {
    console.log("Updated Role:", updatedRole);
    setIsEditing(false);
  };

  return (
    <div>
      {!isEditing ? (
        <div className="grid gap-4">
          {jobRoles.map((role) => (
            <JobRoleCard
              key={role.id}
              role={role}
              onEdit={handleEdit}
              onDelete={(role) => console.log("Delete:", role)}
              onView={(role) => console.log("View:", role)}
            />
          ))}
        </div>
      ) : (
        <JobRoleForm
          role={selectedRole}
          isEditing={true}
          jobRoles={jobRoles}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default JobRoleManager;
