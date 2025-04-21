
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import CustomerNotes from "./CustomerNotes";
import CustomerProjects from "./CustomerProjects";

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

interface CustomerDetailsProps {
  selectedCustomer: Customer | null;
  setViewMode: (mode: 'list' | 'detail') => void;
  setEditing: (customer: Customer | null) => void;
  setOpen: (open: boolean) => void;
  handleDeleteCustomer: (customerId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  selectedCustomer,
  setViewMode,
  setEditing,
  setOpen,
  handleDeleteCustomer,
  activeTab,
  setActiveTab
}) => {
  if (!selectedCustomer) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" className="mr-2" onClick={() => setViewMode('list')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
        <h1 className="text-2xl font-bold">
          {selectedCustomer.name} {selectedCustomer.last_name}
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
                  onClick={() => { setEditing(selectedCustomer); setOpen(true); }} 
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
                        onClick={() => handleDeleteCustomer(selectedCustomer.id)}
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
                  <p>{selectedCustomer.name} {selectedCustomer.last_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                  <p>{selectedCustomer.address || "None provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Phone Number(s)</p>
                  <p>{selectedCustomer.cell_numbers.length ? selectedCustomer.cell_numbers.join(", ") : "None provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email(s)</p>
                  <p>{selectedCustomer.emails.length ? selectedCustomer.emails.join(", ") : "None provided"}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Lead Source</p>
                  <p>
                    {selectedCustomer.lead_source || "None specified"}
                    {selectedCustomer.lead_source === "Other" && selectedCustomer.lead_source_description && (
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
          <CustomerNotes customerId={selectedCustomer.id} />
        </TabsContent>
        <TabsContent value="projects">
          <CustomerProjects customerId={selectedCustomer.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
