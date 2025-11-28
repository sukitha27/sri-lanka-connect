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

interface HelpOfferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HelpOfferForm = ({ open, onOpenChange }: HelpOfferFormProps) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    area_id: "",
    help_type: "",
    description: "",
    contact_info: "",
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
        description: "You must be logged in to offer help.",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('help_offers')
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
        title: "Offer posted",
        description: "Thank you! People in need can now see your offer.",
      });
      setFormData({
        area_id: "",
        help_type: "",
        description: "",
        contact_info: "",
      });
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Offer Help</DialogTitle>
          <DialogDescription>
            Share what help you can provide. People in need will be able to contact you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="area">Area where you can help</Label>
            <Select
              value={formData.area_id}
              onValueChange={(value) => setFormData({ ...formData, area_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
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
            <Label htmlFor="helpType">Type of Help</Label>
            <Input
              id="helpType"
              placeholder="e.g., Transport, Food, Shelter, Medical Aid"
              value={formData.help_type}
              onChange={(e) => setFormData({ ...formData, help_type: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Details</Label>
            <Textarea
              id="description"
              placeholder="Describe what you can offer and any limitations"
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
              placeholder="Phone number or preferred contact method"
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
            {loading ? "Posting..." : "Post Offer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
