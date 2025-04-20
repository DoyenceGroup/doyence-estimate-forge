
import { supabase } from '@/integrations/supabase/client';

// Helper function to get the current user's company ID
export async function getUserCompanyId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_company_id', { user_uuid: userId });
    
    if (error) {
      console.error('Error getting user company ID using RPC:', error);
      // Fallback to direct query as a backup
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Fallback error getting user company ID:', profileError);
        return null;
      }
      
      return profileData?.company_id || null;
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
    const { data, error } = await supabase.rpc('is_company_member', { 
      company_uuid: companyId, 
      user_uuid: userId 
    });
    
    if (error) {
      console.error('Error checking company membership using RPC:', error);
      // Fallback to direct query as a backup
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('id')
        .eq('company_id', companyId)
        .eq('user_id', userId);
      
      if (memberError) {
        console.error('Fallback error checking company membership:', memberError);
        return false;
      }
      
      return memberData && memberData.length > 0;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking company membership:', error);
    return false;
  }
}

// Export the supabase instance
export { supabase };
