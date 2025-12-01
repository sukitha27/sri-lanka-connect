import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Users, MapPin } from "lucide-react";

interface StatsProps {
  totalRequests: number;
  verifiedRequests: number;
  actionsTaken: number;
  missingPersons: number;
}

export const AdminStats = ({ totalRequests, verifiedRequests, actionsTaken, missingPersons }: StatsProps) => {
  const stats = [
    {
      title: "Total Requests",
      value: totalRequests,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Verified Requests",
      value: verifiedRequests,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Actions Taken",
      value: actionsTaken,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Missing Persons",
      value: missingPersons,
      icon: MapPin,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
