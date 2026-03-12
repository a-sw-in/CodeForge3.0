-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'success'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active announcements
CREATE POLICY "Anyone can read active announcements"
  ON announcements
  FOR SELECT
  USING (is_active = true);

-- Policy: Allow all operations (for admin API with anon key)
-- Since you're using custom admin auth, allow all operations with anon key
CREATE POLICY "Allow all operations for service role"
  ON announcements
  FOR ALL
  USING (true)
  WITH CHECK (true);
