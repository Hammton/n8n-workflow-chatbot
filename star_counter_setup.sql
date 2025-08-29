-- =====================================================
-- Star Counter Database Setup for GitHub-style Stars
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This will create tables and functions for the star counter feature

-- 1. Create user_stars table to track individual stars
CREATE TABLE IF NOT EXISTS user_stars (
    id SERIAL PRIMARY KEY,
    ip_address TEXT,
    session_id TEXT,
    user_agent TEXT,
    starred_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ip_address, session_id)
);

-- 2. Create site_stats table for global statistics
CREATE TABLE IF NOT EXISTS site_stats (
    id SERIAL PRIMARY KEY,
    stat_name TEXT UNIQUE NOT NULL,
    stat_value INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Initialize with 63 stars as requested
INSERT INTO site_stats (stat_name, stat_value) 
VALUES ('total_stars', 63)
ON CONFLICT (stat_name) DO NOTHING;

-- 4. Function to safely increment star count
CREATE OR REPLACE FUNCTION increment_star_count()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE site_stats 
    SET stat_value = stat_value + 1, updated_at = NOW()
    WHERE stat_name = 'total_stars'
    RETURNING stat_value INTO new_count;
    
    RETURN new_count;
END;
$$;

-- 5. Function to get current star count
CREATE OR REPLACE FUNCTION get_star_count()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT stat_value INTO current_count
    FROM site_stats 
    WHERE stat_name = 'total_stars';
    
    RETURN COALESCE(current_count, 63);
END;
$$;

-- 6. Function to add a star (with duplicate prevention)
CREATE OR REPLACE FUNCTION add_star(
    user_ip TEXT,
    user_session TEXT,
    user_agent_string TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    new_count INTEGER;
    already_starred BOOLEAN := FALSE;
BEGIN
    -- Check if user already starred
    IF EXISTS (
        SELECT 1 FROM user_stars 
        WHERE ip_address = user_ip AND session_id = user_session
    ) THEN
        already_starred := TRUE;
    ELSE
        -- Add the star
        INSERT INTO user_stars (ip_address, session_id, user_agent)
        VALUES (user_ip, user_session, user_agent_string);
        
        -- Increment counter
        SELECT increment_star_count() INTO new_count;
    END IF;
    
    -- Return result
    IF already_starred THEN
        SELECT stat_value INTO new_count FROM site_stats WHERE stat_name = 'total_stars';
        RETURN json_build_object(
            'success', false,
            'message', 'Already starred',
            'count', new_count
        );
    ELSE
        RETURN json_build_object(
            'success', true,
            'message', 'Star added successfully',
            'count', new_count
        );
    END IF;
END;
$$;

-- 7. Function to check if user has already starred
CREATE OR REPLACE FUNCTION has_user_starred(
    user_ip TEXT,
    user_session TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_stars 
        WHERE ip_address = user_ip AND session_id = user_session
    );
END;
$$;

-- =====================================================
-- Verification Queries (Optional - for testing)
-- =====================================================

-- Check if tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_stars', 'site_stats');

-- Check current star count
SELECT get_star_count() as current_stars;

-- Check site_stats table content
SELECT * FROM site_stats WHERE stat_name = 'total_stars';

-- =====================================================
-- Setup Complete!
-- =====================================================
-- After running this SQL:
-- 1. Your star counter will start at 63 stars
-- 2. Users can star your site (once per IP+session)
-- 3. The counter will increment automatically
-- 4. All functions are ready for API integration
-- =====================================================