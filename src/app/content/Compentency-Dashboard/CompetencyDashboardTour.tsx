import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logUserJourney, getPageInfo } from '@/utils/journeyLogger';
import { useState, useEffect, useRef } from 'react';

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

// Map on_click to element IDs
const getAttachToConfig = (stepId: string) => {
  const configs: Record<string, { element: string; on: 'top' | 'bottom' | 'left' | 'right' }> = {
    'welcome': { element: '#tour-dashboard-container', on: 'bottom' },
    'kpi-cards': { element: '#tour-kpi-cards', on: 'bottom' },
    'navigation-tabs': { element: '#tour-navigation-tabs', on: 'bottom' },
    'tab-balance-equity': { element: '#tour-tab-balance-equity', on: 'bottom' },
    'workload-heatmap': { element: '#tour-workload-heatmap', on: 'top' },
    'task-risk-analysis': { element: '#tour-task-risk-analysis', on: 'top' },
    'role-similarity-network': { element: '#tour-role-similarity-network', on: 'top' },
    'coverage-scorecards': { element: '#tour-coverage-scorecards', on: 'top' },
    'tab-health-completeness': { element: '#tour-tab-health-completeness', on: 'bottom' },
    'competency-radar': { element: '#tour-competency-radar', on: 'top' },
    'skills-funnel': { element: '#tour-skills-funnel', on: 'top' },
    'tab-alignment': { element: '#tour-tab-alignment-standardization', on: 'bottom' },
    'benchmark-gauge': { element: '#tour-benchmark-gauge', on: 'top' },
    'alignment-stats': { element: '#tour-alignment-stats', on: 'top' },
    'tab-stakeholder': { element: '#tour-tab-stakeholder-lenses', on: 'bottom' },
    'stakeholder-views': { element: '#tour-stakeholder-views', on: 'bottom' },
    'stakeholder-filters': { element: '#tour-stakeholder-filters', on: 'top' },
    'tour-complete': { element: '#tour-dashboard-container', on: 'bottom' },
  };
  return configs[stepId] || { element: '#tour-dashboard-container', on: 'bottom' };
};

// Map on_click to tab switches
const getTabSwitchFromStep = (stepId: string): string | null => {
  const tabMappings: Record<string, string> = {
    'tab-balance-equity': 'balance-equity',
    'workload-heatmap': 'balance-equity',
    'task-risk-analysis': 'balance-equity',
    'role-similarity-network': 'balance-equity',
    'coverage-scorecards': 'balance-equity',
    'tab-health-completeness': 'health-completeness',
    'competency-radar': 'health-completeness',
    'skills-funnel': 'health-completeness',
    'tab-alignment': 'alignment-standardization',
    'benchmark-gauge': 'alignment-standardization',
    'alignment-stats': 'alignment-standardization',
    'tab-stakeholder': 'stakeholder-lenses',
    'stakeholder-views': 'stakeholder-lenses',
    'stakeholder-filters': 'stakeholder-lenses',
  };
  return tabMappings[stepId] || null;
};

// Tour steps configuration with tab switching capability (fallback)
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

