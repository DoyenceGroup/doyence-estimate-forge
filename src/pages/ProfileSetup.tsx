
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSetupForm from "@/components/auth/ProfileSetup";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isProfileCompleted, setIsProfileCompleted] = useState<boolean | null>(null);

  // Check if profile is already completed
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (user) {
        try {
          console.log("Checking profile completion status for user:", user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('profile_completed')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error checking profile status:", error);
            return;
          }
          
          console.log("Profile data:", data);
          
          if (data && data.profile_completed === true) {
            console.log("Profile already completed, redirecting to dashboard");
            setIsProfileCompleted(true);
            navigate("/dashboard");
          } else {
            setIsProfileCompleted(false);
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
    };
    
    if (user && !isLoading) {
      checkProfileStatus();
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!user && !isLoading) {
      console.log("No user found, redirecting to login");
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || isProfileCompleted === null) {
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
