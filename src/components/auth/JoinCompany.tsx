
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const JoinCompany = () => {
  const [inviteToken, setInviteToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoinCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data: invitation, error: inviteError } = await supabase
        .from('company_invitations')
        .select('*, companies(*)')
        .eq('token', inviteToken)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invitation) {
        throw new Error('Invalid or expired invitation token');
      }

      // Join the company
      const { error: joinError } = await supabase
        .from('company_members')
        .insert({
          company_id: invitation.company_id,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      // Update invitation status
      await supabase
        .from('company_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      toast({
        title: "Success!",
        description: `You've joined ${invitation.companies.name}`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error joining company",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Existing Company</CardTitle>
        <CardDescription>
          Enter your invitation token to join a company
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleJoinCompany}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteToken">Invitation Token</Label>
              <Input
                id="inviteToken"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Joining..." : "Join Company"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JoinCompany;
