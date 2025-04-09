
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSetupForm from "@/components/auth/ProfileSetup";
import { useAuth } from "@/contexts/AuthContext";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

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
