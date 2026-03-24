import "shepherd.js/dist/css/shepherd.css";
import { getPageInfo } from "@/utils/journeyLogger";

// Define TourStep interface to match the actual usage in this file
interface AttachTo {
  element: string;
  on: 'top' | 'bottom' | 'left' | 'right';
  offset?: { bottom?: number; top?: number; left?: number; right?: number };
}

interface When {
  show?: () => void;
  hide?: () => void;
}

export interface TourStep {
  id?: string;
  title?: string;
  text?: string;
  attachTo?: AttachTo;
  when?: When;
  classes?: string;
  menuId?: number;  // Add menuId field
  buttons?: Array<{
    text?: string;
    action?: () => void;
    classes?: string;
  }>;
  beforeShowPromise?: () => Promise<void>;
}

// Interface for API tour step data
interface TourStepData {
  on_click: string;
  title: string;
  description: string;
}

// Helper to get user data from localStorage
const getUserData = (): { url: string; token: string; subInstituteId: string } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
      return {
        url: APP_URL,
        token,
        subInstituteId: String(sub_institute_id)
      };
    }
  } catch (e) {
    console.error('[tourSteps] Error getting userData:', e);
  }
  return null;
};

// Fetch tour steps from API
export const fetchTourStepsFromAPI = async (menuId: number): Promise<TourStepData[]> => {
  const userData = getUserData();
  if (!userData) {
    console.log('[tourSteps] No userData available, using default tour steps');
    return [];
  }

  try {
    const apiUrl = `${userData.url}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${userData.token}&sub_institute_id=${userData.subInstituteId}`;
    console.log('[tourSteps] Fetching tour steps from API:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch tour steps: ${res.status}`);
    }

    const json = await res.json();
    console.log('[tourSteps] Raw API response:', json);

    // Handle different response formats
    let tourData: TourStepData[] = [];

    if (Array.isArray(json)) {
      tourData = json;
    } else if (json.data && Array.isArray(json.data)) {
      tourData = json.data;
    } else if (json.result && Array.isArray(json.result)) {
      tourData = json.result;
    } else if (json.response && Array.isArray(json.response)) {
      tourData = json.response;
    } else if (typeof json === 'object') {
      for (const key of Object.keys(json)) {
        if (Array.isArray(json[key])) {
          tourData = json[key];
          console.log(`[tourSteps] Found array data in response.${key}`);
          break;
        }
      }
    }

    // Normalize field names
    const normalizedTourData = tourData.map((step: any) => ({
      on_click: step.on_click || step.onClick || step.step_key || step.stepKey || step.id,
      title: step.title || step.Title || step.name || step.step_title || step.stepTitle || '',
      description: step.description || step.Description || step.text || step.Text || step.content || step.step_description || ''
    }));

    console.log('[tourSteps] Parsed tour data:', normalizedTourData);
    return normalizedTourData;
  } catch (error) {
    console.error('[tourSteps] Error fetching tour steps:', error);
    return [];
  }
};

const stepIcons = [
  '🚀', // Skill Library
  '👥', // Jobrole Library
  '📋', // Jobrole Task Library
  '📚', // Knowledge
  '💪', // Ability
  '😊', // Attitude
  '🎯', // Behaviour
];

const tabDescriptions: Record<string, string> = {
  "Skill": "Manage and explore organization skills",
  "Jobrole": "Organize and define job roles",
  "Jobrole Task": "View and manage job role tasks",
  "Invisible": "Access invisible competencies",
  "Knowledge": "Create and maintain knowledge assets",
  "Ability": "Define important abilities",
  "Attitude": "Manage traits and attitudes",
  "Behaviour": "Track and grow behaviors",
};

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

