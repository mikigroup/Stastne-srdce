-- Check specific profile data for reactivation
-- Replace 'YOUR_TOKEN_HERE' with the actual token you're testing

SELECT 
    id,
    email,
    data_deletion_requested,
    account_suspended,
    data_deletion_token,
    data_deletion_scheduled,
    pg_typeof(data_deletion_requested) as data_deletion_requested_type,
    pg_typeof(account_suspended) as account_suspended_type
FROM profiles 
WHERE data_deletion_token = 'YOUR_TOKEN_HERE';

-- Check all profiles with deletion tokens
SELECT 
    id,
    email,
    data_deletion_requested,
    account_suspended,
    data_deletion_token,
    data_deletion_scheduled,
    pg_typeof(data_deletion_requested) as data_deletion_requested_type,
    pg_typeof(account_suspended) as account_suspended_type
FROM profiles 
WHERE data_deletion_token IS NOT NULL
ORDER BY created_at DESC
LIMIT 5; 