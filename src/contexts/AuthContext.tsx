import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUpWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      setIsLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUpWithEmailAndPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: "We've sent you a code to verify your email.",
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

  const verifyEmailOtp = async (email: string, token: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (error) throw error;

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);

      toast({
        title: "Email Verified",
        description: "Your email has been verified and you're now signed in.",
      });

      navigate("/");
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
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);

      toast({
        title: "Welcome Back",
        description: "You're now logged in.",
      });

      navigate("/");
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
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
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
        isLoading,
        signUpWithEmailAndPassword,
        verifyEmailOtp,
        signInWithEmailAndPassword,
        signOut,
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
