import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Ban, 
  Check, 
  ChevronDown, 
  Edit, 
  Lock, 
  MoreHorizontal, 
  Search, 
  Shield, 
  User, 
  UserCheck 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AdminUser } from '@/lib/types';
import { useAuth } from '@/contexts/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface UsersManagementProps {
  isSuperuser: boolean;
}

export default function UsersManagement({ isSuperuser }: UsersManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<'admin' | 'superuser'>('admin');
  const { toast } = useToast();
  const { user: currentUser, impersonateUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Fetch user profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesError) {
          throw profilesError;
        }
        
        // Fetch admin users
        const { data: admins, error: adminsError } = await supabase
          .from('admin_users')
          .select('*');
          
        if (adminsError) {
          throw adminsError;
        }
        
        // Transform profiles to match UserProfile type
        const transformedProfiles = profiles?.map(profile => ({
          ...profile,
          email: profile.company_email, // Map company_email to email to satisfy the type
          user_id: profile.id, // Use id as user_id to satisfy the type
        })) as UserProfile[];
        
        setUsers(transformedProfiles || []);
        setAdminUsers(admins as AdminUser[] || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load users',
          description: 'Please try again later',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const filteredUsers = users.filter(user => 
    (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const isUserAdmin = (userId: string) => 
    adminUsers.some(admin => admin.id === userId);

  const isUserSuperuser = (userId: string) => 
    adminUsers.some(admin => admin.id === userId && admin.role === 'superuser');
    
  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      // Update user status in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
      
      toast({
        title: 'User updated',
        description: `User status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update user',
        description: 'Please try again later',
      });
    }
  };
  
  const handleUpdateAdminStatus = async (userId: string, makeAdmin: boolean, role: 'admin' | 'superuser' = 'admin') => {
    try {
      if (makeAdmin) {
        // Add user as admin
        const { error } = await supabase
          .from('admin_users')
          .insert({
            id: userId,
            role,
            created_by: currentUser?.id
          });
          
        if (error) {
          throw error;
        }
        
        // Update local state
        setAdminUsers([...adminUsers, {
          id: userId,
          role,
          created_at: new Date().toISOString(),
          created_by: currentUser?.id,
          is_active: true
        }]);
      } else {
        // Remove admin status
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', userId);
          
        if (error) {
          throw error;
        }
        
        // Update local state
        setAdminUsers(adminUsers.filter(admin => admin.id !== userId));
      }
      
      toast({
        title: 'Admin access updated',
        description: makeAdmin ? 'User granted admin access' : 'Admin access revoked',
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update admin status',
        description: 'Please try again later',
      });
    }
  };
  
  const handleImpersonateUser = async (userId: string) => {
    try {
      await impersonateUser(userId);
    } catch (error) {
      console.error('Error impersonating user:', error);
    }
  };
  
  const handleOpenAdminDialog = (user: UserProfile) => {
    setSelectedUser(user);
    const existingAdmin = adminUsers.find(admin => admin.id === user.id);
    setAdminRole(existingAdmin?.role as 'admin' | 'superuser' || 'admin');
    setIsAdminDialogOpen(true);
  };
  
  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage all users and their access</CardDescription>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.profile_photo_url ? (
                          <img 
                            src={user.profile_photo_url} 
                            alt={`${user.first_name} ${user.last_name}`}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        {isUserSuperuser(user.id) && (
                          <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                            Superuser
                          </Badge>
                        )}
                        {isUserAdmin(user.id) && !isUserSuperuser(user.id) && (
                          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.company_name || "—"}
                    </TableCell>
                    <TableCell>
                      {user.status === 'active' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : user.status === 'suspended' ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Suspended
                        </Badge>
                      ) : user.status === 'blocked' ? (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unknown</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role || "User"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit user
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleImpersonateUser(user.id)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Impersonate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleUpdateUserStatus(user.id, 'suspended')}>
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend user
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUpdateUserStatus(user.id, 'active')}>
                              <Check className="mr-2 h-4 w-4" />
                              Activate user
                            </DropdownMenuItem>
                          )}
                          {isSuperuser && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpenAdminDialog(user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                {isUserAdmin(user.id) ? 'Manage admin access' : 'Make admin'}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input 
                  value={selectedUser?.first_name || ''} 
                  onChange={(e) => setSelectedUser(user => user ? {...user, first_name: e.target.value} : null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input 
                  value={selectedUser?.last_name || ''} 
                  onChange={(e) => setSelectedUser(user => user ? {...user, last_name: e.target.value} : null)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                value={selectedUser?.email || ''} 
                onChange={(e) => setSelectedUser(user => user ? {...user, email: e.target.value} : null)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={selectedUser?.status || 'active'}
                onValueChange={(value) => setSelectedUser(user => user ? {...user, status: value} : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Company ID</label>
              <Input 
                value={selectedUser?.company_id || ''} 
                onChange={(e) => setSelectedUser(user => user ? {...user, company_id: e.target.value} : null)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!selectedUser) return;
              
              try {
                const { error } = await supabase
                  .from('profiles')
                  .update({
                    first_name: selectedUser.first_name,
                    last_name: selectedUser.last_name,
                    company_email: selectedUser.email,
                    status: selectedUser.status,
                    company_id: selectedUser.company_id
                  })
                  .eq('id', selectedUser.id);
                  
                if (error) throw error;
                
                setUsers(users.map(user => 
                  user.id === selectedUser.id ? selectedUser : user
                ));
                
                toast({
                  title: 'User updated',
                  description: 'User information has been updated',
                });
                
                setIsEditDialogOpen(false);
              } catch (error) {
                console.error('Error updating user:', error);
                toast({
                  variant: 'destructive',
                  title: 'Failed to update user',
                  description: 'Please try again later',
                });
              }
            }}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
            <DialogDescription>
              {isUserAdmin(selectedUser?.id || '') 
                ? 'Modify admin privileges for this user' 
                : 'Grant admin privileges to this user'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isSuperuser && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Role</label>
                <Select
                  value={adminRole}
                  onValueChange={(value: any) => setAdminRole(value)}
                  disabled={selectedUser?.id === currentUser?.id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superuser">Superuser</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedUser?.id === currentUser?.id && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-md flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <p className="text-sm">You cannot modify your own admin privileges</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)}>
              Cancel
            </Button>
            {isUserAdmin(selectedUser?.id || '') ? (
              <>
                {selectedUser?.id !== currentUser?.id && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      if (!selectedUser) return;
                      handleUpdateAdminStatus(selectedUser.id, false);
                      setIsAdminDialogOpen(false);
                    }}
                  >
                    Remove admin access
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    if (!selectedUser) return;
                    handleUpdateAdminStatus(selectedUser.id, true, adminRole);
                    setIsAdminDialogOpen(false);
                  }}
                  disabled={selectedUser?.id === currentUser?.id}
                >
                  Update role
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => {
                  if (!selectedUser) return;
                  handleUpdateAdminStatus(selectedUser.id, true, adminRole);
                  setIsAdminDialogOpen(false);
                }}
              >
                Grant admin access
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
