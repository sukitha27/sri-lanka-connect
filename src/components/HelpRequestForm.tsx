import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Area {
  id: string;
  name: string;
  district: string;
}

interface HelpRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HelpRequestForm = ({ open, onOpenChange }: HelpRequestFormProps) => {
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

    const { error } = await supabase
      .from('help_requests')
      .insert({
        ...formData,
        user_id: user.id,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Request submitted",
        description: "Your help request has been posted. Someone will reach out soon.",
      });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Help</DialogTitle>
          <DialogDescription>
            Describe what help you need. Your contact information will be shared with volunteers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
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
            <Label htmlFor="title">What do you need?</Label>
            <Input
              id="title"
              placeholder="e.g., Food, Water, Medical Supplies, Shelter"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your situation and what help you need"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Information</Label>
            <Input
              id="contact"
              placeholder="Phone number or other contact method"
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location Details (Optional)</Label>
            <Textarea
              id="location"
              placeholder="Additional location information to help people find you"
              value={formData.location_details}
              onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
