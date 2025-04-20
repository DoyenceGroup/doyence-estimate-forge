
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/lib/types";
import type { AuthContextType } from "./auth-types";

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signInWithEmailAndPassword: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  verifyOtp: async () => {},
  resendOtp: async () => {},
  supabase: supabase,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Listen for Auth Changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Get Session on Mount
  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          toast({
            variant: "destructive",
            title: "Error fetching session",
          });
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Session fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();
  }, [toast]);

  // Fetch profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        console.warn("User ID missing from session");
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            variant: "destructive",
            title: "Failed to load profile",
          });
        } else {
          // Create a profile object with null values for missing fields
          const profileData: UserProfile = {
            id: data.id || "",
            user_id: data.id || "",
            email: data.company_email || null,
            first_name: data.first_name || null,
            last_name: data.last_name || null,
            phone_number: data.phone_number || null,
            profile_photo_url: data.profile_photo_url || null,
            company_role: data.company_role || null,
            role: data.role || null,
            profile_completed: data.profile_completed || false,
            company_id: data.company_id || null,
            company_name: data.company_name || null,
            company_email: data.company_email || null,
            company_address: data.company_address || null,
            logo_url: data.logo_url || null,
            website: data.website || null
          };
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Error in profile fetch:", err);
      }

      setIsLoading(false);
    };

    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [user, toast]);

  // Auth actions
  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin + '/verify',
        },
      });

      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "Please check your email for verification.",
      });

      navigate('/verify', { 
        state: { email },
        replace: true 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      
      if (error) throw error;
      
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
      
      if (data.user) {
        navigate("/profile-setup", { replace: true });
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Please try again with a valid code.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + '/verify',
        }
      });

      if (error) throw error;

      toast({
        title: "Verification email resent",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      toast({
        variant: "destructive",
        title: "Failed to resend verification email",
        description: error.message || "Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });

      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signInWithEmailAndPassword,
        signUp,
        signOut,
        verifyOtp,
        resendOtp,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// For new modular usage
export { AuthContext };
