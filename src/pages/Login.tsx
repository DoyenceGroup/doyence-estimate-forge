
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Handle email confirmation redirects
    const handleEmailConfirmation = async () => {
      // If there's a hash in URL (from email verification)
      if (window.location.hash) {
        try {
          // Exchange the token in the URL for a session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error getting session after email confirmation:", error);
            return;
          }
          
          if (data?.session) {
            toast({
              title: "Email confirmed",
              description: "Your email has been verified. You are now signed in.",
            });
            
            // After successful verification, navigate to profile setup
            setTimeout(() => {
              navigate("/profile-setup");
            }, 500);
          }
        } catch (err) {
          console.error("Error processing email confirmation:", err);
        }
      }
    };

    handleEmailConfirmation();
    
    // If user is already logged in, redirect to dashboard
    if (user && !isLoading) {
      console.log("User already logged in, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-primary-700 mb-2">
          Doyence Estimating
        </h1>
        <h2 className="text-center text-xl font-semibold text-gray-900">
          Log in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
