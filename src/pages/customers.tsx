
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Customer = {
  id: string;
  name: string;
  last_name: string;
  address: string;
  cell_numbers: string[];
  emails: string[];
  lead_source: string;
};

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  async function fetchCustomers() {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers(data || []);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleFormSave = () => {
    setOpen(false);
    setEditing(null);
    fetchCustomers();
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
                {customer.cell_numbers.join(", ")}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Email(s): </span>
                {customer.emails.join(", ")}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Address: </span>
                {customer.address}
              </div>
              <div>
                <span className="font-semibold">Lead Source: </span>
                {customer.lead_source}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
