'use client';
import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import { Button } from '../../../../components/ui/button';
// import dynamic from 'next/dynamic';

// // Import your existing AddUserModal component
// const AddUserModal = dynamic(() => import('../AddUserModal'), {
//   ssr: false,
//   loading: () => <p>Loading...</p>
// });

const StatsSidebar = ({
  stats,
  onBulkAssignTask,
  onBulkExport,
  selectedCount,
  onBulkSkillAssessment,
  sessionData,
  userJobroleLists = [], // Add this prop
  userLOR = [],
  userProfiles = [],
  userLists = [],
  userDepartmentLists = [], // Add this prop for departments
}) => {
  // const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Add User Modal */}
      {/* {isAddUserModalOpen && (
        <AddUserModal
          isOpen={isAddUserModalOpen}
          setIsOpen={setIsAddUserModalOpen}
          sessionData={sessionData}
          userJobroleLists={userJobroleLists} // Pass the prop here
          userLOR={userLOR}
          userDepartmentLists={userDepartmentLists} // Pass the prop here
          userProfiles={userProfiles}
          userLists={userLists}
        />
      )} */}

      {/* Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Overview</h3>
        <div className="space-y-4">
          {/* <div className="flex justify-between">
            <span>Total Employees</span>
            <span>{stats.totalEmployees}</span>
          </div> */}
          <div className="flex justify-between">
            <span>Active</span>
            <span>{stats.activeEmployees}</span>
          </div>
          <div className="flex justify-between">
            <span>Inactive</span>
            <span>{stats.awayEmployees}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => setIsAddUserModalOpen(true)}
        >
          Add Employee
        </Button>
      </div> */}
    </div>
  );
};

export default StatsSidebar;