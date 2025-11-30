-- Create storage bucket for missing person photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('missing-persons', 'missing-persons', true)
ON CONFLICT (id) DO NOTHING;

-- Create missing_persons table
CREATE TABLE IF NOT EXISTS public.missing_persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  area_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  last_seen_date TIMESTAMP WITH TIME ZONE,
  last_seen_location TEXT,
  gps_latitude NUMERIC,
  gps_longitude NUMERIC,
  description TEXT NOT NULL,
  physical_description TEXT,
  clothing_description TEXT,
  contact_info TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'missing',
  is_found BOOLEAN NOT NULL DEFAULT false,
  found_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.missing_persons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missing_persons
CREATE POLICY "Missing persons are viewable by everyone"
ON public.missing_persons
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create missing person reports"
ON public.missing_persons
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missing person reports"
ON public.missing_persons
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own missing person reports"
ON public.missing_persons
FOR DELETE
USING (auth.uid() = user_id);

-- Storage policies for missing-persons bucket
CREATE POLICY "Missing person photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'missing-persons');

CREATE POLICY "Authenticated users can upload missing person photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'missing-persons' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own missing person photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'missing-persons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own missing person photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'missing-persons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Trigger for updated_at
CREATE TRIGGER update_missing_persons_updated_at
BEFORE UPDATE ON public.missing_persons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.missing_persons;