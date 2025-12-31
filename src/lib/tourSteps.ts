import type { StepOptions } from 'shepherd.js';
import "shepherd.js/dist/css/shepherd.css";

export interface TourStep extends Omit<StepOptions, 'buttons'> {}

const stepIcons = [
  '🚀', // Skill Library
  '👥', // Jobrole Library
  '📋', // Jobrole Task Library
  '📚', // Knowledge
  '💪', // Ability
  '😊', // Attitude
  '🎯', // Behaviour
];

const descriptions: Record<string, { emoji: string; main: string; sub: string }> = {
  "Skill": {
    emoji: "🚀",
    main: "Manage and explore all your organization skills in one place.",
    sub: "Build comprehensive skill inventories to drive competency development."
  },
  "Jobrole": {
    emoji: "👥",
    main: "Organize and define job roles across all departments.",
    sub: "Create clear role definitions to align your workforce structure."
  },
  "Jobrole Task": {
    emoji: "📋",
    main: "View and manage tasks & responsibilities for each job role.",
    sub: "Detail specific duties and expectations for every position."
  },
  "Invisible": {
    emoji: "👁️",
    main: "Access invisible competencies and hidden skills.",
    sub: "Explore competencies that are not immediately visible but crucial for success."
  },
  "Knowledge": {
    emoji: "📚",
    main: "Create and maintain knowledge assets for your competency model.",
    sub: "Build a knowledge base that supports learning and development."
  },
  "Ability": {
    emoji: "💪",
    main: "Define important abilities required for job performance.",
    sub: "Identify core capabilities needed for success in each role."
  },
  "Attitude": {
    emoji: "😊",
    main: "Manage traits and attitude competencies here.",
    sub: "Cultivate positive workplace behaviors and mindsets."
  },
  "Behaviour": {
    emoji: "🎯",
    main: "Track, define and grow behavioral competencies.",
    sub: "Develop observable behaviors that drive performance excellence."
  },
};

export const generateTourSteps = (tabs: string[]): TourStep[] => {
  // Exclude "Course Library" from tour
  const tourTabs = tabs.filter(tab => tab !== "Course Library");

  return tourTabs.map((tab, index) => {
    const icon = stepIcons[index % stepIcons.length];
    const desc = descriptions[tab] || { emoji: "📖", main: `Explore the ${tab} section.`, sub: "Discover features and capabilities." };

    const totalSteps = tourTabs.length;
    const stepperHtml = `
      <div class="mb-2">
        <div class="flex justify-center items-center mb-1">
          <span class="text-xs font-medium text-gray-600">Step ${index + 1} of ${totalSteps}</span>
        </div>
        <div class="flex justify-center items-center">
          <div class="flex w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
            ${Array.from({ length: totalSteps }, (_, i) => `
              <div class="flex-1 h-full ${i <= index ? 'bg-blue-500' : 'bg-gray-300'} transition-colors duration-300 ${i > 0 ? 'border-l border-white' : ''}"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    return {
      id: tab.replace(/\s+/g, '-').toLowerCase(),
      title: `<h3 class="text-lg font-bold text-white px-4 py-2">${tab}</h3>`,
      text: `<div class="space-y-2">
        <p class="text-gray-700 text-sm leading-relaxed"><strong>${desc.main.split(' ').slice(0, 2).join(' ')}</strong> ${desc.main.split(' ').slice(2).join(' ')}</p>
        <p class="text-xs text-gray-500">${desc.sub}</p>
        <button class="detail-onboarding-btn" onclick="if(window.detailOnboardingHandler) window.detailOnboardingHandler('${tab}')">${tab} Details onboarding</button>
      </div>${stepperHtml}`,
      attachTo: { element: `#tab-${tab.replace(/\s+/g, '-').toLowerCase()}`, on: "top", offset: { bottom: 40 } },
      when: {
        show: () => {
          const stepEl = document.querySelector('.shepherd-element') as HTMLElement;
          if (stepEl) {
            stepEl.style.opacity = '0';
            stepEl.style.transform = 'translateY(20px)';
            stepEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            requestAnimationFrame(() => {
              stepEl.style.opacity = '1';
              stepEl.style.transform = 'translateY(0)';
            });
          }
        }
      }
    };
  });
};

