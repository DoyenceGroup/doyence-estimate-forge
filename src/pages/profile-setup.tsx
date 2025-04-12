
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSetupForm from "@/components/auth/ProfileSetup";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isProfileCompleted, setIsProfileCompleted] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Check if profile is already completed
  useEffect(() => {
    let isMounted = true;
    const checkProfileStatus = async () => {
      if (!user) return;
      
      try {
        console.log("Checking profile completion status for user:", user.id);
        setIsChecking(true);
        
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
        
        // Only update state and navigate if component is still mounted
        if (isMounted) {
          if (data && data.profile_completed === true) {
            console.log("Profile already completed, redirecting to dashboard");
            setIsProfileCompleted(true);
            // Use replace instead of push to prevent back button issues
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 100);
          } else {
            setIsProfileCompleted(false);
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };
    
    // Only check profile status if we have a user and auth is done loading
    if (user && !isLoading) {
      checkProfileStatus();
    } else if (!isLoading) {
      setIsChecking(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, isLoading, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoading && !isChecking) {
      console.log("No user found, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, isChecking, navigate]);

  if (isLoading || isChecking || isProfileCompleted === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <h1 className="text-center text-3xl font-bold text-primary-700 mb-2">
            Doyence Estimating
          </h1>
          <h2 className="text-center text-xl font-semibold text-gray-900 mb-8">
            Loading your profile
          </h2>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
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