export const generateTourSteps = (tabs: string[], tourStepsFromAPI: TourStepData[] = []): TourStep[] => {
  // Exclude "Course Library" from tour
  const tourTabs = tabs.filter(tab => tab !== "Course Library");

  // Get dynamic menuId from journeyLogger
  const pageInfo = typeof window !== 'undefined' ? getPageInfo() : { menuId: 0 };
  const currentMenuId = pageInfo.menuId;

  // Create a map of on_click to API step for easy lookup
  const apiStepsMap = new Map();
  tourStepsFromAPI.forEach((step: TourStepData) => {
    apiStepsMap.set(step.on_click, step);
  });

  console.log('[tourSteps] generateTourSteps - tourStepsFromAPI:', tourStepsFromAPI);
  console.log('[tourSteps] generateTourSteps - apiStepsMap:', apiStepsMap);

  return tourTabs.map((tab, index) => {
    const icon = stepIcons[index % stepIcons.length];
    const desc = descriptions[tab] || { emoji: "📖", main: `Explore the ${tab} section.`, sub: "Discover features and capabilities." };
    const tabDesc = tabDescriptions[tab] || "";

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

    // Get API data for this tab (use tab name with hyphens as on_click)
    const tabKey = tab.replace(/\s+/g, '-').toLowerCase();
    const apiStep = apiStepsMap.get(tabKey);
    const apiTitle = apiStep?.title;
    const apiDescription = apiStep?.description;

    console.log(`[tourSteps] Tab '${tab}' (key: '${tabKey}') - apiTitle:`, apiTitle, ', apiDescription:', apiDescription);

    return {
      id: tab.replace(/\s+/g, '-').toLowerCase(),
      title: apiTitle ? `<h3 class="text-lg font-bold text-white px-4 py-2">${apiTitle}</h3>` : `<h3 class="text-lg font-bold text-white px-4 py-2">${tab}</h3>`,
      text: apiDescription ? `
<div class="space-y-2">
  <p class="text-gray-700 text-sm leading-relaxed">${apiDescription}</p>
  <button class="detail-onboarding-btn"
    onclick="if(window.detailOnboardingHandler) window.detailOnboardingHandler('${tab}')">
    ${tab} Details onboarding
  </button>
</div>

${stepperHtml}

<div class="tour-radio-container" style="margin-bottom:4px">
  ${tourTabs.map((t, i) => `
    <label style="display:flex;align-items:center;gap:6px;margin:2px 0;cursor:pointer;font-size:11px">
      <input 
        type="radio" 
        name="tourTabSelector"
        value="${t}"
        ${t === tab ? "checked" : ""}
        onchange="handleTourTabChange('${t}')"
      />
      <span><strong>${t}:</strong> ${tabDescriptions[t] || ''}</span>
    </label>
  `).join("")}
</div>
` : `
<div class="space-y-2">
  <p class="text-gray-700 text-sm leading-relaxed">
    <strong>${desc.main.split(' ').slice(0, 2).join(' ')}</strong>
    ${desc.main.split(' ').slice(2).join(' ')}
  </p>
  <p class="text-xs text-gray-500">${desc.sub}</p>

  <button class="detail-onboarding-btn"
    onclick="if(window.detailOnboardingHandler) window.detailOnboardingHandler('${tab}')">
    ${tab} Details onboarding
  </button>
</div>

${stepperHtml}

<div class="tour-radio-container" style="margin-bottom:4px">
  ${tourTabs.map((t, i) => `
    <label style="display:flex;align-items:center;gap:6px;margin:2px 0;cursor:pointer;font-size:11px">
      <input 
        type="radio" 
        name="tourTabSelector"
        value="${t}"
        ${t === tab ? "checked" : ""}
        onchange="handleTourTabChange('${t}')"
      />
      <span><strong>${t}:</strong> ${tabDescriptions[t] || ''}</span>
    </label>
  `).join("")}
</div>
`,
      menuId: currentMenuId,  // Add dynamic menuId to each step
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

export const generateDetailTourSteps = (tab: string, tourStepsFromAPI: TourStepData[] = []): TourStep[] => {
  // Create a map of on_click to API step for easy lookup
  const apiStepsMap = new Map();
  tourStepsFromAPI.forEach((step: TourStepData) => {
    apiStepsMap.set(step.on_click, step);
  });

  console.log('[tourSteps] generateDetailTourSteps called - tab:', tab);
  console.log('[tourSteps] tourStepsFromAPI length:', tourStepsFromAPI?.length);
  console.log('[tourSteps] tourStepsFromAPI data:', tourStepsFromAPI);
  console.log('[tourSteps] apiStepsMap entries:', Array.from(apiStepsMap.entries()));

  // Log which step IDs we're looking for
  const stepIdLookups: Record<string, string[]> = {
    'Skill': ['search-skill', 'filter-skill', 'view-toggle-skill', 'hexagon-cards', 'skill-actions', 'add-skill', 'skill-more-actions'],
    'Jobrole Task': ['search-jobroletask', 'filter-jobroletask', 'view-toggle-jobroletask', 'task-cards', 'task-actions', 'jobroletask-more-actions'],
    'Invisible': ['invisible-tabs', 'invisible-cards', 'invisible-view-button'],
    'Jobrole': ['search-jobrole', 'filter-jobrole', 'view-toggle-jobrole', 'jobrole-cards', 'jobrole-actions', 'jobrole-more-actions'],
    'Knowledge': ['knowledge-search', 'knowledge-filter', 'knowledge-view-toggle', 'knowledge-bubbles', 'knowledge-bubble-click', 'knowledge-more-actions'],
    'Ability': ['search-abilities', 'filter-abilities', 'view-toggle-ability', 'triangle-cards', 'ability-more-actions'],
    'Attitude': ['search-attitude', 'filter-attitude', 'view-toggle-attitude', 'attitude-cards', 'attitude-more-actions'],
    'Behaviour': ['search-behaviour', 'filter-behaviour', 'view-toggle-behaviour', 'behaviour-cards', 'behaviour-more-actions'],
  };

  const lookupIds = stepIdLookups[tab] || [];
  console.log('[tourSteps] Looking for step IDs:', lookupIds);

  // Debug what we found for each ID
  lookupIds.forEach(id => {
    const found = apiStepsMap.get(id);
    console.log(`[tourSteps] Lookup '${id}':`, found ? `FOUND - title: ${found.title}, description: ${found.description}` : 'NOT FOUND');
  });

  if (tab === 'Skill') {
    return [
      {
        id: 'search-skill',
        title: apiStepsMap.get('search-skill')?.title || 'Search Skills',
        text: apiStepsMap.get('search-skill')?.description || 'Use this search bar to quickly find skills by name or description. Start typing to see matching results.',
        attachTo: { element: '#search-skills-input', on: 'bottom' },
      },
      {
        id: 'filter-skill',
        title: apiStepsMap.get('filter-skill')?.title || 'Filter Options',
        text: apiStepsMap.get('filter-skill')?.description || 'Refine your skill view by department, category, proficiency level, and more. Click to explore filtering options.',
        attachTo: { element: 'button[title="Filter"]', on: 'bottom' },
      },
      {
        id: 'view-toggle-skill',
        title: apiStepsMap.get('view-toggle-skill')?.title || 'View Modes',
        text: apiStepsMap.get('view-toggle-skill')?.description || 'Switch between hexagon view for visual exploration and table view for detailed information.',
        attachTo: { element: '.flex.border.rounded-md', on: 'bottom' },
      },
      {
        id: 'hexagon-cards',
        title: apiStepsMap.get('hexagon-cards')?.title || 'Skill Cards',
        text: apiStepsMap.get('hexagon-cards')?.description || 'Each hexagon represents a skill. Click on any card to view detailed information and available actions.',
        attachTo: { element: '.hexagon-wrapper-skill', on: 'bottom' },
      },
      {
        id: 'skill-actions',
        title: apiStepsMap.get('skill-actions')?.title || 'Skill Actions',
        text: apiStepsMap.get('skill-actions')?.description || 'These action icons allow you to edit, delete, view analytics, and link skills to tasks.',
        attachTo: { element: '.hexagon-wrapper-skill .flex.gap-2', on: 'right' },
      },
      {
        id: 'add-skill',
        title: apiStepsMap.get('add-skill')?.title || 'Add New Skills',
        text: apiStepsMap.get('add-skill')?.description || 'Click the more actions menu to access options for adding new skills, importing, and AI-powered suggestions.',
        attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
      },
      {
        id: 'skill-more-actions',
        title: apiStepsMap.get('skill-more-actions')?.title || 'Advanced Actions',
        text: apiStepsMap.get('skill-more-actions')?.description || 'Access bulk operations, exports, settings, and more advanced features from this menu.',
        attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
      },
    ];
  } else if (tab === 'Jobrole') {
    return [
      {
        id: "search-jobrole",
        title: apiStepsMap.get("search-jobrole")?.title || " Search Job Roles",
        text: apiStepsMap.get("search-jobrole")?.description || "Search job roles by name or description.",
        attachTo: {
          element: 'input[placeholder*="Search job roles"]',
          on: "bottom",
        },
      },
      {
        id: "filter-jobrole",
        title: apiStepsMap.get("filter-jobrole")?.title || "Filter Job Roles",
        text: apiStepsMap.get("filter-jobrole")?.description || "Filter job roles by department and criteria.",
        attachTo: {
          element: 'button[title="Filter"]',
          on: "bottom",
        },
      },
      {
        id: "view-toggle-jobrole",
        title: apiStepsMap.get("view-toggle-jobrole")?.title || "View Toggle",
        text: apiStepsMap.get("view-toggle-jobrole")?.description || "Switch between card view and table view.",
        attachTo: {
          element: ".flex.border.rounded-md",
          on: "bottom",
        },
      },
      {
        id: "jobrole-cards",
        title: apiStepsMap.get("jobrole-cards")?.title || "Job Role Cards",
        text: apiStepsMap.get("jobrole-cards")?.description || "Each card represents a job role. Click to expand.",
        attachTo: {
          element: ".grid > div:first-child",
          on: "bottom",
        },
      },
      {
        id: "jobrole-actions",
        title: apiStepsMap.get("jobrole-actions")?.title || "Card Actions",
        text: apiStepsMap.get("jobrole-actions")?.description || "View, edit, map skills or delete job roles.",
        attachTo: {
          element: ".grid > div:first-child .flex.justify-center.gap-2",
          on: "bottom",
        },
      },
      {
        id: "more-actions-jobrole",
        title: apiStepsMap.get("jobrole-more-actions")?.title || "More Actions",
        text: apiStepsMap.get("jobrole-more-actions")?.description || "Access import, export and configure options.",
        attachTo: {
          element: 'button[title="More Actions"]',
          on: "bottom",
        },
      },
    ];
  } else if (tab === 'Jobrole Task') {
    return [
      {
        id: 'search-jobroletask',
        title: apiStepsMap.get('search-jobroletask')?.title || 'Search Job Role Tasks',
        text: apiStepsMap.get('search-jobroletask')?.description || 'Use this search bar to quickly find tasks by job role, categories, or proficiency levels. Start typing to see matching results.',
        attachTo: { element: 'input[placeholder*="Search jobrole task"]', on: 'bottom' },
      },
      {
        id: 'filter-jobroletask',
        title: apiStepsMap.get('filter-jobroletask')?.title || 'Filter Options',
        text: apiStepsMap.get('filter-jobroletask')?.description || 'Refine your task view by department, job role, and critical work function. Click the funnel icon to explore filtering options.',
        attachTo: { element: 'button[class*="hover:rounded-md hover:bg-gray-100"]', on: 'bottom' },
      },
      {
        id: 'view-toggle-jobroletask',
        title: apiStepsMap.get('view-toggle-jobroletask')?.title || 'View Modes',
        text: apiStepsMap.get('view-toggle-jobroletask')?.description || 'Switch between card view for visual exploration and table view for detailed information.',
        attachTo: { element: '.flex.border.rounded-md.overflow-hidden', on: 'bottom' },
      },
      {
        id: 'task-cards',
        title: apiStepsMap.get('task-cards')?.title || 'Task Cards',
        text: apiStepsMap.get('task-cards')?.description || 'Each card represents a task. Click on the title to view details and select tasks for configuration.',
        attachTo: { element: '#task-cards-grid > div:first-child', on: 'bottom' },
      },
      {
        id: 'task-actions',
        title: apiStepsMap.get('task-actions')?.title || 'Task Actions',
        text: apiStepsMap.get('task-actions')?.description || 'These action icons allow you to edit, clone, and delete tasks.',
        attachTo: { element: '.flex.justify-end.p-2', on: 'right' },
      },
      {
        id: 'jobroletask-more-actions',
        title: apiStepsMap.get('jobroletask-more-actions')?.title || 'Advanced Actions',
        text: apiStepsMap.get('jobroletask-more-actions')?.description || 'Access exports, settings, help, and more advanced features from this menu.',
        attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
      },
    ];
  } else if (tab === 'Invisible') {
    return [
      {
        id: 'invisible-tabs',
        title: apiStepsMap.get('invisible-tabs')?.title || 'Invisible Competency Types',
        text: apiStepsMap.get('invisible-tabs')?.description || 'Navigate through different categories of invisible competencies like frameworks, methodologies, techniques, and more.',
        attachTo: { element: '.flex.w-full.flex-wrap.justify-center.gap-3.mb-6', on: 'bottom' },
      },
      {
        id: 'invisible-cards',
        title: apiStepsMap.get('invisible-cards')?.title || 'Invisible Competency Cards',
        text: apiStepsMap.get('invisible-cards')?.description || 'Each card represents an invisible competency item. These are crucial skills and knowledge that are not immediately visible but essential for success.',
        attachTo: { element: '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6 > div:first-child', on: 'bottom' },
      },
      {
        id: 'invisible-view-button',
        title: apiStepsMap.get('invisible-view-button')?.title || 'View Details',
        text: apiStepsMap.get('invisible-view-button')?.description || 'Click the eye icon to view detailed information about each invisible competency, including descriptions and applications.',
        attachTo: { element: '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6 > div:first-child button:last-child', on: 'bottom' },
      },
    ];
  } else if (tab === 'Knowledge') {
  return [
    {
      id: 'knowledge-search',
      title: apiStepsMap.get('knowledge-search')?.title || 'Search Knowledge',
      text: apiStepsMap.get('knowledge-search')?.description || 'Search knowledge items by name, category, or proficiency level to quickly find what you need.',
      attachTo: {
        element: 'input[placeholder*="Search knowledge"]',
        on: 'bottom',
      },
    },
    {
      id: 'knowledge-filter',
      title: apiStepsMap.get('knowledge-filter')?.title || 'Filter Knowledge',
      text: apiStepsMap.get('knowledge-filter')?.description || 'Use filters to narrow knowledge by category, proficiency, or relevance.',
      attachTo: {
        element: 'button[title="Filter"]',
        on: 'bottom',
      },
    },
    {
      id: 'knowledge-view-toggle',
      title: apiStepsMap.get('knowledge-view-toggle')?.title || 'View Mode',
      text: apiStepsMap.get('knowledge-view-toggle')?.description || 'Switch between Bubble View and Grid View based on how you prefer to explore knowledge.',
      attachTo: {
        element: '.flex.border.rounded-md', // view toggle container
        on: 'bottom',
      },
    },
    {
      id: 'knowledge-bubbles',
      title: apiStepsMap.get('knowledge-bubbles')?.title || 'Knowledge Items',
      text: apiStepsMap.get('knowledge-bubbles')?.description || 'Each bubble represents a knowledge item. These are core learning concepts linked to roles and skills.',
      attachTo: {
        element: '.knowledge-bubble',
        on: 'bottom',
      },
    },
    {
      id: 'knowledge-bubble-click',
      title: apiStepsMap.get('knowledge-bubble-click')?.title || 'Knowledge Details',
      text: apiStepsMap.get('knowledge-bubble-click')?.description || 'Click any knowledge bubble to view detailed descriptions, proficiency expectations, and mappings.',
      attachTo: {
        element: '.knowledge-bubble',
        on: 'right',
      },
    },
    {
      id: 'knowledge-more-actions',
      title: apiStepsMap.get('knowledge-more-actions')?.title || 'More Actions',
      text: apiStepsMap.get('knowledge-more-actions')?.description || 'Access advanced options like manage, export, or configure knowledge visibility.',
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
      title: apiStepsMap.get('search-abilities')?.title || 'Search Abilities',
      text: apiStepsMap.get('search-abilities')?.description || 'Use this search bar to quickly find abilities by name, category, sub-category, or proficiency level. Start typing to see matching results.',
      attachTo: { element: '#search-abilities-input', on: 'bottom' },
    },
    {
      id: 'filter-abilities',
      title: apiStepsMap.get('filter-abilities')?.title || 'Filter Options',
      text: apiStepsMap.get('filter-abilities')?.description || 'Refine your ability view by category, sub-category, and proficiency level. Click the funnel icon to explore filtering options.',
      attachTo: { element: 'button[title="Filter"]', on: 'bottom' },
    },
    {
      id: 'view-toggle-ability',
      title: apiStepsMap.get('view-toggle-ability')?.title || 'View Modes',
      text: apiStepsMap.get('view-toggle-ability')?.description || 'Switch between triangle view for visual exploration and table view for detailed information.',
      attachTo: { element: '#ability-view-toggle', on: 'bottom' },
    },
    {
      id: 'triangle-cards',
      title: apiStepsMap.get('triangle-cards')?.title || 'Ability Triangles',
      text: apiStepsMap.get('triangle-cards')?.description || 'Each triangle represents an ability. Click on any triangle to view detailed information and available actions.',
      attachTo: { element: '.triangle-wrapper', on: 'bottom' },
    },
    {
      id: 'ability-more-actions',
      title: apiStepsMap.get('ability-more-actions')?.title || 'Advanced Actions',
      text: apiStepsMap.get('ability-more-actions')?.description || 'Access options for adding new abilities, AI suggestions, bulk actions, exports, analytics, and more from this menu.',
      attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
    },
  ];
} else if (tab === 'Attitude') {
  return [
    {
      id: 'search-attitude',
      title: apiStepsMap.get('search-attitude')?.title || 'Search Attitudes',
      text: apiStepsMap.get('search-attitude')?.description || 'Use this search bar to quickly find attitudes by name, category, sub-category, or proficiency level. Start typing to see matching results.',
      attachTo: { element: '#search-attitude-input', on: 'bottom' },
    },
    {
      id: 'filter-attitude',
      title: apiStepsMap.get('filter-attitude')?.title || 'Filter Options',
      text: apiStepsMap.get('filter-attitude')?.description || 'Refine your attitude view by category, sub-category, and proficiency level. Click the funnel icon to explore filtering options.',
      attachTo: { element: 'button[title="Filter"]', on: 'bottom' },
    },
    {
      id: 'view-toggle-attitude',
      title: apiStepsMap.get('view-toggle-attitude')?.title || 'View Modes',
      text: apiStepsMap.get('view-toggle-attitude')?.description || 'Switch between card view for visual exploration and table view for detailed information.',
      attachTo: { element: '#attitude-view-toggle', on: 'bottom' },
    },
    {
      id: 'attitude-cards',
      title: apiStepsMap.get('attitude-cards')?.title || 'Attitude Cards',
      text: apiStepsMap.get('attitude-cards')?.description || 'Each card represents an attitude. Click on any card to view detailed information and available actions.',
      attachTo: { element: '.grid > div:first-child', on: 'bottom' },
    },
    {
      id: 'attitude-more-actions',
      title: apiStepsMap.get('attitude-more-actions')?.title || 'Advanced Actions',
      text: apiStepsMap.get('attitude-more-actions')?.description || 'Access options for adding new attitudes, AI suggestions, import/export, and settings from this menu.',
      attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
    },
  ];
} else if (tab === 'Behaviour') {
  return [
    {
      id: 'search-behaviour',
      title: apiStepsMap.get('search-behaviour')?.title || 'Search Behaviours',
      text: apiStepsMap.get('search-behaviour')?.description || 'Use this search bar to quickly find behaviours by name, category, sub-category, or proficiency level. Start typing to see matching results.',
      attachTo: { element: '#search-behaviour-input', on: 'bottom' },
    },
    {
      id: 'filter-behaviour',
      title: apiStepsMap.get('filter-behaviour')?.title || 'Filter Options',
      text: apiStepsMap.get('filter-behaviour')?.description || 'Refine your behaviour view by category, sub-category, and proficiency level. Click the funnel icon to explore filtering options.',
      attachTo: { element: 'button[title="Filter"]', on: 'bottom' },
    },
    {
      id: 'view-toggle-behaviour',
      title: apiStepsMap.get('view-toggle-behaviour')?.title || 'View Modes',
      text: apiStepsMap.get('view-toggle-behaviour')?.description || 'Switch between card view for visual exploration and table view for detailed information.',
      attachTo: { element: '#behaviour-view-toggle', on: 'bottom' },
    },
    {
      id: 'behaviour-cards',
      title: apiStepsMap.get('behaviour-cards')?.title || 'Behaviour Cards',
      text: apiStepsMap.get('behaviour-cards')?.description || 'Each card represents a behaviour. Click on any card to view detailed information and available actions.',
      attachTo: { element: '.grid > div:first-child', on: 'bottom' },
    },
    {
      id: 'behaviour-more-actions',
      title: apiStepsMap.get('behaviour-more-actions')?.title || 'Advanced Actions',
      text: apiStepsMap.get('behaviour-more-actions')?.description || 'Access options for adding new behaviours, AI suggestions, import/export, and settings from this menu.',
      attachTo: { element: 'button[title="More Actions"]', on: 'bottom' },
    },
  ];
}

  return [];
};
