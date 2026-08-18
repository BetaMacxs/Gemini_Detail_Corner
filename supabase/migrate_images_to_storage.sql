-- Product Images Migration to Supabase Storage
DELETE FROM public.product_images;

INSERT INTO public.product_images (product_id, storage_path, sort_order) VALUES ((SELECT id FROM public.products WHERE slug = 'air-freshener'), 'air-freshener.png', 0);
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

