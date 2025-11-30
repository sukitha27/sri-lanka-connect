-- Add foreign key constraint from missing_persons to areas
ALTER TABLE public.missing_persons
ADD CONSTRAINT fk_missing_persons_area
FOREIGN KEY (area_id) REFERENCES public.areas(id)
ON DELETE CASCADE;