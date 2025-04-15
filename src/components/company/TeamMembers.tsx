
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Users, UserX, User, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_photo_url: string | null;
  status: 'active' | 'pending' | 'inactive';
}

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
}

const TeamMembers = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  useEffect(() => {
    // In a real implementation, we would fetch team members from the database
    // For now, we'll just use mock data
    const mockMembers: TeamMember[] = [
      {
        id: user?.id || "1",
        first_name: profile?.first_name || "Current",
        last_name: profile?.last_name || "User",
        email: user?.email || "current@example.com",
        role: "Owner",
        profile_photo_url: profile?.profile_photo_url,
        status: 'active'
      },
      {
        id: "2",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        role: "Project Manager",
        profile_photo_url: null,
        status: 'active'
      }
    ];
    
    const mockInvitations: Invitation[] = [
      {
        id: "inv1",
        email: "mark@example.com",
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: "inv2",
        email: "sarah@example.com",
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ];
    
    setMembers(mockMembers);
    setInvitations(mockInvitations);
    setIsLoading(false);
  }, [user, profile]);
  
  const handleRemoveMember = (memberId: string) => {
    // In a real implementation, we would remove the member from the database
    // For now, we'll just update the local state
    setMembers(members.filter(member => member.id !== memberId));
    
    toast({
      title: "Team member removed",
      description: "The team member has been removed from your company.",
    });
  };
  
  const handleCancelInvitation = (invitationId: string) => {
    // In a real implementation, we would cancel the invitation in the database
    // For now, we'll just update the local state
    setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
    
    toast({
      title: "Invitation cancelled",
      description: "The invitation has been cancelled.",
    });
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

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
            {/* Active Members */}
            <div>
              <h3 className="font-medium mb-2">Active Members ({members.length})</h3>
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
                          {member.first_name} {member.last_name}
                          {member.id === user?.id && <span className="ml-2 text-xs text-gray-500">(You)</span>}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{member.role}</Badge>
                      
                      {member.id !== user?.id && (
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
                              <Button variant="destructive" onClick={() => handleRemoveMember(member.id)}>Remove</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Pending Invitations ({invitations.length})</h3>
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
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamMembers;
