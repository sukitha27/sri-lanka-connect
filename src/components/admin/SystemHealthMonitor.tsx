import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Cloud, AlertCircle } from "lucide-react";

interface HealthMetric {
  name: string;
  status: "healthy" | "warning" | "error";
  message: string;
  icon: React.ElementType;
}

interface SystemHealthMonitorProps {
  metrics: HealthMetric[];
}

export const SystemHealthMonitor = ({ metrics }: SystemHealthMonitorProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Real-time system status monitoring</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)} bg-opacity-10`}>
                  <metric.icon className={`h-5 w-5 ${getStatusColor(metric.status).replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <p className="font-medium">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.message}</p>
                </div>
              </div>
              {getStatusBadge(metric.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
