
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  // Add signIn alias for signInWithEmailAndPassword to fix build error
  signIn: (email: string, password: string) => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  supabase: typeof supabase;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Add flag to prevent navigation conflicts
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthProvider initialized");
    
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      if (data?.session) {
        console.log("Initial session found:", data.session.user?.email);
        setSession(data.session);
        setUser(data.session.user);
      } else {
        console.log("No initial session found");
      }
      setIsLoading(false);
    };

    // Set up auth state listener first
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (currentSession?.user && !isNavigating) {
            console.log("User signed in, checking profile completion");
            
            // Set navigating flag to prevent conflicts
            setIsNavigating(true);
            
            // Wrap in setTimeout to avoid Supabase auth deadlocks
            setTimeout(async () => {
              try {
                // Check if user has completed their profile
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('profile_completed')
                  .eq('id', currentSession.user.id)
                  .single();
                  
                console.log("Profile data:", profile);
                
                if (!profile || profile.profile_completed !== true) {
                  console.log("Redirecting to profile setup");
                  navigate("/profile-setup");
                } else {
                  console.log("Redirecting to dashboard");
                  navigate("/dashboard");
                }
              } catch (error) {
                console.error("Error checking profile:", error);
              } finally {
                // Release navigation lock
                setTimeout(() => setIsNavigating(false), 500);
              }
            }, 100);
          }
        }
      }
    );

    getSession();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate, isNavigating]);

  const signUp = async (email: string, password: string) => {
    console.log("Signing up user:", email);
    setIsLoading(true);
    try {
      // First step: Create the user account without email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Explicitly disable auto confirmation to force OTP flow
          emailRedirectTo: undefined,
          data: {
            email_confirmed: false
          }
        }
      });

      if (error) throw error;
      
      console.log("User account created, requesting OTP...");

      // Second step: Explicitly request OTP for the signup flow
      const { error: otpError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (otpError) throw otpError;

      console.log("OTP requested and sent to user email");
      
      toast({
        title: "Verification code sent",
        description: "We've sent a verification code to your email.",
      });

      // Navigate to verify page, passing email in state
      setIsNavigating(true);
      navigate("/verify", { state: { email } });
      setTimeout(() => setIsNavigating(false), 500);
    } catch (error: any) {
      console.error("Sign-up error:", error.message);
      toast({
        title: "Sign-up failed",
        description: error.message || "Unable to create account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    console.log("Verifying OTP for:", email);
    setIsLoading(true);
    try {
      // Use the correct type "signup" for registration verification
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (error) throw error;

      console.log("OTP verified successfully");
      setSession(data.session);
      setUser(data.session?.user ?? null);

      toast({
        title: "Email Verified",
        description: "Your email has been verified and you're now signed in.",
      });

      // Let the onAuthStateChange listener handle navigation
      // It will check profile completion and redirect appropriately
    } catch (error: any) {
      console.error("OTP verification error:", error.message);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create signInWithEmailAndPassword function
  const signInWithEmailAndPassword = async (email: string, password: string) => {
    console.log("Signing in user:", email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Sign in successful");
      setSession(data.session);
      setUser(data.session?.user ?? null);

      toast({
        title: "Welcome Back",
        description: "You're now logged in.",
      });

      // Let the onAuthStateChange listener handle navigation
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create alias for signIn
  const signIn = signInWithEmailAndPassword;

  const signOut = async () => {
    console.log("Signing out user");
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      toast({ title: "Signed out", description: "You have been logged out." });
      
      setIsNavigating(true);
      navigate("/login");
      setTimeout(() => setIsNavigating(false), 500);
    } catch (error: any) {
      console.error("Sign-out error:", error.message);
      toast({
        title: "Logout Failed",
        description: error.message || "Error signing out.",
        variant: "destructive",
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
        isLoading,
        signUp,
        verifyOtp,
        signIn, // Add the alias
        signInWithEmailAndPassword,
        signOut,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
