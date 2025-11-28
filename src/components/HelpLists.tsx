import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, MapPin, Heart, HandHeart, Search, Filter, MoreVertical, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  contact_info: string;
  location_details: string | null;
  status: string;
  created_at: string;
  areas: { name: string; district: string };
  user_id?: string;
}

interface HelpOffer {
  id: string;
  help_type: string;
  description: string;
  contact_info: string;
  is_available: boolean;
  created_at: string;
  areas: { name: string; district: string };
  user_id?: string;
}

interface UserRole {
  role: string;
}

export const HelpLists = ({ selectedArea }: { selectedArea: string | null }) => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [offers, setOffers] = useState<HelpOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    checkAdminStatus();
    
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

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: role } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin(role?.role === 'admin');
    }
  };

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

  type RequestStatus = 'open' | 'in_progress' | 'fulfilled' | 'closed';
  type OfferStatus = 'available' | 'unavailable';

  const handleStatusUpdate = async (id: string, newStatus: RequestStatus | OfferStatus, type: 'request' | 'offer') => {
    try {
      if (type === 'request') {
        await supabase
          .from('help_requests')
          .update({ status: newStatus as RequestStatus })
          .eq('id', id);
      } else {
        await supabase
          .from('help_offers')
          .update({ is_available: newStatus === 'available' })
          .eq('id', id);
      }

      toast({
        title: "Status updated",
        description: `Successfully updated status to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, type: 'request' | 'offer') => {
    try {
      if (type === 'request') {
        await supabase.from('help_requests').delete().eq('id', id);
      } else {
        await supabase.from('help_offers').delete().eq('id', id);
      }

      toast({
        title: "Deleted successfully",
        description: `The ${type} has been removed`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.help_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || offer.help_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      fulfilled: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests and offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Tabs defaultValue="requests" className="w-full">
          <div className="flex flex-col sm:flex-row gap-3">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="requests" className="gap-2">
                <Heart className="w-4 h-4" />
                Requests ({filteredRequests.length})
              </TabsTrigger>
              <TabsTrigger value="offers" className="gap-2">
                <HandHeart className="w-4 h-4" />
                Offers ({filteredOffers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="mt-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="offers" className="mt-0">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
          </div>

          <TabsContent value="requests" className="space-y-3 mt-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No help requests found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg flex-1">{request.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, 'fulfilled', 'request')}>
                                Mark Fulfilled
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, 'closed', 'request')}>
                                Mark Closed
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDelete(request.id, 'request')}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
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

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>{request.areas.name}, {request.areas.district}</span>
                      <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="offers" className="space-y-3 mt-4">
            {filteredOffers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <HandHeart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No help offers found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredOffers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-md transition-shadow border-l-4 border-l-accent group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg flex-1">{offer.help_type}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-accent/10 text-accent">
                          Available
                        </Badge>
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusUpdate(offer.id, 'unavailable', 'offer')}>
                                Mark Unavailable
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDelete(offer.id, 'offer')}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground/80">{offer.description}</p>

                    <div className="flex gap-2 text-sm text-foreground">
                      <Phone className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                      <span className="font-medium">{offer.contact_info}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>{offer.areas.name}, {offer.areas.district}</span>
                      <span>{formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Admin mode active</span>
        </div>
      )}
    </div>
  );
};