
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSetupForm from "@/components/auth/ProfileSetup";

const ProfileSetup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("doyence_user");
    if (!userData) {
      navigate("/login");
    } else {
      const user = JSON.parse(userData);
      // If profile is already completed, redirect to dashboard
      if (user.profileCompleted) {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h1 className="text-center text-3xl font-bold text-primary-700 mb-2">
          Doyence Estimating
        </h1>
        <h2 className="text-center text-xl font-semibold text-gray-900">
          Complete your profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <ProfileSetupForm />
      </div>
    </div>
  );
};

export default ProfileSetup;
