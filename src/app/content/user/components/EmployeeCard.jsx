'use client';
import React from 'react';
import Image from '../../../../components/AppImage';
import Icon from '../../../../components/AppIcon';
import { Button } from '../../../../components/ui/button';

const EmployeeCard = ({ employee, onViewProfile, onEdit }) => {
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

  // 🔹 Function to navigate to taskManagement.tsx like your reference code
  const handleAssignTaskMenu = (employeeId) => {
    localStorage.setItem("clickedUser", employeeId);
    const menu = "task/taskManagement.tsx";
    window.__currentMenuItem = menu;
    window.dispatchEvent(
      new CustomEvent("menuSelected", {
        detail: {
          menu,
          pageType: "page",
          access: menu,
          pageProps: employeeId || null,
        },
      })
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-card transition-smooth">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <Image
            src={
              employee.image && employee.image.trim()
                ? employee.image.startsWith('http')
                  ? employee.image // already a full URL, use as-is
                  : `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${employee.image}`
                : 'https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39'
            }
            alt={employee.full_name || 'Employee'}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
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

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  localStorage.setItem("clickedUser", employee.id);
                  const menu = "user/usersTabs.tsx";
                  window.__currentMenuItem = menu;
                  window.dispatchEvent(
                    new CustomEvent("menuSelected", {
                      detail: {
                        menu,
                        pageType: "page",
                        access: menu,
                        pageProps: employee.id || null,
                      },
                    })
                  );
                }}
                className="h-8 w-8"
              >
                <Icon name="Edit" size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={14} />
              <span>{employee.address}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Mail" size={14} />
              <span>{employee.email}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {employee.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}
                >
                  {skill.name}
                </span>
              ))}
              {employee.skills.length > 3 && (
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

            {/* 🔹 Assign Task Button with Navigation */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAssignTaskMenu(employee.id)}
              iconName="Plus"
              iconPosition="left"
            >
              Assign Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
