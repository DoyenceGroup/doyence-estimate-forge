
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

type UserProfile = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
  profile_photo_url: string | null;
  company_role: string | null;
  role: string | null;
  profile_completed: boolean;
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
  supabase: supabase,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch the current session on mount
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

  // Fetch profile whenever user/session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) {
        console.warn("User email missing from session");
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Failed to load profile",
        });
      } else {
        setProfile(data);
      }

      setIsLoading(false);
    };

    if (user) {
      fetchProfile();
    } else {
      setProfile(null); // clear profile if no user
    }
  }, [user]);

  // Listen to auth state changes
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

  // Sign in with email and password
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

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "Please check your email for verification.",
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

  // Verify OTP for email verification
  const verifyOtp = async (email: string, token: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      
      if (error) throw error;
      
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
      
      // Redirect to login page
      navigate("/login", { 
        replace: true,
        state: { verified: true }
      });
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

  // Sign out the user
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
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
