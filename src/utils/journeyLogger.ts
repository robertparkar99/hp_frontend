/**
 * Global Journey Logger Service
 * 
 * Logs user journey events to the API at http://127.0.0.1:8000/api/user-journey-logs
 * Automatically retrieves session data from localStorage (userData)
 * 
 * Event Types:
 * - tour_started: When user starts the onboarding tour
 * - tour_step_view: When a tour step is displayed
 * - tour_step_complete: When user completes a tour step (clicks next)
 * - tour_skipped: When user skips the tour
 * - page_visit: When user visits a page
 */

import { useState, useEffect } from "react";

/**
 * Session data interface matching the pattern from Knowledge_library/page.tsx and Newsidebar.tsx
 */
export interface SessionData {
  url: string;
  token: string;
  subInstituteId: string;
  orgType: string;
  userId: string;
  menuId: string; // Added menu_id from session
}

/**
 * React hook to get session data - use this in components
 * Returns session data in the same format as Knowledge_library/page.tsx
 */
export const useSessionData = () => {
  const [sessionData, setSessionData] = useState<SessionData>({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
    menuId: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, sub_institute_id, org_type, user_id, menu_id } =
          JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          subInstituteId: sub_institute_id,
          orgType: org_type,
          userId: user_id,
          menuId: menu_id || "", // Get menu_id from session
        });
      }
    }
  }, []);

  return sessionData;
};

/**
 * Set the current page's menuId in a dedicated localStorage key
 * This should be called when navigating to a new page
 */
export const setCurrentPageMenuId = (menuId: string | number): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem('currentPageMenuId', String(menuId));
  }
};

/**
 * Get session data synchronously (for non-react contexts)
 * Returns the session data object or null if not available
 * Uses the same pattern as Newsidebar.tsx and Knowledge_library/page.tsx
 */
export const getSessionData = (): SessionData | null => {
  if (typeof window === "undefined") return null;
  
  const userData = localStorage.getItem("userData");
  if (!userData) return null;
  
  const { APP_URL, token, sub_institute_id, org_type, user_id, menu_id } =
    JSON.parse(userData);
    
  return {
    url: APP_URL,
    token,
    subInstituteId: sub_institute_id,
    orgType: org_type,
    userId: user_id,
    menuId: menu_id || "", // Get menu_id from session
  };
};

interface JourneyLogPayload {
  token: string;
  user_id: number;
  sub_institute_id: number;
  menu_id: number;
  access_link: string;
  event_type: string;
  step_key: string | null;
}

interface LogUserJourneyParams {
  eventType: string;
  stepKey?: string | null;
  menuId?: string | number; // Optional - will get from session if not provided
  accessLink: string;
}

/**
 * Helper to get current page info for journey logging
 * Extracts menuId and accessLink from the current route
 * Uses the dedicated currentPageMenuId localStorage key set by navigation handlers
 */
export const getPageInfo = (): { menuId: number; accessLink: string } => {
  // Try to get from window.__currentMenuItem or use pathname
  const menuItem = (window as any).__currentMenuItem;
  const pathname = window.location.pathname;
  
  // First try to get from dedicated currentPageMenuId storage (set during navigation)
  let menuId: number = 0;
  
  if (typeof window !== "undefined") {
    // 1. Try currentPageMenuId (set by sidebar journey logging)
    const storedMenuId = localStorage.getItem('currentPageMenuId');
    if (storedMenuId && !isNaN(parseInt(storedMenuId))) {
      menuId = parseInt(storedMenuId);
    } else {
      // 2. Try activeSubItem (set by Newsidebar when clicking menu)
      const activeSubItem = localStorage.getItem('activeSubItem');
      if (activeSubItem && !isNaN(parseInt(activeSubItem))) {
        menuId = parseInt(activeSubItem);
      } else {
        // 3. Fallback to session menuId
        const session = getSessionData();
        if (session?.menuId && !isNaN(parseInt(session.menuId))) {
          menuId = parseInt(session.menuId);
        }
      }
    }
  }
  
  return {
    menuId,
    accessLink: menuItem || pathname,
  };
};

