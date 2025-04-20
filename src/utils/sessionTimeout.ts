
import { supabase } from "@/lib/supabase";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

let inactivityTimer: NodeJS.Timeout;
let lastActivity = Date.now();

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
  // Reset timer on user activity
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    window.addEventListener(event, resetTimer);
  });
  
  resetTimer();
  
  return () => {
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
    clearTimeout(inactivityTimer);
  };
};
