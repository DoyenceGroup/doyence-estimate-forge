
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
  Building,
  Edit,
  FileSpreadsheet,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Users
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    website: '',
    address: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        // Fetch companies with additional metrics
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        
        // Enhance company data with member counts
        const enhancedCompanies = await Promise.all(data.map(async (company) => {
          // Get member count
          const { count: memberCount, error: memberError } = await supabase
            .from('company_members')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);
            
          // Get customer count  
          const { count: customerCount, error: customerError } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', company.id);
            
          return {
            ...company,
            member_count: memberCount || 0,
            customer_count: customerCount || 0
          };
        }));
        
        setCompanies(enhancedCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load companies',
          description: 'Please try again later',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [toast]);

  const filteredCompanies = companies.filter(company => 
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditCompany = (company: any) => {
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };
  
  const handleCreateCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: newCompany.name,
          email: newCompany.email,
          website: newCompany.website,
          address: newCompany.address
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Add to local state with default counts
      setCompanies([
        { 
          ...data, 
          member_count: 0, 
          customer_count: 0 
        },
        ...companies
      ]);
      
      toast({
        title: 'Company created',
        description: 'New company has been created successfully',
      });
      
      // Reset form and close dialog
      setNewCompany({
        name: '',
        email: '',
        website: '',
        address: ''
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create company',
        description: 'Please try again later',
      });
    }
  };
  
  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: selectedCompany.name,
          email: selectedCompany.email,
          website: selectedCompany.website,
          address: selectedCompany.address
        })
        .eq('id', selectedCompany.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setCompanies(companies.map(company => 
        company.id === selectedCompany.id ? selectedCompany : company
      ));
      
      toast({
        title: 'Company updated',
        description: 'Company information has been updated',
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update company',
        description: 'Please try again later',
      });
    }
  };
  
  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setCompanies(companies.filter(company => company.id !== companyId));
      
      toast({
        title: 'Company deleted',
        description: 'Company has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete company',
        description: 'Please try again later',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Company Management</CardTitle>
            <CardDescription>Manage all companies</CardDescription>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search companies..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
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
                  <TableHead>Company</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.name}
                            className="h-8 w-8 rounded object-contain bg-gray-100"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                            <Building className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-gray-500">{company.website}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-gray-500" />
                        {company.member_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileSpreadsheet className="mr-2 h-4 w-4 text-gray-500" />
                        {company.customer_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.email || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit company
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCompany(company.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCompanies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No companies found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Create Company Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Company</DialogTitle>
            <DialogDescription>Add a new company to the platform</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input 
                value={newCompany.name} 
                onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                value={newCompany.email} 
                onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input 
                value={newCompany.website} 
                onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input 
                value={newCompany.address} 
                onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCompany}>
              Create company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company information</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input 
                value={selectedCompany?.name || ''} 
                onChange={(e) => setSelectedCompany({...selectedCompany, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                value={selectedCompany?.email || ''} 
                onChange={(e) => setSelectedCompany({...selectedCompany, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input 
                value={selectedCompany?.website || ''} 
                onChange={(e) => setSelectedCompany({...selectedCompany, website: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input 
                value={selectedCompany?.address || ''} 
                onChange={(e) => setSelectedCompany({...selectedCompany, address: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCompany}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
