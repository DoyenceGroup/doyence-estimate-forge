import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, UserX, User, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TeamMember, CompanyInvitation } from "@/lib/types";

const TeamMembers = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noCompany, setNoCompany] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user?.id || !profile) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get company ID directly from profile
        const companyId = profile.company_id;
        
        if (!companyId) {
          console.log("No company ID found for user");
          setNoCompany(true);
          setIsLoading(false);
          return;
        }
        
        console.log("Using company ID:", companyId);
        
        // First, get company members
        const { data: memberData, error: memberError } = await supabase
          .from('company_members')
          .select('id, user_id, role')
          .eq('company_id', companyId);
        
        if (memberError) {
          console.error("Error fetching members:", memberError);
          throw memberError;
        }
        
        if (!memberData) {
          console.log("No member data returned");
          setMembers([]);
        } else {
          // Now fetch profile data for each member
          const formattedMembers: TeamMember[] = [];
          
          for (const member of memberData) {
            // Get profile data for this user_id
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, phone_number, profile_photo_url, company_email')
              .eq('id', member.user_id)
              .single();
              
            if (profileError) {
              console.error(`Error fetching profile for user ${member.user_id}:`, profileError);
              // Still add the member with available data
              formattedMembers.push({
                id: member.id,
                user_id: member.user_id,
                role: member.role,
                first_name: null,
                last_name: null,
                email: null,
                profile_photo_url: null
              });
            } else if (profileData) {
              formattedMembers.push({
                id: member.id,
                user_id: member.user_id,
                role: member.role,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                email: profileData.company_email,
                profile_photo_url: profileData.profile_photo_url
              });
            }
          }
          
          setMembers(formattedMembers);
        }
        
        // Check if current user is in the list, add if not
        if (user && !members.some(m => m.user_id === user.id)) {
          // Add current user directly to company_members table
          const { data: insertData, error: insertError } = await supabase
            .from('company_members')
            .insert({
              company_id: companyId,
              user_id: user.id,
              role: 'admin' // First user is an admin
            })
            .select('id')
            .single();
          
          if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
            console.error("Error adding current user to company:", insertError);
          } else {
            console.log("Current user added to company members or already exists");
            
            // Add current user to the local members list if not already there
            if (!members.some(m => m.user_id === user.id)) {
              setMembers(prevMembers => [
                ...prevMembers,
                {
                  id: insertData?.id || `temp-${user.id}`,
                  user_id: user.id,
                  role: 'admin',
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  email: profile.email,
                  profile_photo_url: profile.profile_photo_url
                }
              ]);
            }
          }
        }

        // Fetch invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('invitations')
          .select('*')
          .eq('company_id', companyId);

        if (invitationsError) {
          console.error("Error fetching invitations:", invitationsError);
          throw invitationsError;
        }

        // Type casting to ensure compatibility with CompanyInvitation[]
        const typedInvitations = (invitationsData || []).map(inv => ({
          ...inv,
          status: (inv.status || 'pending') as 'pending' | 'accepted' | 'rejected'
        }));

        setInvitations(typedInvitations);
        setNoCompany(false);
      } catch (error: any) {
        console.error("Error fetching team data:", error);
        toast({
          title: "Error fetching team data",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('team-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitations' },
        () => {
          console.log("Received realtime update for invitations");
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'company_members' },
        () => {
          console.log("Received realtime update for company_members");
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          console.log("Received realtime update for profiles");
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, profile, toast]);
  
  const handleRemoveMember = async (memberId: string, userId: string) => {
    try {
      // Don't allow removing yourself
      if (userId === user?.id) {
        toast({
          title: "Cannot remove yourself",
          description: "You cannot remove yourself from the company.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      toast({
        title: "Team member removed",
        description: "The team member has been removed from your company.",
      });
      
      setMembers(members.filter(member => member.id !== memberId));
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
      
      setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
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
