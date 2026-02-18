import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Closure variable to store tour instance for button actions
let tourInstance: any = null;

// Tour step configuration for Early Going Report page
export const earlyGoingReportTourSteps: any[] = [
  {
    id: 'earlygoing-header',
    title: '📋 Early Going Report',
    text: 'This page displays the Early Going Report for employees who left before their expected out time. Use the filters below to customize your search.',
    attachTo: { element: '#earlygoing-header', on: 'bottom' },
    buttons: [
      {
        text: 'Skip Tour',
        action: () => tourInstance?.cancel(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-filters',
    title: '🔍 Filters Section',
    text: 'Use the filters below to search for specific employees. You can filter by department, employee, and date.',
    attachTo: { element: '#earlygoing-filters', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-department-selector',
    title: '🏢 Department Filter',
    text: 'Select one or more departments to filter employees. Click on the dropdown to see available departments.',
    attachTo: { element: '#earlygoing-department-selector', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-employee-selector',
    title: '👤 Employee Filter',
    text: 'Select specific employees within the selected departments. You can choose multiple employees.',
    attachTo: { element: '#earlygoing-employee-selector', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-date-picker',
    title: '📅 Date Selection',
    text: 'Select the date for which you want to view the Early Going Report. By default, it shows today\'s date.',
    attachTo: { element: '#earlygoing-date-picker', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-search-button',
    title: '🔘 Search Button',
    text: 'Click the Search button to fetch the Early Going Report data based on your selected filters.',
    attachTo: { element: '#earlygoing-search-button', on: 'top' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next ',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-export-buttons',
    title: '📤 Export Options',
    text: 'Export your report in different formats: Print, PDF, or Excel. Click on the respective button to download.',
    attachTo: { element: '#earlygoing-export-buttons', on: 'left' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next ',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-print-button',
    title: '🖨️ Print Report',
    text: 'Click here to print the current report. The print preview will show all displayed data.',
    attachTo: { element: '#earlygoing-print-button', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-pdf-button',
    title: '📄 Export to PDF',
    text: 'Download the report as a PDF file. This will include all table data with proper formatting.',
    attachTo: { element: '#earlygoing-pdf-button', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next ',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-excel-button',
    title: '📊 Export to Excel',
    text: 'Download the report as an Excel file. This format is useful for further data analysis.',
    attachTo: { element: '#earlygoing-excel-button', on: 'bottom' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Next ',
        action: () => tourInstance?.next()
      }
    ]
  },
  {
    id: 'earlygoing-data-table',
    title: '📊 Data Table',
    text: 'The table displays employee early going data including: Sr No., Emp ID, Employee Name, Department, Out Time, and Expected Out Time. Use pagination to navigate through results.',
    attachTo: { element: '#earlygoing-data-table', on: 'top' },
    buttons: [
      {
        text: 'Previous',
        action: () => tourInstance?.back()
      },
      {
        text: 'Finish Tour ',
        action: () => tourInstance?.complete()
      }
    ]
  }
];

// Tour configuration
export const earlyGoingReportTourConfig: any = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
    classes: 'shepherd-theme-custom',
    scrollTo: {
      behavior: 'smooth' as const,
      block: 'center' as const
    },
    modalOverlayOpeningPadding: 10,
    modalOverlayOpeningRadius: 8
  },
  useModalOverlay: true,
  exitOnEsc: true,
  keyboardNavigation: true
};

// Helper function to start the tour
export const startEarlyGoingReportTour = (): void => {
  const tour = new Shepherd.Tour(earlyGoingReportTourConfig);

  earlyGoingReportTourSteps.forEach(step => {
    tour.addStep({
      ...step,
      buttons: step.buttons.map((btn: any) => ({
        ...btn,
        action:
          btn.text.includes('Next') ? () => tour.next() :
          btn.text.includes('Previous') ? () => tour.back() :
          btn.text.includes('Skip') ? () => tour.cancel() :
          btn.text.includes('Finish') ? () => tour.complete() :
          btn.action
      }))
    });
  });

  sessionStorage.setItem('earlyGoingReportTourCompleted', 'true');
  sessionStorage.removeItem('triggerPageTour');

  tour.start();
};


// Check if tour should be triggered
export const shouldStartEarlyGoingReportTour = (): boolean => {
  const trigger = sessionStorage.getItem('triggerPageTour');
  const tourCompleted = sessionStorage.getItem('earlyGoingReportTourCompleted');
  
  // Trigger if:
  // 1. triggerPageTour is set to 'true' or contains 'early-going' or 'earlygoing'
  // 2. Tour hasn't been completed yet
  if (trigger && 
      (trigger === 'true' || trigger.toLowerCase().includes('early'))) {
    return !tourCompleted || tourCompleted === 'false';
  }
  return false;
};

// Reset tour completion for testing
export const resetEarlyGoingReportTour = (): void => {
  sessionStorage.removeItem('earlyGoingReportTourCompleted');
};
