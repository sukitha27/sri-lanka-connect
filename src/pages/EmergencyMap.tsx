import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, AlertTriangle, Users, Droplet, Battery } from 'lucide-react';

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  contact_info: string;
  gps_latitude: number;
  gps_longitude: number;
  emergency_type: string;
  number_of_people: number;
  water_level: string | null;
  is_verified: boolean;
  created_at: string;
  areas: { name: string; district: string };
  has_children: boolean;
  has_elderly: boolean;
  has_disabled: boolean;
  has_medical_needs: boolean;
  needs_food: boolean;
  needs_water: boolean;
  needs_power: boolean;
  phone_battery_percent: number | null;
  landmark: string | null;
}

const EmergencyMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyFilter, setEmergencyFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
    
    const channel = supabase
      .channel('map_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_requests' }, fetchRequests)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [80.7718, 7.8731], // Sri Lanka center
      zoom: 7,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [requests, emergencyFilter, verifiedFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('help_requests')
      .select('*, areas(name, district)')
      .not('gps_latitude', 'is', null)
      .not('gps_longitude', 'is', null)
      .neq('status', 'closed')
      .order('created_at', { ascending: false });

    if (data) {
      setRequests(data as HelpRequest[]);
    }
    setLoading(false);
  };

  const updateMarkers = () => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter requests
    const filteredRequests = requests.filter(request => {
      const matchesType = emergencyFilter === 'all' || request.emergency_type === emergencyFilter;
      const matchesVerified = verifiedFilter === 'all' || 
        (verifiedFilter === 'verified' && request.is_verified) ||
        (verifiedFilter === 'unverified' && !request.is_verified);
      return matchesType && matchesVerified;
    });

    // Add new markers
    filteredRequests.forEach(request => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      
      // Color based on emergency type and verification
      const colors = {
        trapped_by_flood: '#dc2626',
        medical_emergency: '#ea580c',
        food_water_needed: '#f59e0b',
        evacuation_needed: '#dc2626',
        missing_person: '#7c3aed',
        other_emergency: '#6b7280',
      };
      
      const bgColor = colors[request.emergency_type as keyof typeof colors] || '#6b7280';
      el.style.backgroundColor = bgColor;
      
      if (request.is_verified) {
        el.innerHTML = '✓';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
      }

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 max-w-sm';
      popupContent.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-bold text-base">${request.title}</h3>
            ${request.is_verified ? '<span class="text-xs bg-blue-600 text-white px-2 py-1 rounded">✓ Verified</span>' : ''}
          </div>
          
          <div class="text-sm text-gray-700">
            <div class="font-semibold mb-1">${request.emergency_type.replace(/_/g, ' ').toUpperCase()}</div>
            <p class="mb-2">${request.description.substring(0, 150)}${request.description.length > 150 ? '...' : ''}</p>
          </div>

          ${request.number_of_people > 1 ? `
            <div class="flex items-center gap-1 text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
              <span>👥</span>
              <span><strong>${request.number_of_people} people</strong></span>
              ${request.has_children || request.has_elderly || request.has_disabled || request.has_medical_needs ? `
                <span class="text-xs">
                  (${[
                    request.has_children && 'Children',
                    request.has_elderly && 'Elderly',
                    request.has_disabled && 'Disabled',
                    request.has_medical_needs && 'Medical'
                  ].filter(Boolean).join(', ')})
                </span>
              ` : ''}
            </div>
          ` : ''}

          ${request.water_level ? `
            <div class="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
              <strong>🌊 Water Level:</strong> ${request.water_level.replace(/_/g, ' ').toUpperCase()}
            </div>
          ` : ''}

          ${request.needs_food || request.needs_water || request.needs_power ? `
            <div class="flex gap-2 flex-wrap">
              ${request.needs_food ? '<span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">🍽️ Food</span>' : ''}
              ${request.needs_water ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">💧 Water</span>' : ''}
              ${request.needs_power ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">🔋 Power</span>' : ''}
            </div>
          ` : ''}

          ${request.phone_battery_percent && request.phone_battery_percent < 20 ? `
            <div class="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
              ⚠️ Low battery: ${request.phone_battery_percent}%
            </div>
          ` : ''}

          <div class="border-t pt-2 mt-2 space-y-1 text-sm">
            <div class="flex items-center gap-1 text-gray-600">
              <span>📍</span>
              <span>${request.areas.name}, ${request.areas.district}</span>
            </div>
            ${request.landmark ? `
              <div class="text-gray-600">
                <strong>🏛️ Landmark:</strong> ${request.landmark}
              </div>
            ` : ''}
            <div class="flex items-center gap-1 text-gray-600">
              <span>📞</span>
              <a href="tel:${request.contact_info}" class="font-semibold text-blue-600 hover:underline">
                ${request.contact_info}
              </a>
            </div>
            <div class="text-xs text-gray-500">
              ${new Date(request.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        maxWidth: '400px',
        className: 'emergency-popup'
      }).setDOMContent(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([request.gps_longitude, request.gps_latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (filteredRequests.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredRequests.forEach(request => {
        bounds.extend([request.gps_longitude, request.gps_latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <h1 className="text-xl font-bold">Emergency Map</h1>
              </div>
              <Badge variant="outline" className="font-mono">
                {requests.filter(r => {
                  const matchesType = emergencyFilter === 'all' || r.emergency_type === emergencyFilter;
                  const matchesVerified = verifiedFilter === 'all' || 
                    (verifiedFilter === 'verified' && r.is_verified) ||
                    (verifiedFilter === 'unverified' && !r.is_verified);
                  return matchesType && matchesVerified;
                }).length} requests
              </Badge>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={emergencyFilter} onValueChange={setEmergencyFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Emergency Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="trapped_by_flood">🌊 Trapped by Flood</SelectItem>
                  <SelectItem value="medical_emergency">🚑 Medical Emergency</SelectItem>
                  <SelectItem value="food_water_needed">🍽️ Food/Water</SelectItem>
                  <SelectItem value="evacuation_needed">🚨 Evacuation</SelectItem>
                  <SelectItem value="missing_person">👤 Missing Person</SelectItem>
                  <SelectItem value="other_emergency">⚠️ Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="verified">✓ Verified Only</SelectItem>
                  <SelectItem value="unverified">⚠️ Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading emergency requests...</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <Card className="absolute bottom-4 left-4 p-3 shadow-lg z-10 max-w-xs">
          <h3 className="font-semibold text-sm mb-2">Emergency Types</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white"></div>
              <span>Trapped / Evacuation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-600 border-2 border-white"></div>
              <span>Medical Emergency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white"></div>
              <span>Food/Water Needed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-600 border-2 border-white"></div>
              <span>Missing Person</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center text-white text-[8px] font-bold">
                ✓
              </div>
              <span>Verified Request</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyMap;
