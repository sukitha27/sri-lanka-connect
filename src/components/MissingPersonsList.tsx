import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Calendar, MapPin, Phone, Search, User, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MissingPerson {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  last_seen_date: string | null;
  last_seen_location: string;
  description: string;
  physical_description: string | null;
  clothing_description: string | null;
  contact_info: string;
  photo_url: string | null;
  status: string;
  is_found: boolean;
  created_at: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
  areas: { name: string; district: string } | null;
}

export const MissingPersonsList = ({ selectedArea }: { selectedArea?: string }) => {
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchMissingPersons();

    const channel = supabase
      .channel("missing-persons-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "missing_persons" },
        () => {
          fetchMissingPersons();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedArea]);

  useEffect(() => {
    let filtered = missingPersons;

    if (searchTerm) {
      filtered = filtered.filter((person) =>
        person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.last_seen_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((person) => 
        statusFilter === "found" ? person.is_found : !person.is_found
      );
    }

    setFilteredPersons(filtered);
  }, [missingPersons, searchTerm, statusFilter]);

  const fetchMissingPersons = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("missing_persons")
        .select("*, areas(name, district)")
        .order("created_at", { ascending: false });

      if (selectedArea) {
        query = query.eq("area_id", selectedArea);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMissingPersons((data as MissingPerson[]) || []);
    } catch (error) {
      console.error("Error fetching missing persons:", error);
      toast.error("Failed to load missing persons");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="missing">Still Missing</SelectItem>
            <SelectItem value="found">Found</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPersons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== "all"
                ? "No missing persons found matching your criteria"
                : "No missing person reports yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPersons.map((person) => (
            <Card key={person.id} className={person.is_found ? "opacity-75" : ""}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-24 w-24 rounded-lg">
                    {person.photo_url ? (
                      <AvatarImage src={person.photo_url} alt={person.full_name} />
                    ) : (
                      <AvatarFallback className="rounded-lg">
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{person.full_name}</h3>
                        <div className="flex gap-2 mt-1">
                          {person.age && (
                            <Badge variant="secondary">{person.age} years old</Badge>
                          )}
                          {person.gender && (
                            <Badge variant="secondary">{person.gender}</Badge>
                          )}
                          {person.is_found && (
                            <Badge className="bg-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              Found
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-2 text-sm">
                      {person.last_seen_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Last seen: {new Date(person.last_seen_date).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{person.last_seen_location}</span>
                        {person.areas && (
                          <Badge variant="outline" className="ml-2">
                            {person.areas.name}, {person.areas.district}
                          </Badge>
                        )}
                      </div>

                      {person.gps_latitude && person.gps_longitude && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <MapPin className="h-3 w-3" />
                          <span>
                            GPS: {person.gps_latitude.toFixed(6)}, {person.gps_longitude.toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>

                    {person.physical_description && (
                      <div>
                        <p className="text-sm font-medium">Physical Description:</p>
                        <p className="text-sm text-muted-foreground">{person.physical_description}</p>
                      </div>
                    )}

                    {person.clothing_description && (
                      <div>
                        <p className="text-sm font-medium">Clothing:</p>
                        <p className="text-sm text-muted-foreground">{person.clothing_description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium">Additional Information:</p>
                      <p className="text-sm text-muted-foreground">{person.description}</p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>Contact: {person.contact_info}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Reported {formatDistanceToNow(new Date(person.created_at))} ago
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};