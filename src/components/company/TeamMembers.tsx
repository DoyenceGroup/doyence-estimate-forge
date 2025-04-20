
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Users, UserX, User, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TeamMember {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  profile_photo_url: string | null;
}

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired' | string;
  created_at: string;
}

const TeamMembers = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noCompany, setNoCompany] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const fetchTeamData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // First check if the user has a company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, company_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setNoCompany(true);
        setIsLoading(false);
        return;
      }

      if (!userProfile.company_id) {
        // If user has company name but no company_id, trigger an update to create the company
        if (userProfile.company_name) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', user.id);

          if (updateError) {
            console.error("Error updating profile:", updateError);
            setNoCompany(true);
            setIsLoading(false);
            return;
          }

          // Fetch the updated profile to get the new company_id
          const { data: updatedProfile, error: updatedProfileError } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

          if (updatedProfileError || !updatedProfile.company_id) {
            setNoCompany(true);
            setIsLoading(false);
            return;
          }

          await fetchWithCompanyId(updatedProfile.company_id);
        } else {
          setNoCompany(true);
          setIsLoading(false);
        }
        return;
      }
      
      await fetchWithCompanyId(userProfile.company_id);
    } catch (error: any) {
      console.error("Error fetching team data:", error);
      toast({
        title: "Error fetching team data",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchWithCompanyId = async (companyId: string) => {
    try {
      // Fetch members using company_members table and join with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('company_members')
        .select(`
          id,
          user_id,
          role,
          profiles (
            first_name,
            last_name,
            email,
            profile_photo_url
          )
        `)
        .eq('company_id', companyId);

      if (membersError) throw membersError;
      
      // Format the members data
      const formattedMembers = membersData.map(member => ({
        id: member.id,
        user_id: member.user_id,
        first_name: member.profiles?.first_name || null,
        last_name: member.profiles?.last_name || null,
        email: member.profiles?.email || null,
        role: member.role || 'member',
        profile_photo_url: member.profiles?.profile_photo_url || null
      }));
      
      // Fetch invitations for this company
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('company_id', companyId);

      if (invitationsError) throw invitationsError;

      console.log("Members data:", formattedMembers);
      console.log("Invitations data:", invitationsData);

      setMembers(formattedMembers || []);
      setInvitations(invitationsData || []);
      setNoCompany(false);
    } catch (error) {
      console.error("Error in fetchWithCompanyId:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
    
    // Set up realtime subscription for invitations
    const channel = supabase
      .channel('team-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitations' },
        () => {
          console.log("Received realtime update for invitations");
          fetchTeamData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'company_members' },
        () => {
          console.log("Received realtime update for company_members");
          fetchTeamData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          console.log("Received realtime update for profiles");
          fetchTeamData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.company_id, user?.id]);
  
  const handleRemoveMember = async (memberId: string, userId: string) => {
    try {
      // Delete the company_members entry
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      toast({
        title: "Team member removed",
        description: "The team member has been removed from your company.",
      });
      
      fetchTeamData();
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);
      
      if (error) throw error;
      
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled.",
      });
      
      fetchTeamData();
    } catch (error: any) {
      toast({
        title: "Failed to cancel invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  if (noCompany) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage your team members and invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <p className="text-gray-500 mb-4">
              Please complete your company information first.
            </p>
            <Button 
              onClick={() => {
                window.location.href = "/settings";
              }}
              variant="default"
            >
              Complete Company Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </CardTitle>
        <CardDescription>
          Manage your team members and invitations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Active Members ({members.length})</h3>
              {members.length > 0 ? (
                <div className="space-y-2">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          {member.profile_photo_url && (
                            <AvatarImage src={member.profile_photo_url} alt={`${member.first_name} ${member.last_name}`} />
                          )}
                          <AvatarFallback>{getInitials(member.first_name, member.last_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.first_name || ''} {member.last_name || ''}
                            {member.user_id === user?.id && <span className="ml-2 text-xs text-gray-500">(You)</span>}
                          </div>
                          <div className="text-sm text-gray-500">{member.email || 'No email'}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{member.role || 'Member'}</Badge>
                        
                        {member.user_id !== user?.id && (
                          <Dialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">...</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">
                                    <UserX className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Remove team member</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to remove this team member? They will no longer have access to your company.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {}}>Cancel</Button>
                                <Button variant="destructive" onClick={() => handleRemoveMember(member.id, member.user_id)}>Remove</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-center text-gray-500">
                  No team members yet
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Pending Invitations ({invitations.length})</h3>
              {invitations.length > 0 ? (
                <div className="space-y-2">
                  {invitations.map(invitation => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-xs text-gray-500">
                            Invited {new Date(invitation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">Pending</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-center text-gray-500">
                  No pending invitations
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamMembers;
