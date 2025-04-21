
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [sessionChecked, setSessionChecked] = useState(false);

  // Flag to detect if redirected after email verification
  const isVerification = searchParams.get("verification") === "true";

  useEffect(() => {
    console.log("Login page: Auth state -", { session, isLoading });
    
    if (!isLoading) {
      setSessionChecked(true);
      if (session) {
        console.log("Login page: User already logged in. Redirecting to dashboard...");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("Login page: No session found, showing login form");
      }
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
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
          {isVerification
            ? "Your email is being verified"
            : "Log in to your account"}
        </h2>

        {isVerification && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we verify your email address...
          </p>
        )}
      </div>

      {/* Only show login form if we're not in verification state and session has been checked */}
      {!isVerification && sessionChecked && !session && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <LoginForm />
        </div>
      )}
    </div>
  );
};

export default Login;
