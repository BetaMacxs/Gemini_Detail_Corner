-- Script to create missing products and insert/update product variants
-- Run this in your Supabase SQL Editor

-- 1. Ensure the 'scent' column exists on product_variants
ALTER TABLE IF EXISTS public.product_variants 
ADD COLUMN IF NOT EXISTS scent text;

-- 2. Insert missing products (so variants have a valid product_id)
WITH new_variants (old_id, product_slug, size_val, scent_val, price_val) AS (
  VALUES
    (1, 'milky-tyre-shine', '500ml', NULL, 55.00),
    (2, 'milky-tyre-shine', '1L', NULL, 95.00),
    (3, 'milky-tyre-shine', '5L', NULL, 400.00),
    (4, 'clear-tyre-shine', '500ml', NULL, 85.00),
    (5, 'clear-tyre-shine', '1L', NULL, 160.00),
    (6, 'clear-tyre-shine', '5L', NULL, 700.00),
    (7, 'quick-detail', '500ml', NULL, 70.00),
    (8, 'quick-detail', '1L', NULL, 130.00),
    (9, 'quick-detail', '5L', NULL, 400.00),
    (10, 'spray-wax', '500ml', NULL, 85.00),
    (11, 'spray-wax', '1L', NULL, 160.00),
    (12, 'spray-wax', '5L', NULL, 450.00),
    (13, 'quick-wax', '500ml', NULL, 90.00),
    (14, 'quick-wax', '1L', NULL, 170.00),
    (15, 'interior-cleaner', '500ml', NULL, 50.00),
    (16, 'interior-cleaner', '1L', NULL, 90.00),
    (17, 'interior-cleaner', '5L', NULL, 260.00),
    (18, 'wheel-tyre-cleaner', '500ml', NULL, 45.00),
    (19, 'wheel-tyre-cleaner', '1L', NULL, 80.00),
    (20, 'wheel-tyre-cleaner', '5L', NULL, 210.00),
    (21, 'iron-remover', '500ml', NULL, 130.00),
    (22, 'iron-remover', '1L', NULL, 230.00),
    (23, 'iron-remover', '5L', NULL, 750.00),
    (24, 'wash-wax-shampoo', '500ml', NULL, 40.00),
    (25, 'wash-wax-shampoo', '1L', NULL, 70.00),
    (26, 'wash-wax-shampoo', '5L', NULL, 140.00),
    (27, 'hyper-foam-shampoo', '500ml', NULL, 40.00),
    (28, 'hyper-foam-shampoo', '1L', NULL, 70.00),
    (29, 'hyper-foam-shampoo', '5L', NULL, 140.00),
    (30, 'snow-foam', '500ml', NULL, 50.00),
    (31, 'snow-foam', '1L', NULL, 80.00),
    (32, 'snow-foam', '5L', NULL, 200.00),
    (33, 'engine-cleaner', '500ml', NULL, 30.00),
    (34, 'engine-cleaner', '1L', NULL, 50.00),
    (35, 'engine-cleaner', '5L', NULL, 110.00),
    (36, 'dash-flash', '500ml', NULL, 65.00),
    (37, 'dash-flash', '1L', NULL, 120.00),
    (38, 'ceramic-force', '250ml', NULL, 80.00),
    (39, 'ceramic-force', '500ml', NULL, 120.00),
    (40, 'whitewall-blast', '5L', NULL, 400.00),
    (41, 'whitewall-blast', '500ml', NULL, 80.00),
    (43, 'crystal-gloss', '500ml', NULL, 150.00),
    (44, 'air-freshener', '250ml', 'Sea Breeze', 55.00),
    (45, 'air-freshener', '250ml', 'Cherry / Lavendar', 55.00),
    (46, 'air-freshener', '250ml', 'Summer Radiance', 55.00),
    (47, 'air-freshener', '5L', 'Sea Breeze', 260.00),
    (48, 'air-freshener', '5L', 'Cherry / Lavendar', 260.00),
    (49, 'air-freshener', '5L', 'Summer Radiance', 260.00),
    (50, 'tyre-trim', '500ml', NULL, 80.00),
    (51, 'degreaser-pro', '1L', NULL, 100.00),
    (52, 'tyre-trim', '5L', NULL, 700.00),
    (55, 'glowup-kit', '500ml (kit)', NULL, 220.00),
    (69, 'scratch-swirl-remover', '1L', NULL, 120.00),
    (70, 'scratch-swirl-remover', '500ml', NULL, 70.00),
    (74, 'ultimate-shine-kit', '500ml', NULL, 255.00),
    (75, 'window-cleaner', '500ml', NULL, 30.00),
    (76, 'window-cleaner', '1L', NULL, 60.00),
    (77, 'window-cleaner', '5L', NULL, 180.00),
    (82, 'detail-prep-shampoo', '500ml', NULL, 50.00),
    (83, 'detail-prep-shampoo', '1L', NULL, 80.00),
    (84, 'detail-prep-shampoo', '5L', NULL, 180.00),
    (85, 'air-freshener', '100ml', 'Cherry / Lavendar', 30.00),
    (86, 'air-freshener', '100ml', 'Sea Breeze', 30.00),
    (87, 'air-freshener', '100ml', 'Summer Radiance', 30.00),
    (88, 'crystal-gloss', '1L', NULL, 270.00),
    (89, 'crystal-gloss', '5L', NULL, 950.00),
    (90, 'dash-flash', '5L', NULL, 450.00),
    (91, 'degreaser-pro', '5L', NULL, 280.00),
    (92, 'airfreshener-hanger', '25ml', NULL, 35.00),
    (93, 'tyre-applicator', '1', NULL, 25.00),
    (94, 'wash-sponge', '1', NULL, 25.00),
    (95, 'chemois', '1', NULL, 40.00),
    (96, 'detail-brushes', '5 Piece', NULL, 180.00),
    (97, 'microfibre-cloth', '400X400', NULL, 25.00),
    (98, 'microfibre-dryingtowel', '1', NULL, 75.00),
    (99, 'clay-bar', '1', NULL, 100.00),
    (100, 'degreaser-pro', '500ml', NULL, 75.00)
)
INSERT INTO public.products (name, slug, sku, price)
SELECT 
  initcap(replace(nv.product_slug, '-', ' ')),
  nv.product_slug,
  nv.product_slug,
  MIN(nv.price_val)
