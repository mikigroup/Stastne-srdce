-- Temporarily disable RLS for testing
-- WARNING: This is only for testing, remember to re-enable it!

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test the reactivation manually
-- Replace 'YOUR_TOKEN_HERE' with the actual token
UPDATE profiles 
SET 
    data_deletion_requested = false,
    data_deletion_date = null,
    data_deletion_scheduled = null,
    data_deletion_token = null,
    account_suspended = false,
    updated_at = now()
WHERE data_deletion_token = 'YOUR_TOKEN_HERE';

-- Check if update was successful
SELECT 
    id,
    email,
    data_deletion_requested,
    account_suspended,
    data_deletion_token
FROM profiles 
WHERE id = 'd684e815-9ec7-4bbf-b895-5b885a291289';

-- Re-enable RLS (IMPORTANT!)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 