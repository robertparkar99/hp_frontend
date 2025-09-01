import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ResponsibilityLevels = () => {
  const [activeTab, setActiveTab] = useState('Entry');

  const responsibilityLevels = {
    'Entry': {
      title: 'Entry Level',
      description: 'New professionals starting their career journey with foundational skills and supervised responsibilities.',
      characteristics: [
        'Limited professional experience (0-2 years)',
        'Requires guidance and mentorship',
        'Focuses on learning and skill development',
        'Handles routine tasks and assignments',
        'Works under close supervision'
      ],
      expectations: [
        'Complete assigned tasks accurately and on time',
        'Actively participate in training and development programs',
        'Seek feedback and apply it constructively',
        'Demonstrate willingness to learn new skills',
        'Follow established processes and procedures'
      ],
      roleExamples: [
        'Junior Software Developer',
        'Marketing Assistant',
        'Sales Associate',
        'HR Coordinator',
        'Financial Analyst I'
      ]
    },
    'Mid': {
      title: 'Mid Level',
      description: 'Experienced professionals with proven competencies who can work independently and contribute to team objectives.',
      characteristics: [
        'Moderate professional experience (2-5 years)',
        'Works independently with minimal supervision',
        'Contributes to project planning and execution',
        'Mentors junior team members',
        'Demonstrates specialized knowledge'
      ],
      expectations: [
        'Lead small to medium-sized projects',
        'Provide guidance to entry-level employees',
        'Contribute to process improvements',
        'Collaborate effectively across departments',
        'Take ownership of deliverables and outcomes'
      ],
      roleExamples: [
        'Software Engineer',
        'Marketing Specialist',
        'Account Manager',
        'HR Business Partner',
        'Senior Financial Analyst'
      ]
    },
    'Senior': {
      title: 'Senior Level',
      description: 'Highly experienced professionals who drive strategic initiatives and provide leadership within their domain.',
      characteristics: [
        'Extensive professional experience (5-10 years)',
        'Subject matter expert in their field',
        'Leads complex projects and initiatives',
        'Influences organizational decisions',
        'Develops and implements strategies'
      ],
      expectations: [
        'Drive strategic initiatives and innovation',
        'Lead cross-functional teams and projects',
        'Mentor and develop team members',
        'Represent the organization externally',
        'Contribute to long-term planning and vision'
      ],
      roleExamples: [
        'Senior Software Engineer',
        'Marketing Manager',
        'Sales Manager',
        'HR Manager',
        'Finance Manager'
      ]
    },
    'Executive': {
      title: 'Executive Level',
      description: 'Senior leaders responsible for organizational strategy, major decision-making, and enterprise-wide impact.',
      characteristics: [
        'Extensive leadership experience (10+ years)',
        'Sets organizational vision and strategy',
        'Manages large teams and budgets',
        'Accountable for business outcomes',
        'Influences industry and market direction'
      ],
      expectations: [
        'Define and execute organizational strategy',
        'Lead major business transformations',
        'Build and maintain key stakeholder relationships',
        'Drive organizational culture and values',
        'Ensure sustainable business growth'
      ],
      roleExamples: [
        'Chief Technology Officer',
        'VP of Marketing',
        'VP of Sales',
        'Chief Human Resources Officer',
        'Chief Financial Officer'
      ]
    }
  };

  const tabs = Object.keys(responsibilityLevels);

  const getTabColor = (level) => {
    const colors = {
      'Entry': 'text-success border-success',
      'Mid': 'text-warning border-warning',
      'Senior': 'text-primary border-primary',
      'Executive': 'text-error border-error'
    };
    return colors[level] || 'text-muted-foreground border-border';
  };

  const getActiveTabColor = (level) => {
    const colors = {
      'Entry': 'bg-success/10 text-success border-success',
      'Mid': 'bg-warning/10 text-warning border-warning',
      'Senior': 'bg-primary/10 text-primary border-primary',
      'Executive': 'bg-error/10 text-error border-error'
    };
    return colors[level] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Levels of Responsibility</h2>
        <p className="text-muted-foreground">
          Understanding the different responsibility levels helps in proper job role classification and career progression planning.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-micro ${
              activeTab === tab
                ? getActiveTabColor(tab)
                : 'text-muted-foreground hover:text-foreground hover:bg-background'
            }`}
          >
            {responsibilityLevels[tab].title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {responsibilityLevels[activeTab].title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {responsibilityLevels[activeTab].description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Characteristics */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-3 flex items-center space-x-2">
              <Icon name="User" size={16} />
              <span>Key Characteristics</span>
            </h4>
            <ul className="space-y-2">
              {responsibilityLevels[activeTab].characteristics.map((characteristic, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <Icon name="CheckCircle2" size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{characteristic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expectations */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-3 flex items-center space-x-2">
              <Icon name="Target" size={16} />
              <span>Performance Expectations</span>
            </h4>
            <ul className="space-y-2">
              {responsibilityLevels[activeTab].expectations.map((expectation, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <Icon name="ArrowRight" size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{expectation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Role Examples */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-3 flex items-center space-x-2">
            <Icon name="Briefcase" size={16} />
            <span>Example Roles</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {responsibilityLevels[activeTab].roleExamples.map((role, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Career Progression */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-md font-medium text-foreground mb-2 flex items-center space-x-2">
            <Icon name="TrendingUp" size={16} />
            <span>Career Progression Path</span>
          </h4>
          <div className="flex items-center space-x-2 text-sm">
            {tabs.map((level, index) => (
              <React.Fragment key={level}>
                <span className={`px-2 py-1 rounded ${
                  level === activeTab ? getActiveTabColor(level) : 'bg-background text-muted-foreground'
                }`}>
                  {level}
                </span>
                {index < tabs.length - 1 && (
                  <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsibilityLevels;