import { AlertTriangle, FileText, CheckCircle, Map, Phone, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const EmergencyHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg mb-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Header */}
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EMERGENCY SOS</h1>
              <p className="text-xs text-red-100">Flood Rescue - Sri Lanka</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {}}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              View All
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {}}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="w-4 h-4" />
              Verified
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/map')}
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Map className="w-4 h-4" />
              Map
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {}}
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <CheckCircle className="w-4 h-4" />
              Actions Taken
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {}}
              className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Phone className="w-4 h-4" />
              Emergency Contacts
            </Button>
          </div>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="secondary" size="sm">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                View All
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/map')}>
                <Map className="w-4 h-4 mr-2" />
                Map
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckCircle className="w-4 h-4 mr-2" />
                Actions Taken
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="w-4 h-4 mr-2" />
                Emergency Contacts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Action Buttons */}
        <div className="px-4 pb-4 space-y-2">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={() => {}}
          >
            🏠 Offer Help, Find Relief Camps & Shelters
          </Button>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            onClick={() => {}}
          >
            📍 Real-time Flood Map
          </Button>
        </div>
      </div>
    </div>
  );
};