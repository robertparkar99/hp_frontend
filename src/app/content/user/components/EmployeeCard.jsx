'use client';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit, MapPin, Mail, Plus } from 'lucide-react';
import Image from '../../../../components/AppImage';
import Icon from '../../../../components/AppIcon';
import { Button } from '../../../../components/ui/button';

const EmployeeCard = ({ employee, onViewProfile, onEdit }) => {
  const [showActions, setShowActions] = useState(null);
  const [clickedButtonRect, setClickedButtonRect] = useState(null);
  const fallbackImage =
    "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

  const [imgSrc, setImgSrc] = useState(
    employee.image && employee.image.trim()
      ? employee.image.startsWith("http")
        ? employee.image
        : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${employee.image}`
      : fallbackImage
  );

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'bg-success text-success-foreground';
      case 'Advanced': return 'bg-primary text-primary-foreground';
      case 'Intermediate': return 'bg-warning text-warning-foreground';
      case 'Beginner': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-success';
      case 'Inactive': return 'bg-warning';
      case 'Offline': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const triggerMenuNavigation = (employeeId, menu) => {
    localStorage.setItem('clickedUser', employeeId);

    const menuRoutes = {
      'user/viewProfile.tsx': `/content/user/profile/`,
      'user/usersTabs.tsx': `/content/user/edit/`,
      'task/taskManagement.tsx': `/content/task/assign/`
    };

    const routePath = menuRoutes[menu];
    if (routePath) {
      window.location.href = routePath;
    }
  };

  const handleAssignTaskMenu = (employee) => {
    triggerMenuNavigation(employee.id, 'task/taskManagement.tsx');
  };

  const handleEditEmployeeMenu = (employee) => {
    triggerMenuNavigation(employee.id, 'user/usersTabs.tsx');
  };

  const handleMenuToggle = (employeeId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickedButtonRect(rect);
    setShowActions(showActions === employeeId ? null : employeeId);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-card transition-smooth">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <Image
            src={imgSrc}
            alt={employee.full_name || "Employee"}
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            onError={() => setImgSrc(fallbackImage)}
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(employee.status)}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground truncate">
                {employee.full_name}
              </h3>
              <p className="text-sm text-muted-foreground">{employee.mobile}</p>
              <p className="text-sm text-muted-foreground">{employee.profile_name}</p>
            </div>

            <div className="relative">
              <button
                onClick={(e) => handleMenuToggle(employee.id, e)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <Icon name="MoreHorizontal" size={16} />
              </button>

              {showActions === employee.id && clickedButtonRect &&
                createPortal(
                  <div
                    className="absolute w-48 bg-popover border border-border rounded-md shadow-lg z-50"
                    style={{
                      top: clickedButtonRect.bottom + window.scrollY,
                      left: clickedButtonRect.left + window.scrollX
                    }}
                  >
                    <div className="py-2">
                      <button
                        onClick={() => handleEditEmployeeMenu(employee)}
                        className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Employee</span>
                      </button>
                    </div>
                  </div>,
                  document.body
                )
              }
            </div>
          </div>

          <div className="mt-3 flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{employee.address}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>{employee.email}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {employee.skills?.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}
                >
                  {skill.name}
                </span>
              ))}
              {employee.skills?.length > 3 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  +{employee.skills.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-foreground">
              <span className="mr-2">Status:</span>
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${getStatusColor(
                  employee.status
                )}`}
              ></span>
              <span className="ml-2">{employee.status}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAssignTaskMenu(employee)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Assign Task</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
