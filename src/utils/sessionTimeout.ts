
import { supabase } from "@/integrations/supabase/client";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
let inactivityTimer: NodeJS.Timeout;
let lastActivity = Date.now();

// Track user activity without relying on focus/blur events for resets
export const initializeSessionTimeout = () => {
  // Only track user activity for timeout purposes
  const updateActivity = () => {
    lastActivity = Date.now();
  };
  
  // Set up inactivity check on a fixed interval
  const checkInactivity = () => {
    const timeSinceLastActivity = Date.now() - lastActivity;
    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
      supabase.auth.signOut();
    }
  };
  
  // Update last activity on user interactions
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    window.addEventListener(event, updateActivity);
  });
  
  // Check for inactivity periodically instead of using setTimeout
  // This approach is more resilient to tab switching
  const intervalTimer = setInterval(checkInactivity, 60000); // Check every minute
  
  // Initialize activity timestamp
  updateActivity();
  
  return () => {
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
      window.removeEventListener(event, updateActivity);
    });
    clearInterval(intervalTimer);
  };
};
