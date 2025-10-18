-- Complete Database Schema Analysis
-- This query will show ALL tables and their relationships

-- ========================================
-- PART 1: List ALL tables in public schema
-- ========================================
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ========================================
-- PART 2: Show all subscription-related tables specifically
-- ========================================
SELECT
    tablename as "Table Name",
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as "Column Count"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%subscription%'
ORDER BY tablename;

-- ========================================
-- PART 3: Show structure of 'subscriptions' table
-- ========================================
SELECT
    column_name as "Column",
    data_type as "Type",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- ========================================
-- PART 4: Show structure of 'active_subscriptions' (if exists)
-- ========================================
SELECT
    column_name as "Column",
    data_type as "Type",
    is_nullable as "Nullable"
FROM information_schema.columns
WHERE table_name = 'active_subscriptions'
ORDER BY ordinal_position;

-- ========================================
-- PART 5: Check if active_subscriptions is a VIEW or TABLE
-- ========================================
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name = 'subscriptions' OR table_name = 'active_subscriptions');

-- ========================================
-- PART 6: Show foreign key relationships
-- ========================================
SELECT
    tc.table_name as "From Table",
    kcu.column_name as "From Column",
    ccu.table_name AS "To Table",
    ccu.column_name AS "To Column",
    tc.constraint_name as "Constraint"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name LIKE '%subscription%' OR ccu.table_name LIKE '%subscription%')
ORDER BY tc.table_name;

-- ========================================
-- PART 7: Count records in each subscription table
-- ========================================
SELECT
    'subscriptions' as table_name,
    COUNT(*) as record_count
FROM subscriptions
UNION ALL
SELECT
    'active_subscriptions' as table_name,
    COUNT(*) as record_count
FROM active_subscriptions;
