-- Create waitlist positions table
CREATE TABLE waitlist_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  total_signups INTEGER NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('business', 'influencer')),
  referral_count INTEGER DEFAULT 0,
  referrer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster lookups
CREATE INDEX waitlist_positions_user_id_idx ON waitlist_positions(user_id);
CREATE INDEX waitlist_positions_position_idx ON waitlist_positions(position);

-- Create function to update positions when referrals happen
CREATE OR REPLACE FUNCTION update_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  -- When referral_count increases, decrease position by 50 * number of new referrals
  IF (TG_OP = 'UPDATE' AND NEW.referral_count > OLD.referral_count) THEN
    NEW.position := GREATEST(1, OLD.position - (50 * (NEW.referral_count - OLD.referral_count)));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for position updates
CREATE TRIGGER update_position_on_referral
  BEFORE UPDATE ON waitlist_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_position();

-- Add RLS policies
ALTER TABLE waitlist_positions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own position
CREATE POLICY "Users can view own position"
  ON waitlist_positions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update positions
CREATE POLICY "Service role can manage positions"
  ON waitlist_positions
  FOR ALL
  USING (auth.role() = 'service_role'); 