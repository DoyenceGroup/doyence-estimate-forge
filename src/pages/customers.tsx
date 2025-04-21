import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, ArrowLeft, Trash2, Search, ArrowDown, ArrowUp, Filter } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  last_name: string;
  address: string;
  cell_numbers: string[];
  emails: string[];
  lead_source: string;
  lead_source_description?: string;
  created_at: string;
  updated_at: string;
};

const sortOptions = [
  { value: "name", label: "First Name" },
  { value: "last_name", label: "Last Name" },
  { value: "created_at", label: "Date Added" },
  { value: "updated_at", label: "Last Modified" },
];

const leadSourceOptions = [
  { value: "all", label: "All" },
  { value: "Referral", label: "Referral" },
  { value: "Website", label: "Website" },
  { value: "Social Media", label: "Social Media" },
  { value: "Other", label: "Other" },
];

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

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterLeadSource, setFilterLeadSource] = useState("all");
  const [filterDateAdded, setFilterDateAdded] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);
  const [filterDateModified, setFilterDateModified] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);
  const [showFilter, setShowFilter] = useState(false);

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

  const filteredSortedCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        if (filterLeadSource && filterLeadSource !== "all" && customer.lead_source !== filterLeadSource) return false;
        
        if (
          filterDateAdded[0] &&
          new Date(customer.created_at).getTime() < new Date(filterDateAdded[0]).getTime()
        )
          return false;
        if (
          filterDateAdded[1] &&
          new Date(customer.created_at).getTime() > new Date(filterDateAdded[1]).getTime() + 86400000
        )
          return false;
        
        if (
          filterDateModified[0] &&
          new Date(customer.updated_at).getTime() < new Date(filterDateModified[0]).getTime()
        )
          return false;
        if (
          filterDateModified[1] &&
          new Date(customer.updated_at).getTime() > new Date(filterDateModified[1]).getTime() + 86400000
        )
          return false;
        
        const searchLower = search.toLowerCase();
        return (
          !search ||
          customer.name.toLowerCase().includes(searchLower) ||
          customer.last_name.toLowerCase().includes(searchLower) ||
          (customer.emails && customer.emails.some((e) => e?.toLowerCase().includes(searchLower))) ||
          (customer.cell_numbers && customer.cell_numbers.some((n) => n?.toLowerCase().includes(searchLower)))
        );
      })
      .sort((a, b) => {
        let valA: any, valB: any;
        
        if (sortBy === "name") {
          valA = a.name?.toLowerCase() || "";
          valB = b.name?.toLowerCase() || "";
        } else if (sortBy === "last_name") {
          valA = a.last_name?.toLowerCase() || "";
          valB = b.last_name?.toLowerCase() || "";
        } else if (sortBy === "created_at") {
          valA = new Date(a.created_at || 0).getTime();
          valB = new Date(b.created_at || 0).getTime();
        } else if (sortBy === "updated_at") {
          valA = new Date(a.updated_at || 0).getTime();
          valB = new Date(b.updated_at || 0).getTime();
        } else {
          valA = "";
          valB = "";
        }
        
        if (valA === valB) return 0;
        if (sortDir === "asc") return valA > valB ? 1 : -1;
        else return valA < valB ? 1 : -1;
      });
  }, [
    customers,
    search,
    sortBy,
    sortDir,
    filterLeadSource,
    filterDateAdded,
    filterDateModified,
  ]);

  const renderDateLabel = (range: [Date | undefined, Date | undefined]) => {
    if (!range[0] && !range[1]) return "Any";
    if (range[0] && range[1])
      return `${format(range[0], "MMM d, yyyy")} - ${format(range[1], "MMM d, yyyy")}`;
    if (range[0]) return `After ${format(range[0], "MMM d, yyyy")}`;
    if (range[1]) return `Before ${format(range[1], "MMM d, yyyy")}`;
    return "Any";
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
          
          <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search customers…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="search"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(opt => (
                    <SelectItem value={opt.value} key={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="outline"
                aria-label="Toggle sort direction"
                onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
              >
                {sortDir === "asc" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2">
                    <Filter className="w-4 h-4 mr-2" /> Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 bg-background">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs mb-1 text-muted-foreground">Lead Source</label>
                      <Select value={filterLeadSource} onValueChange={v => setFilterLeadSource(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Lead source" />
                        </SelectTrigger>
                        <SelectContent>
                          {leadSourceOptions.map(opt => (
                            <SelectItem value={opt.value} key={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-muted-foreground">Date Added</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full">
                            {renderDateLabel(filterDateAdded)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0 bg-background">
                          <Calendar
                            mode="range"
                            selected={{
                              from: filterDateAdded[0],
                              to: filterDateAdded[1],
                            }}
                            onSelect={(range) => setFilterDateAdded([range?.from, range?.to])}
                            className={cn("p-3 pointer-events-auto")}
                          />
                          {(filterDateAdded[0] || filterDateAdded[1]) && (
                            <Button type="button" size="sm" variant="link" onClick={() => setFilterDateAdded([undefined, undefined])}>
                              Clear
                            </Button>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-muted-foreground">Last Modified</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full">
                            {renderDateLabel(filterDateModified)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0 bg-background">
                          <Calendar
                            mode="range"
                            selected={{
                              from: filterDateModified[0],
                              to: filterDateModified[1],
                            }}
                            onSelect={(range) => setFilterDateModified([range?.from, range?.to])}
                            className={cn("p-3 pointer-events-auto")}
                          />
                          {(filterDateModified[0] || filterDateModified[1]) && (
                            <Button type="button" size="sm" variant="link" onClick={() => setFilterDateModified([undefined, undefined])}>
                              Clear
                            </Button>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {(filterLeadSource !== "all" || filterDateAdded[0] || filterDateAdded[1] || filterDateModified[0] || filterDateModified[1]) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-1"
                  onClick={() => {
                    setFilterLeadSource("all");
                    setFilterDateAdded([undefined, undefined]);
                    setFilterDateModified([undefined, undefined]);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredSortedCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">No customers found. Create your first customer!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSortedCustomers.map((customer) => (
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
                      {customer.cell_numbers && customer.cell_numbers.length > 0 ? customer.cell_numbers.join(", ") : "None provided"}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Email(s): </span>
                      {customer.emails && customer.emails.length > 0 ? customer.emails.join(", ") : "None provided"}
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
