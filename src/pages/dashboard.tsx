
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Clock, Wrench, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  action: string;
  project_name: string | null;
  customer_name: string | null;
  created_at: string;
}

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
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      }
    };

    fetchStats();
  }, [user?.id]);

  // Fetch recent activity
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching activity:', error);
          return;
        }

        setRecentActivity(data || []);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchActivity();
    }
  }, [user?.id]);

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
                    onClick={() => navigate(stat.path)}
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
                  {isLoading ? (
                    <div className="py-4 text-center text-gray-500">Loading activity...</div>
                  ) : recentActivity.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">No recent activity</div>
                  ) : (
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
                                {item.project_name && <span> - {item.project_name}</span>}
                              </p>
                              {item.customer_name && (
                                <p className="text-sm text-gray-500">
                                  {item.customer_name}
                                </p>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
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
