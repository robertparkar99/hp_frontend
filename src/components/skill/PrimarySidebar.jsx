import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const PrimarySidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationSections = [
    {
      label: 'Organization Management',
      items: [
        {
          label: 'Employee List & Profiles',
          path: '/employee-list-profiles',
          icon: 'Users'
        },
        {
          label: 'Organization Details',
          path: '/organization-profile-management',
          icon: 'Building2'
        },
        {
          label: 'Skill Gap Analysis',
          path: '/skill-gap-analysis',
          icon: 'TrendingUp'
        }
      ]
    },
    {
      label: 'Skill Management',
      items: [
        {
          label: 'Skill Library Management',
          path: '/skill-library-management',
          icon: 'BookOpen'
        },
        {
          label: 'Job Role Library',
          path: '/job-role-library',
          icon: 'Briefcase'
        }
      ]
    },
    {
      label: 'LMS',
      items: [
        {
          label: 'Courses Management',
          path: '/courses-management',
          icon: 'GraduationCap'
        },
        {
          label: 'Quiz & Assessment System',
          path: '/quiz-assessment-system',
          icon: 'FileText'
        }
      ]
    },
    {
      label: 'Reports',
      items: [
        {
          label: 'Comprehensive Reports Dashboard',
          path: '/comprehensive-reports-dashboard',
          icon: 'BarChart3'
        }
      ]
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-[1100] p-2 bg-card border border-border rounded-md shadow-elevation-1"
      >
        <Icon name={isMobileOpen ? "X" : "Menu"} size={20} />
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[1050]"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-card border-r border-border z-[900]
        transform transition-transform duration-300 ease-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Navigation Content */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="px-4 space-y-8">
              {navigationSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                    {section.label}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileOpen(false)}
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
                            size={18} 
                            className={isActiveRoute(item.path) ? 'text-primary-foreground' : 'text-muted-foreground'}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Footer Section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Icon name="Building2" size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Acme Corporation</p>
                <p className="text-xs text-muted-foreground">Enterprise Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default PrimarySidebar;