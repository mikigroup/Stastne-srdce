-- Temporarily disable RLS for testing
-- This will help us determine if the problem is with RLS or something else

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test the reactivation manually
UPDATE profiles 
SET 
    data_deletion_requested = false,
    data_deletion_date = null,
    data_deletion_scheduled = null,
    data_deletion_token = null,
    account_suspended = false,
    updated_at = now()
WHERE data_deletion_token = '991f86e6-2cb0-44d8-b14f-44903422fe3e';

-- Check if update was successful
SELECT 
    id,
    email,
    data_deletion_requested,
    account_suspended,
    data_deletion_token,
    updated_at
FROM profiles 
WHERE id = 'd684e815-9ec7-4bbf-b895-5b885a291289';

-- Re-enable RLS (IMPORTANT!)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 