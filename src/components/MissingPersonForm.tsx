import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Upload, User } from "lucide-react";

interface MissingPersonFormData {
  full_name: string;
  age: number;
  gender: string;
  last_seen_date: string;
  last_seen_location: string;
  description: string;
  physical_description: string;
  clothing_description: string;
  contact_info: string;
}

interface Area {
  id: string;
  name: string;
  district: string;
  province: string;
}

export const MissingPersonForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [capturedLocation, setCapturedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MissingPersonFormData>();

  useEffect(() => {
    fetchAreas();
    captureGPSLocation();
  }, []);

  const fetchAreas = async () => {
    const { data, error } = await supabase.from("areas").select("*").order("name");
    if (error) {
      toast.error("Failed to load areas");
    } else {
      setAreas(data || []);
    }
  };

  const captureGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCapturedLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success("Location captured");
        },
        (error) => {
          console.error("GPS error:", error);
          toast.error("Could not capture location");
        }
      );
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photoFile) return null;

    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('missing-persons')
      .upload(fileName, photoFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error("Failed to upload photo");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('missing-persons')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (data: MissingPersonFormData) => {
    if (!selectedArea) {
      toast.error("Please select an area");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      let photoUrl = null;
      if (photoFile) {
        photoUrl = await uploadPhoto(user.id);
      }

      const { error } = await supabase.from("missing_persons").insert({
        user_id: user.id,
        area_id: selectedArea,
        full_name: data.full_name,
        age: data.age || null,
        gender: data.gender,
        last_seen_date: data.last_seen_date || null,
        last_seen_location: data.last_seen_location,
        description: data.description,
        physical_description: data.physical_description || null,
        clothing_description: data.clothing_description || null,
        contact_info: data.contact_info,
        photo_url: photoUrl,
        gps_latitude: capturedLocation?.lat || null,
        gps_longitude: capturedLocation?.lng || null,
      });

      if (error) throw error;

      toast.success("Missing person report submitted successfully");
      reset();
      setPhotoFile(null);
      setPhotoPreview("");
      setSelectedArea("");
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Report Missing Person
        </CardTitle>
        <CardDescription>
          Please provide as much detail as possible to help locate the missing person
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="area">Area *</Label>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name} - {area.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register("full_name", { required: "Name is required" })}
              placeholder="Enter full name"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                {...register("age")}
                placeholder="Age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => register("gender").onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_seen_date">Last Seen Date & Time</Label>
            <Input
              id="last_seen_date"
              type="datetime-local"
              {...register("last_seen_date")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_seen_location">Last Seen Location *</Label>
            <Input
              id="last_seen_location"
              {...register("last_seen_location", { required: "Location is required" })}
              placeholder="Address or landmark"
            />
            {errors.last_seen_location && (
              <p className="text-sm text-destructive">{errors.last_seen_location.message}</p>
            )}
            {capturedLocation && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                GPS: {capturedLocation.lat.toFixed(6)}, {capturedLocation.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="cursor-pointer"
            />
            {photoPreview && (
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="physical_description">Physical Description</Label>
            <Textarea
              id="physical_description"
              {...register("physical_description")}
              placeholder="Height, build, hair color, eye color, distinctive features..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clothing_description">Clothing Description</Label>
            <Textarea
              id="clothing_description"
              {...register("clothing_description")}
              placeholder="What they were wearing when last seen..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Information *</Label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              placeholder="Any other relevant details, medical conditions, circumstances..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_info">Contact Information *</Label>
            <Input
              id="contact_info"
              {...register("contact_info", { required: "Contact info is required" })}
              placeholder="Phone number or email"
            />
            {errors.contact_info && (
              <p className="text-sm text-destructive">{errors.contact_info.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};