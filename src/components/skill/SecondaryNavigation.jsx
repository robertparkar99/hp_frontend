import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const SecondaryNavigation = ({ employeeId }) => {
  const location = useLocation();

  const secondaryNavItems = [
    {
      label: 'Personal Details',
      path: `/employee-list-profiles/${employeeId}/personal-details`,
      icon: 'User'
    },
    {
      label: 'Job Role-Specific Skills',
      path: `/employee-list-profiles/${employeeId}/job-role-skills`,
      icon: 'Target'
    },
    {
      label: 'Job Role-Specific Tasks',
      path: `/employee-list-profiles/${employeeId}/job-role-tasks`,
      icon: 'CheckSquare'
    },
    {
      label: 'Self-Skill Assessment',
      path: `/employee-list-profiles/${employeeId}/skill-assessment`,
      icon: 'Award'
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-60 bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={20} color="white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Employee Profile</h3>
            <p className="text-xs text-muted-foreground">ID: {employeeId}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4">
        <ul className="space-y-1">
          {secondaryNavItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-micro
                  ${isActiveRoute(item.path)
                    ? 'bg-primary text-primary-foreground shadow-elevation-1'
                    : 'text-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon 
                  name={item.icon} 
                  size={16} 
                  className={isActiveRoute(item.path) ? 'text-primary-foreground' : 'text-muted-foreground'}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-micro">
            <Icon name="Download" size={14} />
            <span>Export Profile</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-micro">
            <Icon name="Share" size={14} />
            <span>Share Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondaryNavigation;