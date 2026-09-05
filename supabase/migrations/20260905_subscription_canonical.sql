-- Migration: Safe Canonical Subscription Tier Update
-- Date: 2026-09-05

-- 1. Update existing legacy values to canonical plan identifiers
UPDATE public.profiles 
SET subscription_tier = 'basic' 
WHERE subscription_tier IS NULL OR subscription_tier = 'free';

UPDATE public.profiles 
SET subscription_tier = 'designer_pro' 
WHERE subscription_tier = 'designer' OR subscription_tier = 'pro';

UPDATE public.profiles 
SET subscription_tier = 'fashion_studio' 
WHERE subscription_tier = 'studio';

-- 2. Safely recreate the CHECK constraint allowing both canonical & legacy values
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'basic', 'designer', 'designer_pro', 'studio', 'fashion_studio'));

-- 3. Set default column value to 'basic'
ALTER TABLE public.profiles 
ALTER COLUMN subscription_tier SET DEFAULT 'basic';
