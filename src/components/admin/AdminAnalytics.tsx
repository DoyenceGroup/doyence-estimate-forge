
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, BarList, LineChart } from '@tremor/react';
import { AnalyticsData } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface AdminAnalyticsProps {
  analyticsData: Partial<AnalyticsData>;
}

export default function AdminAnalytics({ analyticsData }: AdminAnalyticsProps) {
  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [activeCompanies, setActiveCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExtendedAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // For demonstration, we'll create some sample data since we don't have real analytics yet
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // Sample login activity for the past week
        const sampleLoginActivity = daysOfWeek.map((day, i) => ({
          date: day,
          "Logins": Math.floor(Math.random() * 50) + 10
        }));
        
        setLoginActivity(sampleLoginActivity);
        
        // Fetch some actual companies for the active companies list
        const { data: companies, error } = await supabase
          .from('companies')
          .select('id, name')
          .limit(5);
          
        if (error) {
          console.error('Error fetching companies:', error);
          return;
        }
        
        // Create sample activity data for these companies
        const activeCompaniesList = companies.map(company => ({
          name: company.name,
          value: Math.floor(Math.random() * 100) + 10
        }));
        
        setActiveCompanies(activeCompaniesList);
      } catch (error) {
        console.error('Error fetching extended analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExtendedAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Key metrics across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Login Activity Chart */}
              <div>
                <h3 className="text-lg font-medium mb-4">Login Activity (Past Week)</h3>
                <BarChart
                  data={loginActivity}
                  index="date"
                  categories={["Logins"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value} users`}
                  className="h-64"
                />
              </div>
              
              {/* Most Active Companies */}
              <div>
                <h3 className="text-lg font-medium mb-4">Most Active Companies</h3>
                <BarList 
                  data={activeCompanies}
                  valueFormatter={(value) => `${value} actions`}
                  color="blue"
                  className="h-64"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <LineChart
                data={[
                  { month: 'Jan', Users: 10 },
                  { month: 'Feb', Users: 25 },
                  { month: 'Mar', Users: 40 },
                  { month: 'Apr', Users: 55 },
                  { month: 'May', Users: 75 },
                  { month: 'Jun', Users: 110 },
                ]}
                index="month"
                categories={["Users"]}
                colors={["emerald"]}
                className="h-64"
                valueFormatter={(value) => `${value} users`}
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Distribution</CardTitle>
            <CardDescription>Customers per company</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <BarChart
                data={[
                  { company: 'Company A', Customers: 45 },
                  { company: 'Company B', Customers: 32 },
                  { company: 'Company C', Customers: 27 },
                  { company: 'Company D', Customers: 23 },
                  { company: 'Company E', Customers: 18 },
                ]}
                index="company"
                categories={["Customers"]}
                colors={["amber"]}
                valueFormatter={(value) => `${value} customers`}
                className="h-64"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
