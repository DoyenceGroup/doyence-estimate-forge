
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, ArrowLeft, Trash2, Search, ArrowDown, ArrowUp, Filter, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerDetails } from "@/components/customers/CustomerDetails";
import { leadSourceOptions } from "@/components/customers/leadSourceOptions";

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

const socialMediaSources = ["Facebook", "Instagram", "LinkedIn", "Social Media"];
const referralSources = ["Word of Mouth", "Referral"];
const advertisingSources = ["Car Branding", "House Branding"];

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
  const [selectedLeadSources, setSelectedLeadSources] = useState<string[]>([]);
  const [filterDateAdded, setFilterDateAdded] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);
  const [filterDateModified, setFilterDateModified] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);
  const [showFilter, setShowFilter] = useState(false);

  async function fetchCustomers() {
    try {
      setLoading(true);
      if (!session?.user?.id) return;
      
      // Fix: Use explicit type annotation for the RPC function call to avoid recursive type instantiation
      type GetCompanyIdResponse = string;
      
      const { data, error: companyIdError } = await supabase.rpc<GetCompanyIdResponse>(
        'get_effective_user_company_id'
      );
      
      if (companyIdError) {
        console.error("Error getting effective user company ID:", companyIdError);
        return;
      }
      
      // No need for explicit casting since we defined the return type correctly
      const companyId = data;

      const { data: customersData, error } = await supabase
        .from("customers")
        .select("*")
        .eq("company_id", companyId)
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
      setCustomers(customersData || []);
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

  const toggleLeadSourceFilter = (source: string) => {
    setSelectedLeadSources(prev => {
      if (prev.includes(source)) {
        return prev.filter(s => s !== source);
      } else {
        return [...prev, source];
      }
    });
  };

  const resetFilters = () => {
    setSelectedLeadSources([]);
    setFilterDateAdded([undefined, undefined]);
    setFilterDateModified([undefined, undefined]);
  };

  const hasActiveFilters = selectedLeadSources.length > 0 || 
    filterDateAdded[0] !== undefined || 
    filterDateAdded[1] !== undefined || 
    filterDateModified[0] !== undefined || 
    filterDateModified[1] !== undefined;

  const filteredSortedCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        if (selectedLeadSources.length > 0) {
          const customerSource = customer.lead_source || "";

          let matchesSelectedSource = false;

          for (const selectedSource of selectedLeadSources) {
            if (
              selectedSource === "Word of Mouth" &&
              referralSources.includes(customerSource)
            ) {
              matchesSelectedSource = true;
              break;
            }

            if (
              selectedSource === "Social Media" &&
              socialMediaSources.includes(customerSource)
            ) {
              matchesSelectedSource = true;
              break;
            }

            if (selectedSource === "Car Branding" && customerSource === "Car Branding") {
              matchesSelectedSource = true;
              break;
            }

            if (selectedSource === "House Branding" && customerSource === "House Branding") {
              matchesSelectedSource = true;
              break;
            }

            if (
              selectedSource !== "Social Media" &&
              selectedSource !== "Word of Mouth" &&
              selectedSource !== "Car Branding" &&
              selectedSource !== "House Branding" &&
              selectedSource !== "Other" &&
              selectedSource === customerSource
            ) {
              matchesSelectedSource = true;
              break;
            }

            if (
              selectedSource === "Other" &&
              !leadSourceOptions
                .slice(0, -1)
                .map(o => o.value)
                .includes(customerSource)
            ) {
              matchesSelectedSource = true;
              break;
            }
          }

          if (!matchesSelectedSource) {
            return false;
          }
        }

        if (filterDateAdded[0] && new Date(customer.created_at).getTime() < new Date(filterDateAdded[0]).getTime()) {
          return false;
        }
        if (filterDateAdded[1] && new Date(customer.created_at).getTime() > new Date(filterDateAdded[1]).getTime() + 86400000) {
          return false;
        }
        
        if (filterDateModified[0] && new Date(customer.updated_at).getTime() < new Date(filterDateModified[0]).getTime()) {
          return false;
        }
        if (filterDateModified[1] && new Date(customer.updated_at).getTime() > new Date(filterDateModified[1]).getTime() + 86400000) {
          return false;
        }
        
        const searchLower = search.toLowerCase();
        return (
          !search ||
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.last_name?.toLowerCase().includes(searchLower) ||
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
    selectedLeadSources,
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
              <CustomerFilters
                hasActiveFilters={hasActiveFilters}
                selectedLeadSources={selectedLeadSources}
                toggleLeadSourceFilter={toggleLeadSourceFilter}
                filterDateAdded={filterDateAdded}
                setFilterDateAdded={setFilterDateAdded}
                filterDateModified={filterDateModified}
                setFilterDateModified={setFilterDateModified}
                resetFilters={resetFilters}
                renderDateLabel={renderDateLabel}
              />
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
            <CustomerList
              customers={filteredSortedCustomers}
              viewCustomerDetails={viewCustomerDetails}
              setEditing={setEditing}
              setOpen={setOpen}
              handleDeleteCustomer={handleDeleteCustomer}
            />
          )}
        </>
      ) : (
        <CustomerDetails
          selectedCustomer={selectedCustomer}
          setViewMode={setViewMode}
          setEditing={setEditing}
          setOpen={setOpen}
          handleDeleteCustomer={handleDeleteCustomer}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
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
