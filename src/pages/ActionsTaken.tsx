import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmergencyHeader } from "@/components/EmergencyHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, CheckSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  contact_info: string;
  location_details: string | null;
  status: string;
  created_at: string;
  action_taken_at: string | null;
  action_notes: string | null;
  areas: { name: string; district: string };
  emergency_type?: string;
  number_of_people?: number;
  is_verified?: boolean;
}

const ActionsTaken = () => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    
    const channel = supabase
      .channel('actions_taken_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_requests' }, fetchRequests)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('help_requests')
      .select('*, areas(name, district)')
      .eq('action_taken', true)
      .order('action_taken_at', { ascending: false });

    if (data) setRequests(data as HelpRequest[]);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      fulfilled: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <AppShell>
      <EmergencyHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Actions Taken</h1>
            <p className="text-muted-foreground">
              Help requests where rescue or assistance actions have been initiated ({requests.length} total)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No actions recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-600">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        {request.is_verified && (
                          <Badge className="bg-blue-600 text-white">✓ Verified</Badge>
                        )}
                        <Badge className="bg-orange-600 text-white">✓ Action Taken</Badge>
                      </div>
                      {request.emergency_type && (
                        <Badge variant="outline" className="text-xs">
                          {request.emergency_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      )}
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/80">{request.description}</p>
                  
                  {request.action_notes && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="text-sm font-semibold text-orange-900 mb-1">Action Notes:</div>
                      <div className="text-sm text-orange-800">{request.action_notes}</div>
                    </div>
                  )}

                  {request.number_of_people && (
                    <div className="text-sm">
                      <span className="font-semibold">👥 {request.number_of_people} people</span>
                    </div>
                  )}

                  {request.location_details && (
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{request.location_details}</span>
                    </div>
                  )}

                  <div className="flex gap-2 text-sm text-foreground">
                    <Phone className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span className="font-medium">{request.contact_info}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>{request.areas.name}, {request.areas.district}</span>
                    <span>
                      {request.action_taken_at 
                        ? `Action: ${formatDistanceToNow(new Date(request.action_taken_at), { addSuffix: true })}`
                        : formatDistanceToNow(new Date(request.created_at), { addSuffix: true })
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ActionsTaken;