// Hook to fetch tour steps from API
export const useTourStepsFromAPI = (menuId: number = 182) => {
  const [tourStepsFromAPI, setTourStepsFromAPI] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<{ url: string; token: string; subInstituteId: string } | null>(null);

  // Load session data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          subInstituteId: String(sub_institute_id),
        });
      } catch (e) {
        console.error('[CompetencyDashboardTour] Invalid userData in localStorage', e);
      }
    }
  }, []);

  // Fetch tour steps from API
  useEffect(() => {
    async function fetchTourSteps() {
      if (!sessionData) return;

      setIsLoading(true);
      try {
        // Get page info for access_link
        const pageInfo = getPageInfo();
        console.log('[CompetencyDashboardTour] Current page menuId:', pageInfo.menuId, 'accessLink:', pageInfo.accessLink);

        // Fetch tour steps with proper authentication and filtering
        const res = await fetch(
          `${sessionData.url}/table_data?table=Onboarding_tour_details&filters[menu_id]=${menuId}&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}`
        );

        if (!res.ok) {
          const errorRes = res.clone();
          try {
            const errorText = await errorRes.text();
            console.error('[CompetencyDashboardTour] Tour steps API error:', res.status, errorText);
          } catch (e) {
            console.error('[CompetencyDashboardTour] Tour steps API error:', res.status);
          }
          throw new Error(`Failed to fetch tour steps: ${res.status}`);
        }

        const json = await res.json();
        console.log('[CompetencyDashboardTour] Tour steps API response:', json);

        // Handle different response formats
        let tourData: any[] = [];
        if (Array.isArray(json)) {
          tourData = json;
        } else if (json.data && Array.isArray(json.data)) {
          tourData = json.data;
        } else if (json.result && Array.isArray(json.result)) {
          tourData = json.result;
        }

        console.log('[CompetencyDashboardTour] Parsed tour data:', tourData);

        // Filter by menu_id and access_link from getPageInfo
        // Note: We use menu_id from query param (182) but also check access_link
        // Handle access_link with or without leading slash
        const normalizeAccessLink = (link: string) => {
          return link?.startsWith('/') ? link.slice(1) : link;
        };

        console.log('[CompetencyDashboardTour] Page accessLink:', pageInfo.accessLink);
        console.log('[CompetencyDashboardTour] First few API access_links:', tourData.slice(0, 3).map((s: any) => s.access_link));

        const filteredData = tourData.filter((step: any) => {
          const apiAccessLink = normalizeAccessLink(step.access_link);
          const pageAccessLink = normalizeAccessLink(pageInfo.accessLink);
          // Only filter by access_link since menu_id is already in the query
          const matches = apiAccessLink === pageAccessLink;
          if (!matches) {
            console.log('[CompetencyDashboardTour] Filtering out step:', step.access_link, 'vs', pageInfo.accessLink, '-> normalized:', apiAccessLink, 'vs', pageAccessLink);
          }
          return matches;
        });

        console.log('[CompetencyDashboardTour] Filtered tour data:', filteredData);

        // Use filtered data if available, otherwise use all data
        setTourStepsFromAPI(filteredData.length > 0 ? filteredData : tourData);
      } catch (error) {
        console.error('[CompetencyDashboardTour] Error fetching tour steps:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTourSteps();
  }, [sessionData, menuId]);

  return { tourStepsFromAPI, isLoading };
};

// Create and initialize the tour with tab switching capability
export const initializeTour = (switchTab: TabSwitcher, tourStepsFromAPI: any[] = []) => {
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

  const isUsingAPI = tourStepsFromAPI.length > 0;
  console.log('[CompetencyDashboardTour] Using API data:', isUsingAPI, 'Steps count:', tourStepsFromAPI.length);

  // Get page info for journey logging
  const getTourMenuId = () => {
    const pageInfo = getPageInfo();
    return pageInfo.menuId || 5; // Fallback to 5 if no menuId found
  };

  // Button logic for API-based tour
  const getAPITourButtons = (index: number, totalSteps: number) => {
    const currentStep = tourStepsFromAPI[index];
    const stepId = currentStep?.on_click;
    const targetTab = getTabSwitchFromStep(stepId);

    const skip = {
      text: 'Skip',
      action: async function (this: any) {
        if (targetTab) {
          switchTab(targetTab);
        }
        this.cancel();
        logUserJourney({
          eventType: 'tour_skipped',
          stepKey: stepId || `step_${index}`,
          menuId: getTourMenuId(),
          accessLink: '/competency-dashboard',
        }).catch(err => console.error('JourneyLogger: Error logging tour skip:', err));
      },
      classes: 'shepherd-button-secondary',
    };

    const back = {
      text: 'Previous',
      action: async function (this: any) {
        const prevStepId = tourStepsFromAPI[index - 1]?.on_click;
        const prevTab = getTabSwitchFromStep(prevStepId);
        if (prevTab && prevTab !== targetTab) {
          switchTab(prevTab);
          setTimeout(() => tour.back(), 600);
        } else {
          tour.back();
        }
      },
      classes: 'shepherd-button-secondary',
    };

    const next = {
      text: 'Next',
      action: async function (this: any) {
        const nextStepId = tourStepsFromAPI[index + 1]?.on_click;
        const nextTab = getTabSwitchFromStep(nextStepId);
        if (nextTab && nextTab !== targetTab) {
          switchTab(nextTab);
          setTimeout(() => tour.next(), 600);
        } else {
          tour.next();
        }
      },
      classes: 'shepherd-button',
    };

    const finish = {
      text: 'Finish',
      action: function (this: any) {
        this.complete();
        logUserJourney({
          eventType: 'tour_step_complete',
          stepKey: stepId || `step_${index}`,
          menuId: getTourMenuId(),
          accessLink: '/competency-dashboard',
        }).catch(err => console.error('JourneyLogger: Error logging tour complete:', err));
        setTourCompleted();
      },
      classes: 'shepherd-button',
    };

    if (index === 0) return [skip, next];
    if (index === totalSteps - 1) return [skip, back, finish];
    return [skip, back, next];
  };

  // Add steps to tour - use API data or fallback to hardcoded
  if (isUsingAPI) {
    // Map API data to tour steps format
    tourStepsFromAPI.forEach((apiStep, index) => {
      const attachTo = getAttachToConfig(apiStep.on_click);
      const stepId = apiStep.on_click;
      const targetTab = getTabSwitchFromStep(stepId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tour as any).addStep({
        id: stepId,
        title: apiStep.title,
        text: apiStep.description || '',
        attachTo,
        beforeShowPromise: function (this: any) {
          return new Promise<void>(resolve => {
            // Switch to the appropriate tab if needed
            if (targetTab) {
              switchTab(targetTab);
              setTimeout(() => {
                waitForElement(attachTo.element, 50, 100).then((element) => {
                  logElementPosition(attachTo.element, element);
                  setTimeout(resolve, 800);
                });
              }, 500);
            } else {
              setTimeout(resolve, 300);
            }
          });
        },
        buttons: getAPITourButtons(index, tourStepsFromAPI.length),
        cancelIcon: { enabled: true },
      } as any);
    });
  } else {
    // Use hardcoded steps
    const steps = createTourSteps(switchTab);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    steps.forEach((step: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tour as any).addStep(step);
    });
  }

  // Add journey logging event listeners
  tour.on('start', () => {
    console.log('Tour started - logging journey');
    const menuId = getTourMenuId();
    console.log('Using menuId for tour:', menuId);
    logUserJourney({
      eventType: 'tour_started',
      stepKey: isUsingAPI ? tourStepsFromAPI[0]?.on_click : 'welcome',
      menuId: menuId,
      accessLink: '/competency-dashboard',
    }).catch(err => console.error('JourneyLogger: Error logging tour start:', err));
  });

  tour.on('show', (e: any) => {
    const step = e.step;
    console.log('Tour step shown:', step.id, '- logging journey');
    const menuId = getTourMenuId();
    logUserJourney({
      eventType: 'tour_step_view',
      stepKey: step.id,
      menuId: menuId,
      accessLink: '/competency-dashboard',
    }).catch(err => console.error('JourneyLogger: Error logging tour step view:', err));
  });

  tour.on('complete', () => {
    console.log('Tour completed - logging journey');
    const menuId = getTourMenuId();
    logUserJourney({
      eventType: 'tour_step_complete',
      stepKey: isUsingAPI ? tourStepsFromAPI[tourStepsFromAPI.length - 1]?.on_click : 'tour_complete',
      menuId: menuId,
      accessLink: '/competency-dashboard',
    }).catch(err => console.error('JourneyLogger: Error logging tour complete:', err));

    // Mark tour as completed
    setTourCompleted();
  });

  tour.on('cancel', () => {
    console.log('Tour cancelled/skipped - logging journey');
    const menuId = getTourMenuId();
    logUserJourney({
      eventType: 'tour_skipped',
      stepKey: 'tour_skipped',
      menuId: menuId,
      accessLink: '/competency-dashboard',
    }).catch(err => console.error('JourneyLogger: Error logging tour skip:', err));
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
