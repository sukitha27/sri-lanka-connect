import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertFeed } from "@/components/AlertFeed";
import { HelpLists } from "@/components/HelpLists";
import { HelpRequestForm } from "@/components/HelpRequestForm";
import { HelpOfferForm } from "@/components/HelpOfferForm";
import { CloudRain, LogOut, Plus, HandHeart, Shield } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface Area {
  id: string;
  name: string;
  district: string;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAdminRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    fetchAreas();

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const fetchAreas = async () => {
    const { data } = await supabase
      .from('areas')
      .select('id, name, district')
      .order('name');
    
    if (data) setAreas(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CloudRain className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Sri Lanka Weather Alert System</h1>
          <p className="text-muted-foreground mb-6">
            Real-time updates and community support during severe weather conditions
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" className="gap-2">
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CloudRain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Weather Alert System</h1>
                <p className="text-xs text-muted-foreground">Sri Lanka Emergency Response</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedArea || ""} onValueChange={(value) => setSelectedArea(value || null)}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Areas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}, {area.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 flex-1">
              <Button 
                onClick={() => setRequestFormOpen(true)}
                variant="destructive"
                className="flex-1 sm:flex-initial gap-2"
              >
                <Plus className="w-4 h-4" />
                Request Help
              </Button>
              <Button 
                onClick={() => setOfferFormOpen(true)}
                className="flex-1 sm:flex-initial gap-2 bg-accent hover:bg-accent/90"
              >
                <HandHeart className="w-4 h-4" />
                Offer Help
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <CloudRain className="w-5 h-5 text-primary" />
            </div>
            Active Weather Alerts
          </h2>
          <AlertFeed selectedArea={selectedArea} />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <HandHeart className="w-5 h-5 text-accent" />
            </div>
            Community Help
          </h2>
          <HelpLists selectedArea={selectedArea} />
        </section>
      </main>

      <HelpRequestForm open={requestFormOpen} onOpenChange={setRequestFormOpen} />
      <HelpOfferForm open={offerFormOpen} onOpenChange={setOfferFormOpen} />
    </div>
  );
};

export default Index;
