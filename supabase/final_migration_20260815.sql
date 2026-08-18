-- Stage 1: Fix Database Schema
-- Run these first if columns are missing
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS highlights jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS application_steps jsonb;

-- Stage 2: Update Category Structure
INSERT INTO public.categories (name, slug) VALUES 
('Exterior Maintenance', 'exterior'),
('Wheel & Tyre Care', 'wheels'),
('Interior Detail', 'interior'),
('Professional Accessories', 'accessories')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Stage 3: Data-Driven Product Details
-- Updating products with unique, professional data

-- Quick Detailer
UPDATE public.products SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior'),
  specifications = '{"pH Level": "7.0 (Neutral)", "Scent": "Tropical Cherry", "Dilution": "Ready to Use", "Durability": "2-3 Weeks"}',
  highlights = '["Instant Gloss Enhancement", "Anti-Static Formula", "Safe for Coatings", "Streak-Free Finish"]',
  application_steps = '[{"title": "Spray", "instruction": "Mist lightly over a small section of the vehicle surface."}, {"title": "Wipe", "instruction": "Using a clean microfiber towel, spread the product evenly."}, {"title": "Buff", "instruction": "Flip the towel to a dry side and buff to a high-gloss shine."}]'
WHERE slug = 'quick-detail';

-- Wash & Wax Shampoo
UPDATE public.products SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior'),
  specifications = '{"pH Level": "7.2 (Neutral)", "Scent": "Sweet Grape", "Wax Content": "Infused Carnauba", "Foam Level": "High Suds"}',
  highlights = '["High Lubricity Wash", "Adds Carnauba Protection", "Sheet-Rinse Technology", "Safe for All Finishes"]',
  application_steps = '[{"title": "Rinse", "instruction": "Pre-rinse the vehicle to remove loose dirt and debris."}, {"title": "Mix", "instruction": "Add 30ml-50ml of shampoo to a 10L bucket of water."}, {"title": "Wash", "instruction": "Wash using a high-quality mitt, rinsing the mitt frequently."}]'
WHERE slug = 'wash-wax-shampoo';

-- Iron Remover
UPDATE public.products SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'wheels'),
  specifications = '{"Action": "Color Changing", "pH Level": "6.8", "Safe On": "Paint & Wheels", "Scent": "Lemon Masked"}',
  highlights = '["Dissolves Brake Dust", "Iron Fallout Removal", "Non-Acidic Formula", "Visible Purple Reaction"]',
  application_steps = '[{"title": "Cool", "instruction": "Ensure wheels/panels are cool to the touch and out of direct sunlight."}, {"title": "Spray", "instruction": "Spray directly onto the surface and wait 2-4 minutes."}, {"title": "Rinse", "instruction": "When product turns deep purple, rinse thoroughly with pressure water."}]'
WHERE slug = 'iron-remover';

-- Milky Tyre Shine
UPDATE public.products SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'wheels'),
  specifications = '{"Base": "Water-Based", "Finish": "Satin/Natural", "UV Protection": "SPF 40", "Sling": "Zero-Sling"}',
  highlights = '["Restores Deep Black Look", "Hydrates Tyre Rubber", "Non-Greasy Finish", "UV Damage Prevention"]',
  application_steps = '[{"title": "Clean", "instruction": "Clean tyres thoroughly with Wheel & Tyre Cleaner and let dry."}, {"title": "Apply", "instruction": "Apply a small amount to a foam applicator pad."}, {"title": "Spread", "instruction": "Spread evenly around the sidewall and let dry for 10 minutes."}]'
WHERE slug = 'milky-tyre-shine';

-- Interior Cleaner
UPDATE public.products SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'interior'),
  specifications = '{"pH Level": "8.5", "Scent": "Fresh Linen", "Surface": "Multi-Surface", "UV Guard": "Yes"}',
  highlights = '["Lifts Deep Grime", "Anti-Microbial Properties", "Safe for Sensitive Plastics", "Matte OEM Finish"]',
  application_steps = '[{"title": "Mist", "instruction": "Spray directly onto a microfiber cloth or soft brush."}, {"title": "Agitate", "instruction": "Work into the surface gently to lift embedded dirt."}, {"title": "Wipe", "instruction": "Wipe away residue with a dry, clean microfiber cloth."}]'
WHERE slug = 'interior-cleaner';

-- Dash Flash
UPDATE public.products SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'interior'),
  specifications = '{"Finish": "Factory Natural", "Anti-Static": "Yes", "UV Resistance": "High", "Scent": "New Car"}',
  highlights = '["Dust Repellent Coating", "SPF 50 UV Protection", "No-Glow Natural Finish", "Cracking Prevention"]',
  application_steps = '[{"title": "Prepare", "instruction": "Ensure dashboard is free from heavy dust using Interior Cleaner."}, {"title": "Apply", "instruction": "Mist onto an applicator and wipe across trim surfaces."}, {"title": "Level", "instruction": "Wait 2 minutes and buff with a dry towel for a uniform finish."}]'
WHERE slug = 'dash-flash';

-- Professional Microfiber
UPDATE public.products SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'accessories'),
  specifications = '{"GSM": "450", "Material": "70/30 Blend", "Edges": "Edgeless Sonic Cut", "Washable": "Yes"}',
  highlights = '["Scratch-Free Performance", "Ultra-Absorbent", "Lint-Free Buffing", "Commercial Grade Durability"]',
  application_steps = '[{"title": "Inspect", "instruction": "Always check for trapped debris before use on paint."}, {"title": "Wipe", "instruction": "Use in linear motions to prevent swirl marks."}, {"title": "Care", "instruction": "Machine wash with microfiber detergent; tumble dry low."}]'
WHERE slug = 'microfiber-towel' OR slug = 'pro-towel';

-- Large Accessories
UPDATE public.products SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'accessories'),
  specifications = '{"Build": "Industrial Grade", "Ergonomics": "Detention Grip", "Material": "Chemical Resistant"}',
  highlights = '["Professional Detailing Tool", "Built for Daily Use", "Enhanced Efficiency", "Surface Safe Design"]',
  application_steps = '[{"title": "Prep", "instruction": "Rinse tool before first use to ensure it is contaminant free."}, {"title": "Utility", "instruction": "Use with appropriate DetailCorner chemicals for best results."}, {"title": "Storage", "instruction": "Rinse and dry thoroughly before storing in a dust-free bag."}]'
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'accessories');