export const generateDetailTourSteps = (tab: string): TourStep[] => {
  if (tab === 'Skill') {
    return [
      {
        id: 'search-bar',
        title: 'Search Skills',
        text: 'Use this search bar to quickly find skills by name or description. Start typing to see matching results.',
        attachTo: { element: '#search-skills-input', on: 'bottom' },
      },
      {
        id: 'filter-button',
        title: 'Filter Options',
        text: 'Refine your skill view by department, category, proficiency level, and more. Click to explore filtering options.',
        attachTo: { element: 'button[title="Filter"]', on: 'bottom' },
      },
      {
        id: 'view-toggle',
        title: 'View Modes',
        text: 'Switch between hexagon view for visual exploration and table view for detailed information.',
        attachTo: { element: '.flex.border.rounded-md', on: 'bottom' },
      },
      {
        id: 'hexagon-cards',
        title: 'Skill Cards',
        text: 'Each hexagon represents a skill. Click on any card to view detailed information and available actions.',
        attachTo: { element: '.hexagon-wrapper-skill', on: 'bottom' },
      },
      {
        id: 'skill-actions',
        title: 'Skill Actions',
        text: 'These action icons allow you to edit, delete, view analytics, and link skills to tasks.',
        attachTo: { element: '.hexagon-wrapper-skill .flex.gap-2', on: 'right' },
      },
      {
        id: 'add-skill',
        title: 'Add New Skills',
        text: 'Click the more actions menu to access options for adding new skills, importing, and AI-powered suggestions.',
        attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
      },
      {
        id: 'more-actions',
        title: 'Advanced Actions',
        text: 'Access bulk operations, exports, settings, and more advanced features from this menu.',
        attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
      },
    ];
  } else if (tab === 'Jobrole') {
    return [
      {
        id: "search-jobrole",
        title: "Search Job Roles",
        text: "Search job roles by name or description.",
        attachTo: {
          element: 'input[placeholder*="Search job roles"]',
          on: "bottom",
        },
      },
      {
        id: "filter-jobrole",
        title: "Filter Job Roles",
        text: "Filter job roles by department and criteria.",
        attachTo: {
          element: 'button[title="Filter"]',
          on: "bottom",
        },
      },
      {
        id: "view-toggle",
        title: "View Toggle",
        text: "Switch between card view and table view.",
        attachTo: {
          element: ".flex.border.rounded-md",
          on: "bottom",
        },
      },
      {
        id: "jobrole-cards",
        title: "Job Role Cards",
        text: "Each card represents a job role. Click to expand.",
        attachTo: {
          element: ".grid > div:first-child",
          on: "bottom",
        },
      },
      {
        id: "jobrole-actions",
        title: "Card Actions",
        text: "View, edit, map skills or delete job roles.",
        attachTo: {
          element: ".grid > div:first-child .flex.justify-center.gap-2",
          on: "bottom",
        },
      },
      {
        id: "more-actions",
        title: "More Actions",
        text: "Access import, export and configure options.",
        attachTo: {
          element: 'button[title="More Actions"]',
          on: "bottom",
        },
      },
    ];
  } else if (tab === 'Jobrole Task') {
    return [
      {
        id: 'search-bar',
        title: 'Search Job Role Tasks',
        text: 'Use this search bar to quickly find tasks by job role, categories, or proficiency levels. Start typing to see matching results.',
        attachTo: { element: 'input[placeholder*="Search jobrole task"]', on: 'bottom' },
      },
      {
        id: 'filter-button',
        title: 'Filter Options',
        text: 'Refine your task view by department, job role, and critical work function. Click to explore filtering options.',
        attachTo: { element: 'button[class*="hover:rounded-md hover:bg-gray-100"]', on: 'bottom' },
      },
      {
        id: 'view-toggle',
        title: 'View Modes',
        text: 'Switch between card view for visual exploration and table view for detailed information.',
        attachTo: { element: '.flex.border.rounded-md.overflow-hidden', on: 'bottom' },
      },
      {
        id: 'task-cards',
        title: 'Task Cards',
        text: 'Each card represents a task. Click on the title to view details and select tasks for configuration.',
        attachTo: { element: '#task-cards-grid > div:first-child', on: 'bottom' },
      },
      {
        id: 'task-actions',
        title: 'Task Actions',
        text: 'These action icons allow you to edit, clone, and delete tasks.',
        attachTo: { element: '.flex.justify-end.p-2', on: 'right' },
      },
      {
        id: 'more-actions',
        title: 'Advanced Actions',
        text: 'Access exports, settings, help, and more advanced features from this menu.',
        attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
      },
    ];
  } else if (tab === 'Invisible') {
    return [
      {
        id: 'invisible-tabs',
        title: 'Invisible Competency Types',
        text: 'Navigate through different categories of invisible competencies like frameworks, methodologies, techniques, and more.',
        attachTo: { element: '.flex.w-full.flex-wrap.justify-center.gap-3.mb-6', on: 'bottom' },
      },
      {
        id: 'invisible-cards',
        title: 'Invisible Competency Cards',
        text: 'Each card represents an invisible competency item. These are crucial skills and knowledge that are not immediately visible but essential for success.',
        attachTo: { element: '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6 > div:first-child', on: 'bottom' },
      },
      {
        id: 'invisible-view-button',
        title: 'View Details',
        text: 'Click the eye icon to view detailed information about each invisible competency, including descriptions and applications.',
        attachTo: { element: '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6 > div:first-child button:last-child', on: 'bottom' },
      },
    ];
  } else if (tab === 'Knowledge') {
  return [
    {
      id: 'knowledge-search',
      title: 'Search Knowledge',
      text: 'Search knowledge items by name, category, or proficiency level to quickly find what you need.',
      attachTo: {
        element: 'input[placeholder*="Search knowledge"]',
        on: 'bottom',
      },
    },
    {
      id: 'knowledge-filter',
      title: 'Filter Knowledge',
      text: 'Use filters to narrow knowledge by category, proficiency, or relevance.',
      attachTo: {
        element: 'button[title="Filter"]',
        on: 'bottom',
      },
    },
    {
      id: 'knowledge-view-toggle',
      title: 'View Mode',
      text: 'Switch between Bubble View and Grid View based on how you prefer to explore knowledge.',
      attachTo: {
        element: '.flex.border.rounded-md', // view toggle container
        on: 'bottom',
      },
    },
    {
      id: 'knowledge-bubbles',
      title: 'Knowledge Items',
      text: 'Each bubble represents a knowledge item. These are core learning concepts linked to roles and skills.',
      attachTo: {
        element: '.knowledge-bubble',
        on: 'bottom',
      },
    },
    {
      id: 'knowledge-bubble-click',
      title: 'Knowledge Details',
      text: 'Click any knowledge bubble to view detailed descriptions, proficiency expectations, and mappings.',
      attachTo: {
        element: '.knowledge-bubble',
        on: 'right',
      },
    },
    {
      id: 'knowledge-more-actions',
      title: 'More Actions',
      text: 'Access advanced options like manage, export, or configure knowledge visibility.',
      attachTo: {
        element: 'button[title="More Actions"]',
        on: 'bottom',
      },
    },
  ];
} else if (tab === 'Ability') {
  return [
    {
      id: 'search-abilities',
      title: 'Search Abilities',
      text: 'Use this search bar to quickly find abilities by name, category, sub-category, or proficiency level. Start typing to see matching results.',
      attachTo: { element: '#search-abilities-input', on: 'bottom' },
    },
    {
      id: 'filter-button',
      title: 'Filter Options',
      text: 'Refine your ability view by category, sub-category, and proficiency level. Click the funnel icon to explore filtering options.',
      attachTo: { element: 'button[title="Filter"]', on: 'bottom' },
    },
    {
      id: 'view-toggle',
      title: 'View Modes',
      text: 'Switch between triangle view for visual exploration and table view for detailed information.',
      attachTo: { element: '#ability-view-toggle', on: 'bottom' },
    },
    {
      id: 'triangle-cards',
      title: 'Ability Triangles',
      text: 'Each triangle represents an ability. Click on any triangle to view detailed information and available actions.',
      attachTo: { element: '.triangle-wrapper', on: 'bottom' },
    },
    {
      id: 'more-actions',
      title: 'Advanced Actions',
      text: 'Access options for adding new abilities, AI suggestions, bulk actions, exports, analytics, and more from this menu.',
      attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
    },
  ];
} else if (tab === 'Attitude') {
  return [
    {
      id: 'search-attitude',
      title: 'Search Attitudes',
      text: 'Use this search bar to quickly find attitudes by name, category, sub-category, or proficiency level. Start typing to see matching results.',
      attachTo: { element: '#search-attitude-input', on: 'bottom' },
    },
    {
      id: 'filter-button',
      title: 'Filter Options',
      text: 'Refine your attitude view by category, sub-category, and proficiency level. Click the funnel icon to explore filtering options.',
      attachTo: { element: 'button[title="Filter"]', on: 'bottom' },
    },
    {
      id: 'view-toggle',
      title: 'View Modes',
      text: 'Switch between card view for visual exploration and table view for detailed information.',
      attachTo: { element: '#attitude-view-toggle', on: 'bottom' },
    },
    {
      id: 'attitude-cards',
      title: 'Attitude Cards',
      text: 'Each card represents an attitude. Click on any card to view detailed information and available actions.',
      attachTo: { element: '.grid > div:first-child', on: 'bottom' },
    },
    {
      id: 'more-actions',
      title: 'Advanced Actions',
      text: 'Access options for adding new attitudes, AI suggestions, import/export, and settings from this menu.',
      attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
    },
  ];
} else if (tab === 'Behaviour') {
  return [
    {
      id: 'search-behaviour',
      title: 'Search Behaviours',
      text: 'Use this search bar to quickly find behaviours by name, category, sub-category, or proficiency level. Start typing to see matching results.',
      attachTo: { element: '#search-behaviour-input', on: 'bottom' },
    },
    {
      id: 'filter-button',
      title: 'Filter Options',
      text: 'Refine your behaviour view by category, sub-category, and proficiency level. Click the funnel icon to explore filtering options.',
      attachTo: { element: 'button[title="Filter"]', on: 'bottom' },
    },
    {
      id: 'view-toggle',
      title: 'View Modes',
      text: 'Switch between card view for visual exploration and table view for detailed information.',
      attachTo: { element: '#behaviour-view-toggle', on: 'bottom' },
    },
    {
      id: 'behaviour-cards',
      title: 'Behaviour Cards',
      text: 'Each card represents a behaviour. Click on any card to view detailed information and available actions.',
      attachTo: { element: '.grid > div:first-child', on: 'bottom' },
    },
    {
      id: 'more-actions',
      title: 'Advanced Actions',
      text: 'Access options for adding new behaviours, AI suggestions, import/export, and settings from this menu.',
      attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
    },
  ];
}

  return [];
};

