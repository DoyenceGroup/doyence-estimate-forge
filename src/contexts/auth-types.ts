
import type { UserProfile } from "@/lib/types";
import type { supabase } from "@/integrations/supabase/client";

export type AuthContextType = {
  session: any;
  user: any;
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
  supabase: typeof supabase;
};
