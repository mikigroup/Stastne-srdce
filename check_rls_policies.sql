-- Check current RLS policies for profiles table
-- 1. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. List all policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. Check specific reactivation policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname LIKE '%reactivation%'
ORDER BY policyname;

-- 4. Check all policies with their conditions
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