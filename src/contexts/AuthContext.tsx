import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type UserProfile = {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  profile_photo_url: string | null;
  company_role: string | null;
  role: string | null;
  profile_completed: boolean;
  company_id: string | null;
  company_name: string | null;
  company_email: string | null;
  company_address: string | null;
  logo_url: string | null;
  website: string | null;
};

type AuthContextType = {
  session: any;
  user: any;
  profile: UserProfile | null;
  isLoading: boolean;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  supabase: typeof supabase;
};

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

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
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
      setIsLoading(false);
    };

    getSession();
  }, []);

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
          console.log("Profile data fetched:", data);
          setProfile(data);
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
    }
  }, [user]);

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
  }, [navigate]);

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

export const useAuth = () => useContext(AuthContext);
