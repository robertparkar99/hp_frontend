# Tour System Documentation

This tour system provides two types of tours:

## 1. Sidebar Tour
The sidebar tour guides users through the main navigation menu. It:
- Highlights each section and submenu item
- Allows users to click through the menu
- Can navigate to specific pages
- Pauses when a page tour starts and resumes when it completes

## 2. Page Tour
Page tours are specific to individual pages and guide users through page-specific features. They:
- Start automatically when navigating from the sidebar tour
- Can be manually triggered
- Resume the sidebar tour when completed

## How It Works

### Flow
1. User starts sidebar tour from Welcome modal
2. Sidebar tour highlights navigation items
3. User clicks "new" button or Next navigates to a page
4. Sidebar tour pauses and stores current step
5. Page tour starts automatically on the new page
6. When page tour completes, it triggers sidebar tour to resume
7. Sidebar tour resumes from where it left off

### Key Components

#### PageTourManager (`PageTourManager.ts`)
Manages page-specific tours:
- `initializeTour(config)` - Initialize tour with configuration
- `startTour(steps)` - Start the tour with given steps
- `cancelTour()` - Cancel the tour
- `completeTour()` - Complete the tour
- `isPageTourCompleted(pageUrl)` - Check if tour is completed

#### usePageTour Hook (`usePageTour.ts`)
React hook for page tours:
```tsx
const {
    startTour,
    cancelTour,
    completeTour,
    isTourActive,
    isTourCompleted
} = usePageTour({
    pageUrl: '/your-page-url',
    steps: [...],
    onComplete: () => {},
    onCancel: () => {}
});
```

#### PageTour Component (`PageTour.tsx`)
Wrapper component for page content:
```tsx
<PageTour
    pageUrl="/your-page-url"
    steps={[...]}
    onComplete={() => {}}
>
    <YourPageContent />
</PageTour>
```

## Usage Example

### Creating a Page Tour

```tsx
// pages/your-page.tsx
"use client";

import { useEffect } from 'react';
import { PageTourManager } from '@/components/Tour/PageTourManager';

const tourSteps = [
    {
        id: 'welcome',
        title: 'Welcome!',
        text: 'This is your page tour.',
        attachTo: { element: '#page-header', on: 'bottom' },
        buttons: [
            { text: 'Skip', action: () => PageTourManager.globalInstance?.cancelTour() },
            { text: 'Next', action: () => PageTourManager.globalInstance?.nextStep() }
        ]
    },
    {
        id: 'feature',
        title: 'Feature',
        text: 'This is a key feature.',
        attachTo: { element: '#feature-id', on: 'right' },
        buttons: [
            { text: 'Back', action: () => PageTourManager.globalInstance?.previousStep() },
            { text: 'Complete', action: () => PageTourManager.globalInstance?.completeTour() }
        ]
    }
];

export default function YourPage() {
    useEffect(() => {
        // Check if tour should be triggered
        if (sessionStorage.getItem('triggerPageTour') === 'true') {
            sessionStorage.removeItem('triggerPageTour');
            
            PageTourManager.globalInstance = PageTourManager.globalInstance || new PageTourManager();
            PageTourManager.globalInstance.initializeTour({
                pageUrl: '/your-page-url',
                steps: tourSteps,
                onComplete: () => console.log('Tour completed!'),
                onCancel: () => console.log('Tour cancelled')
            });
        }
    }, []);

    return (
        <div>
            <h1 id="page-header">Your Page</h1>
            <div id="feature-id">Your Feature</div>
        </div>
    );
}
```

## Tour State Persistence

### localStorage Keys
- `sidebarTourPausedStep` - Current step index for sidebar tour
- `returnToSidebarTour` - Flag to resume sidebar tour after page tour
- `pageTour_{pageUrl}` - Per-page completion status

### sessionStorage Keys
- `triggerPageTour` - Flag to trigger page tour on page load

## Customization

### Styling
Custom styles can be added to the tour elements by targeting:
- `.shepherd-theme-custom` - Main theme class
- `.shepherd-element` - Tour popup container
- `.shepherd-header` - Tour header
- `.shepherd-button` - Action buttons

### Resetting Tours
```tsx
// Reset all tours
PageTourManager.resetAllPageTours();
localStorage.removeItem('sidebarTourCompleted');
localStorage.removeItem('sidebarTourPausedStep');
```
