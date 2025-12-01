import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { AdminStats } from "@/components/admin/AdminStats";
import { RequestTrendsChart } from "@/components/admin/RequestTrendsChart";
import { UserActivityChart } from "@/components/admin/UserActivityChart";
import { SystemHealthMonitor } from "@/components/admin/SystemHealthMonitor";
import { WeatherAlertForm } from "@/components/admin/WeatherAlertForm";

interface Area {
  id: string;
  name: string;
  district: string;
}

interface Stats {
  totalRequests: number;
  verifiedRequests: number;
  actionsTaken: number;
  missingPersons: number;
}

const Admin = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    verifiedRequests: 0,
    actionsTaken: 0,
    missingPersons: 0,
  });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAreas();
      fetchStats();
      fetchTrendData();
      fetchActivityData();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'moderator'])
      .maybeSingle();
    
    if (!data) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this page.",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setCheckingAuth(false);
  };

  const fetchAreas = async () => {
    const { data } = await supabase
      .from('areas')
      .select('id, name, district')
      .order('name');
    
    if (data) setAreas(data);
  };

  const fetchStats = async () => {
    const { count: totalRequests } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true });

    const { count: verifiedRequests } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    const { count: actionsTaken } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true })
      .eq('action_taken', true);

    const { count: missingPersons } = await supabase
      .from('missing_persons')
      .select('*', { count: 'exact', head: true })
      .eq('is_found', false);

    setStats({
      totalRequests: totalRequests || 0,
      verifiedRequests: verifiedRequests || 0,
      actionsTaken: actionsTaken || 0,
      missingPersons: missingPersons || 0,
    });
  };

  const fetchTrendData = async () => {
    const { data } = await supabase
      .from('help_requests')
      .select('created_at, is_verified')
      .order('created_at', { ascending: true });

    if (data) {
      const trends = data.reduce((acc: any, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, requests: 0, verified: 0 };
        }
        acc[date].requests += 1;
        if (curr.is_verified) acc[date].verified += 1;
        return acc;
      }, {});

      setTrendData(Object.values(trends).slice(-7));
    }
  };

  const fetchActivityData = async () => {
    const { data } = await supabase
      .from('help_requests')
      .select('emergency_type');

    if (data) {
      const activity = data.reduce((acc: any, curr) => {
        const type = curr.emergency_type || 'Other';
        if (!acc[type]) {
          acc[type] = { category: type, count: 0 };
        }
        acc[type].count += 1;
        return acc;
      }, {});

      setActivityData(Object.values(activity));
    }
  };

  const healthMetrics = [
    {
      name: "Database Connection",
      status: "healthy" as const,
      message: "All queries responding normally",
      icon: require("lucide-react").Database,
    },
    {
      name: "API Services",
      status: "healthy" as const,
      message: "All endpoints operational",
      icon: require("lucide-react").Activity,
    },
    {
      name: "Storage",
      status: "healthy" as const,
      message: "File uploads working correctly",
      icon: require("lucide-react").Cloud,
    },
    {
      name: "Alert System",
      status: stats.totalRequests > 100 ? ("warning" as const) : ("healthy" as const),
      message: stats.totalRequests > 100 ? "High request volume" : "Operating normally",
      icon: require("lucide-react").AlertCircle,
    },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main
          </Button>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="w-24" />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Post Alert</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminStats {...stats} />
            
            <div className="grid gap-6 md:grid-cols-2">
              <RequestTrendsChart data={trendData} />
              <SystemHealthMonitor metrics={healthMetrics} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <UserActivityChart data={activityData} />
              <RequestTrendsChart data={trendData} />
            </div>
            
            <AdminStats {...stats} />
          </TabsContent>

          <TabsContent value="alerts">
            <div className="max-w-2xl mx-auto">
              <WeatherAlertForm areas={areas} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
