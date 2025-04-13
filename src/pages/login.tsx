
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  // Flag to detect if redirected after email verification
  const isVerification = searchParams.get("verification") === "true";

  useEffect(() => {
    if (!isLoading && session) {
      console.log("Login page: user already logged in. Redirecting to dashboard...");
      navigate("/dashboard", { replace: true });
    }
  }, [session, isLoading, navigate]);

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

      {/* Only show login form if we're not in verification state */}
      {!isVerification && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <LoginForm />
        </div>
      )}
    </div>
  );
};

export default Login;
