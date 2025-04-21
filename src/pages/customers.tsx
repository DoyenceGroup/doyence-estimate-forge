
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();

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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
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
            <Card key={customer.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>
                  {customer.name} {customer.last_name}
                </CardTitle>
                <Button size="icon" variant="ghost" onClick={() => { setEditing(customer); setOpen(true); }} aria-label="Edit customer">
                  <Edit className="w-4 h-4" />
                </Button>
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
