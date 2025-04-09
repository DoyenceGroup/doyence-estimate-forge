import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  // Triggered when redirected after OTP sent
  const isVerification = searchParams.get("verification") === "true";

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
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
            ? "Verifying your email address"
            : "Create a new account"}
        </h2>
        {isVerification && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we verify your email address. Check your inbox for the OTP.
          </p>
        )}
      </div>

      {/* Show form only during registration step, not verification step */}
      {!isVerification && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <RegisterForm />
        </div>
      )}
    </div>
  );
};

export default Register;
