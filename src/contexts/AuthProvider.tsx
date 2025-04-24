
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
  isSuperuser: false,
  isAdmin: false,
  signInWithEmailAndPassword: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  verifyOtp: async () => {},
  resendOtp: async () => {},
  impersonateUser: async () => {},
  endImpersonation: async () => {},
  supabase: supabase,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [originalUser, setOriginalUser] = useState<any>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

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
        setIsSuperuser(false);
        setIsAdmin(false);
        setOriginalUser(null);
        setIsImpersonating(false);
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

  // Check admin status when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      try {
        // Check if user is a superuser
        const { data: superuserData, error: superuserError } = await supabase.rpc('is_superuser');
        
        if (superuserError) {
          console.error("Error checking superuser status:", superuserError);
        } else {
          setIsSuperuser(!!superuserData);
        }
        
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase.rpc('is_admin');
        
        if (adminError) {
          console.error("Error checking admin status:", adminError);
        } else {
          setIsAdmin(!!adminData);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
      }
    };

    if (user) {
      checkAdminStatus();
    } else {
      setIsSuperuser(false);
      setIsAdmin(false);
    }
  }, [user]);

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
            website: data.website || null,
            status: data.status || "active"
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

  const impersonateUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Store current user before impersonation
      if (!isImpersonating) {
        setOriginalUser({
          id: user.id,
          session: session
        });
      }
      
      // Call the start_impersonation RPC function to set the session variable
      const { data: impersonationResult, error: impersonationError } = await supabase.rpc('start_impersonation', {
        target_user_id: userId
      });
      
      if (impersonationError) {
        throw impersonationError;
      }
      
      // Fetch the impersonated user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      // Update state to reflect impersonation
      setIsImpersonating(true);
      
      // Set the impersonated user data
      const impersonatedUser = {
        ...user,
        id: userId,
        impersonated: true
      };
      
      setUser(impersonatedUser);
      
      // Create a profile object for the impersonated user
      const profileData2: UserProfile = {
        id: profileData.id || "",
        user_id: profileData.id || "",
        email: profileData.company_email || null,
        first_name: profileData.first_name || null,
        last_name: profileData.last_name || null,
        phone_number: profileData.phone_number || null,
        profile_photo_url: profileData.profile_photo_url || null,
        company_role: profileData.company_role || null,
        role: profileData.role || null,
        profile_completed: profileData.profile_completed || false,
        company_id: profileData.company_id || null,
        company_name: profileData.company_name || null,
        company_email: profileData.company_email || null,
        company_address: profileData.company_address || null,
        logo_url: profileData.logo_url || null,
        website: profileData.website || null,
        status: profileData.status || "active"
      };
      
      setProfile(profileData2);
      
      toast({
        title: "Impersonation active",
        description: `You are now viewing as ${profileData2.first_name || ''} ${profileData2.last_name || ''}`,
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Impersonation error:", error);
      toast({
        variant: "destructive",
        title: "Impersonation failed",
        description: error.message || "Could not impersonate user",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const endImpersonation = async () => {
    if (!isImpersonating || !originalUser) {
      return;
    }
    
    try {
      setIsLoading(true);

      // End the impersonation session in the database
      const { data: endResult, error: endError } = await supabase.rpc('end_impersonation');
      
      if (endError) {
        throw endError;
      }
      
      // Restore original user and session
      setUser(originalUser);
      setSession(originalUser.session);
      
      // Reset impersonation state
      setIsImpersonating(false);
      setOriginalUser(null);
      
      // Re-fetch original user profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", originalUser.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      // Create a profile object for the original user
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
        website: data.website || null,
        status: data.status || "active"
      };
      
      setProfile(profileData);
      
      toast({
        title: "Impersonation ended",
        description: "You've returned to your admin account",
      });
      
      // Navigate back to admin dashboard
      navigate("/admin");
      
    } catch (error: any) {
      console.error("Error ending impersonation:", error);
      toast({
        variant: "destructive",
        title: "Error ending impersonation",
        description: error.message || "Could not end impersonation session",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // If impersonating, end impersonation instead of signing out
      if (isImpersonating && originalUser) {
        await endImpersonation();
        return;
      }
      
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
        isSuperuser,
        isAdmin,
        signInWithEmailAndPassword,
        signUp,
        signOut,
        verifyOtp,
        resendOtp,
        impersonateUser,
        endImpersonation,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// For new modular usage
export { AuthContext };
