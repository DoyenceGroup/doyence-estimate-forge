
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useProfileSetup = () => {
  const { user, profile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createNewCompany, setCreateNewCompany] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.user_metadata) {
      setFirstName(user.user_metadata.first_name || "");
      setLastName(user.user_metadata.last_name || "");
    }
    
    if (profile) {
      setFirstName(profile.first_name || firstName);
      setLastName(profile.last_name || lastName);
      setCompanyName(profile.company_name || "");
      setPhoneNumber(profile.phone_number || "");
      setCompanyRole(profile.company_role || "");
      setWebsite(profile.website || "");
      setAddress(profile.company_address || "");
      
      if (profile.logo_url) {
        setLogoUrl(profile.logo_url);
      }
      
      if (profile.profile_photo_url) {
        setProfilePhotoUrl(profile.profile_photo_url);
      }
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to complete your profile.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      let companyId = null;
      
      if (createNewCompany) {
        const email = user.email;
        
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: companyName,
            email: email,
            website: website,
            address: address,
            logo_url: logoUrl
          })
          .select()
          .single();
          
        if (companyError) throw companyError;
        
        companyId = company.id;
        
        await supabase
          .from('company_members')
          .insert({
            company_id: companyId,
            user_id: user.id,
            role: 'admin'
          });
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          company_role: companyRole,
          phone_number: phoneNumber,
          profile_photo_url: profilePhotoUrl,
          logo_url: logoUrl,
          company_id: companyId,
          company_name: companyName,
          company_address: address,
          website: website,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile setup complete",
        description: "Your account is ready to use.",
      });
      
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast({
        title: "Profile setup failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    logoUrl,
    setLogoUrl,
    profilePhotoUrl,
    setProfilePhotoUrl,
    isLoading,
    createNewCompany,
    handleSubmit,
  };
};
