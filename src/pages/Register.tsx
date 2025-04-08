
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem("doyence_user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.profileCompleted) {
        navigate("/dashboard");
      } else {
        navigate("/profile-setup");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-primary-700 mb-2">
          Doyence Estimating
        </h1>
        <h2 className="text-center text-xl font-semibold text-gray-900">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