FROM new_variants nv
GROUP BY nv.product_slug
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert or update the variants
WITH new_variants (old_id, product_slug, size_val, scent_val, price_val) AS (
  VALUES
    (1, 'milky-tyre-shine', '500ml', NULL, 55.00),
    (2, 'milky-tyre-shine', '1L', NULL, 95.00),
    (3, 'milky-tyre-shine', '5L', NULL, 400.00),
    (4, 'clear-tyre-shine', '500ml', NULL, 85.00),
    (5, 'clear-tyre-shine', '1L', NULL, 160.00),
    (6, 'clear-tyre-shine', '5L', NULL, 700.00),
    (7, 'quick-detail', '500ml', NULL, 70.00),
    (8, 'quick-detail', '1L', NULL, 130.00),
    (9, 'quick-detail', '5L', NULL, 400.00),
    (10, 'spray-wax', '500ml', NULL, 85.00),
    (11, 'spray-wax', '1L', NULL, 160.00),
    (12, 'spray-wax', '5L', NULL, 450.00),
    (13, 'quick-wax', '500ml', NULL, 90.00),
    (14, 'quick-wax', '1L', NULL, 170.00),
    (15, 'interior-cleaner', '500ml', NULL, 50.00),
    (16, 'interior-cleaner', '1L', NULL, 90.00),
    (17, 'interior-cleaner', '5L', NULL, 260.00),
    (18, 'wheel-tyre-cleaner', '500ml', NULL, 45.00),
    (19, 'wheel-tyre-cleaner', '1L', NULL, 80.00),
    (20, 'wheel-tyre-cleaner', '5L', NULL, 210.00),
    (21, 'iron-remover', '500ml', NULL, 130.00),
    (22, 'iron-remover', '1L', NULL, 230.00),
    (23, 'iron-remover', '5L', NULL, 750.00),
    (24, 'wash-wax-shampoo', '500ml', NULL, 40.00),
    (25, 'wash-wax-shampoo', '1L', NULL, 70.00),
    (26, 'wash-wax-shampoo', '5L', NULL, 140.00),
    (27, 'hyper-foam-shampoo', '500ml', NULL, 40.00),
    (28, 'hyper-foam-shampoo', '1L', NULL, 70.00),
    (29, 'hyper-foam-shampoo', '5L', NULL, 140.00),
    (30, 'snow-foam', '500ml', NULL, 50.00),
    (31, 'snow-foam', '1L', NULL, 80.00),
    (32, 'snow-foam', '5L', NULL, 200.00),
    (33, 'engine-cleaner', '500ml', NULL, 30.00),
    (34, 'engine-cleaner', '1L', NULL, 50.00),
    (35, 'engine-cleaner', '5L', NULL, 110.00),
    (36, 'dash-flash', '500ml', NULL, 65.00),
    (37, 'dash-flash', '1L', NULL, 120.00),
    (38, 'ceramic-force', '250ml', NULL, 80.00),
    (39, 'ceramic-force', '500ml', NULL, 120.00),
    (40, 'whitewall-blast', '5L', NULL, 400.00),
    (41, 'whitewall-blast', '500ml', NULL, 80.00),
    (43, 'crystal-gloss', '500ml', NULL, 150.00),
    (44, 'air-freshener', '250ml', 'Sea Breeze', 55.00),
    (45, 'air-freshener', '250ml', 'Cherry / Lavendar', 55.00),
    (46, 'air-freshener', '250ml', 'Summer Radiance', 55.00),
    (47, 'air-freshener', '5L', 'Sea Breeze', 260.00),
    (48, 'air-freshener', '5L', 'Cherry / Lavendar', 260.00),
    (49, 'air-freshener', '5L', 'Summer Radiance', 260.00),
    (50, 'tyre-trim', '500ml', NULL, 80.00),
    (51, 'degreaser-pro', '1L', NULL, 100.00),
    (52, 'tyre-trim', '5L', NULL, 700.00),
    (55, 'glowup-kit', '500ml (kit)', NULL, 220.00),
    (69, 'scratch-swirl-remover', '1L', NULL, 120.00),
    (70, 'scratch-swirl-remover', '500ml', NULL, 70.00),
    (74, 'ultimate-shine-kit', '500ml', NULL, 255.00),
    (75, 'window-cleaner', '500ml', NULL, 30.00),
    (76, 'window-cleaner', '1L', NULL, 60.00),
    (77, 'window-cleaner', '5L', NULL, 180.00),
    (82, 'detail-prep-shampoo', '500ml', NULL, 50.00),
    (83, 'detail-prep-shampoo', '1L', NULL, 80.00),
    (84, 'detail-prep-shampoo', '5L', NULL, 180.00),
    (85, 'air-freshener', '100ml', 'Cherry / Lavendar', 30.00),
    (86, 'air-freshener', '100ml', 'Sea Breeze', 30.00),
    (87, 'air-freshener', '100ml', 'Summer Radiance', 30.00),
    (88, 'crystal-gloss', '1L', NULL, 270.00),
    (89, 'crystal-gloss', '5L', NULL, 950.00),
    (90, 'dash-flash', '5L', NULL, 450.00),
    (91, 'degreaser-pro', '5L', NULL, 280.00),
    (92, 'airfreshener-hanger', '25ml', NULL, 35.00),
    (93, 'tyre-applicator', '1', NULL, 25.00),
    (94, 'wash-sponge', '1', NULL, 25.00),
    (95, 'chemois', '1', NULL, 40.00),
    (96, 'detail-brushes', '5 Piece', NULL, 180.00),
    (97, 'microfibre-cloth', '400X400', NULL, 25.00),
    (98, 'microfibre-dryingtowel', '1', NULL, 75.00),
    (99, 'clay-bar', '1', NULL, 100.00),
    (100, 'degreaser-pro', '500ml', NULL, 75.00)
)
INSERT INTO public.product_variants (product_id, sku, name, size, scent, price)
SELECT 
  p.id,
  nv.product_slug || '-' || lower(regexp_replace(nv.size_val, '\s+', '', 'g')) || COALESCE('-' || lower(regexp_replace(nv.scent_val, '[^a-zA-Z0-9]', '', 'g')), ''),
  nv.size_val || COALESCE(' (' || nv.scent_val || ')', ''),
  nv.size_val,
  nv.scent_val,
  nv.price_val
