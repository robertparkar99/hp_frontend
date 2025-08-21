import React, { useState, useEffect } from 'react';
import AssessmentHeader from './components/AssessmentHeader';
import AssessmentProgress from './components/AssessmentProgress';
import QuestionCard from './components/QuestionCard';
import ContextualHelp from './components/ContextualHelp';
import AssessmentComplete from './components/AssessmentComplete';

const SkillAssessment = () => {
  const [isStarted, setIsStarted] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(1);

  // Mock assessment data
  const assessmentData = {
    sections: [
      {
        id: 'frontend',
        name: 'Frontend Development',
        icon: 'Monitor',
        totalQuestions: 15,
        completedQuestions: 0,
        completed: false,
        definition: `Frontend development involves creating the user-facing part of web applications using HTML, CSS, JavaScript, and modern frameworks like React, Angular, or Vue.js.`,
        examples: `Common applications include:\n• Building responsive web interfaces\n• Implementing interactive user experiences\n• Optimizing web performance\n• Ensuring cross-browser compatibility\n• Mobile-first design approaches`,
        relatedSkills: ['HTML/CSS', 'JavaScript', 'React', 'UI/UX Design', 'Responsive Design']
      },
      {
        id: 'backend',
        name: 'Backend Development',
        icon: 'Server',
        totalQuestions: 15,
        completedQuestions: 0,
        completed: false,
        definition: `Backend development focuses on server-side logic, databases, APIs, and system architecture that powers web applications.`,
        examples: `Common applications include:\n• Building REST APIs and GraphQL endpoints\n• Database design and optimization\n• Server configuration and deployment\n• Authentication and security implementation\n• Microservices architecture`,
        relatedSkills: ['Node.js', 'Python', 'SQL', 'API Design', 'Cloud Services']
      },
      {
        id: 'database',
        name: 'Database Management',
        icon: 'Database',
        totalQuestions: 15,
        completedQuestions: 0,
        completed: false,
        definition: `Database management involves designing, implementing, and maintaining database systems for efficient data storage and retrieval.`,
        examples: `Common applications include:\n• SQL query optimization\n• Database schema design\n• Data modeling and normalization\n• Backup and recovery strategies\n• Performance tuning`,
        relatedSkills: ['SQL', 'NoSQL', 'Data Modeling', 'Query Optimization', 'Database Security']
      },
      {
        id: 'devops',
        name: 'DevOps & Deployment',
        icon: 'GitBranch',
        totalQuestions: 15,
        completedQuestions: 0,
        completed: false,
        definition: `DevOps practices focus on automating and streamlining the software development lifecycle through continuous integration and deployment.`,
        examples: `Common applications include:\n• CI/CD pipeline setup\n• Container orchestration with Docker/Kubernetes\n• Infrastructure as Code\n• Monitoring and logging\n• Cloud platform management`,
        relatedSkills: ['Docker', 'Kubernetes', 'AWS/Azure', 'Jenkins', 'Terraform']
      },
      {
        id: 'testing',
        name: 'Testing & Quality Assurance',
        icon: 'CheckCircle',
        totalQuestions: 15,
        completedQuestions: 0,
        completed: false,
        definition: `Testing and QA involves ensuring software quality through various testing methodologies and automated testing frameworks.`,
        examples: `Common applications include:\n• Unit and integration testing\n• Test-driven development (TDD)\n• Automated testing frameworks\n• Performance testing\n• Security testing`,
        relatedSkills: ['Jest', 'Selenium', 'Test Automation', 'Performance Testing', 'Security Testing']
      },
      {
        id: 'project-management',
        name: 'Project Management',
        icon: 'Users',
        totalQuestions: 15,
        completedQuestions: 0,
        completed: false,
        definition: `Project management involves planning, executing, and delivering software projects using various methodologies and tools.`,
        examples: `Common applications include:\n• Agile/Scrum methodology\n• Sprint planning and retrospectives\n• Stakeholder communication\n• Risk management\n• Team coordination`,
        relatedSkills: ['Agile', 'Scrum', 'Kanban', 'Risk Management', 'Team Leadership']
      },
      {
        id: 'soft-skills',
        name: 'Communication & Leadership',
        icon: 'MessageSquare',
        totalQuestions: 15,
        completedQuestions: 0,
        completed: false,
        definition: `Communication and leadership skills are essential for effective collaboration and career advancement in technology roles.`,
        examples: `Common applications include:\n• Technical documentation\n• Code reviews and mentoring\n• Client presentations\n• Team leadership\n• Cross-functional collaboration`,
        relatedSkills: ['Technical Writing', 'Mentoring', 'Presentation Skills', 'Team Leadership', 'Conflict Resolution']
      },
      {
        id: 'emerging-tech',
        name: 'Emerging Technologies',
        icon: 'Zap',
        totalQuestions: 15,
        completedQuestions: 0,
        completed: false,
        definition: `Emerging technologies encompass cutting-edge developments in AI, machine learning, blockchain, and other innovative fields.`,
        examples: `Common applications include:\n• Machine learning model development\n• AI integration in applications\n• Blockchain development\n• IoT solutions\n• Cloud-native architectures`,
        relatedSkills: ['Machine Learning', 'AI/ML', 'Blockchain', 'IoT', 'Cloud Computing']
      }
    ],
    questions: [
      // Frontend Development Questions
      {
        id: 1,
        sectionId: 'frontend',
        skillCategory: 'Frontend Development',
        skillName: 'React Development',
        skillIcon: 'Monitor',
        questionNumber: 1,
        totalQuestions: 120,
        type: 'multiple-choice',
        title: 'What is the primary purpose of React hooks?',
        description: 'Consider the fundamental concept and benefits of React hooks in functional components.',
        options: [
          {
            value: 'state-logic',
            label: 'To use state and lifecycle features in functional components',
            description: 'Hooks allow functional components to have state and lifecycle methods'
          },
          {
            value: 'performance',
            label: 'To improve application performance',
            description: 'While hooks can help with performance, this is not their primary purpose'
          },
          {
            value: 'styling',
            label: 'To handle component styling',
            description: 'Hooks are not specifically designed for styling purposes'
          },
          {
            value: 'routing',
            label: 'To manage application routing',
            description: 'Routing is handled by separate libraries, not hooks directly'
          }
        ]
      },
      {
        id: 2,
        sectionId: 'frontend',
        skillCategory: 'Frontend Development',
        skillName: 'CSS & Responsive Design',
        skillIcon: 'Monitor',
        questionNumber: 2,
        totalQuestions: 120,
        type: 'rating',
        title: 'Rate your proficiency in creating responsive web layouts using CSS Grid and Flexbox',
        description: 'Consider your ability to create complex, responsive layouts that work across different screen sizes.',
        ratingLabels: {
          low: 'Basic understanding',
          high: 'Expert level'
        }
      },
      {
        id: 3,
        sectionId: 'frontend',
        skillCategory: 'Frontend Development',
        skillName: 'JavaScript ES6+',
        skillIcon: 'Monitor',
        questionNumber: 3,
        totalQuestions: 120,
        type: 'multiple-select',
        title: 'Which ES6+ features do you regularly use in your development work?',
        description: 'Select all the modern JavaScript features you are comfortable using.',
        options: [
          {
            value: 'arrow-functions',
            label: 'Arrow Functions',
            description: 'Concise function syntax with lexical this binding'
          },
          {
            value: 'destructuring',
            label: 'Destructuring Assignment',
            description: 'Extracting values from arrays and objects'
          },
          {
            value: 'async-await',
            label: 'Async/Await',
            description: 'Modern asynchronous programming syntax'
          },
          {
            value: 'modules',
            label: 'ES6 Modules',
            description: 'Import/export module system'
          },
          {
            value: 'template-literals',
            label: 'Template Literals',
            description: 'String interpolation with backticks'
          },
          {
            value: 'spread-operator',
            label: 'Spread Operator',
            description: 'Expanding arrays and objects'
          }
        ]
      },
      // Backend Development Questions
      {
        id: 4,
        sectionId: 'backend',
        skillCategory: 'Backend Development',
        skillName: 'API Development',
        skillIcon: 'Server',
        questionNumber: 4,
        totalQuestions: 120,
        type: 'scenario',
        title: 'You need to design a RESTful API for a user management system. What approach would you take?',
        scenario: `Your team is building a user management system that needs to handle user registration, authentication, profile updates, and user deletion. The API will be consumed by both web and mobile applications, and needs to be scalable and secure.`,
        options: [
          {
            value: 'rest-standard',
            label: 'Follow REST conventions with proper HTTP methods',
            description: 'Use GET, POST, PUT, DELETE with appropriate status codes and resource naming'
          },
          {
            value: 'single-endpoint',
            label: 'Create a single endpoint that handles all operations',
            description: 'Use one URL with different parameters to determine the operation'
          },
          {
            value: 'graphql-only',
            label: 'Use GraphQL instead of REST',
            description: 'Implement a GraphQL API for more flexible data fetching'
          },
          {
            value: 'custom-protocol',
            label: 'Design a custom protocol specific to the application',
            description: 'Create a proprietary API structure tailored to specific needs'
          }
        ]
      },
      {
        id: 5,
        sectionId: 'backend',
        skillCategory: 'Backend Development',
        skillName: 'Node.js Development',
        skillIcon: 'Server',
        questionNumber: 5,
        totalQuestions: 120,
        type: 'rating',
        title: 'Rate your experience with Node.js and Express.js for building server-side applications',
        description: 'Consider your ability to build scalable backend services, handle middleware, and manage asynchronous operations.'
      }
    ]
  };

  const totalQuestions = assessmentData.questions.length;
  const completedQuestions = Object.keys(answers).length;
  const totalSections = assessmentData.sections.length;

  // Update section completion status
  useEffect(() => {
    assessmentData.sections.forEach(section => {
      const sectionQuestions = assessmentData.questions.filter(q => q.sectionId === section.id);
      const sectionAnswers = sectionQuestions.filter(q => answers[q.id]);
      section.completedQuestions = sectionAnswers.length;
      section.completed = sectionAnswers.length === sectionQuestions.length;
    });
  }, [answers]);

  const handleStartAssessment = () => {
    setIsStarted(true);
  };

  const handlePauseAssessment = () => {
    // Save progress and show pause confirmation
    console.log('Assessment paused. Progress saved.');
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      updateCurrentSection();
    } else {
      // Complete assessment
      setIsCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      updateCurrentSection();
    }
  };

  const updateCurrentSection = () => {
    const currentQuestion = assessmentData.questions[currentQuestionIndex];
    const sectionIndex = assessmentData.sections.findIndex(s => s.id === currentQuestion.sectionId);
    setCurrentSection(sectionIndex + 1);
  };

  const handleSectionClick = (sectionId) => {
    const firstQuestionIndex = assessmentData.questions.findIndex(q => q.sectionId === sectionId);
    if (firstQuestionIndex !== -1) {
      setCurrentQuestionIndex(firstQuestionIndex);
      updateCurrentSection();
    }
  };

  const handleViewResults = () => {
    // Navigate to detailed results page
    window.location.href = '/my-learning-dashboard';
  };

  const handleRetakeAssessment = () => {
    setIsStarted(false);
    setIsCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentSection(1);
  };

  const getCurrentSkill = () => {
    if (!isStarted || isCompleted) return null;
    const currentQuestion = assessmentData.questions[currentQuestionIndex];
    return assessmentData.sections.find(s => s.id === currentQuestion.sectionId);
  };

  const getCurrentQuestion = () => {
    if (!isStarted || isCompleted) return null;
    return assessmentData.questions[currentQuestionIndex];
  };

  // Mock results data for completion screen
  const mockResults = {
    totalQuestions: 120,
    totalSkills: 8,
    strongSkills: 3,
    developingSkills: 5,
    recommendedCourses: 12,
    skillScores: [
      { name: 'Frontend Development', category: 'Technical', icon: 'Monitor', score: 85 },
      { name: 'Backend Development', category: 'Technical', icon: 'Server', score: 72 },
      { name: 'Database Management', category: 'Technical', icon: 'Database', score: 68 },
      { name: 'DevOps & Deployment', category: 'Technical', icon: 'GitBranch', score: 45 },
      { name: 'Testing & QA', category: 'Technical', icon: 'CheckCircle', score: 78 },
      { name: 'Project Management', category: 'Soft Skills', icon: 'Users', score: 82 },
      { name: 'Communication', category: 'Soft Skills', icon: 'MessageSquare', score: 88 },
      { name: 'Emerging Technologies', category: 'Technical', icon: 'Zap', score: 35 }
    ],
    topRecommendations: [
      'Advanced DevOps Practices',
      'Machine Learning Fundamentals',
      'Cloud Architecture Patterns',
      'Advanced Database Optimization'
    ]
  };

  if (isCompleted) {
    return (
      <div className="">
        <main className="pt-16 pb-24 md:pb-8">
          <div className="container mx-auto px-6 py-8">
            <AssessmentComplete 
              results={mockResults}
              onViewResults={handleViewResults}
              onRetakeAssessment={handleRetakeAssessment}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="">
        <div className="container mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left Sidebar - Progress */}
              <div className="lg:col-span-4">
                <AssessmentProgress 
                  currentSection={currentSection}
                  totalSections={totalSections}
                  completedQuestions={completedQuestions}
                  totalQuestions={totalQuestions}
                  sections={assessmentData.sections}
                  onSectionClick={handleSectionClick}
                />
              </div>

              {/* Main Content - Question */}
              <div className="lg:col-span-8">
                <QuestionCard 
                  question={getCurrentQuestion()}
                  onAnswer={(answer) => handleAnswer(getCurrentQuestion().id, answer)}
                  onNext={handleNextQuestion}
                  onPrevious={handlePreviousQuestion}
                  isFirst={currentQuestionIndex === 0}
                  isLast={currentQuestionIndex === totalQuestions - 1}
                  currentAnswer={answers[getCurrentQuestion()?.id]}
                />
              </div>

              {/* Right Sidebar - Contextual Help */}
              {/* <div className="lg:col-span-3">
                <ContextualHelp 
                  currentSkill={getCurrentSkill()}
                  currentQuestion={getCurrentQuestion()}
                />
              </div> */}
            </div>
        </div>
      </main>
    </div>
  );
};

export default SkillAssessment;