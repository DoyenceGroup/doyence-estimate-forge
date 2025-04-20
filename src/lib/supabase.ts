
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
// Using the direct query pattern that matches our RLS security definer function
export async function isUserCompanyMember(companyId: string, userId: string): Promise<boolean> {
  try {
    if (!companyId || !userId) {
      console.warn('Missing company ID or user ID for membership check');
      return false;
    }
    
    // Direct query that aligns exactly with our security definer function
    const { data, error } = await supabase
      .from('company_members')
      .select('id')
      .match({ 
        company_id: companyId, 
        user_id: userId 
      })
      .maybeSingle();
    
    if (error) {
      // Don't treat "No rows found" as an error
      if (error.code === 'PGRST116') {
        return false;
      }
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
