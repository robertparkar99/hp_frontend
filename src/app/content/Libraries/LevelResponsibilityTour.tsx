import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Helper function to wait for element to exist
const waitForElement = (selector: string, maxAttempts = 50, interval = 100): Promise<Element | null> => {
  return new Promise((resolve) => {
    let attempts = 0;
    const checkElement = () => {
      const element = document.querySelector(selector);
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

// Tab switcher callback type
export type SectionSwitcher = (section: 'description' | 'responsibility' | 'business') => void;

// Tour steps configuration
export const createLORTTourSteps = (switchSection: SectionSwitcher) => [
  {
    id: 'welcome',
    title: 'Welcome to Level of Responsibility!',
    text: 'This page helps you understand the SFIA framework levels of responsibility. Let\'s take a quick tour to explore all the features.',
    buttons: [
      { text: 'Skip', action: function(this: any) { this.cancel(); } },
      { text: 'Start Tour', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'level-selector',
    title: 'Level Selector',
    text: 'Select SFIA responsibility levels (1-7) to view their details. Each level represents increasing responsibility and autonomy.',
    attachTo: { element: '#tour-level-selector', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        waitForElement('#tour-level-selector', 50, 100).then(() => {
          setTimeout(resolve, 500);
        });
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'section-tabs',
    title: 'Content Tabs',
    text: 'Switch between three views: Description/Guidance Notes, Responsibility Attributes, and Business Skills/Behavioral Factors.',
    attachTo: { element: '#tour-section-tabs', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        waitForElement('#tour-section-tabs', 50, 100).then(() => {
          setTimeout(resolve, 500);
        });
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  {
    id: 'level-badge',
    title: 'Current Level Badge',
    text: 'This badge shows the selected level number and its guiding phrase summarizing the responsibility expectations.',
    attachTo: { element: '#tour-level-badge', on: 'bottom' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        waitForElement('#tour-level-badge', 50, 100).then(() => {
          setTimeout(resolve, 500);
        });
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  // Description Section
  {
    id: 'description-section',
    title: 'Description & Guidance Notes',
    text: 'The description tab shows the essence of the level and guidance notes explaining how it applies in practice.',
    attachTo: { element: '#tour-description-section', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: description-section - switching to description section');
        switchSection('description');
        setTimeout(() => {
          waitForElement('#tour-description-section', 50, 100).then(() => {
            setTimeout(resolve, 800);
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
    id: 'description-card',
    title: 'Level Description',
    text: 'The Description card shows the core essence of what the level means in practice. It summarizes the typical approach and mindset expected.',
    attachTo: { element: '#tour-description-card', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        switchSection('description');
        setTimeout(() => {
          waitForElement('#tour-description-card', 50, 100).then(() => {
            setTimeout(resolve, 500);
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
    id: 'guidance-card',
    title: 'Guidance Notes',
    text: 'The Guidance Notes card provides practical examples and explanations of how to apply this level in real work situations.',
    attachTo: { element: '#tour-guidance-card', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        switchSection('description');
        setTimeout(() => {
          waitForElement('#tour-guidance-card', 50, 100).then(() => {
            setTimeout(resolve, 500);
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  // Responsibility Attributes Section
  {
    id: 'responsibility-section',
    title: 'Responsibility Attributes',
    text: 'The Responsibility Attributes tab shows the key skills and behaviors expected at this level. These are derived from SFIA framework attributes.',
    attachTo: { element: '#tour-responsibility-section', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: responsibility-section - switching to responsibility section');
        switchSection('responsibility');
        setTimeout(() => {
          waitForElement('#tour-responsibility-section', 50, 100).then(() => {
            setTimeout(resolve, 800);
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
    id: 'attribute-cards',
    title: 'Attribute Cards',
    text: 'Each attribute card shows a key competency area with its description. Click on different levels to see how attributes evolve.',
    attachTo: { element: '#tour-attribute-cards', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        switchSection('responsibility');
        setTimeout(() => {
          waitForElement('#tour-attribute-cards', 50, 100).then(() => {
            setTimeout(resolve, 500);
          });
        }, 500);
      });
    },
    buttons: [
      { text: 'Previous', action: function(this: any) { this.back(); } },
      { text: 'Next', action: function(this: any) { this.next(); } }
    ]
  },
  // Business Skills Section
  {
    id: 'business-section',
    title: 'Business Skills & Behavioral Factors',
    text: 'The Business Skills tab shows soft skills and behavioral competencies required at this level, including leadership and communication skills.',
    attachTo: { element: '#tour-business-section', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        console.log('Step: business-section - switching to business section');
        switchSection('business');
        setTimeout(() => {
          waitForElement('#tour-business-section', 50, 100).then(() => {
            setTimeout(resolve, 800);
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
    id: 'business-cards',
    title: 'Behavioral Factor Cards',
    text: 'These cards show the business skills and behaviors expected. They complement technical skills and are crucial for career progression.',
    attachTo: { element: '#tour-business-cards', on: 'top' as const },
    beforeShowPromise: function(this: any) {
      return new Promise<void>(resolve => {
        switchSection('business');
        setTimeout(() => {
          waitForElement('#tour-business-cards', 50, 100).then(() => {
            setTimeout(resolve, 500);
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
    text: 'Congratulations! You now understand how to navigate the Level of Responsibility page. Use the level selector to explore different SFIA levels.',
    buttons: [
      { text: 'Done', action: function(this: any) { this.cancel(); } }
    ]
  }
];

// Add custom styles for the tour
const addLORTourStyles = () => {
  if (document.getElementById('lor-tour-styles')) {
    return;
  }
  
  const styleSheet = document.createElement('style');
  styleSheet.id = 'lor-tour-styles';
  styleSheet.textContent = `
    .shepherd-theme-lor {
      --shepherd-theme-primary: #0575E6;
      --shepherd-theme-secondary: #6c757d;
    }
    .shepherd-theme-lor .shepherd-header {
      background: linear-gradient(90deg, #0575E6 0%, #56AAFF 100%);
      color: white;
      border-radius: 8px 8px 0 0;
      padding: 12px 16px;
    }
    .shepherd-theme-lor .shepherd-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: white;
    }
    .shepherd-theme-lor .shepherd-text {
      font-size: 14px;
      line-height: 1.6;
      color: #1f2937;
      padding: 16px;
    }
    .shepherd-theme-lor .shepherd-button {
      background: #0575E6;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-weight: 500;
      color: white;
      transition: all 0.2s ease;
      margin-left: 8px;
    }
    .shepherd-theme-lor .shepherd-button:hover {
      background: #0056b3;
      transform: translateY(-1px);
    }
    .shepherd-theme-lor .shepherd-button-secondary {
      background: #e5e7eb;
      color: #374151;
    }
    .shepherd-theme-lor .shepherd-button-secondary:hover {
      background: #d1d5db;
    }
    .shepherd-theme-lor .shepherd-cancel-icon {
      color: white;
      font-size: 20px;
    }
    .shepherd-theme-lor .shepherd-element {
      box-shadow: 0 10px 40px rgba(5, 117, 230, 0.3);
      border-radius: 12px;
      max-width: 420px;
    }
    .shepherd-element {
      z-index: 99999 !important;
    }
    .shepherd-modal-overlay-container {
      z-index: 99998 !important;
    }
    .shepherd-modal-overlay {
      background: rgba(0, 0, 0, 0.4);
    }
    .shepherd-content {
      overflow: visible !important;
    }
    .shepherd-has-title .shepherd-content .shepherd-header {
      padding-top: 12px;
    }
  `;
  document.head.appendChild(styleSheet);
};

// Create and initialize the tour
export const initializeLORTour = (switchSection: SectionSwitcher) => {
  addLORTourStyles();

  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-lor',
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

  // Create steps with section switcher
  const steps = createLORTTourSteps(switchSection);
  
  // Add steps to tour
  steps.forEach((step: any) => {
    tour.addStep(step);
  });

  return tour;
};

// Tour state management
export const LOR_TOUR_STORAGE_KEY = 'lorTourCompleted';

export const isLORTourCompleted = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(LOR_TOUR_STORAGE_KEY) === 'true';
};

export const setLORTourCompleted = (): void => {
  localStorage.setItem(LOR_TOUR_STORAGE_KEY, 'true');
};

export const resetLORTour = (): void => {
  localStorage.removeItem(LOR_TOUR_STORAGE_KEY);
};
