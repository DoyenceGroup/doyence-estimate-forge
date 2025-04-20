
import { supabase } from '@/integrations/supabase/client';

// Helper function to get the current user's company ID
export async function getUserCompanyId(userId: string): Promise<string | null> {
  try {
    // Call our improved database function
    const { data, error } = await supabase.rpc('get_user_company_id', { user_uuid: userId });
    
    if (error) {
      console.error('Error getting user company ID:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error getting user company ID:', error);
    return null;
  }
}

// Helper function to check if a user is a member of a company
export async function isUserCompanyMember(companyId: string, userId: string): Promise<boolean> {
  try {
    // Call our improved database function
    const { data, error } = await supabase.rpc('is_company_member', { 
      company_uuid: companyId, 
      user_uuid: userId 
    });
    
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
