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
      }));
    }
  }, [open, prefillData]);

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Area *
              </Label>
              <Select
                value={formData.area_id}
                onValueChange={(value) => setFormData({ ...formData, area_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your area" />
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
              <Label htmlFor="title">What do you need? *</Label>
              <Input
                id="title"
                placeholder="e.g., Food, Water, Medical Supplies, Shelter"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
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