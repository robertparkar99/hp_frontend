import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import {Button} from '@/components/ui/button';

const ContextualHelp = ({ currentSkill, currentQuestion }) => {
  const [activeTab, setActiveTab] = useState('definition');

  const helpContent = {
    definition: {
      title: "Skill Definition",
      content: currentSkill?.definition || `${currentSkill?.name} involves the ability to design, develop, and maintain software applications using modern programming languages and frameworks. This includes understanding of software architecture, design patterns, and best practices for code quality and maintainability.`
    },
    examples: {
      title: "Examples & Applications",
      content: currentSkill?.examples || `Common applications include:\n• Building web applications using React, Angular, or Vue.js\n• Developing REST APIs and microservices\n• Implementing database design and optimization\n• Writing unit tests and integration tests\n• Code review and refactoring practices\n• Version control with Git and collaborative development`
    },
    tips: {
      title: "Assessment Tips",
      content: `• Be honest about your current skill level\n• Consider your practical experience, not just theoretical knowledge\n• Think about recent projects where you've applied this skill\n• Rate based on your ability to work independently\n• Consider both breadth and depth of your knowledge`
    }
  };

  const tabs = [
    { id: 'definition', label: 'Definition', icon: 'BookOpen' },
    { id: 'examples', label: 'Examples', icon: 'Lightbulb' },
    { id: 'tips', label: 'Tips', icon: 'HelpCircle' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Contextual Help</h3>
        {currentSkill && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name={currentSkill.icon} size={16} />
            <span>{currentSkill.name}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-foreground mb-3">{helpContent[activeTab].title}</h4>
          <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {helpContent[activeTab].content}
          </div>
        </div>

        {activeTab === 'definition' && currentSkill?.relatedSkills && (
          <div className="border-t border-border pt-4">
            <h5 className="text-sm font-medium text-foreground mb-2">Related Skills</h5>
            <div className="flex flex-wrap gap-2">
              {currentSkill.relatedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {currentQuestion?.type === 'scenario' && (
          <div className="border-t border-border pt-4">
            <h5 className="text-sm font-medium text-foreground mb-2">Scenario Context</h5>
            <p className="text-sm text-muted-foreground">
              This scenario-based question evaluates your practical decision-making skills. 
              Consider the real-world implications of each option and choose the approach 
              that demonstrates best practices and professional judgment.
            </p>
          </div>
        )}

        {currentQuestion?.type === 'rating' && (
          <div className="border-t border-border pt-4">
            <h5 className="text-sm font-medium text-foreground mb-2">Rating Scale Guide</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-medium">1</div>
                <span className="text-muted-foreground">Beginner - Limited or no experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium">2</div>
                <span className="text-muted-foreground">Novice - Basic understanding</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-medium">3</div>
                <span className="text-muted-foreground">Intermediate - Can work with guidance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">4</div>
                <span className="text-muted-foreground">Advanced - Can work independently</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium">5</div>
                <span className="text-muted-foreground">Expert - Can mentor others</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4 mt-6">
        <Button
          variant="ghost"
          size="sm"
          iconName="MessageCircle"
          iconPosition="left"
          fullWidth
        >
          Need More Help?
        </Button>
      </div>
    </div>
  );
};

export default ContextualHelp;