
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

// Helper function to get the current user's company ID
export async function getUserCompanyId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data?.company_id || null;
  } catch (error) {
    console.error('Error getting user company ID:', error);
    return null;
  }
}

// Helper function to check if a user is a member of a company
export async function isUserCompanyMember(companyId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('company_members')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking company membership:', error);
    return false;
  }
}
