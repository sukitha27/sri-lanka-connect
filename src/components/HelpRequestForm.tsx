import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Phone, AlertTriangle } from "lucide-react";

interface Area {
  id: string;
  name: string;
  district: string;
}

interface HelpRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillData?: {
    helpType?: string;
    title?: string;
    description?: string;
  };
}

export const HelpRequestForm = ({ open, onOpenChange, prefillData }: HelpRequestFormProps) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    area_id: "",
    title: "",
    description: "",
    contact_info: "",
    location_details: "",
    emergency_type: "",
    gps_latitude: null as number | null,
    gps_longitude: null as number | null,
    landmark: "",
    number_of_people: 1,
    has_children: false,
    has_elderly: false,
    has_disabled: false,
    has_medical_needs: false,
    water_level: "",
    safe_for_hours: null as number | null,
    building_type: "",
    floor_level: "",
    needs_food: false,
    needs_water: false,
    needs_power: false,
    phone_battery_percent: null as number | null,
    alternate_phone: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    if (open && prefillData) {
      setFormData(prev => ({
        ...prev,
        title: prefillData.title || prev.title,
        description: prefillData.description || prev.description,
        emergency_type: prefillData.helpType || prev.emergency_type,
      }));
    }
  }, [open, prefillData]);

  const captureGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            gps_latitude: position.coords.latitude,
            gps_longitude: position.coords.longitude,
          }));
          toast({
            title: "Location Captured",
            description: `GPS: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          });
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not get your location. Please enter address manually.",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "GPS Not Available",
        description: "Your device doesn't support GPS location.",
      });
    }
  };

  const fetchAreas = async () => {
    const { data } = await supabase
      .from('areas')
      .select('id, name, district')
      .order('name');
    
    if (data) setAreas(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to request help.",
      });
      setLoading(false);
      return;
    }

    // Validate phone number format
    const phoneNumber = formData.contact_info.replace(/[^\d+]/g, '');
    if (phoneNumber.length < 9) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with at least 9 digits.",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('help_requests')
      .insert({
        ...formData,
        user_id: user.id,
        status: 'open',
      } as any);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Help Request Submitted! 🎉",
        description: "Your request has been posted. Volunteers will contact you soon.",
      });
      // Reset form
      setFormData({
        area_id: "",
        title: "",
        description: "",
        contact_info: "",
        location_details: "",
        emergency_type: "",
        gps_latitude: null,
        gps_longitude: null,
        landmark: "",
        number_of_people: 1,
        has_children: false,
        has_elderly: false,
        has_disabled: false,
        has_medical_needs: false,
        water_level: "",
        safe_for_hours: null,
        building_type: "",
        floor_level: "",
        needs_food: false,
        needs_water: false,
        needs_power: false,
        phone_battery_percent: null,
        alternate_phone: "",
      });
      onOpenChange(false);
    }
    setLoading(false);
  };

  const handleQuickFill = (type: string) => {
    const quickTemplates = {
      food: {
        title: "Need Food Supplies",
        description: "Urgently need food supplies for my family. We have been without proper meals for the past day."
      },
      water: {
        title: "Need Clean Drinking Water",
        description: "Need clean drinking water urgently. Our water supply has been contaminated."
      },
      shelter: {
        title: "Need Shelter/Accommodation",
        description: "Our home is flooded/damaged and we need a safe place to stay temporarily."
      },
      medical: {
        title: "Need Medical Assistance",
        description: "Require medical attention/medicines. There are injured/elderly people who need help."
      },
      transport: {
        title: "Need Emergency Transport",
        description: "Need transportation to safer location/hospital. We are stranded and need to evacuate."
      },
      communication: {
        title: "Need Communication Help",
        description: "Need phone charging/power bank/internet access to contact family and emergency services."
      }
    };

    const template = quickTemplates[type as keyof typeof quickTemplates];
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.title,
        description: template.description
      }));
      
      toast({
        title: "Template Applied",
        description: `Quick template for ${type} help has been applied. Please review and edit as needed.`,
      });
    }
  };

  const emergencyContacts = [
    { name: "Police", number: "119" },
    { name: "Ambulance", number: "1990" },
    { name: "Fire", number: "111" },
    { name: "Disaster Management", number: "117" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Request Emergency Help
          </DialogTitle>
          <DialogDescription>
            Describe what help you need. Your contact information will be shared with verified volunteers.
          </DialogDescription>
        </DialogHeader>

        {/* Emergency Contacts Quick Access */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Emergency Contacts
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-amber-700">{contact.name}:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-amber-800 font-mono hover:bg-amber-100"
                  onClick={() => setFormData(prev => ({ ...prev, contact_info: contact.number }))}
                >
                  {contact.number}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Template Buttons */}
          <div className="space-y-3">
            <Label>Quick Help Templates</Label>
            <div className="flex flex-wrap gap-2">
              {['food', 'water', 'shelter', 'medical', 'transport', 'communication'].map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors capitalize"
                  onClick={() => handleQuickFill(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Emergency Type */}
          <div className="space-y-2">
            <Label htmlFor="emergency_type">Emergency Type *</Label>
            <Select
              value={formData.emergency_type}
              onValueChange={(value) => setFormData({ ...formData, emergency_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trapped_by_flood">🌊 Trapped by Flood</SelectItem>
                <SelectItem value="medical_emergency">🚑 Medical Emergency</SelectItem>
                <SelectItem value="food_water_needed">🍽️ Food/Water Needed</SelectItem>
                <SelectItem value="evacuation_needed">🚨 Evacuation Needed</SelectItem>
                <SelectItem value="missing_person">👤 Missing Person</SelectItem>
                <SelectItem value="other_emergency">⚠️ Other Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="contact"
                placeholder="07X XXX XXXX"
                value={formData.contact_info}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternate_phone">Alternate Phone</Label>
              <Input
                id="alternate_phone"
                placeholder="Optional"
                value={formData.alternate_phone}
                onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Your Location
            </h4>
            
            <div className="space-y-2">
              <Label>GPS Location</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.gps_latitude && formData.gps_longitude 
                    ? `${formData.gps_latitude.toFixed(6)}, ${formData.gps_longitude.toFixed(6)}`
                    : "Not captured"}
                  disabled
                  className="flex-1"
                />
                <Button 
                  type="button"
                  onClick={captureGPS}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Get Location
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">District *</Label>
                <Select
                  value={formData.area_id}
                  onValueChange={(value) => setFormData({ ...formData, area_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}, {area.district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  placeholder="Nearby landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_details">Address / Area</Label>
              <Input
                id="location_details"
                placeholder="Your address or area name"
                value={formData.location_details}
                onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
              />
            </div>
          </div>

          {/* Emergency Details */}
          <div className="space-y-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency Details
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number_of_people">Number of People</Label>
                <Input
                  id="number_of_people"
                  type="number"
                  min="1"
                  value={formData.number_of_people}
                  onChange={(e) => setFormData({ ...formData, number_of_people: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_children"
                  checked={formData.has_children}
                  onChange={(e) => setFormData({ ...formData, has_children: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="has_children">Children</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_elderly"
                  checked={formData.has_elderly}
                  onChange={(e) => setFormData({ ...formData, has_elderly: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="has_elderly">Elderly</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_disabled"
                  checked={formData.has_disabled}
                  onChange={(e) => setFormData({ ...formData, has_disabled: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="has_disabled">Disabled</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_medical_needs"
                  checked={formData.has_medical_needs}
                  onChange={(e) => setFormData({ ...formData, has_medical_needs: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="has_medical_needs">Medical</Label>
              </div>
            </div>
          </div>

          {/* Current Situation */}
          <div className="space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800">🌊 Current Situation</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="water_level">Water Level</Label>
                <Select
                  value={formData.water_level}
                  onValueChange={(value) => setFormData({ ...formData, water_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select water level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ankle_deep">Ankle Deep</SelectItem>
                    <SelectItem value="knee_deep">Knee Deep</SelectItem>
                    <SelectItem value="waist_deep">Waist Deep</SelectItem>
                    <SelectItem value="chest_deep">Chest Deep</SelectItem>
                    <SelectItem value="over_head">Over Head</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="safe_for_hours">Safe For (Hours)</Label>
                <Input
                  id="safe_for_hours"
                  type="number"
                  min="0"
                  placeholder="How long until danger?"
                  value={formData.safe_for_hours || ""}
                  onChange={(e) => setFormData({ ...formData, safe_for_hours: parseInt(e.target.value) || null })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building_type">Building Type</Label>
                <Input
                  id="building_type"
                  placeholder="House, Apartment, etc."
                  value={formData.building_type}
                  onChange={(e) => setFormData({ ...formData, building_type: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor_level">Floor Level</Label>
                <Input
                  id="floor_level"
                  placeholder="Ground, 1st, 2nd, etc."
                  value={formData.floor_level}
                  onChange={(e) => setFormData({ ...formData, floor_level: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="needs_food"
                  checked={formData.needs_food}
                  onChange={(e) => setFormData({ ...formData, needs_food: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="needs_food">🍽️ Food</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="needs_water"
                  checked={formData.needs_water}
                  onChange={(e) => setFormData({ ...formData, needs_water: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="needs_water">💧 Water</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="needs_power"
                  checked={formData.needs_power}
                  onChange={(e) => setFormData({ ...formData, needs_power: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="needs_power">🔋 Power</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_battery_percent">Phone Battery %</Label>
              <Input
                id="phone_battery_percent"
                type="number"
                min="0"
                max="100"
                placeholder="Battery percentage"
                value={formData.phone_battery_percent || ""}
                onChange={(e) => setFormData({ ...formData, phone_battery_percent: parseInt(e.target.value) || null })}
              />
            </div>
          </div>

          {/* What do you need */}
          <div className="space-y-2">
            <Label htmlFor="title">What do you need? *</Label>
            <Input
              id="title"
              placeholder="e.g., Food, Water, Medical Supplies, Evacuation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description of Your Situation *</Label>
            <Textarea
              id="description"
              placeholder="Describe your situation, number of people affected, urgency level, and specific help needed..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about what you need and how many people need help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Information *
              </Label>
              <Input
                id="contact"
                placeholder="Phone number (e.g., 0712345678)"
                value={formData.contact_info}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be shared with volunteers who can help you.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location Details</Label>
              <Input
                id="location"
                placeholder="Landmarks, building name, floor number..."
                value={formData.location_details}
                onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
              />
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Safety Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Stay in a safe location while waiting for help</li>
              <li>• Keep your phone charged and nearby</li>
              <li>• Have important documents ready if evacuation is needed</li>
              <li>• Follow official emergency instructions</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit Help Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};