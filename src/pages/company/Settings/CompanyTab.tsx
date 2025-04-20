
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
  const [companyRole, setCompanyRole] = useState(""); // Unused but kept for future-proofing
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    // Load company info from companies table if company_id is available
    if (profile?.company_id) {
      setCompanyId(profile.company_id);

      // Fetch company details from companies table
      supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .maybeSingle()
        .then(({ data: company, error }) => {
          if (!company || error) return;
          console.log("Loaded company data:", company);
          setCompanyName(company.name || "");
          setWebsite(company.website || "");
          setEmail(company.email || "");
          setAddress(company.address || "");
          setLogoUrl(company.logo_url || null);
        });
      // Load phone from profile (not in companies)
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
    setIsLoading(true);

    try {
      // First update the local profile's logo_url field
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone_number: phoneNumber,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update company in companies table
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          name: companyName,
          website: website,
          email: email,
          address: address,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", companyId);

      if (companyError) throw companyError;

      toast({
        title: "Company updated",
        description: "Your company information has been updated successfully.",
      });
      
      console.log("Saved company with logo URL:", logoUrl);
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

  // Update logo handler with debug logging
  const handleLogoChange = (logo: string | null) => {
    console.log("Logo changed to:", logo);
    setLogoUrl(logo);
  };

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
