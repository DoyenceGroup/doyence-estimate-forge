
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Briefcase } from "lucide-react";
import LogoUpload from "@/components/ui/logo-upload";
import ProfilePhotoUpload from "@/components/ui/profile-photo-upload";

interface CompanyCreationFormProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  companyRole: string;
  setCompanyRole: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  setLogoUrl: (url: string | null) => void;
  setProfilePhotoUrl: (url: string | null) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const CompanyCreationForm = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  companyName,
  setCompanyName,
  companyRole,
  setCompanyRole,
  phoneNumber,
  setPhoneNumber,
  website,
  setWebsite,
  address,
  setAddress,
  setLogoUrl,
  setProfilePhotoUrl,
  isLoading,
  onSubmit,
}: CompanyCreationFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-6">
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
          <Label htmlFor="address" className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            Company Address
          </Label>
          <Input
            id="address"
            placeholder="e.g. 123 Main St, City, State"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
      </div>
      <div className="mt-6">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Complete Profile & Continue"}
        </Button>
      </div>
    </form>
  );
};

export default CompanyCreationForm;
