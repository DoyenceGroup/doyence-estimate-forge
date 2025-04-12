import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: { profile_completed: boolean } | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  supabase: typeof supabase;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ profile_completed: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

        const { data: profileData } = await supabase
          .from("profiles")
          .select("profile_completed")
          .eq("id", data.session.user.id)
          .single();

        setProfile(profileData ?? null);
      } else {
        console.log("No initial session found");
      }

      setIsLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (currentSession?.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("profile_completed")
            .eq("id", currentSession.user.id)
            .single();

          setProfile(profileData ?? null);
        }

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (currentSession?.user) {
            setTimeout(async () => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("profile_completed")
                .eq("id", currentSession.user.id)
                .single();

              console.log("Profile data:", profile);

              if (!profile || profile.profile_completed !== true) {
                console.log("Redirecting to profile setup");
                navigate("/profile-setup");
              } else {
                console.log("Redirecting to dashboard");
                navigate("/dashboard");
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
  }, [navigate]);

  const signUp = async (email: string, password: string) => {
    console.log("Signing up user:", email);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) throw error;

      console.log("User signed up, OTP email sent");

      toast({
        title: "Verification code sent",
        description: "We've sent a verification code to your email.",
      });

      navigate("/verify", { state: { email } });
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
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (error) throw error;

      console.log("OTP verified successfully");
      setSession(data.session);
      setUser(data.session?.user ?? null);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", data.session?.user.id)
        .single();

      setProfile(profileData ?? null);

      toast({
        title: "Email Verified",
        description: "Your email has been verified and you're now signed in.",
      });

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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", data.session?.user.id)
        .single();

      setProfile(profileData ?? null);

      toast({
        title: "Welcome Back",
        description: "You're now logged in.",
      });

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

  const signOut = async () => {
    console.log("Signing out user");
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      toast({ title: "Signed out", description: "You have been logged out." });
      navigate("/login");
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
        profile,
        isLoading,
        signUp,
        verifyOtp,
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
