import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MapPin, Heart, HandHeart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  contact_info: string;
  location_details: string | null;
  status: string;
  created_at: string;
  areas: { name: string; district: string };
}

interface HelpOffer {
  id: string;
  help_type: string;
  description: string;
  contact_info: string;
  is_available: boolean;
  created_at: string;
  areas: { name: string; district: string };
}

export const HelpLists = ({ selectedArea }: { selectedArea: string | null }) => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [offers, setOffers] = useState<HelpOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    const requestsChannel = supabase
      .channel('help_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_requests' }, fetchData)
      .subscribe();

    const offersChannel = supabase
      .channel('help_offers_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_offers' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(offersChannel);
    };
  }, [selectedArea]);

  const fetchData = async () => {
    let requestsQuery = supabase
      .from('help_requests')
      .select('*, areas(name, district)')
      .neq('status', 'closed')
      .order('created_at', { ascending: false });

    let offersQuery = supabase
      .from('help_offers')
      .select('*, areas(name, district)')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (selectedArea) {
      requestsQuery = requestsQuery.eq('area_id', selectedArea);
      offersQuery = offersQuery.eq('area_id', selectedArea);
    }

    const [requestsData, offersData] = await Promise.all([
      requestsQuery,
      offersQuery
    ]);

    if (requestsData.data) setRequests(requestsData.data);
    if (offersData.data) setOffers(offersData.data);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <Tabs defaultValue="requests" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="requests" className="gap-2">
          <Heart className="w-4 h-4" />
          Help Requests ({requests.length})
        </TabsTrigger>
        <TabsTrigger value="offers" className="gap-2">
          <HandHeart className="w-4 h-4" />
          Help Offers ({offers.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="requests" className="space-y-3 mt-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active help requests in this area.
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{request.title}</CardTitle>
                  <Badge variant="outline" className="shrink-0">
                    {request.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground/80">{request.description}</p>
                
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

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                  <span>{request.areas.name}, {request.areas.district}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="offers" className="space-y-3 mt-4">
        {offers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No help offers available in this area yet.
            </CardContent>
          </Card>
        ) : (
          offers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-shadow border-l-4 border-l-accent">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{offer.help_type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground/80">{offer.description}</p>

                <div className="flex gap-2 text-sm text-foreground">
                  <Phone className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                  <span className="font-medium">{offer.contact_info}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                  <span>{offer.areas.name}, {offer.areas.district}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};
