import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, AlertOctagon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
  areas: { name: string; district: string };
}

export const AlertFeed = ({ selectedArea }: { selectedArea: string | null }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    const channel = supabase
      .channel('weather_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weather_alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedArea]);

  const fetchAlerts = async () => {
    let query = supabase
      .from('weather_alerts')
      .select('*, areas(name, district)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (selectedArea) {
      query = query.eq('area_id', selectedArea);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching alerts:', error);
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-critical text-critical-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>;
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active alerts for the selected area.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className="border-l-4 hover:shadow-md transition-shadow" style={{
          borderLeftColor: alert.severity === 'critical' ? 'hsl(var(--critical))' : 
                          alert.severity === 'warning' ? 'hsl(var(--warning))' : 
                          'hsl(var(--primary))'
        }}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg leading-tight">{alert.title}</h3>
                  <Badge variant="outline" className="shrink-0">
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/80 mb-2">{alert.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium">{alert.areas.name}, {alert.areas.district}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
