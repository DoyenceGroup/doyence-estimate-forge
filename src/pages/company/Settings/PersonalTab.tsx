
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProfilePhotoUpload from "@/components/ui/profile-photo-upload";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PersonalTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setCompanyRole(profile.company_role || "");
      setPhoneNumber(profile.phone_number || "");
      setProfilePhotoUrl(profile.profile_photo_url || null);
    }
  }, [profile]);

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          company_role: companyRole,
          phone_number: phoneNumber,
          profile_photo_url: profilePhotoUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your personal information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSavePersonal}>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and profile photo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-4">
            <ProfilePhotoUpload
              onImageUpload={setProfilePhotoUrl}
              initialImage={profilePhotoUrl || profile?.profile_photo_url || undefined}
            />
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
            <Label htmlFor="companyRole">Your Position/Role</Label>
            <Input
              id="companyRole"
              placeholder="e.g. Owner, Project Manager, Estimator"
              value={companyRole}
              onChange={(e) => setCompanyRole(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PersonalTab;
