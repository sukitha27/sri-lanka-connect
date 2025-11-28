import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertFeed } from "@/components/AlertFeed";
import { HelpLists } from "@/components/HelpLists";
import { HelpRequestForm } from "@/components/HelpRequestForm";
import { HelpOfferForm } from "@/components/HelpOfferForm";
import { EmergencyAlertBanner } from "@/components/EmergencyAlertBanner";
import { QuickHelpGrid } from "@/components/QuickHelpGrid";
import { CriticalInfo } from "@/components/CriticalInfo";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { SOSButton } from "@/components/SOSButton";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { CloudRain, LogOut, Plus, HandHeart, Shield, Menu } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CloudRain className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-gray-900">Sri Lanka Connect</h1>
          <p className="text-gray-600 mb-6">
            Emergency help network and community support during severe weather conditions
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" className="gap-2">
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Emergency Components */}
      <EmergencyAlertBanner />
      <OfflineIndicator />
      
      {/* Quick Access Grid */}
      <QuickHelpGrid />
      
      {/* Critical Information */}
      <CriticalInfo />

      {/* Area Selection and Action Buttons */}
      <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Select 
  value={selectedArea || "all-areas"} 
  onValueChange={(value) => setSelectedArea(value === "all-areas" ? null : value)}
>
  <SelectTrigger className="w-full sm:w-64">
    <SelectValue placeholder="📍 All Areas in Sri Lanka" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all-areas">All Areas</SelectItem> {/* ✅ Use a non-empty value */}
    {areas.map((area) => (
      <SelectItem key={area.id} value={area.id}>
        {area.name}, {area.district}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          <div className="flex gap-2 flex-1 w-full sm:w-auto">
            <Button 
              onClick={() => setRequestFormOpen(true)}
              variant="destructive"
              className="flex-1 sm:flex-initial gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Request Help
            </Button>
            <Button 
              onClick={() => setOfferFormOpen(true)}
              className="flex-1 sm:flex-initial gap-2 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <HandHeart className="w-4 h-4" />
              Offer Help
            </Button>
            
            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="sm:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Admin Button */}
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/admin")}
              className="gap-2 hidden sm:flex"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weather Alerts - Takes 2/3 on desktop */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CloudRain className="w-5 h-5 text-blue-600" />
              </div>
              Active Weather Alerts
            </h2>
            <AlertFeed selectedArea={selectedArea} />
          </div>
        </div>

        {/* Quick Stats Sidebar - Takes 1/3 on desktop */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Requests:</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Help:</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Area:</span>
                <span className="font-semibold">
                  {selectedArea 
                    ? areas.find(a => a.id === selectedArea)?.name || 'All'
                    : 'All Areas'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Emergency Contacts</h3>
            <div className="space-y-1 text-sm text-yellow-700">
              <div>🚑 Ambulance: 1990</div>
              <div>🚒 Fire: 111</div>
              <div>🚓 Police: 119</div>
              <div>🌊 Disaster Mgmt: 117</div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Help Section - Full Width */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <HandHeart className="w-5 h-5 text-green-600" />
          </div>
          Community Help Board
        </h2>
        <HelpLists selectedArea={selectedArea} />
      </div>

      {/* Action Forms */}
      <HelpRequestForm open={requestFormOpen} onOpenChange={setRequestFormOpen} />
      <HelpOfferForm open={offerFormOpen} onOpenChange={setOfferFormOpen} />

      {/* Floating Action Buttons */}
      <FloatingActionButton 
        onRequestHelp={() => setRequestFormOpen(true)}
        onOfferHelp={() => setOfferFormOpen(true)}
      />
      <SOSButton />
    </div>
  );
};

export default Index;