
import { createClient } from '@supabase/supabase-js';

// Define Supabase URL and key - using the ones from src/integrations/supabase/client.ts
const supabaseUrl = "https://ptdjtgonyxilanijzugt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZGp0Z29ueXhpbGFuaWp6dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNTM1MjMsImV4cCI6MjA1OTcyOTUyM30.0dJbiQfJ5OLGGf6FEzrm0FSvwjQIxkiCddvrqakJxlU";

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
