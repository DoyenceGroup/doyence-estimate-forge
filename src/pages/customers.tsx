
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import CustomerNotes from "@/components/customers/CustomerNotes";
import CustomerProjects from "@/components/customers/CustomerProjects";

type Customer = {
  id: string;
  name: string;
  last_name: string;
  address: string;
  cell_numbers: string[];
  emails: string[];
  lead_source: string;
  lead_source_description?: string;
};

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [activeTab, setActiveTab] = useState<string>("info");
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();

  async function fetchCustomers() {
    try {
      setLoading(true);
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error fetching customers",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Fetched customers:", data);
      setCustomers(data || []);
    } catch (error) {
      console.error("Error in fetchCustomers:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, [session?.user?.id]);

  const handleFormSave = () => {
    setOpen(false);
    setEditing(null);
    fetchCustomers();
    toast({
      title: editing ? "Customer updated" : "Customer created",
      description: `${editing ? "Updated" : "Created"} successfully`,
    });
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);
      
      if (error) {
        console.error("Error deleting customer:", error);
        toast({
          title: "Error deleting customer",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Customer deleted",
        description: "Customer has been deleted successfully",
      });
      
      // Always return to list view after deletion, regardless of current view
      setViewMode('list');
      setSelectedCustomer(null);
      
      fetchCustomers();
    } catch (error) {
      console.error("Error in handleDeleteCustomer:", error);
    }
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('detail');
    setActiveTab("info");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {viewMode === 'list' ? (
        <>
          <div className="flex justify-between mb-6 items-center">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-2">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Customers</h1>
            </div>
            <Button onClick={() => { setOpen(true); setEditing(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </Button>
          </div>
          
          {/* Customers list */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">No customers found. Create your first customer!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customers.map((customer) => (
                <Card key={customer.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => viewCustomerDetails(customer)}>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>
                      {customer.name} {customer.last_name}
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditing(customer); 
                          setOpen(true); 
                        }} 
                        aria-label="Edit customer"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={(e) => e.stopPropagation()} 
                            aria-label="Delete customer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the customer
                              and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <span className="font-semibold">Phone(s): </span>
                      {customer.cell_numbers.length > 0 ? customer.cell_numbers.join(", ") : "None provided"}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Email(s): </span>
                      {customer.emails.length > 0 ? customer.emails.join(", ") : "None provided"}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Address: </span>
                      {customer.address || "None provided"}
                    </div>
                    <div>
                      <span className="font-semibold">Lead Source: </span>
                      {customer.lead_source || "None specified"}
                      {customer.lead_source === "Other" && customer.lead_source_description && (
                        <span className="ml-1 text-sm text-muted-foreground">
                          ({customer.lead_source_description})
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Button variant="ghost" className="mr-2" onClick={() => setViewMode('list')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Customers
              </Button>
              <h1 className="text-2xl font-bold">
                {selectedCustomer?.name} {selectedCustomer?.last_name}
              </h1>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Customer Info</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Customer Information</CardTitle>
                    <div className="flex space-x-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => { 
                          setEditing(selectedCustomer); 
                          setOpen(true); 
                        }} 
                        aria-label="Edit customer"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            aria-label="Delete customer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the customer
                              and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                if (selectedCustomer) {
                                  handleDeleteCustomer(selectedCustomer.id);
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                        <p>{selectedCustomer?.name} {selectedCustomer?.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                        <p>{selectedCustomer?.address || "None provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Phone Number(s)</p>
                        <p>{selectedCustomer?.cell_numbers.length ? selectedCustomer?.cell_numbers.join(", ") : "None provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Email(s)</p>
                        <p>{selectedCustomer?.emails.length ? selectedCustomer?.emails.join(", ") : "None provided"}</p>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Lead Source</p>
                        <p>
                          {selectedCustomer?.lead_source || "None specified"}
                          {selectedCustomer?.lead_source === "Other" && selectedCustomer?.lead_source_description && (
                            <span className="ml-1 text-muted-foreground">
                              ({selectedCustomer.lead_source_description})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes">
                {selectedCustomer && (
                  <CustomerNotes customerId={selectedCustomer.id} />
                )}
              </TabsContent>
              
              <TabsContent value="projects">
                {selectedCustomer && (
                  <CustomerProjects customerId={selectedCustomer.id} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
      
      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Customer" : "New Customer"}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={editing}
            onSave={handleFormSave}
            onCancel={() => { setOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
