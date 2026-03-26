
-- Create enum for motion types
CREATE TYPE public.motion_type AS ENUM (
  'linear_uniform',
  'linear_accelerated', 
  'circular',
  'projectile',
  'oscillation',
  'free_fall',
  'other'
);

-- Create table for analysis sessions
CREATE TABLE public.analysis_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url TEXT NOT NULL,
  video_name TEXT NOT NULL,
  video_size BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  motion_type motion_type,
  motion_type_label TEXT,
  confidence NUMERIC,
  ai_description TEXT,
  parameters JSONB DEFAULT '{}',
  trajectory_data JSONB DEFAULT '[]',
  position_time_data JSONB DEFAULT '[]',
  velocity_time_data JSONB DEFAULT '[]',
  acceleration_time_data JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Public access (no auth required for this research app)
CREATE POLICY "Anyone can view analysis sessions"
  ON public.analysis_sessions FOR SELECT USING (true);

CREATE POLICY "Anyone can create analysis sessions"
  ON public.analysis_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update analysis sessions"
  ON public.analysis_sessions FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete analysis sessions"
  ON public.analysis_sessions FOR DELETE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_analysis_sessions_updated_at
  BEFORE UPDATE ON public.analysis_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

CREATE POLICY "Anyone can upload videos"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Anyone can delete videos"
  ON storage.objects FOR DELETE USING (bucket_id = 'videos');
