import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Tab switcher callback type
export type TabSwitcher = (tabId: string) => void;

// Helper function to wait for element to exist
const waitForElement = (selector: string, maxAttempts = 50, interval = 100): Promise<Element | null> => {
  return new Promise((resolve) => {
    let attempts = 0;
    const checkElement = () => {
      const element = document.querySelector(selector);
      console.log(`Checking for element: ${selector}, attempts: ${attempts}, found: ${!!element}`);
      if (element || attempts >= maxAttempts) {
        resolve(element);
      } else {
        attempts++;
        setTimeout(checkElement, interval);
      }
    };
    checkElement();
  });
};

// Helper function to check if element is visible
const isElementVisible = (element: Element | null): boolean => {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  const isVisible = style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         (element as HTMLElement).offsetParent !== null;
  console.log(`Element visibility check: ${isVisible}, display: ${style.display}, visibility: ${style.visibility}`);
  return isVisible;
};

// Log element position for debugging
const logElementPosition = (selector: string, element: Element | null) => {
  if (!element) {
    console.log(`Element not found: ${selector}`);
    return;
  }
  const rect = (element as HTMLElement).getBoundingClientRect();
  console.log(`Element ${selector} position:`, {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height
  });
};

// Tour steps configuration with tab switching capability
export const createTourSteps = (switchTab: TabSwitcher) => [
  {
    id: 'welcome',
    title: 'Welcome to Competency Dashboard!',
    text: 'This dashboard provides a comprehensive view of your organization\'s competency management. Let\'s take a quick tour to explore all the features.',
    buttons: [
      { text: 'Skip', action: function(this: any) { this.cancel(); } },
      { text: 'Start Tour', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'kpi-cards',
    title: 'Key Performance Indicators',
    text: 'These KPI cards show important metrics at a glance: Total Roles, Mapped Tasks, Skill Coverage, Risk Score, Future Readiness, and Active Reviews.',
    attachTo: { element: '#tour-kpi-cards', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: kpi-cards');
        waitForElement('#tour-kpi-cards', 50, 100).then((element) => {
          logElementPosition('#tour-kpi-cards', element);
          setTimeout(resolve, 800);
        });
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'navigation-tabs',
    title: 'Navigation Tabs',
    text: 'Switch between different views: Role-Task-Skill Balance & Equity, Competency Health & Completeness, Alignment & Standardization, and Stakeholder-Specific Lenses.',
    attachTo: { element: '#tour-navigation-tabs', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: navigation-tabs');
        waitForElement('#tour-navigation-tabs', 50, 100).then((element) => {
          logElementPosition('#tour-navigation-tabs', element);
          setTimeout(resolve, 800);
        });
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  // Tab 1: Balance Equity
  {
    id: 'tab-balance-equity',
    title: 'Role-Task-Skill Balance & Equity',
    text: 'This tab shows the balance between roles, tasks, and skills across your organization. It includes workload heatmaps, task risk analysis, and role similarity networks.',
    attachTo: { element: '#tour-tab-balance-equity', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: tab-balance-equity - switching to balance-equity tab');
        switchTab('balance-equity');
        setTimeout(() => {
          waitForElement('#tour-tab-balance-equity', 50, 100).then((element) => {
            logElementPosition('#tour-tab-balance-equity', element);
            setTimeout(resolve, 1200);
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'workload-heatmap',
    title: 'Workload Equity Heatmap',
    text: 'This heatmap visualizes task volume vs skill requirements for different roles. Colors indicate workload intensity.',
    attachTo: { element: '#tour-workload-heatmap', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: workload-heatmap');
        switchTab('balance-equity');
        setTimeout(() => {
          waitForElement('#tour-workload-heatmap', 50, 100).then((element) => {
            logElementPosition('#tour-workload-heatmap', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Workload heatmap element not visible, skipping...');
              this.next();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'task-risk-analysis',
    title: 'Task Risk Analysis',
    text: 'This chart shows task-wise coverage with bubble size indicating criticality. High risk, low coverage tasks require immediate attention.',
    attachTo: { element: '#tour-task-risk-analysis', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: task-risk-analysis');
        switchTab('balance-equity');
        setTimeout(() => {
          waitForElement('#tour-task-risk-analysis', 50, 100).then((element) => {
            logElementPosition('#tour-task-risk-analysis', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Task risk analysis element not visible, skipping...');
              this.next();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'role-similarity-network',
    title: 'Role Similarity Network',
    text: 'This network visualization shows overlaps between roles based on skill/task similarity. Node size indicates role importance.',
    attachTo: { element: '#tour-role-similarity-network', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: role-similarity-network');
        switchTab('balance-equity');
        setTimeout(() => {
          waitForElement('#tour-role-similarity-network', 50, 100).then((element) => {
            logElementPosition('#tour-role-similarity-network', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Role similarity network element not visible, skipping...');
              this.next();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'coverage-scorecards',
    title: 'Coverage Scorecards',
    text: 'These scorecards track completeness metrics for competency mapping. Shows current vs target percentages.',
    attachTo: { element: '#tour-coverage-scorecards', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: coverage-scorecards');
        switchTab('balance-equity');
        setTimeout(() => {
          waitForElement('#tour-coverage-scorecards', 50, 100).then((element) => {
            logElementPosition('#tour-coverage-scorecards', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Coverage scorecards element not visible, skipping...');
              this.next();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  // Tab 2: Health Completeness
  {
    id: 'tab-health-completeness',
    title: 'Competency Health & Completeness',
    text: 'This tab provides detailed health metrics and completeness analysis for your competency framework, including radar charts and skills funnel.',
    attachTo: { element: '#tour-tab-health-completeness', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: tab-health-completeness - switching to health-completeness tab');
        switchTab('health-completeness');
        setTimeout(() => {
          waitForElement('#tour-tab-health-completeness', 50, 100).then((element) => {
            logElementPosition('#tour-tab-health-completeness', element);
            setTimeout(resolve, 1200);
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'competency-radar',
    title: 'Competency Health Radar',
    text: 'This radar chart shows current vs target coverage across different competency areas like Task Mapping, Skill Coverage, and Behavior Mapping.',
    attachTo: { element: '#tour-competency-radar', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: competency-radar');
        switchTab('health-completeness');
        setTimeout(() => {
          waitForElement('#tour-competency-radar', 50, 100).then((element) => {
            logElementPosition('#tour-competency-radar', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Competency radar element not visible, skipping...');
              this.next();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'skills-funnel',
    title: 'Skills Management Funnel',
    text: 'Track orphan skills through the review and integration process. Shows identified, in review, mapped candidates, and approved skills.',
    attachTo: { element: '#tour-skills-funnel', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: skills-funnel');
        switchTab('health-completeness');
        setTimeout(() => {
          waitForElement('#tour-skills-funnel', 50, 100).then((element) => {
            logElementPosition('#tour-skills-funnel', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Skills funnel element not visible, skipping...');
              this.next();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  // Tab 3: Alignment & Standardization
  {
    id: 'tab-alignment',
    title: 'Alignment & Standardization',
    text: 'This tab shows how your competencies align with external frameworks like O*NET, SkillsFuture, and ESCO.',
    attachTo: { element: '#tour-tab-alignment-standardization', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: tab-alignment - switching to alignment-standardization tab');
        switchTab('alignment-standardization');
        setTimeout(() => {
          waitForElement('#tour-tab-alignment-standardization', 50, 100).then((element) => {
            logElementPosition('#tour-tab-alignment-standardization', element);
            setTimeout(resolve, 1200);
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'benchmark-gauge',
    title: 'External Benchmark Alignment',
    text: 'This gauge shows how your competencies align with external frameworks. Compare against O*NET, SkillsFuture, or ESCO standards.',
    attachTo: { element: '#tour-benchmark-gauge', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: benchmark-gauge');
        switchTab('alignment-standardization');
        setTimeout(() => {
          waitForElement('#tour-benchmark-gauge', 50, 100).then((element) => {
            logElementPosition('#tour-benchmark-gauge', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Benchmark gauge element not visible, skipping...');
              this.next();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'alignment-stats',
    title: 'Alignment Statistics',
    text: 'View aligned, partially aligned, and not aligned competency counts. Use the dropdown to switch between frameworks.',
    attachTo: { element: '#tour-alignment-stats', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: alignment-stats');
        switchTab('alignment-standardization');
        setTimeout(() => {
          waitForElement('#tour-alignment-stats', 50, 100).then((element) => {
            logElementPosition('#tour-alignment-stats', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Alignment stats element not visible, skipping...');
              this.next();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  // Tab 4: Stakeholder Lenses
  {
    id: 'tab-stakeholder',
    title: 'Stakeholder-Specific Lenses',
    text: 'This tab provides different perspectives for various stakeholders like HR, Managers, and Employees.',
    attachTo: { element: '#tour-tab-stakeholder-lenses', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: tab-stakeholder - switching to stakeholder-lenses tab');
        switchTab('stakeholder-lenses');
        setTimeout(() => {
          waitForElement('#tour-tab-stakeholder-lenses', 50, 100).then((element) => {
            logElementPosition('#tour-tab-stakeholder-lenses', element);
            setTimeout(resolve, 1200);
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'stakeholder-views',
    title: 'View Toggle',
    text: 'Switch between Competency Density, Skills Heatmap, and Skills Gap views to analyze data from different perspectives.',
    attachTo: { element: '#tour-stakeholder-views', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: stakeholder-views');
        switchTab('stakeholder-lenses');
        setTimeout(() => {
          waitForElement('#tour-stakeholder-views', 50, 100).then((element) => {
            logElementPosition('#tour-stakeholder-views', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Stakeholder views element not visible, skipping...');
              this.next();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'stakeholder-filters',
    title: 'Filters & Controls',
    text: 'Use filters to sort by gap, filter by category, and set threshold levels to focus on critical skills.',
    attachTo: { element: '#tour-stakeholder-filters', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: stakeholder-filters');
        switchTab('stakeholder-lenses');
        setTimeout(() => {
          waitForElement('#tour-stakeholder-filters', 50, 100).then((element) => {
            logElementPosition('#tour-stakeholder-filters', element);
            if (isElementVisible(element)) {
              setTimeout(resolve, 800);
            } else {
              console.log('Stakeholder filters element not visible, skipping...');
              this.complete();
            }
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Finish', action: function(this: any) { this.complete(); } }
    ]
  },
  {
    id: 'tour-complete',
    title: 'Tour Complete!',
    text: 'Congratulations! You\'ve completed the tour. You now have a good understanding of the Competency Dashboard.',
    buttons: [
      { text: 'Done', action: function(this: any) { this.cancel(); } }
    ]
  }
];

// Add custom styles
const addTourStyles = () => {
  // Check if styles already exist
  if (document.getElementById('shepherd-tour-styles')) {
    return;
  }
  
  const styleSheet = document.createElement('style');
  styleSheet.id = 'shepherd-tour-styles';
  styleSheet.textContent = `
    .shepherd-theme-custom {
      --shepherd-theme-primary: #3b82f6;
      --shepherd-theme-secondary: #6b7280;
    }
    .shepherd-theme-custom .shepherd-header {
      background: #3b82f6;
      color: white;
      border-radius: 8px 8px 0 0;
      padding: 12px 16px;
    }
    .shepherd-theme-custom .shepherd-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: white;
    }
    .shepherd-theme-custom .shepherd-text {
      font-size: 14px;
      line-height: 1.6;
      color: #1f2937;
      padding: 16px;
    }
    .shepherd-theme-custom .shepherd-button {
      background: #3b82f6;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-weight: 500;
      color: white;
      transition: all 0.2s ease;
      margin-left: 8px;
    }
    .shepherd-theme-custom .shepherd-button:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
    .shepherd-theme-custom .shepherd-button-secondary {
      background: #e5e7eb;
      color: #374151;
    }
    .shepherd-theme-custom .shepherd-button-secondary:hover {
      background: #d1d5db;
    }
    .shepherd-theme-custom .shepherd-cancel-icon {
      color: white;
      font-size: 20px;
    }
    .shepherd-theme-custom .shepherd-element {
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      border-radius: 12px;
      max-width: 420px;
    }
    /* Top layer visibility */
    .shepherd-element {
      z-index: 99999 !important;
    }
    .shepherd-modal-overlay-container {
      z-index: 99998 !important;
    }
    .shepherd-modal-overlay {
      background: rgba(0, 0, 0, 0.4);
    }
    /* Ensure tour content is not clipped */
    .shepherd-content {
      overflow: visible !important;
    }
    /* Better positioning for tour tooltip */
    .shepherd-has-title .shepherd-content .shepherd-header {
      padding-top: 12px;
    }
  `;
  document.head.appendChild(styleSheet);
};

// Create and initialize the tour with tab switching capability
export const initializeTour = (switchTab: TabSwitcher) => {
  addTourStyles();

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom',
      scrollTo: {
        behavior: 'smooth' as const,
        block: 'center' as const
      },
      modalOverlayOpeningPadding: 15,
      modalOverlayOpeningRadius: 10
    },
    useModalOverlay: true,
    exitOnEsc: true,
    keyboardNavigation: true
  });

  // Create steps with tab switcher
  const steps = createTourSteps(switchTab);
  
  // Add steps to tour
  steps.forEach((step: any) => {
    tour.addStep(step);
  });

  return tour;
};

// Tour state management
export const TOUR_STORAGE_KEY = 'competencyDashboardTourCompleted';

export const isTourCompleted = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
};

export const setTourCompleted = (): void => {
  localStorage.setItem(TOUR_STORAGE_KEY, 'true');
};

export const resetTour = (): void => {
  localStorage.removeItem(TOUR_STORAGE_KEY);
};
