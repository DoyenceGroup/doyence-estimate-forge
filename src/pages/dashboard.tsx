
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Clock, Wrench, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [_, setRerender] = useState({});
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { name: "Active Estimates", value: "0", icon: FileText, color: "text-blue-500", path: "/estimates" },
    { name: "Total Customers", value: "0", icon: Users, color: "text-green-500", path: "/customers" },
    { name: "Pending Invoices", value: "0", icon: FileSpreadsheet, color: "text-amber-500", path: "/invoices" },
    { name: "Recent Projects", value: "0", icon: Wrench, color: "text-purple-500", path: "/projects" },
  ]);

  const recentActivity = [
    { id: 1, action: "Estimate created", project: "Kitchen Renovation", customer: "John Smith", time: "2 hours ago" },
    { id: 2, action: "Customer added", project: "", customer: "Sarah Johnson", time: "Yesterday" },
    { id: 3, action: "Estimate approved", project: "Bathroom Remodel", customer: "Mike Davis", time: "3 days ago" },
    { id: 4, action: "Invoice sent", project: "Deck Construction", customer: "Emily Wilson", time: "1 week ago" },
  ];

  // Fetch stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        // Fetch customer count
        const { count: customerCount, error: customerError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        if (customerError) {
          console.error('Error fetching customer count:', customerError);
          toast({
            title: "Error fetching customer count",
            description: customerError.message,
            variant: "destructive",
          });
          return;
        }

        // Update the stats array with the actual customer count
        setStats(currentStats => 
          currentStats.map(stat => 
            stat.name === "Total Customers" 
              ? { ...stat, value: String(customerCount || 0) }
              : stat
          )
        );

      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Error fetching stats",
          description: "Could not retrieve customer statistics",
          variant: "destructive",
        });
      }
    };

    fetchStats();
  }, [user?.id]);

  const handleCardClick = (path: string) => {
    console.log("Navigating to:", path);
    navigate(path);
  };

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
                  <Card 
                    key={stat.name}
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleCardClick(stat.path)}
                  >
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
