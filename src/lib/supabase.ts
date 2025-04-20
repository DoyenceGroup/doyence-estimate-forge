
import { supabase } from '@/integrations/supabase/client';

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
