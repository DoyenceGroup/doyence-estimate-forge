
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Mail } from "lucide-react";

const CompanyInvite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState("");
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to invite team members.",
        variant: "destructive",
      });
      return;
    }
    
    // Split and trim emails
    const emailList = emails.split(",")
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    if (emailList.length === 0) {
      toast({
        title: "No emails provided",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Starting invitation process");
      
      // First, ensure we have a company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, company_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Failed to fetch profile:", profileError);
        throw profileError;
      }

      console.log("User profile fetched:", userProfile);

      if (!userProfile.company_id && userProfile.company_name) {
        console.log("No company_id but company_name exists, triggering company creation");
        // Trigger company creation by updating the profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (updateError) {
          console.error("Failed to update profile:", updateError);
          throw updateError;
        }

        // Fetch the updated profile to get the new company_id
        const { data: updatedProfile, error: updatedProfileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (updatedProfileError || !updatedProfile.company_id) {
          console.error("Failed to get updated profile or no company_id:", updatedProfileError);
          throw new Error("Failed to create company. Please set up your company information first.");
        }

        console.log("Company created, new company_id:", updatedProfile.company_id);
        
        // Create invitations with the new company_id
        console.log("Creating invitations with new company_id");
        const { error: inviteError } = await supabase
          .from('invitations')
          .insert(
            emailList.map(email => ({
              company_id: updatedProfile.company_id,
              email: email,
              created_by: user.id
            }))
          );

        if (inviteError) {
          console.error("Failed to create invitations:", inviteError);
          throw inviteError;
        }
        
      } else if (!userProfile.company_id) {
        console.error("No company found");
        throw new Error("No company found. Please set up your company information first.");
      } else {
        // Create invitations with existing company_id
        console.log("Creating invitations with existing company_id:", userProfile.company_id);
        const { error: inviteError } = await supabase
          .from('invitations')
          .insert(
            emailList.map(email => ({
              company_id: userProfile.company_id,
              email: email,
              created_by: user.id
            }))
          );

        if (inviteError) {
          console.error("Failed to create invitations:", inviteError);
          throw inviteError;
        }
      }
      
      toast({
        title: "Invitations sent",
        description: `Sent invitations to ${emailList.length} email(s).`,
      });
      
      setEmails("");
    } catch (error: any) {
      console.error("Invitation error:", error);
      toast({
        title: "Failed to send invitations",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleInvite}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Members
          </CardTitle>
          <CardDescription>
            Invite colleagues to join your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="emails" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email Addresses
            </Label>
            <Input
              id="emails"
              placeholder="Enter email addresses separated by commas"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">
              Enter multiple email addresses separated by commas.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Invitations"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CompanyInvite;
