-- Fix missing columns in products table
-- This script ensures that the products table has the necessary columns for specifications, highlights, and application steps.

DO $$ 
BEGIN 
    -- Add specifications column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='products' AND column_name='specifications') THEN
        ALTER TABLE public.products ADD COLUMN specifications jsonb;
    END IF;
    
    -- Add highlights column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='products' AND column_name='highlights') THEN
        ALTER TABLE public.products ADD COLUMN highlights jsonb;
    END IF;
    
    -- Add application_steps column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='products' AND column_name='application_steps') THEN
        ALTER TABLE public.products ADD COLUMN application_steps jsonb;
    END IF;
END $$;
