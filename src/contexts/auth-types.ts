
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/types';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
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
