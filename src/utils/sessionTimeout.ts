import { supabase } from "@/integrations/supabase/client";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
let inactivityTimer: NodeJS.Timeout;
let lastActivity = Date.now();

// Track if we're in focus or not
let isWindowFocused = true;

const resetTimer = () => {
  // Only reset the timer if we're in focus to prevent unnecessary reloads
  if (isWindowFocused) {
    clearTimeout(inactivityTimer);
    lastActivity = Date.now();

    inactivityTimer = setTimeout(async () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        await supabase.auth.signOut();
      }
    }, INACTIVITY_TIMEOUT);
  }
};

// Named handlers for proper add/remove
function onFocus() {
  isWindowFocused = true;
  // Don't reset the timer here - this was causing the reload when switching windows
}

function onBlur() {
  isWindowFocused = false;
}

export const initializeSessionTimeout = () => {
  // Track window focus/blur events
  window.addEventListener('focus', onFocus);
  window.addEventListener('blur', onBlur);

  // Reset timer on user activity, but only when the window is in focus
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();

  return () => {
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('blur', onBlur);
    clearTimeout(inactivityTimer);
  };
};
