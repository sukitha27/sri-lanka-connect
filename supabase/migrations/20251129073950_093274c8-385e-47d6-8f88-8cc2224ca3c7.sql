-- Add detailed emergency fields to help_requests table
ALTER TABLE public.help_requests 
ADD COLUMN IF NOT EXISTS emergency_type TEXT CHECK (emergency_type IN ('trapped_by_flood', 'medical_emergency', 'food_water_needed', 'evacuation_needed', 'missing_person', 'other_emergency')),
ADD COLUMN IF NOT EXISTS gps_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS gps_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS number_of_people INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_elderly BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_disabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_medical_needs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS water_level TEXT CHECK (water_level IN ('ankle_deep', 'knee_deep', 'waist_deep', 'chest_deep', 'over_head')),
ADD COLUMN IF NOT EXISTS safe_for_hours INTEGER,
ADD COLUMN IF NOT EXISTS building_type TEXT,
ADD COLUMN IF NOT EXISTS floor_level TEXT,
ADD COLUMN IF NOT EXISTS needs_food BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS needs_water BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS needs_power BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_battery_percent INTEGER,
ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS action_taken BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS action_taken_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS action_notes TEXT;

-- Create index for GPS coordinates for map queries
CREATE INDEX IF NOT EXISTS idx_help_requests_gps ON public.help_requests(gps_latitude, gps_longitude) WHERE gps_latitude IS NOT NULL AND gps_longitude IS NOT NULL;

-- Create index for emergency type filtering
CREATE INDEX IF NOT EXISTS idx_help_requests_emergency_type ON public.help_requests(emergency_type);

-- Create index for verified requests
CREATE INDEX IF NOT EXISTS idx_help_requests_verified ON public.help_requests(is_verified, created_at DESC);