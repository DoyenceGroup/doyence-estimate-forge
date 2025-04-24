
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AdminUser } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash } from 'lucide-react';

interface AdminSettingsProps {
  isSuperuser: boolean;
}

export default function AdminSettings({ isSuperuser }: AdminSettingsProps) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch admin users with profiles data - using inner join syntax
        const { data: admins, error: adminsError } = await supabase
          .from('admin_users')
          .select(`
            id,
            role,
            created_at,
            created_by,
            is_active,
            profiles!id(
              first_name,
              last_name,
              email
            )
          `);
          
        if (adminsError) {
          throw adminsError;
        }
        
        // Fetch audit logs
        const { data: logs, error: logsError } = await supabase
          .from('admin_audit_logs')
          .select(`
            *,
            profiles!admin_id(
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (logsError) {
          throw logsError;
        }
        
        // Type assertion with proper handling
        const processedAdmins = admins?.map(admin => ({
          ...admin,
          profiles: admin.profiles || { first_name: null, last_name: null, email: null }
        })) as AdminUser[] || [];
        
        setAdminUsers(processedAdmins);
        setAuditLogs(logs || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load data',
          description: 'Please try again later',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  
  const handleRemoveAdmin = async (adminId: string) => {
    if (!isSuperuser) {
      toast({
        variant: 'destructive',
        title: 'Permission denied',
        description: 'Only superusers can remove admin access',
      });
      return;
    }
    
    if (!confirm('Are you sure you want to remove admin access from this user?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setAdminUsers(adminUsers.filter(admin => admin.id !== adminId));
      
      toast({
        title: 'Admin removed',
        description: 'Admin access has been revoked successfully',
      });
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to remove admin',
        description: 'Please try again later',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="admins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Manage users with admin privileges</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {admin.profiles?.first_name || ''} {admin.profiles?.last_name || ''}
                            </div>
                            <div className="text-sm text-gray-500">{admin.profiles?.email || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {admin.role === 'superuser' ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Superuser
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Admin
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(admin.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {admin.is_active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isSuperuser && (
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveAdmin(admin.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {adminUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No admin users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>History of admin actions</CardDescription>
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
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.profiles?.first_name || ''} {log.profiles?.last_name || ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.entity_type}
                        </TableCell>
                        <TableCell>
                          {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {auditLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Manage global system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Data Management</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Options for managing system data and analytics
                  </p>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline">
                      Refresh Analytics Cache
                    </Button>
                    <Button variant="outline">
                      Export System Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
