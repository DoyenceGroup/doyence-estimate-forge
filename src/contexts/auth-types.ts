
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/types';
import { SupabaseClient } from '@supabase/supabase-js';

// Extend the Supabase User type to include our additional properties
export interface ExtendedUser extends User {
  impersonated?: boolean;
  company_id?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: ExtendedUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isSuperuser: boolean;
  isAdmin: boolean;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  impersonateUser: (userId: string) => Promise<void>;
  endImpersonation: () => Promise<void>;
  supabase: SupabaseClient;
}
