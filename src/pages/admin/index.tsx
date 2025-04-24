
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Users, Building, FileText, User } from 'lucide-react';
import { AnalyticsData } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import UsersManagement from '@/components/admin/UsersManagement';
import CompaniesManagement from '@/components/admin/CompaniesManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import Navbar from '@/components/layout/Navbar';
import AppSidebar from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

export default function AdminDashboard() {
  const { user, isAdmin, isSuperuser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analyticsData, setAnalyticsData] = useState<Partial<AnalyticsData>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && user && !isAdmin && !isSuperuser) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, isSuperuser, isLoading, navigate]);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch basic metrics
        const [
          { data: totalUsers, error: usersError },
          { data: totalCompanies, error: companiesError },
          { data: totalCustomers, error: customersError },
          { data: avgUsersPerCompany, error: avgError },
        ] = await Promise.all([
          supabase.rpc('calculate_total_users'),
          supabase.rpc('calculate_total_companies'),
          supabase.rpc('calculate_total_customers'),
          supabase.rpc('calculate_avg_users_per_company'),
        ]);

        if (usersError || companiesError || customersError || avgError) {
          console.error('Analytics errors:', { usersError, companiesError, customersError, avgError });
          return;
        }

        setAnalyticsData({
          total_users: totalUsers || 0,
          total_companies: totalCompanies || 0,
          total_customers: totalCustomers || 0,
          avg_users_per_company: avgUsersPerCompany || 0
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && (isAdmin || isSuperuser)) {
      fetchAnalytics();
    }
  }, [isLoading, isAdmin, isSuperuser]);
  
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAdmin && !isSuperuser) {
    return null; // Will be redirected by useEffect
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <Navbar onMobileMenuToggle={() => {}} />
          <SidebarTrigger className="fixed top-4 left-4 z-30 md:hidden bg-white rounded shadow" />
          <div className="flex-1 overflow-auto p-6 pt-20">
            <div className="max-w-7xl mx-auto">
              <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage users, companies, and system settings
                </p>
              </header>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="p-2 rounded-full bg-blue-100 mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{analyticsData.total_users || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="p-2 rounded-full bg-green-100 mr-4">
                      <Building className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Companies</p>
                      <p className="text-2xl font-bold">{analyticsData.total_companies || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="p-2 rounded-full bg-amber-100 mr-4">
                      <User className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customers</p>
                      <p className="text-2xl font-bold">{analyticsData.total_customers || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-6">
                    <div className="p-2 rounded-full bg-purple-100 mr-4">
                      <BarChart className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Users/Company</p>
                      <p className="text-2xl font-bold">{analyticsData.avg_users_per_company || 0}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content Tabs */}
              <Tabs 
                defaultValue="analytics" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="companies">Companies</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analytics" className="space-y-4">
                  <AdminAnalytics analyticsData={analyticsData} />
                </TabsContent>
                
                <TabsContent value="users" className="space-y-4">
                  <UsersManagement isSuperuser={isSuperuser} />
                </TabsContent>
                
                <TabsContent value="companies" className="space-y-4">
                  <CompaniesManagement />
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <AdminSettings isSuperuser={isSuperuser} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
