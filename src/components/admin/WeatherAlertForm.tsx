import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface Area {
  id: string;
  name: string;
  district: string;
}

interface WeatherAlertFormProps {
  areas: Area[];
}

export const WeatherAlertForm = ({ areas }: WeatherAlertFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    area_id: "",
    severity: "info",
    title: "",
    description: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in.",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('weather_alerts')
      .insert({
        area_id: formData.area_id,
        severity: formData.severity as 'info' | 'warning' | 'critical',
        title: formData.title,
        description: formData.description,
        created_by: user.id,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Alert published",
        description: "The weather alert has been sent to affected areas.",
      });
      setFormData({
        area_id: "",
        severity: "info",
        title: "",
        description: "",
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Weather Alert</CardTitle>
        <CardDescription>Create and publish weather alerts to affected areas</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="area">Affected Area</Label>
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
            <Label htmlFor="severity">Severity Level</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info - General Information</SelectItem>
                <SelectItem value="warning">Warning - Be Prepared</SelectItem>
                <SelectItem value="critical">Critical - Take Action Now</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Alert Title</Label>
            <Input
              id="title"
              placeholder="e.g., Heavy Rainfall Expected"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Alert Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the weather situation"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <Send className="w-4 h-4" />
            {loading ? "Publishing..." : "Publish Alert"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
