import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  isEmailVerified: boolean;
  isProcessingAuth: boolean; // ✅ ADDED HERE
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleNavigation = async (userId: string | undefined) => {
    if (!userId) {
      console.log("No user ID for navigation");
      return;
    }

    try {
      console.log("Checking profile completion for routing, user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_completed, first_name, last_name')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking profile during navigation:", error);
        throw error;
      }

      console.log("Profile data for routing:", data);

      if (!data || (data && (!data.first_name && !data.last_name))) {
        console.log("Profile needs setup, navigating to profile-setup");
        navigate("/profile-setup", { replace: true });
      } else if (data && data.profile_completed) {
        console.log("Profile complete, navigating to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("Profile exists but incomplete, navigating to profile-setup");
        navigate("/profile-setup", { replace: true });
      }
    } catch (error) {
      console.error("Error determining navigation path:", error);
      navigate("/profile-setup", { replace: true });
    }
  };

  const handleEmailConfirmation = async () => {
    if (isProcessingAuth || !window.location.hash) return;

    try {
      setIsProcessingAuth(true);
      console.log("Processing email verification from URL hash");

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session during email confirmation:", error);
        toast({
          title: "Verification error",
          description: "Could not verify your email. Please try logging in.",
          variant: "destructive",
        });
        return;
      }

      if (data?.session) {
        console.log("Session established after email verification:", data.session.user.email);
        setSession(data.session);
        setUser(data.session.user);
        setIsEmailVerified(true);

        toast({
          title: "Email verified",
          description: "Your email has been verified successfully!",
        });

        await handleNavigation(data.session.user.id);
      } else {
        console.log("No session after email verification, user needs to log in");
      }
    } catch (err) {
      console.error("Exception during email confirmation:", err);
    } finally {
      setIsProcessingAuth(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("AuthProvider initialized");
    const hasAuthHashParams = window.location.hash && window.location.hash.includes('access_token');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === "SIGNED_IN") {
          if (currentSession?.user) {
            console.log("User signed in, setting up session");
            setTimeout(async () => {
              await handleNavigation(currentSession.user.id);
            }, 0);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out, navigating to login");
          navigate("/login", { replace: true });
        } else if (event === "USER_UPDATED") {
          console.log("User updated event received");
        }
      }
    );

    const initializeAuth = async () => {
      try {
        console.log("Checking for existing session");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession?.user?.email);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user &&
          !location.pathname.includes('/login') &&
          !location.pathname.includes('/register')) {
          console.log("User has session, checking navigation path");
          await handleNavigation(currentSession.user.id);
        }

        if (hasAuthHashParams) {
          await handleEmailConfirmation();
        }
      } catch (err) {
        console.error("Error during auth initialization:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting sign up for:", email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login?verification=true'
        }
      });

      if (error) throw error;

      console.log("Sign up successful, verification email sent");
      toast({
        title: "Account created successfully",
        description: "Please check your email for the confirmation link.",
      });
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      console.log("Sign in successful:", data.user?.email);
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log("Signing out user");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log("Sign out successful");
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) {
      console.error("Cannot update profile: No user logged in");
      throw new Error("No user logged in");
    }

    try {
      console.log("Updating profile for user:", user.id);
      const { error } = await supabase
        .from('profiles')
        .update(profileData as Database['public']['Tables']['profiles']['Update'])
        .eq("id", user.id);

      if (error) throw error;

      console.log("Profile updated successfully");
      toast({
        title: "Profile updated successfully",
      });

      if (profileData.profile_completed === true) {
        console.log("Profile completed, navigating to dashboard");
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      console.error("Profile update error:", error.message);
      toast({
        title: "Profile update failed",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    isEmailVerified,
    isProcessingAuth, // ✅ RETURNED HERE
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
