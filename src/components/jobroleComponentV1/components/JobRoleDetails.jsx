import React from 'react';
import Icon from '../../../components/AppIcon';
import {Button} from '../../../components/ui/button';

const JobRoleDetails = ({ role, onClose, onEdit }) => {
  if (!role) return null;

  const getLevelBadgeColor = (level) => {
    const colors = {
      'Entry': 'bg-success/10 text-success border-success/20',
      'Mid': 'bg-warning/10 text-warning border-warning/20',
      'Senior': 'bg-primary/10 text-primary border-primary/20',
      'Executive': 'bg-error/10 text-error border-error/20'
    };
    return colors[level] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1200] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{role.title || 'Untitled Role'}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelBadgeColor(role.level)}`}>
                  {role.level || 'N/A'} Level
                </span>
                <span className="text-sm text-muted-foreground">{role.department || 'N/A'}</span>
                {role.subDepartment && (
                  <>
                    {/* <span className="text-muted-foreground">•</span> */}
                    {/* <span className="text-sm text-muted-foreground">{role.subDepartment}</span> */}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(role)}
              iconName="Edit"
              iconPosition="left"
            >
              Edit Role
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Users" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Current Employees</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{role.employeeCount ?? 0}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Calendar" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Last Updated</span>
                </div>
                <span className="text-sm text-muted-foreground">{role.lastUpdated || 'N/A'}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Activity" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  {role.isActive ? (
                    <>
                      <Icon name="CheckCircle" size={14} className="text-success" />
                      <span className="text-sm text-success">Active</span>
                    </>
                  ) : (
                    <>
                      <Icon name="XCircle" size={14} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Icon name="FileText" size={18} />
                <span>Job Description</span>
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {role.description || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Performance Expectations */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Icon name="Target" size={18} />
                <span>Performance Expectations</span>
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                {Array.isArray(role.performanceExpectations) && role.performanceExpectations.length > 0 ? (
                  <ul className="space-y-3">
                    {role.performanceExpectations.map((expectation, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">{index + 1}</span>
                        </div>
                        <span className="text-foreground leading-relaxed">{expectation}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-muted-foreground">No performance expectations listed.</span>
                )}
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Icon name="Award" size={18} />
                <span>Required Skills</span>
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                {Array.isArray(role.requiredSkills) && role.requiredSkills.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {role.requiredSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-background rounded-md p-3 border border-border"
                      >
                        <Icon name="CheckCircle2" size={14} className="text-success flex-shrink-0" />
                        <span className="text-sm text-foreground">{skill}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No required skills listed.</span>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                  <Icon name="Info" size={18} />
                  <span>Role Information</span>
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Role ID:</span>
                    <span className="text-sm font-medium text-foreground">{role.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created Date:</span>
                    <span className="text-sm font-medium text-foreground">{role.createdDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Department:</span>
                    <span className="text-sm font-medium text-foreground">{role.department || 'N/A'}</span>
                  </div>
                  {role.subDepartment && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sub-Department:</span>
                      <span className="text-sm font-medium text-foreground">{role.subDepartment}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                  <Icon name="TrendingUp" size={18} />
                  <span>Career Progression</span>
                </h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Current Level:</div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getLevelBadgeColor(role.level)}`}>
                      {role.level || 'N/A'} Level
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      This role is positioned at the {(role.level || 'entry').toLowerCase()} level within the organizational hierarchy.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobRoleDetails;