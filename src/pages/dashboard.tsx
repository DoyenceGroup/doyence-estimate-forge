
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Clock, Wrench, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Mock dashboard data
  const stats = [
    { name: "Active Estimates", value: "5", icon: FileText, color: "text-blue-500" },
    { name: "Total Customers", value: "12", icon: Users, color: "text-green-500" },
    { name: "Pending Invoices", value: "3", icon: FileSpreadsheet, color: "text-amber-500" },
    { name: "Recent Projects", value: "8", icon: Wrench, color: "text-purple-500" },
  ];

  // Recent activity mock data
  const recentActivity = [
    { id: 1, action: "Estimate created", project: "Kitchen Renovation", customer: "John Smith", time: "2 hours ago" },
    { id: 2, action: "Customer added", project: "", customer: "Sarah Johnson", time: "Yesterday" },
    { id: 3, action: "Estimate approved", project: "Bathroom Remodel", customer: "Mike Davis", time: "3 days ago" },
    { id: 4, action: "Invoice sent", project: "Deck Construction", customer: "Emily Wilson", time: "1 week ago" },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar placeholder */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Doyence Estimating</h1>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2"
          >
            Menu
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar placeholder */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white p-4 transform transition-transform lg:relative lg:translate-x-0`}>
          <div className="mt-16 space-y-1">
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">Dashboard</div>
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">Estimates</div>
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">Customers</div>
            <div className="p-2 rounded hover:bg-gray-700 cursor-pointer">Settings</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6 lg:pl-64">
          <div className="max-w-7xl mx-auto">
            {/* Welcome message */}
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}!
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your estimates today.
              </p>
            </header>
            
            {/* Stats overview */}
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
            
            {/* Recent activity */}
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
      </div>
    </div>
  );
};

export default Dashboard;
