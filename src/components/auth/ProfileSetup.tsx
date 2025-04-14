
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LogoUpload from "@/components/ui/logo-upload";
import ProfilePhotoUpload from "@/components/ui/profile-photo-upload";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Building, Briefcase } from "lucide-react";

const ProfileSetupForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to complete your profile.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Updating profile for user:", user.id);
      
      // Update the profile data with new fields
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          company_role: companyRole,
          phone_number: phoneNumber,
          website,
          logo_url: logoUrl,
          profile_photo_url: profilePhotoUrl,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      console.log("Profile updated successfully, redirecting to dashboard");
      
      toast({
        title: "Profile setup complete",
        description: "Your account is ready to use.",
      });
      
      // Allow time for the UI to update before redirecting
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 800);
    } catch (error: any) {
      toast({
        title: "Profile setup failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("Profile setup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Add your personal and company information to get started
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <ProfilePhotoUpload onImageUpload={setProfilePhotoUrl} />
            <LogoUpload onImageUpload={setLogoUrl} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              Company Name
            </Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyRole" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              Your Position/Role
            </Label>
            <Input
              id="companyRole"
              placeholder="e.g. Owner, Project Manager, Estimator"
              value={companyRole}
              onChange={(e) => setCompanyRole(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Complete Profile & Continue"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileSetupForm;
