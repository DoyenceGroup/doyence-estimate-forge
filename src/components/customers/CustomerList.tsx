
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

interface CustomerListProps {
  customers: Customer[];
  viewCustomerDetails: (customer: Customer) => void;
  setEditing: (customer: Customer | null) => void;
  setOpen: (open: boolean) => void;
  handleDeleteCustomer: (customerId: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  viewCustomerDetails,
  setEditing,
  setOpen,
  handleDeleteCustomer
}) => {
  return (
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
                onClick={e => { e.stopPropagation(); setEditing(customer); setOpen(true); }} 
                aria-label="Edit customer"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={e => e.stopPropagation()} 
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
  );
};
