
import { supabase } from '@/integrations/supabase/client';

// Helper function to get the current user's company ID
export async function getUserCompanyId(userId: string): Promise<string | null> {
  try {
    // Get the user's profile to determine their company ID
    const { data, error } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user company ID:', error);
      return null;
    }
    
    return data?.company_id || null;
  } catch (error) {
    console.error('Error getting user company ID:', error);
    return null;
  }
}

// Helper function to check if a user is a member of a company
// This now uses the more efficient direct query pattern that matches our RLS policy
export async function isUserCompanyMember(companyId: string, userId: string): Promise<boolean> {
  try {
    // Direct query that matches our RLS policy pattern
    const { data, error } = await supabase
      .from('company_members')
      .select('id')
      .match({ 
        company_id: companyId, 
        user_id: userId 
      })
      .maybeSingle();
    
    if (error) {
      console.error('Error checking company membership:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking company membership:', error);
    return false;
  }
}

// Export the supabase instance
export { supabase };
