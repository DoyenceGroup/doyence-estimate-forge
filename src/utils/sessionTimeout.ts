
import { supabase } from "@/integrations/supabase/client";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
let inactivityTimer: NodeJS.Timeout;
let lastActivity = Date.now();

// Track if we're in focus or not
let isWindowFocused = true;

const resetTimer = () => {
  clearTimeout(inactivityTimer);
  lastActivity = Date.now();
  
  inactivityTimer = setTimeout(async () => {
    const timeSinceLastActivity = Date.now() - lastActivity;
    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
      await supabase.auth.signOut();
    }
  }, INACTIVITY_TIMEOUT);
};

export const initializeSessionTimeout = () => {
  // Only update focus state without resetting timer
  window.addEventListener('focus', () => {
    isWindowFocused = true;
  });
  
  window.addEventListener('blur', () => {
    isWindowFocused = false;
  });
  
  // Reset timer on user activity, but without tying it to window focus
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    window.addEventListener(event, resetTimer);
  });
  
  // Initialize timer
  resetTimer();
  
  return () => {
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
    window.removeEventListener('focus', () => { isWindowFocused = true; });
    window.removeEventListener('blur', () => { isWindowFocused = false; });
    clearTimeout(inactivityTimer);
  };
};
