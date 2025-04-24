
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyCreationForm from "./CompanyCreationForm";
import JoinCompany from "./JoinCompany";
import { useProfileSetup } from "@/hooks/useProfileSetup";

const ProfileSetupForm = () => {
  const {
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
    handleSubmit,
  } = useProfileSetup();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>Add your personal and company information to get started</CardDescription>
      </CardHeader>
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Company</TabsTrigger>
          <TabsTrigger value="join">Join Existing Company</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <CardContent>
            <CompanyCreationForm
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              companyName={companyName}
              setCompanyName={setCompanyName}
              companyRole={companyRole}
              setCompanyRole={setCompanyRole}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              website={website}
              setWebsite={setWebsite}
              address={address}
              setAddress={setAddress}
              setLogoUrl={setLogoUrl}
              setProfilePhotoUrl={setProfilePhotoUrl}
              isLoading={isLoading}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="join">
          <JoinCompany />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ProfileSetupForm;
