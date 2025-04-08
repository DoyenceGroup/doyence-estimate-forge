
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { User } from "@/lib/types";
import { Plus, FileText, Eye, MoreHorizontal, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Sample estimate data
const sampleEstimates = [
  {
    id: "EST-001",
    title: "Kitchen Renovation",
    customer: "John Smith",
    date: "2023-04-01",
    amount: 12500,
    status: "draft",
  },
  {
    id: "EST-002",
    title: "Bathroom Remodel",
    customer: "Mike Davis",
    date: "2023-04-05",
    amount: 8750,
    status: "sent",
  },
  {
    id: "EST-003",
    title: "Deck Construction",
    customer: "Emily Wilson",
    date: "2023-04-10",
    amount: 5200,
    status: "approved",
  },
  {
    id: "EST-004",
    title: "Basement Finishing",
    customer: "Robert Johnson",
    date: "2023-04-12",
    amount: 18900,
    status: "draft",
  },
  {
    id: "EST-005",
    title: "Garage Conversion",
    customer: "Lisa Thompson",
    date: "2023-04-15",
    amount: 14300,
    status: "sent",
  },
];

// Status badge styling
const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline" className="bg-gray-100">Draft</Badge>;
    case "sent":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Sent</Badge>;
    case "approved":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const Estimates = () => {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("doyence_user");
    if (!userData) {
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col">
      <Navbar onMobileMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 overflow-auto p-6 lg:pl-64">
          <div className="max-w-7xl mx-auto">
            {/* Header with title and create button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                New Estimate
              </Button>
            </div>
            
            {/* Estimates table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Estimates</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estimate #</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleEstimates.map((estimate) => (
                      <TableRow key={estimate.id}>
                        <TableCell className="font-medium">{estimate.id}</TableCell>
                        <TableCell>{estimate.title}</TableCell>
                        <TableCell>{estimate.customer}</TableCell>
                        <TableCell>{new Date(estimate.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          ${estimate.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(estimate.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estimates;
