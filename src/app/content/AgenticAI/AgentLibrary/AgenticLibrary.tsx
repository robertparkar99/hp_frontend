import { Globe, CheckSquare, Award, Briefcase, ShieldCheck, BookOpen, Brain, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Agent {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  module: string;
  summary: string;
  function: string;
  workflow: string[];
  outputs: string[];
  cta: string;
  ctaLink: string;
}

const agents: Agent[] = [
  // {
  //   id: 'website-analyzer',
  //   name: 'Website Analyzer Agent',
  //   icon: Globe,
  //   module: 'Organization Management',
  //   summary: 'Evaluates organization websites to extract business intelligence and capability indicators',
  //   function: 'The Website Analyzer Agent evaluates an organization\'s website to extract business intelligence, operational signals, and capability indicators. It supports automated understanding of an organization\'s industry presence, maturity, and functional focus.',
  //   workflow: [
  //     'User provides or confirms the organization website URL',
  //     'Agent crawls and analyzes publicly available content',
  //     'NLP and semantic models identify industry, offerings, roles, and skills',
  //     'Insights are structured and stored within the organization profile'
  //   ],
  //   outputs: ['Identified Industry & Sub-Industry', 'Extracted Business Functions', 'Role & Skill Indicators', 'Website Quality & Content Signals'],
  //   cta: 'View in Organization Management',
  //   ctaLink: '/organization-management'
  // },
  {
    id: 'task-management',
    name: 'Task Management Agent',
    icon: CheckSquare,
    module: 'Organization Management → Task Assignment',
    summary: 'Intelligently supports task creation, allocation, and prioritization using organizational context',
    function: 'This agent intelligently supports task creation, allocation, and prioritization by analyzing organizational context, roles, and workload distribution.',
    workflow: [
      'User initiates task creation or assignment',
      'Agent analyzes task intent and complexity',
      'Maps tasks to relevant roles or users',
      'Suggests priority, dependencies, and timelines'
    ],
    outputs: ['Smart Task Assignments', 'Priority & Effort Recommendations', 'Role-Aligned Task Distribution', 'Reduced Manual Planning Overhead'],
    cta: 'Go to Task Assignment',
    ctaLink: '/content/task'
  },
  {
    id: 'skill-generator',
    name: 'Skill Generator Agent',
    icon: Award,
    module: 'Competency Library',
    summary: 'Dynamically creates standardized skill definitions aligned with industry frameworks',
    function: 'The Skill Generator Agent dynamically creates standardized skill definitions aligned with industry frameworks, job roles, and organizational needs.',
    workflow: [
      'User inputs domain, role, or competency requirement',
      'Agent references internal frameworks and standards',
      'Generates structured skill taxonomy',
      'Skills are published to the competency library'
    ],
    outputs: ['Skill Name & Description', 'Category & Sub-Category Mapping', 'Proficiency Level Definitions', 'Reusable Skill Objects'],
    cta: 'Open Competency Library',
    ctaLink: '/content/Libraries/skillLibrary'
  },
  {
    id: 'job-role-generator',
    name: 'Job Role Generator Agent',
    icon: Briefcase,
    module: 'Competency Library',
    summary: 'Automates creation of detailed job role definitions with skill and responsibility mappings',
    function: 'This agent automates the creation of detailed job role definitions using industry-aligned skill and responsibility mappings.',
    workflow: [
      'User specifies role intent or industry context',
      'Agent analyzes benchmark data and competencies',
      'Generates role structure with expectations',
      'Role is added to the competency ecosystem'
    ],
    outputs: ['Job Role Description', 'Required Skills & Proficiency Levels', 'Responsibility & Outcome Mapping', 'Career Path Alignment'],
    cta: 'Manage Job Roles',
    ctaLink: '/job-roles'
  },
  {
    id: 'sanity-check',
    name: 'Sanity Check Agent',
    icon: ShieldCheck,
    module: 'User Profile → Self Rating of Skills',
    summary: 'Validates user self-assessments by identifying inconsistencies and rating gaps',
    function: 'The Sanity Check Agent validates user self-assessments by identifying inconsistencies, overstatements, or gaps in skill ratings.',
    workflow: [
      'User submits self-rated skills',
      'Agent cross-validates ratings against benchmarks',
      'Flags anomalies or unrealistic scores',
      'Provides corrective guidance'
    ],
    outputs: ['Skill Rating Validation', 'Confidence & Gap Indicators', 'Rating Adjustment Suggestions', 'Improved Data Accuracy'],
    cta: 'Review Skill Self-Rating',
    ctaLink: '/content/user/edit'
  },
  {
    id: 'course-generator',
    name: 'Build with AI – Course Generator Agent',
    icon: BookOpen,
    module: 'Competency Library',
    summary: 'Creates structured, modular learning courses tailored to specific skills and roles',
    function: 'This agent creates structured, modular learning courses tailored to specific skills, roles, or competency gaps.',
    workflow: [
      'User selects skill or role',
      'Agent designs learning objectives',
      'Generates course structure and modules',
      'Content is published for learning delivery'
    ],
    outputs: ['Course Outline & Modules', 'Learning Objectives', 'Skill-to-Content Mapping', 'AI-Generated Learning Assets'],
    cta: 'Create AI Course',
    ctaLink: '/course-generator'
  },
  {
    id: 'pal-agent',
    name: 'Personalized Adaptive Learning (PAL) Agent',
    icon: Brain,
    module: 'Agentic AI → PAL',
    summary: 'Delivers adaptive learning journeys with real-time content adjustment based on performance',
    function: 'PAL delivers adaptive learning journeys by continuously adjusting content based on user performance, behavior, and progress.',
    workflow: [
      'Agent analyzes user skill profile',
      'Maps learning goals and gaps',
      'Dynamically adjusts learning path',
      'Continuously optimizes recommendations'
    ],
    outputs: ['Personalized Learning Paths', 'Real-Time Adaptation', 'Skill Progress Insights', 'Outcome-Oriented Learning'],
    cta: 'Launch PAL Agent',
    ctaLink: 'https://learningagent-kxvkny4y8p5ud4abjappvx7.streamlit.app/'
  },
  {
    id: 'smart-recruitment',
    name: 'Smart Recruitment Agent',
    icon: Users,
    module: 'Talent Management → Talent Acquisition',
    summary: 'Enhances hiring through intelligent candidate-job matching using competency alignment',
    function: 'The Smart Recruitment Agent enhances hiring by matching candidates with job roles using skill, experience, and competency alignment.',
    workflow: [
      'Job role and requirements are defined',
      'Agent evaluates candidate profiles',
      'Performs intelligent matching',
      'Ranks candidates by fitment score'
    ],
    outputs: ['Candidate Fit Scores', 'Skill Match Analysis', 'Hiring Recommendations', 'Reduced Screening Time'],
    cta: 'Go to Talent Acquisition',
    ctaLink: '/content/Telent-management/Recruitment-management'
  }
];

function AgentCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon;
  const router = useRouter();

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-2xl hover:shadow-blue-400/20 transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden hover:scale-105 hover:-translate-y-1 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50/30">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 group-hover:ring-2 group-hover:ring-blue-300 transition-all duration-300">
              <Icon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">{agent.name}</h3>
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
            {agent.module}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.summary}</p>

        <div className="absolute inset-0 bg-white p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 overflow-y-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Function</h4>
            <p className="text-sm text-gray-700">{agent.function}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Workflow</h4>
            <ol className="space-y-1">
              {agent.workflow.map((step, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="font-medium text-blue-400 mr-2">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Outputs Overview</h4>
            <ul className="space-y-1">
              {agent.outputs.map((output, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>{output}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => agent.ctaLink.startsWith('http') ? window.open(agent.ctaLink, '_blank') : router.push(agent.ctaLink)}
            className="w-full mt-4 px-4 py-2.5 bg-blue-400 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            {agent.cta}
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={() => agent.ctaLink.startsWith('http') ? window.open(agent.ctaLink, '_blank') : router.push(agent.ctaLink)}
          className="w-full px-4 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {agent.cta}
        </button>
      </div>
    </div>
  );
}

export default function AgenticLibrary() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl px-2 sm:px-6 lg:px-8 py-4">
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            {/* <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div> */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agentic Library</h1>
              <p className="text-gray-600 mt-1 text-sm" >Centralized discovery and management of AI agents</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-3xl text-sm">
            Explore our intelligent agents deployed across the platform. Each agent is designed to automate,
            enhance, and accelerate specific workflows within your organization. Click any card to learn more
            about capabilities and access points.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Purpose & Value</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span><strong>Capability Catalog</strong> for leadership to understand AI investments and ROI</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span><strong>Discovery Layer</strong> for users to explore and leverage intelligent capabilities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span><strong>Trust-Building Mechanism</strong> through transparency in AI functionality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span><strong>Foundation for Governance</strong> enabling future agent lifecycle management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
