
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
        // Check if we are impersonating - if so, we need to get the effective user ID
        const { data: effectiveUserId, error: userIdError } = await supabase.rpc('get_effective_user_id');
        
        if (userIdError) {
          console.error("Error getting effective user ID:", userIdError);
          // Fall back to the actual user ID
          fetchUserProfile(user.id);
        } else {
          // If effective user ID is different from actual user ID, we're impersonating
          const isCurrentlyImpersonating = effectiveUserId !== user.id;
          setIsImpersonating(isCurrentlyImpersonating);
          
          if (isCurrentlyImpersonating) {
            // Mark the current user as being impersonated
            setUser(currentUser => ({
              ...currentUser,
              impersonated: true
            }));
            
            // Store the original user if not already stored
            if (!originalUser) {
              setOriginalUser({
                id: user.id,
                session: session
              });
            }
            
            // Get profile for the impersonated user
            fetchUserProfile(effectiveUserId);
          } else {
            // Normal case - get profile for actual user
            fetchUserProfile(user.id);
          }
        }
      } catch (err) {
        console.error("Error in profile fetch initialization:", err);
        setIsLoading(false);
      }
    };
    
    const fetchUserProfile = async (profileId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
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
  }, [user, toast, originalUser, session]);

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
      
      // Store current user before impersonation if not already stored
      if (!isImpersonating) {
        setOriginalUser({
          id: user.id,
          session: session
        });
      }
      
      // Call the server-side impersonation function
      const { data, error } = await supabase.rpc('start_impersonation', {
        target_user_id: userId
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Impersonation started successfully:", data);
      
      // After starting server-side impersonation, we need to update our frontend state
      // In this case, we update the user state to indicate impersonation
      setIsImpersonating(true);
      
      // Mark the user as being impersonated
      const impersonatedUser = {
        ...user,
        impersonated: true
      };
      
      setUser(impersonatedUser);
      
      // Fetch the impersonated user's profile - it will use the effective user ID internally
      // Note: The fetchProfile effect will automatically run because we updated the user state
      
      toast({
        title: "Impersonation active",
        description: "You are now viewing the application as another user",
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
    if (!isImpersonating) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the server-side function to end impersonation
      const { data, error } = await supabase.rpc('end_impersonation');
      
      if (error) {
        throw error;
      }
      
      console.log("Impersonation ended successfully:", data);
      
      // Reset impersonation state
      setIsImpersonating(false);
      
      // Update the user state to remove impersonation flag
      setUser(currentUser => ({
        ...currentUser,
        impersonated: false
      }));
      
      // Refresh the session to restore original user
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      setSession(sessionData.session);
      
      // Reset originalUser state
      setOriginalUser(null);
      
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
      if (isImpersonating) {
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
