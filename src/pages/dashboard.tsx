
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Clock, Wrench, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

const Dashboard = () => {
  const [_, setRerender] = useState({});
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { name: "Active Estimates", value: "5", icon: FileText, color: "text-blue-500" },
    { name: "Total Customers", value: "12", icon: Users, color: "text-green-500" },
    { name: "Pending Invoices", value: "3", icon: FileSpreadsheet, color: "text-amber-500" },
    { name: "Recent Projects", value: "8", icon: Wrench, color: "text-purple-500" },
  ];

  const recentActivity = [
    { id: 1, action: "Estimate created", project: "Kitchen Renovation", customer: "John Smith", time: "2 hours ago" },
    { id: 2, action: "Customer added", project: "", customer: "Sarah Johnson", time: "Yesterday" },
    { id: 3, action: "Estimate approved", project: "Bathroom Remodel", customer: "Mike Davis", time: "3 days ago" },
    { id: 4, action: "Invoice sent", project: "Deck Construction", customer: "Emily Wilson", time: "1 week ago" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <Navbar onMobileMenuToggle={() => setRerender({})} />
          <SidebarTrigger className="fixed top-4 left-4 z-30 md:hidden bg-white rounded shadow" />
          <div className="flex-1 overflow-auto p-6 pt-20">
            <div className="max-w-7xl mx-auto">
              <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome{profile?.first_name && profile?.last_name ? `, ${profile.first_name} ${profile.last_name}` : ""}!
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your estimates today.
                </p>
              </header>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                {stats.map((stat) => (
                  <Card key={stat.name}>
                    <CardContent className="flex items-center p-6">
                      <div className="p-2 rounded-full bg-gray-100 mr-4">
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-gray-200">
                    {recentActivity.map((item) => (
                      <li key={item.id} className="py-3">
                        <div className="flex items-start">
                          <div className="mr-2 mt-0.5">
                            <Clock className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {item.action}
                              {item.project && <span> - {item.project}</span>}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.customer}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.time}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
