-- Create enum for alert severity
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');

-- Create enum for help request status
CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'fulfilled', 'closed');

-- Create enum for user roles
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

-- Create areas table for Sri Lankan regions
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  district TEXT NOT NULL,
  province TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  area_id UUID REFERENCES public.areas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create weather_alerts table
CREATE TABLE public.weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create help_requests table
CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  location_details TEXT,
  status request_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create help_offers table
CREATE TABLE public.help_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  help_type TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_offers ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_weather_alerts_updated_at
  BEFORE UPDATE ON public.weather_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_help_requests_updated_at
  BEFORE UPDATE ON public.help_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_help_offers_updated_at
  BEFORE UPDATE ON public.help_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies for areas (public read)
CREATE POLICY "Areas are viewable by everyone"
  ON public.areas FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage areas"
  ON public.areas FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Roles are viewable by everyone"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for weather_alerts
CREATE POLICY "Alerts are viewable by everyone"
  ON public.weather_alerts FOR SELECT
  USING (true);

CREATE POLICY "Admins and moderators can create alerts"
  ON public.weather_alerts FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Admins and moderators can update own alerts"
  ON public.weather_alerts FOR UPDATE
  USING (
    (public.has_role(auth.uid(), 'admin') OR 
     public.has_role(auth.uid(), 'moderator')) AND
    created_by = auth.uid()
  );

CREATE POLICY "Only admins can delete alerts"
  ON public.weather_alerts FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for help_requests
CREATE POLICY "Help requests are viewable by everyone"
  ON public.help_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create help requests"
  ON public.help_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own help requests"
  ON public.help_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own help requests"
  ON public.help_requests FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for help_offers
CREATE POLICY "Help offers are viewable by everyone"
  ON public.help_offers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create help offers"
  ON public.help_offers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own help offers"
  ON public.help_offers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own help offers"
  ON public.help_offers FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_offers;

-- Insert Sri Lankan areas (major districts)
INSERT INTO public.areas (name, district, province) VALUES
  ('Colombo Central', 'Colombo', 'Western Province'),
  ('Kandy City', 'Kandy', 'Central Province'),
  ('Galle Fort', 'Galle', 'Southern Province'),
  ('Jaffna Town', 'Jaffna', 'Northern Province'),
  ('Trincomalee', 'Trincomalee', 'Eastern Province'),
  ('Anuradhapura', 'Anuradhapura', 'North Central Province'),
  ('Batticaloa', 'Batticaloa', 'Eastern Province'),
  ('Ampara', 'Ampara', 'Eastern Province'),
  ('Ratnapura', 'Ratnapura', 'Sabaragamuwa Province'),
  ('Kurunegala', 'Kurunegala', 'North Western Province'),
  ('Matara', 'Matara', 'Southern Province'),
  ('Hambantota', 'Hambantota', 'Southern Province'),
  ('Badulla', 'Badulla', 'Uva Province'),
  ('Nuwara Eliya', 'Nuwara Eliya', 'Central Province'),
  ('Gampaha', 'Gampaha', 'Western Province'),
  ('Kalutara', 'Kalutara', 'Western Province'),
  ('Matale', 'Matale', 'Central Province'),
  ('Monaragala', 'Monaragala', 'Uva Province'),
  ('Polonnaruwa', 'Polonnaruwa', 'North Central Province'),
  ('Puttalam', 'Puttalam', 'North Western Province'),
  ('Kegalle', 'Kegalle', 'Sabaragamuwa Province'),
  ('Kilinochchi', 'Kilinochchi', 'Northern Province'),
  ('Mannar', 'Mannar', 'Northern Province'),
  ('Mullaitivu', 'Mullaitivu', 'Northern Province'),
  ('Vavuniya', 'Vavuniya', 'Northern Province');