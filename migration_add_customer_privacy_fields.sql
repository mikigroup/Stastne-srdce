-- Migration: Add customer privacy & GDPR fields to profiles table
-- Date: 2024-01-06
-- Description: Adds fields for newsletter consent, GDPR compliance, and data deletion tracking

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS newsletter_consent BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS newsletter_consent_date TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gdpr_consent BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_deletion_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_deletion_date TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_deletion_scheduled TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_deletion_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS account_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS marketing_consent_date TIMESTAMPTZ DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.newsletter_consent IS 'User consent for receiving newsletters (Czech law č. 480/2004 Sb.)';
COMMENT ON COLUMN profiles.newsletter_consent_date IS 'Date when newsletter consent was given/withdrawn';
COMMENT ON COLUMN profiles.gdpr_consent IS 'Basic GDPR consent for data processing (EU 2016/679)';
COMMENT ON COLUMN profiles.gdpr_consent_date IS 'Date when GDPR consent was given';
COMMENT ON COLUMN profiles.data_deletion_requested IS 'User requested account/data deletion (GDPR Article 17)';
COMMENT ON COLUMN profiles.data_deletion_date IS 'Date when data deletion was requested';
COMMENT ON COLUMN profiles.data_deletion_scheduled IS 'Date when data will be permanently deleted (30 days grace period)';
COMMENT ON COLUMN profiles.data_deletion_token IS 'Secure token for account reactivation during grace period';
COMMENT ON COLUMN profiles.account_suspended IS 'Account suspended during deletion grace period';
COMMENT ON COLUMN profiles.marketing_consent IS 'User consent for marketing communications';
COMMENT ON COLUMN profiles.marketing_consent_date IS 'Date when marketing consent was given/withdrawn';

-- Create index for performance on GDPR-related queries
CREATE INDEX IF NOT EXISTS idx_profiles_gdpr_consent ON profiles(gdpr_consent, gdpr_consent_date);
CREATE INDEX IF NOT EXISTS idx_profiles_data_deletion ON profiles(data_deletion_requested, data_deletion_scheduled);
CREATE INDEX IF NOT EXISTS idx_profiles_account_suspended ON profiles(account_suspended);
CREATE INDEX IF NOT EXISTS idx_profiles_newsletter_consent ON profiles(newsletter_consent);

-- Update RLS policies if needed (assuming profiles table has RLS enabled)
-- Users can only update their own privacy settings
CREATE POLICY IF NOT EXISTS "Users can update own privacy settings" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function for processing scheduled data deletions
CREATE OR REPLACE FUNCTION process_scheduled_data_deletions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  deletion_count INTEGER := 0;
BEGIN
  -- Find users scheduled for deletion today
  FOR user_record IN 
    SELECT id, email, first_name, last_name, data_deletion_scheduled
    FROM profiles 
    WHERE data_deletion_requested = true 
    AND data_deletion_scheduled <= NOW()
    AND account_suspended = true
  LOOP
    -- Log the deletion for audit purposes
    RAISE NOTICE 'Processing data deletion for user: % (scheduled: %)', 
      user_record.id, user_record.data_deletion_scheduled;
    
    -- Anonymize personal data while keeping profile record for referential integrity
    UPDATE profiles SET
      first_name = 'DELETED',
      last_name = 'USER',
      email = 'deleted-' || user_record.id || '@anonymized.local',
      telephone = NULL,
      street = NULL,
      street_number = NULL,
      city = NULL,
      zip_code = NULL,
      company = NULL,
      ico = NULL,
      dic = NULL,
      allergies_description = NULL,
      avatar_url = NULL,
      username = 'deleted-' || user_record.id,
      website = NULL,
      company_email = NULL,
      -- Keep GDPR audit trail but mark as processed
      data_deletion_requested = false,
      account_suspended = false,
      data_deletion_date = user_record.data_deletion_scheduled,
      data_deletion_scheduled = NULL,
      data_deletion_token = NULL,
      -- Clear all consents
      newsletter_consent = false,
      marketing_consent = false,
      updated_at = NOW()
    WHERE id = user_record.id;
    
    -- TODO: Delete from Supabase Auth (requires admin API call)
    -- This needs to be done via server-side function or cron job
    
    deletion_count := deletion_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Processed % user data deletions', deletion_count;
END;
$$;

-- Create function for automatic data retention cleanup (existing orders older than retention period)
CREATE OR REPLACE FUNCTION cleanup_expired_customer_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  retention_months INTEGER;
  cutoff_date TIMESTAMPTZ;
BEGIN
  -- Get retention period from site_settings
  SELECT (value->>'dataRetention')::INTEGER 
  INTO retention_months
  FROM site_settings 
  WHERE key = 'customer.dataRetention'
  LIMIT 1;
  
  -- Default to 36 months if not set
  IF retention_months IS NULL THEN
    retention_months := 36;
  END IF;
  
  -- Calculate cutoff date
  cutoff_date := NOW() - INTERVAL '1 month' * retention_months;
  
  -- Log cleanup operation
  RAISE NOTICE 'Starting data cleanup for records older than % months (cutoff: %)', retention_months, cutoff_date;
  
  -- Here you would implement actual cleanup logic for old orders
  -- This is just a template - actual implementation depends on your business rules
END;
$$; 