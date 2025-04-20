import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LogoUpload from "@/components/ui/logo-upload";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building, Mail, Phone, Globe, MapPin } from "lucide-react";

const CompanyTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.company_id) {
      console.log("[CompanyTab] Loading company data. Profile:", profile);
      setCompanyId(profile.company_id);

      supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .maybeSingle()
        .then(({ data: company, error }) => {
          console.log("[CompanyTab] Company data response:", { company, error });
          if (error) {
            console.error("[CompanyTab] Error fetching company data:", error);
            return;
          }
          
          if (!company) {
            console.warn("[CompanyTab] No company data found for ID:", profile.company_id);
            return;
          }

          console.log("[CompanyTab] Setting company data from DB:", {
            name: company.name,
            website: company.website,
            email: company.email,
            address: company.address,
            logo_url: company.logo_url ? "Found (length: " + company.logo_url.length + ")" : "Not found"
          });
          
          setCompanyName(company.name || "");
          setWebsite(company.website || "");
          setEmail(company.email || "");
          setAddress(company.address || "");
          setLogoUrl(company.logo_url || null);
        });

      setPhoneNumber(profile.phone_number || "");
    }
  }, [profile]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !companyId) {
      toast({
        title: "Error",
        description: "Missing user or company.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("[CompanyTab] Starting save company with values:", {
      companyName,
      website,
      email,
      address,
      phoneNumber,
      logoUrl: logoUrl ? `Found (length: ${logoUrl.length})` : "Not found"
    });
    
    setIsLoading(true);

    try {
      console.log("[CompanyTab] Updating profile for user:", user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          phone_number: phoneNumber,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      console.log("[CompanyTab] Profile update result:", { profileData, profileError });
      if (profileError) throw profileError;

      console.log("[CompanyTab] Updating company:", companyId);
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .update({
          name: companyName,
          website: website,
          email: email,
          address: address,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", companyId)
        .select()
        .maybeSingle();

      console.log("[CompanyTab] Company update result:", { companyData, companyError });
      if (companyError) throw companyError;

      if (companyData?.logo_url && companyData.logo_url !== logoUrl) {
        setLogoUrl(companyData.logo_url);
      }

      toast({
        title: "Company updated",
        description: "Your company information has been updated successfully.",
      });

    } catch (error: any) {
      console.error("[CompanyTab] Save failed:", error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (logo: string | null) => {
    console.log("[CompanyTab] Logo changed:", logo ? `Received (length: ${logo.length})` : "Removed");
    setLogoUrl(logo);
  };

  console.log("[CompanyTab] Render state:", { 
    companyId, 
    logoUrl: logoUrl ? `Found (length: ${logoUrl.length})` : "Not found"
  });

  return (
    <Card>
      <form onSubmit={handleSaveCompany}>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company details and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-4">
            <LogoUpload
              onImageUpload={handleLogoChange}
              initialImage={logoUrl || undefined}
            />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Company Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone" className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Company Phone
              </Label>
              <Input
                id="companyPhone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Company Address
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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

export default CompanyTab;
