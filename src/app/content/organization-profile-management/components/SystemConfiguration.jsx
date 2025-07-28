import React, { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Checkbox } from '../../../../components/ui/Checkbox';
import Icon from '../../../../components/AppIcon';

const SystemConfiguration = ({ onSave, loading = false }) => {
  const [config, setConfig] = useState({
    skillAssessmentFrequency: 'quarterly',
    courseCompletionRequirement: 80,
    reportingPeriod: 'monthly',
    autoEnrollment: true,
    skillBadges: true,
    learningReminders: true,
    progressTracking: true,
    managerNotifications: true,
    skillExpiryPeriod: 12,
    assessmentRetries: 3,
    certificateExpiry: 24,
    defaultCompetencyLevel: 'intermediate'
  });

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ];

  const competencyLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(config);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">System Configuration</h3>
        <Icon name="Settings" size={20} className="text-muted-foreground" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Assessment Settings */}
        <div>
          <h4 className="text-base font-medium text-foreground mb-4">Assessment Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Skill Assessment Frequency"
              value={config.skillAssessmentFrequency}
              onChange={(value) => handleInputChange('skillAssessmentFrequency', value)}
              options={frequencyOptions}
              description="How often should skills be reassessed?"
            />
            
            <Input
              label="Course Completion Requirement (%)"
              type="number"
              value={config.courseCompletionRequirement}
              onChange={(e) => handleInputChange('courseCompletionRequirement', parseInt(e.target.value))}
              min="0"
              max="100"
              description="Minimum percentage required to complete a course"
            />
          </div>
        </div>

        {/* Reporting Settings */}
        <div>
          <h4 className="text-base font-medium text-foreground mb-4">Reporting Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Reporting Period"
              value={config.reportingPeriod}
              onChange={(value) => handleInputChange('reportingPeriod', value)}
              options={frequencyOptions}
              description="Default reporting period for analytics"
            />
            
            <Select
              label="Default Competency Level"
              value={config.defaultCompetencyLevel}
              onChange={(value) => handleInputChange('defaultCompetencyLevel', value)}
              options={competencyLevelOptions}
              description="Default skill level for new employees"
            />
          </div>
        </div>

        {/* Expiry Settings */}
        <div>
          <h4 className="text-base font-medium text-foreground mb-4">Expiry & Validity Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Skill Expiry Period (months)"
              type="number"
              value={config.skillExpiryPeriod}
              onChange={(e) => handleInputChange('skillExpiryPeriod', parseInt(e.target.value))}
              min="1"
              description="After how many months should skills be re-assessed?"
            />
            
            <Input
              label="Assessment Retries"
              type="number"
              value={config.assessmentRetries}
              onChange={(e) => handleInputChange('assessmentRetries', parseInt(e.target.value))}
              min="1"
              max="10"
              description="Maximum number of assessment attempts"
            />
            
            <Input
              label="Certificate Expiry (months)"
              type="number"
              value={config.certificateExpiry}
              onChange={(e) => handleInputChange('certificateExpiry', parseInt(e.target.value))}
              min="1"
              description="Certificate validity period"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div>
          <h4 className="text-base font-medium text-foreground mb-4">Feature Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="autoEnrollment"
                  checked={config.autoEnrollment}
                  onChange={(e) => handleInputChange('autoEnrollment', e.target.checked)}
                />
                <label htmlFor="autoEnrollment" className="text-sm font-medium text-foreground">
                  Auto-enrollment for new employees
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="skillBadges"
                  checked={config.skillBadges}
                  onChange={(e) => handleInputChange('skillBadges', e.target.checked)}
                />
                <label htmlFor="skillBadges" className="text-sm font-medium text-foreground">
                  Enable skill badges
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="learningReminders"
                  checked={config.learningReminders}
                  onChange={(e) => handleInputChange('learningReminders', e.target.checked)}
                />
                <label htmlFor="learningReminders" className="text-sm font-medium text-foreground">
                  Learning reminders & notifications
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="progressTracking"
                  checked={config.progressTracking}
                  onChange={(e) => handleInputChange('progressTracking', e.target.checked)}
                />
                <label htmlFor="progressTracking" className="text-sm font-medium text-foreground">
                  Progress tracking
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
          <Button variant="outline">
            Reset to Defaults
          </Button>
          <Button type="submit" loading={loading}>
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SystemConfiguration;