/**
 * Main journey logging function
 * Automatically retrieves session data from localStorage and sends to API
 * Uses the same session pattern as Newsidebar.tsx and Knowledge_library/page.tsx
 */
export const logUserJourney = async ({
  eventType,
  stepKey = null,
  menuId, // Optional - will use session menu_id if not provided
  accessLink,
}: LogUserJourneyParams): Promise<void> => {
  try {
    const session = getSessionData();

    if (!session || !session.token || !session.userId || !session.subInstituteId) {
      console.warn("JourneyLogger: Missing required session data");
      return;
    }
   
    console.log("JourneyLogger: Retrieved session data", {
      userId: session.userId,
      subInstituteId: session.subInstituteId,
      menuId: menuId  || 'no menu', // Use activeSubItem if available, otherwise session menu_id
    });
    // Use provided menuId or get from session, or get from page info
    let finalMenuId: number = 0;
    if (menuId) {
      // Check if menuId is a valid numeric string or number
      const parsedMenuId = typeof menuId === 'string' ? parseInt(menuId, 10) : menuId;
      // Only use the parsed value if it's a valid number (not NaN and not from a non-numeric string like 'welcome')
      if (!isNaN(parsedMenuId) && (typeof menuId === 'number' || /^\d+$/.test(menuId))) {
        finalMenuId = parsedMenuId;
      }
    } else {
      // Try to get from page info (activeSubItem from sidebar)
      const pageInfo = getPageInfo();
      finalMenuId = pageInfo.menuId;
    }

    // If finalMenuId is still 0, try to get a valid menu_id from session
    if (finalMenuId === 0) {
      const session = getSessionData();
      if (session?.menuId && !isNaN(parseInt(session.menuId))) {
        finalMenuId = parseInt(session.menuId);
      }
    }

    // If still 0, skip the API call and just log locally - the API requires a valid menu_id
    if (finalMenuId === 0) {
      console.warn("JourneyLogger: Skipping API call - no valid menu_id available. Payload would be:", {
        eventType,
        stepKey,
        accessLink
      });
      return;
    }

    const payload: JourneyLogPayload = {
      token: session.token,
      user_id: parseInt(session.userId) || 0,
      sub_institute_id: parseInt(session.subInstituteId) || 0,
      menu_id: finalMenuId,
      access_link: accessLink || `No access link for menu ${finalMenuId}`,
      event_type: eventType,
      step_key: stepKey,
    };

    const response = await fetch(`${session.url}/api/user-journey-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Clone the response before reading to avoid "body stream already read" error
      const responseClone = response.clone();
      let errorMessage = `Status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData);
        console.error("JourneyLogger: API error", response.status, errorData);
        // Log detailed validation errors if available
        if (errorData.errors) {
          console.error("JourneyLogger: Validation errors:", errorData.errors);
        }
      } catch {
        // Response is not JSON, likely HTML error page - use cloned response
        try {
          const errorText = await responseClone.text();
          errorMessage = errorText.substring(0, 500); // Limit length for readability
          console.error("JourneyLogger: API error", response.status, "HTML response received");
          console.error("JourneyLogger: Payload sent:", payload);
          console.error("JourneyLogger: Error response preview:", errorMessage);
        } catch (textError) {
          console.error("JourneyLogger: API error", response.status, "Could not read error response");
          console.error("JourneyLogger: Payload sent:", payload);
        }
      }
    } else {
      console.log("JourneyLogger: Event logged successfully", {
        eventType,
        stepKey,
        menuId: menuId || 0,
        accessLink,
      });
    }
  } catch (error) {
    console.error("JourneyLogger: Journey log error:", error);
  }
};

export default logUserJourney;

