
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
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
      // For each email, create an invitation in the database
      const companyId = profile?.company_id;
      
      // Validate emails
      const invalidEmails = emailList.filter(email => !validateEmail(email));
      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email format: ${invalidEmails.join(", ")}`);
      }
      
      if (!companyId) {
        throw new Error("No company ID found. Please set up your company first.");
      }

      // Create invitations in the database
      const { error } = await supabase
        .from('invitations')
        .insert(
          emailList.map(email => ({
            company_id: companyId,
            email: email,
            created_by: user.id
          }))
        );
      
      if (error) throw error;
      
      toast({
        title: "Invitations sent",
        description: `Sent invitations to ${emailList.length} email(s).`,
      });
      
      // Clear the input
      setEmails("");
    } catch (error: any) {
      toast({
        title: "Failed to send invitations",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simple email validation
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
