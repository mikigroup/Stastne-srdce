-- Check current policies again
SELECT 
    policyname,
    CASE cmd 
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT' 
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE cmd::text
    END as operation,
    qual as using_condition,
    with_check as check_condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname; 