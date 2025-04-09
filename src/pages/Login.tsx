
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const isVerification = searchParams.get('verification') === 'true';

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    // This handling is secondary to the AuthContext navigation
    // but provides a fallback
    if (user && !isLoading) {
      console.log("Login page: User already logged in, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