FROM new_variants nv
JOIN public.products p ON p.slug = nv.product_slug
ON CONFLICT (sku) DO UPDATE 
SET 
  price = EXCLUDED.price,
  size = EXCLUDED.size,
  scent = EXCLUDED.scent,
  name = EXCLUDED.name;
-- Categories
INSERT INTO public.categories (slug, name) VALUES ('accessories', 'Accessories') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (slug, name) VALUES ('exterior', 'Exterior') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (slug, name) VALUES ('wheels', 'Wheels') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (slug, name) VALUES ('interior', 'Interior') ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('air-freshener', 'air-freshener', 'Air Freshener', 'Long lasting fragrance that leaves your car smelling fresh. Choose from various scents.', true, (SELECT id FROM public.categories WHERE slug = 'accessories'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('airfreshener-hanger', 'airfreshener-hanger', 'Air Freshener Hanger', 'Long lasting hanging air freshener that keeps your car smelling fresh for weeks.', true, (SELECT id FROM public.categories WHERE slug = 'accessories'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('ceramic-force', 'ceramic-force', 'Ceramic Force', 'Advanced ceramic spray coating that bonds to paint, providing months of hydrophobic protection and gloss.', false, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('chemois', 'chemois', 'Chemois', 'Super absorbent natural chamois leather for streak free drying and polishing.', true, (SELECT id FROM public.categories WHERE slug = 'accessories'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('clay-bar', 'clay-bar', 'Clay Bar', 'Removes bonded contaminants and overspray, leaving paint glass smooth before waxing.', true, (SELECT id FROM public.categories WHERE slug = 'accessories'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('clear-tyre-shine', 'clear-tyre-shine', 'Clear Tyre Shine', 'A clear, silicone-free tyre gel that gives a deep wet look. Long-lasting and water-resistant.', true, (SELECT id FROM public.categories WHERE slug = 'wheels'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('crystal-gloss', 'crystal-gloss', 'Crystal Gloss', 'A high-gloss finishing polish that removes light swirls and leaves a deep, wet shine. Easy to use.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('dash-flash', 'dash-flash', 'Dash Flash', 'An interior dressing that leaves dashboards and trim with a natural finish.', true, (SELECT id FROM public.categories WHERE slug = 'interior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('degreaser-pro', 'degreaser-pro', 'Degreaser Pro', 'Heavy duty engine and underbody degreaser that cuts through grease and grime fast.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('detail-brushes', 'detail-brushes', 'Detailing Brushes', 'Soft, precision brushes for vents, badges, wheels, and intricate interior trims.', true, (SELECT id FROM public.categories WHERE slug = 'accessories'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('detail-prep-shampoo', 'detail-prep-shampoo', 'Detail Prep Shampoo', 'pH neutral pre-wash shampoo that gently lifts dirt and prepares paint for correction.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('engine-cleaner', 'engine-cleaner', 'Engine Cleaner', 'Degreases and cleans engine bays without harming sensors or hoses. Leaves a clean, factory-fresh look.', false, NULL, 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('glowup-kit', 'glowup-kit', 'Glowup Combo', 'The ultimate glowup combo: 500ml each of Interior Cleaner, Wheel Cleaner, Quick Detailer, Shampoo, Tyre Shine, and Air Freshener.', false, NULL, 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('hyper-foam-shampoo', 'hyper-foam-shampoo', 'Hyper Foam Shampoo', 'Produces thick, luxurious foam that lifts dirt away safely. Ideal for foam cannons.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('interior-cleaner', 'interior-cleaner', 'Interior Cleaner', 'A gentle cleaner for dashboards, plastics, and vinyl. Removes dirt without leaving residue.', true, (SELECT id FROM public.categories WHERE slug = 'interior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('iron-remover', 'iron-remover', 'Iron Remover', 'Changes colour on contact with iron particles, safely lifting them from paint, wheels, and glass.', true, (SELECT id FROM public.categories WHERE slug = 'wheels'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('microfibre-cloth', 'microfibre-cloth', 'Micro Fibre Cloth', 'Lint free, ultra soft microfibre cloth for scratch free cleaning and buffing.', true, (SELECT id FROM public.categories WHERE slug = 'accessories'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('microfibre-dryingtowel', 'microfibre-dryingtowel', 'Micro Fibre Drying Towel', 'Extra large plush microfibre drying towel that absorbs water instantly without scratching.', true, (SELECT id FROM public.categories WHERE slug = 'accessories'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('milky-tyre-shine', 'milky-tyre-shine', 'Milky Tyre Shine', 'A water-based coating that leaves tyres with a rich shine. Protects against UV and cracking.', true, (SELECT id FROM public.categories WHERE slug = 'wheels'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('quick-detail', 'quick-detail', 'Quick Detailer', 'A spray on, wipe off detailing spray that enhances gloss. Perfect between washes.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('quick-wax', 'quick-wax', 'Quick Wax', 'An easy-on, easy-off liquid wax that leaves a brilliant shine in minutes. Ideal for maintenance.', false, NULL, 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('scratch-swirl-remover', 'scratch-swirl-remover', 'Scratch & Swirl Remover', 'This gentle compound removes light scratches and swirl marks, restoring clarity and depth.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('snow-foam', 'snow-foam', 'Snow Foam Shampoo', 'Thick, clinging pre-wash foam that breaks down dirt and grime before contact washing.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('spray-wax', 'spray-wax', 'Spray Wax', 'A quick application carnauba wax that adds depth and shine while providing protection.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('tyre-applicator', 'tyre-applicator', 'Tyre Applicator', 'A foam applicator pad designed for even, mess free application of tyre dressings and gels.', true, (SELECT id FROM public.categories WHERE slug = 'accessories'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('tyre-trim', 'tyre-trim', 'Tyre & Trim', 'This tyre & trim restores a deep, rich black finish while shielding against UV rays and weather. Non-greasy, long-lasting, and simple to apply.', false, (SELECT id FROM public.categories WHERE slug = 'wheels'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('ultimate-shine-kit', 'ultimate-shine-kit', 'Ultimate Shine Combo', 'Containing 500ml Tyre & Trim, Shampoo, Spray Wax, Interior Cleaner, Wheel Cleaner, and Air Freshener.', false, NULL, 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('wash-sponge', 'wash-sponge', 'Wash Sponge', 'High density foam wash sponge that holds plenty of soap and glides safely over paint.', true, (SELECT id FROM public.categories WHERE slug = 'accessories'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('wash-wax-shampoo', 'wash-wax-shampoo', 'Wash & Wax Shampoo', 'A high foaming shampoo that cleans gently while depositing a protective wax layer.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('wheel-tyre-cleaner', 'wheel-tyre-cleaner', 'Wheel & Tyre Cleaner', 'Powerful formula that dissolves brake dust, road grime, and grease. Safe for all wheel types.', true, (SELECT id FROM public.categories WHERE slug = 'wheels'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('whitewall-blast', 'whitewall-blast', 'Whitewall Blast', 'Specially formulated to clean whitewall tyres. Removes browning and stains instantly.', true, (SELECT id FROM public.categories WHERE slug = 'wheels'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

INSERT INTO public.products (slug, sku, name, description, active, category_id, price)
VALUES ('window-cleaner', 'window-cleaner', 'Window Cleaner', 'A streak free formula that cuts through grime, road film, and fingerprints.', true, (SELECT id FROM public.categories WHERE slug = 'exterior'), 0)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  category_id = EXCLUDED.category_id;

-- Product Images
DELETE FROM public.product_images;

INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'air-freshener'), 'air-freshener.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'air-freshener'), 'cherry-lavendar.png', 1);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'air-freshener'), 'summer-radiance.png', 2);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'airfreshener-hanger'), 'airfreshener-hanger.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'absorber-chemois'), 'chemois.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'clay-bar'), 'clay-bar.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'clear-tyre-shine'), 'clear-tyre-shine.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'crystal-gloss'), 'crystal-gloss.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'dash-flash'), 'dash-flash.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'degreaser-pro'), 'degreaser-pro.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'detail-brushes'), 'detail-brushes.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'detail-prep-shampoo'), 'detail-prep-shampoo.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'engine-cleaner'), 'engine-cleaner.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'glowup-kit'), 'glowup-kit.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'hyper-foam-shampoo'), 'hyper-foam-shampoo.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'interior-cleaner'), 'interior-cleaner.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'iron-remover'), 'iron-remover.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'microfibre-cloth'), 'microfibre-cloth.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'microfibre-dryingtowel'), 'microfibre-dryingtowel.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'milky-tyre-shine'), 'milky-tyre-shine.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'quick-detail'), 'quick-detail.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'quick-wax'), 'quick-wax.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'scratch-swirl-remover'), 'scratch-swirl-remover.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'snow-foam'), 'snow-foam.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'spray-wax'), 'spray-wax.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'tyre-applicator'), 'tyre-applicator.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'tyre-trim'), 'tyre-trim.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'ultimate-shine-kit'), 'ultimate-shine-kit.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'wash-sponge'), 'wash-sponge.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'wash-wax-shampoo'), 'wash-wax-shampoo.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'wheel-tyre-cleaner'), 'wheel-tyre-cleaner.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'whitewall-blast'), 'whitewall-blast.png', 0);
INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'window-cleaner'), 'window-cleaner.png', 0);
