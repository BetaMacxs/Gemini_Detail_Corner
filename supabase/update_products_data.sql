-- DETAILCORNER DATABASE MIGRATION
-- Updates specifications, highlights, application steps and categories for all 31 catalog products.

-- 1. Ensure categories exist with exact IDs and slugs
INSERT INTO public.categories (name, slug, active, sort_order) VALUES
  ('Exterior Maintenance', 'exterior', true, 1),
  ('Wheel & Tyre Care', 'wheels', true, 2),
  ('Interior Detail', 'interior', true, 3),
  ('Professional Accessories', 'accessories', true, 4)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order;

-- 2. Update each product with unique data

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Formulation":"Carnauba & Polymer Emulsion","Durability":"4-6 Weeks","Application":"Spray & Buff","Scent":"Sweet Banana","Safe On":"Paint, Glass, Chrome, Wraps"}'::jsonb,
  highlights = '["Instant Deep Wet-Look Gloss","Hydrophobic Water-Beading Shield","UV Inhibitors Prevent Sun Degradation","Safe on Ceramic Coatings & Paint Protection Film"]'::jsonb,
  application_steps = '[{"title":"Shake Well","instruction":"Shake bottle thoroughly. Work on a clean, dry, and cool vehicle in the shade."},{"title":"Mist Section","instruction":"Mist a light, even coat directly onto a single body panel or onto a clean microfiber towel."},{"title":"Spread & Level","instruction":"Gently spread the product using a plush microfiber cloth to ensure complete coverage."},{"title":"Buff to High Gloss","instruction":"Flip to a clean, dry side of the microfiber towel and buff lightly to reveal a streak-free, mirror-like gloss."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'spray-wax';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Kit Contents":"6 Full-Size 500ml Bottles","Includes":"Tyre & Trim, Shampoo, Spray Wax, Interior, Wheel & Air Freshener","Target":"Complete Vehicle Detail","Skill Level":"Enthusiast to Pro"}'::jsonb,
  highlights = '["Comprehensive All-in-One Detailing System","Covers Wheels, Exterior Wash, Protection & Cabin Care","Full-Size 500ml Pro-Grade Formulations","Maximum Value for Complete Interior & Exterior Rejuvenation"]'::jsonb,
  application_steps = '[{"title":"Wheel & Tyre Stage","instruction":"Decontaminate rims with Wheel Cleaner and dress tyres with Tyre & Trim for deep satin protection."},{"title":"Exterior Wash & Dry","instruction":"Lather vehicle with High-Foam Shampoo, rinse thoroughly, and dry using a plush drying towel."},{"title":"Paint Protection","instruction":"Apply Spray Wax panel-by-panel, buffing with a clean microfiber cloth for instant gloss and beading."},{"title":"Cabin Cleanse & Fragrance","instruction":"Wipe interior trim with Interior Cleaner and finish with a spritz of Air Freshener."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'ultimate-shine-kit';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'wheels' LIMIT 1),
  specifications = '{"Base":"Silicone-Free Solvent Gel","Finish":"High Gloss Wet Look","Sling Resistance":"100% Zero-Sling Formula","Durability":"3-4 Weeks Weather Resistant","Protection":"UV Barrier Shield"}'::jsonb,
  highlights = '["Ultra-High Wet Gloss Finish","Advanced Zero-Sling Quick-Bond Chemistry","Prevents Browning, Cracking & Dry Rot","Silicone-Free & Body Shop Safe"]'::jsonb,
  application_steps = '[{"title":"Deep Clean Tyres","instruction":"Thoroughly scrub tyre sidewalls with Wheel & Tyre Cleaner to strip old dressings and allow dry time."},{"title":"Apply to Pad","instruction":"Dispense a line of Clear Tyre Shine gel directly onto a contoured foam tyre applicator."},{"title":"Work Into Grooves","instruction":"Smooth the gel evenly into tyre treads and sidewall lettering with overlapping strokes."},{"title":"Cure Time","instruction":"Allow 10-15 minutes to dry before driving. Apply a second coat for maximum wet-look gloss."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'clear-tyre-shine';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Abrasive Level":"Ultra-Fine Finishing Polish","Pad Compatibility":"Finishing Foam Pad / Hand Pad","Working Time":"Long Working Cycle","Dusting":"Zero Dust Formula","Finish":"Mirror Reflection Optical Clarity"}'::jsonb,
  highlights = '["Eliminates Light Swirls, Holograms & Buffer Trails","Restores Deep Optical Paint Clarity","Zero Dusting & Effortless Wipe-Off","Safe for Clear Coats, Gelcoats & Soft Japanese Paints"]'::jsonb,
  application_steps = '[{"title":"Decontaminate Paint","instruction":"Wash and clay the vehicle to remove all bonded above-surface contaminants."},{"title":"Pad Preparation","instruction":"Apply 3-4 pea-sized drops of Crystal Gloss to a soft foam finishing pad."},{"title":"Work Panel","instruction":"Polish in a 2x2 ft crosshatch pattern at medium speed until polish turns translucent."},{"title":"Wipe & Inspect","instruction":"Wipe clean with a 450 GSM edgeless microfiber towel under inspection lighting."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'crystal-gloss';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'interior' LIMIT 1),
  specifications = '{"Finish":"OEM Matte / Satin (Non-Greasy)","UV Protection":"SPF 50+ Broad Spectrum UV Blockers","Anti-Static":"Advanced Dust Repellent Technology","Scent":"Signature New Car Aroma","Surface Safe":"Vinyl, Plastic, Rubber, Sealed Leather"}'::jsonb,
  highlights = '["Factory Original Non-Sticky Satin Finish","Prevents Dashboard Fading & Heat Cracking","Anti-Static Repels Dust for Weeks","Eliminates Dangerous Windshield Glare"]'::jsonb,
  application_steps = '[{"title":"Pre-Clean","instruction":"Remove loose grime with Interior Cleaner and allow surfaces to dry."},{"title":"Apply to Applicator","instruction":"Spray 2-3 pumps onto a microfiber applicator pad rather than directly on electronics."},{"title":"Spread Evenly","instruction":"Wipe smoothly across dashboard, door cards, and interior trim."},{"title":"Level Off","instruction":"Wait 60 seconds and buff lightly with a dry microfiber cloth to lock in the matte OEM look."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'dash-flash';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Concentration":"Industrial Heavy Duty","Dilution Ratio":"Heavy Grease: Neat | Engine: 1:5 | Light: 1:10","pH Level":"Alkaline 11.5","Rinsing":"100% Water Soluble Rapid Rinse","Action Time":"2-5 Minutes Penetration"}'::jsonb,
  highlights = '["Dissolves Heavy Oil, Sludge & Road Tar Instantly","Fast-Acting Emulsifying Detergents","Safe for Engine Components, Wheel Wells & Underbody","Concentrated Formula for Maximum Cost Efficiency"]'::jsonb,
  application_steps = '[{"title":"Cool Engine / Surface","instruction":"Ensure the engine and components are cool to the touch and out of direct sun."},{"title":"Spray Generously","instruction":"Spray directly onto greasy surfaces, engine bays, or suspension components."},{"title":"Agitate Grime","instruction":"Use a stiff detailing brush to agitate stubborn oil build-up and heavy grease."},{"title":"High-Pressure Rinse","instruction":"Rinse thoroughly with a steady stream of water until runoff is completely clear."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'degreaser-pro';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'interior' LIMIT 1),
  specifications = '{"Material":"High-Density Natural Aroma Wood & Cord","Volume":"25ml Pure Concentrated Fragrance","Lifespan":"Up to 60 Days Continuous Release","Placement":"Rearview Mirror / Headrest","Refillable":"Yes"}'::jsonb,
  highlights = '["Premium Cologne-Grade Natural Essential Oils","Continuous Controlled Vapor Release","Sleek Minimalist Glass & Wood Hanging Bottle","Eliminates Unwanted Cabin Odors at Molecular Level"]'::jsonb,
  application_steps = '[{"title":"Unscrew Wooden Cap","instruction":"Unscrew the wooden lid and carefully remove the plastic security plug."},{"title":"Seal & Invert","instruction":"Screw the wooden lid back on tightly and invert the bottle for 3-5 seconds to saturate the wood."},{"title":"Hang Securely","instruction":"Hang freely from your rearview mirror, adjusting cord length so it does not obstruct vision."},{"title":"Refresh as Needed","instruction":"Invert for 2 seconds once a week to re-infuse the wooden diffuser top."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'airfreshener-hanger';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"pH Level":"7.0 Pure Neutral","Lubricity":"High-Slip Anti-Mar Polymers","Dilution":"50ml per 10 Litres Water (1:200)","Wax Strip Safe":"Preserves Existing Waxes & Sealants","Foam Profile":"Dense Clinging Suds"}'::jsonb,
  highlights = '["Gentle pH-Neutral Daily Maintenance Wash","Encapsulates Dirt Particles to Prevent Swirl Marks","Leaves No Water Spots or Film Residue","Safe on Ceramic Coatings, Sealants & Matte Finishes"]'::jsonb,
  application_steps = '[{"title":"Pre-Rinse","instruction":"Blast vehicle with high-pressure water to knock off heavy grit and dirt."},{"title":"Prepare Wash Buckets","instruction":"Add 50ml of Detail Prep Shampoo into a 10L bucket and froth with a water jet."},{"title":"Two-Bucket Wash","instruction":"Wash panel by panel from top to bottom, rinsing your wash mitt frequently."},{"title":"Sheet Rinse & Dry","instruction":"Rinse thoroughly with an open hose flow and dry with a plush microfibre drying towel."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'detail-prep-shampoo';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Safety Rating":"Plastic, Rubber & Electrical Harness Safe","pH Level":"Balanced Alkaline 9.5","Foam Action":"Clinging Dirt-Lifting Foam","Biodegradable":"Yes, Eco-Safe Formulation","Scent":"Fresh Citrus"}'::jsonb,
  highlights = '["Cuts Road Filth, Oil Mist & Brake Dust Under Hood","Non-Corrosive to Aluminum Radiators & Brass Fittings","Revitalizes Faded Black Engine Covers & Hoses","Safe for Modern Hybrid & Electric Compartment Covers"]'::jsonb,
  application_steps = '[{"title":"Cover Sensitive Sensors","instruction":"Cover alternator, exposed air intake, and battery terminals with plastic bags."},{"title":"Spray Engine Bay","instruction":"Generously coat cold engine surfaces, firewall, and underside of hood."},{"title":"Detail with Brushes","instruction":"Agitate crevices, intake manifolds, and hose clamps with a soft detailing brush."},{"title":"Gentle Rinse","instruction":"Rinse on low pressure, dry with compressed air or towel, and apply Dash Flash to plastics."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'engine-cleaner';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Kit Size":"6-Piece Pro Bundle (500ml each)","Included Products":"Interior Cleaner, Wheel Cleaner, Quick Detailer, Shampoo, Tyre Shine, Air Freshener","Target":"Weekend Detail Transformation","Packaging":"Heavy Duty Box Set"}'::jsonb,
  highlights = '["Complete 360-Degree Detailing Solution","Curated for Quick, Dramatic Visual Results","Color-Coded Chemicals for Easy Identification","Exceptional Value for Detailing Enthusiasts"]'::jsonb,
  application_steps = '[{"title":"Wheels First","instruction":"Spray Wheel Cleaner onto dry rims, brush brake dust away, and rinse."},{"title":"Body Wash & Shine","instruction":"Wash with Shampoo, dry, and mist Quick Detailer for instant mirror reflection."},{"title":"Tyre Finish","instruction":"Coat rubber with Tyre Shine for a slick, rich black sidewall."},{"title":"Cockpit Touch-Up","instruction":"Wipe interior surfaces clean and finish with the included fresh Air Freshener."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'glowup-kit';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Foam Cannon Ratio":"100ml per 900ml Warm Water (1:9)","Bucket Ratio":"40ml per 10L Water","pH Level":"7.4 Neutral Touch-Safe","Cling Time":"8-12 Minutes Dwell Time","Fragrance":"Sweet Cherry Blossom"}'::jsonb,
  highlights = '["Produces Massive Avalanche-Style Snow Foam","Maximum Dwell Time Lifts & Softens Road Grime","Minimizes Contact Wash Scratches & Swirls","100% Safe for Ceramic Coats, Sealants & Gloss Wraps"]'::jsonb,
  application_steps = '[{"title":"Mix in Cannon","instruction":"Pour 100ml of Hyper Foam into your lance bottle and top up with warm water."},{"title":"Coat Vehicle","instruction":"Spray thick blanket of foam over entire dry vehicle starting from bottom to top."},{"title":"Dwell & Penetrate","instruction":"Allow foam to dwell for 5-8 minutes to dissolve and carry away loose dirt."},{"title":"Power Rinse","instruction":"Thoroughly rinse with a pressure washer before proceeding to the contact wash stage."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'hyper-foam-shampoo';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'wheels' LIMIT 1),
  specifications = '{"Reaction Indicator":"Color Changing (Clear to Deep Purple)","pH Level":"6.8 pH Balanced (Acid-Free)","Active Ingredient":"Sodium Thioglycolate Complex","Safe Surfaces":"Alloy Wheels, Clear Coat, Chrome, Glass","Odor":"Cherry Masked Fragrance"}'::jsonb,
  highlights = '["Chemically Neutralizes Embedded Sintered Iron & Brake Dust","Visible Color Changing Reaction Proves Contaminant Removal","Prevents Paint Pitting & Sub-Surface Rust Spots","Acid-Free Formula Safe on All Factory OEM & Aftermarket Rims"]'::jsonb,
  application_steps = '[{"title":"Ensure Cool Surface","instruction":"Never apply in direct sunlight or on warm wheels/paintwork."},{"title":"Spray Evenly","instruction":"Spray liberal mist across wheels and lower vehicle body panels."},{"title":"Observe Reaction","instruction":"Wait 3-5 minutes as the liquid turns intensely purple, dissolving iron particles."},{"title":"Agitate & Rinse","instruction":"Agitate stubborn areas with a detail brush and pressure rinse completely."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'iron-remover';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'accessories' LIMIT 1),
  specifications = '{"GSM":"400 GSM Plush Dual-Pile","Blend":"80/20 Polyester/Polyamide Premium Weave","Dimensions":"40cm x 40cm Edgeless Laser-Cut","Lint Free":"100% Guaranteed Non-Shedding","Wash Cycles":"500+ Machine Washes"}'::jsonb,
  highlights = '["Scratch-Free Edgeless Ultrasonic Border","Short Pile for Wax/Coating Removal, Long Pile for Buffing","Traps Micro-Dust Deep within Fibers","Ideal for Quick Detailers, Glass, Interior & Wax Buffing"]'::jsonb,
  application_steps = '[{"title":"Fold in Four","instruction":"Fold towel twice into a square to provide 8 fresh, clean wiping faces."},{"title":"Linear Strokes","instruction":"Wipe in straight, overlapping lines rather than circular motions to prevent marring."},{"title":"Flip to Clean Face","instruction":"Flip to a fresh quarter as soon as dirt or residue begins loading on the towel."},{"title":"Washing Care","instruction":"Machine wash with dedicated microfiber detergent; do not use fabric softeners."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'microfibre-cloth';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'accessories' LIMIT 1),
  specifications = '{"GSM":"700 GSM Heavyweight Twisted Loop","Size":"60cm x 90cm Jumbo Extra Large","Absorption":"Holds Over 3.5 Litres of Water","Edge Construction":"Soft Hidden-Stitch Silk Edge","Color":"Stealth Grey / Red Border"}'::jsonb,
  highlights = '["Dries an Entire Full-Size SUV in a Single Pass","Twisted-Loop Technology Glides Without Paint Drag","Completely Scratch-Free & Streak-Free Finish","Eliminates Water Spotting on Hot Summer Days"]'::jsonb,
  application_steps = '[{"title":"Spread Across Panel","instruction":"Lay the drying towel flat across the hood or roof of the freshly rinsed vehicle."},{"title":"Pull by Corners","instruction":"Gently draw the towel toward you by the two top corners without applying downward pressure."},{"title":"Pat Lower Panels","instruction":"Pat or wipe vertical body sides to absorb remaining water droplets."},{"title":"Air Dry","instruction":"Hang in a dust-free environment to air dry after use."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'microfibre-dryingtowel';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'wheels' LIMIT 1),
  specifications = '{"Base Formula":"Water-Based Emulsion with Nano-Polymers","Finish":"Factory Satin / Natural Dark Black","UV Protection":"SPF 45 UV Blocking Absorbers","Dust Attraction":"Zero Static Attraction","Dilutable":"Ready-to-Use"}'::jsonb,
  highlights = '["Restores Natural Factory OEM Satin Tyre Look","Non-Sticky Water-Based Formula That Will Not Sling","Moisturizes Rubber to Prevent Sidewall Cracking & Browning","Safe for Plastic Bumper Trim, Wheel Arch Liners & Engine Bay"]'::jsonb,
  application_steps = '[{"title":"Clean Tyre","instruction":"Scrub tyre thoroughly with Wheel & Tyre Cleaner to remove road oils."},{"title":"Apply to Sponge","instruction":"Dispense 2-3 coin-sized drops onto a contoured tyre applicator sponge."},{"title":"Work Across Sidewall","instruction":"Smooth the lotion evenly along the tyre curve, working into lettering."},{"title":"Dry & Matte Finish","instruction":"Dries completely within 5 minutes to a deep, non-greasy satin sheen."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'milky-tyre-shine';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Active Content":"Polymer & SiO2 Fortified Detail Spray","pH Level":"7.0 Neutral","Durability":"2-3 Weeks Slick Barrier","Scent":"Tropical Cherry Blast","Safe Surfaces":"Paint, Glass, Plastic, Chrome, Carbon Fiber"}'::jsonb,
  highlights = '["Safely Lifts Fingerprints, Light Dust & Bird Droppings","Instantly Boosts Gloss, Depth & Surface Slickness","Reinforces Existing Waxes, Sealants & Ceramic Coatings","Streak-Free Formulation Even in Warm Conditions"]'::jsonb,
  application_steps = '[{"title":"Target Panel","instruction":"Work on one panel at a time out of direct blazing sunlight."},{"title":"Light Mist","instruction":"Mist lightly over the target surface or directly onto a 400 GSM microfiber towel."},{"title":"Wipe Clean","instruction":"Wipe in one direction using the towel to pick up dust and light contaminants."},{"title":"Buff to Glow","instruction":"Flip to a dry side and buff with rapid, light strokes to produce an instant shine."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'quick-detail';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Wax Type":"Liquid Carnauba & Reactive Silicone Polymers","Cure Time":"Instant (No Haze Wait Required)","Gloss Index":"98/100 Deep Reflective Shine","Durability":"Up to 8 Weeks","Scent":"Sweet Coconut"}'::jsonb,
  highlights = '["Lightning-Fast Wipe-On, Wipe-Off Application","Produces Deep, Warm Carnauba Glow on Dark Paints","Leaves Super Hydrophobic Water-Repelling Finish","Non-Staining on Black Rubber Trims & Badges"]'::jsonb,
  application_steps = '[{"title":"Wash Vehicle","instruction":"Ensure vehicle is completely clean and dry before wax application."},{"title":"Mist Section","instruction":"Spray 2-3 mists per half-panel on hood, doors, and fenders."},{"title":"Spread Evenly","instruction":"Spread with a soft microfiber towel to create an even, transparent film."},{"title":"Immediate Buff","instruction":"No need to wait for haze — buff immediately with a dry microfiber cloth to high gloss."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'quick-wax';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'accessories' LIMIT 1),
  specifications = '{"Material":"High-Density Dual-Layer Molded Foam","Grip":"Ergonomic Solid Grip Handle","Contour":"Curved Profile for Sidewall Matching","Durability":"Chemical Resistant & Reusable","Dimensions":"10cm x 6cm x 4cm"}'::jsonb,
  highlights = '["Ergonomic Grip Keeps Hands Clean & Dressing-Free","Curved Face Conforms Perfectly to Low & High Profile Tyres","Prevents Dressing Pooling in Wheel Rims & Grooves","Durable Foam Does Not Crumble or Degrade with Solvent Gels"]'::jsonb,
  application_steps = '[{"title":"Apply Product","instruction":"Pour a thin line of tyre shine along the curved center of the applicator."},{"title":"Place on Sidewall","instruction":"Position the curved foam face flush against the tyre sidewall."},{"title":"Glide Around Tyre","instruction":"Smoothly glide applicator in continuous circular strokes around the tyre circumference."},{"title":"Store Clean","instruction":"Store in a dedicated plastic bag after use to keep dust off the foam."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'tyre-applicator';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'wheels' LIMIT 1),
  specifications = '{"Formulation":"Multi-Surface Polymer Restorer","Target Surfaces":"Tyres, Exterior Plastic Trim, Rubbers, Bumpers","Finish":"Deep Rich Satin-Black OEM Finish","UV Protection":"Integrated Anti-Oxidant UV Absorbers","Durability":"Up to 30 Days"}'::jsonb,
  highlights = '["Dual-Purpose Dressing for Both Tyres & Faded Black Trim","Brings Sun-Faded Grey Plastics Back to Showroom Black","Non-Greasy Touch-Dry Finish Will Not Attract Dirt","Weather-Resistant Barrier Survives Multiple Rain Showers"]'::jsonb,
  application_steps = '[{"title":"Clean Surface","instruction":"Clean tyres and trim thoroughly with Degreaser or APC and let dry completely."},{"title":"Apply Dressing","instruction":"Dispense a small amount onto a foam applicator or microfiber pad."},{"title":"Work Into Texture","instruction":"Work into textured plastic moldings or tyre rubber using moderate pressure."},{"title":"Buff Excess","instruction":"After 5 minutes, wipe over with a dry microfiber cloth to remove any excess film."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'tyre-trim';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'interior' LIMIT 1),
  specifications = '{"Available Scents":"Sea Breeze, Cherry / Lavender, Summer Radiance","Base":"Fine Fragrance Oil & Pure Distilled Water","Volume":"100ml / 250ml / 5L Options","Longevity":"Long-Lasting Odor Neutralizing Formula","Safety":"Non-Staining on Fabric & Carpets"}'::jsonb,
  highlights = '["Premium Non-Masking Odor Encapsulation Technology","Eliminates Smoke, Pet & Food Odors at the Source","Refined Luxury Cologne Scents That Never Overwhelm","Safe to Mist onto Floor Mats, Fabric Seats & Boot Liners"]'::jsonb,
  application_steps = '[{"title":"Clean Cabin","instruction":"Vacuum interior carpets and wipe down dusty surfaces for best scent retention."},{"title":"Mist Footwells","instruction":"Spray 3-4 pumps into front and rear footwell carpets and under seats."},{"title":"Recirculate AC","instruction":"Turn on vehicle AC on recirculation mode for 2 minutes to distribute aroma evenly."},{"title":"Enjoy Fragrance","instruction":"Re-apply weekly or as needed to maintain a fresh showroom aroma."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'air-freshener';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'accessories' LIMIT 1),
  specifications = '{"Material":"Cross-Cut Honeycomb High-Density Foam","Absorption":"Holds Over 1 Litre of Soapy Water","Channel Design":"8-Way Dirt Trapping Channels","Size":"22cm x 11cm x 7cm Ergonomic Block","Safe On":"Clear Coats, Single Stage Paints, Wraps"}'::jsonb,
  highlights = '["Honeycomb Laser Cuts Pull Dirt Away from Paint Surface","Extreme Soap Retention Delivers Maximum Lubrication","Ergonomic Shape Fits Comfortably in Hand to Reduce Fatigue","Durable Commercial Grade Foam Resists Tearing"]'::jsonb,
  application_steps = '[{"title":"Submerge in Suds","instruction":"Immerse sponge in your wash bucket and squeeze several times to saturate."},{"title":"Glide Over Paint","instruction":"Glide across vehicle panels in straight lines with gentle, zero-pressure strokes."},{"title":"Rinse Frequently","instruction":"Rinse thoroughly in a grit-guard rinse bucket after every 2-3 panels."},{"title":"Clean & Store","instruction":"Rinse with clean water, squeeze out excess, and air dry in a shaded area."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'wash-sponge';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'interior' LIMIT 1),
  specifications = '{"pH Level":"8.5 Balanced Safe Alkaline","Active Agents":"Bio-Enzymatic Dirt Dissolvers","Safe On":"Dashboard, Door Panels, Leather, Vinyl, Fabrics","Scent":"Crisp Clean Linen","Residue":"100% Zero Sticky Residue"}'::jsonb,
  highlights = '["Multi-Surface Cleaner Lifts Ground-In Dirt, Body Oils & Stains","Safe for Sensitive Touchscreens & Modern Piano Black Trim","Natural Matte Finish Keeps Interiors Looking Factory Fresh","Anti-Bacterial Agents Leave Cabin Sanitized & Clean"]'::jsonb,
  application_steps = '[{"title":"Vacuum First","instruction":"Vacuum loose dust and grit from seats, carpets, and console areas."},{"title":"Spray on Towel / Brush","instruction":"Spray directly onto a microfiber cloth or soft detailing brush for precise control."},{"title":"Agitate Gently","instruction":"Gently agitate dirty areas, cup holders, and textured vinyl surfaces."},{"title":"Wipe with Dry Cloth","instruction":"Wipe away lifted grime with a clean, dry microfiber towel."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'interior-cleaner';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'wheels' LIMIT 1),
  specifications = '{"Formula":"2-in-1 Dual Action Degreaser & Brake Dust Dissolver","pH Level":"Non-Acidic Alkaline 10.0","Action":"Foams on Contact & Loosens Browning","Safe On":"Painted, Polished, Powder-Coated & Chrome Alloys","Dilution":"Ready-to-Use High Strength"}'::jsonb,
  highlights = '["Dissolves Stubborn Brake Dust & Brown Tyre Oxidation Together","Non-Acidic Chemistry Protects Expensive Brake Calipers & Lug Nuts","Foaming Spray Head Clings to Vertical Wheel Spokes","Prepares Tyre Sidewalls for Maximum Dressing Adhesion"]'::jsonb,
  application_steps = '[{"title":"Cool Wheels First","instruction":"Ensure wheels and brakes are completely cold before starting."},{"title":"Spray Rim & Rubber","instruction":"Liberally coat both the wheel faces, barrel, and tyre sidewall."},{"title":"Agitate with Brushes","instruction":"Scrub tyre with a stiff tyre brush and wheel spokes with a soft detail brush."},{"title":"High-Pressure Blast","instruction":"Rinse completely with strong water pressure until all brown foam is gone."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'wheel-tyre-cleaner';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Wax Content":"Genuine Brazilian Carnauba Emulsion","pH Level":"7.2 Neutral","Dilution":"40ml per 10 Litres Water (1:250)","Foam Rating":"Rich Conditioning Foam","Scent":"Sweet Grape Burst"}'::jsonb,
  highlights = '["Cleans Road Dirt While Depositing a Fresh Layer of Carnauba Wax","Enhances Paint Gloss & Depth with Every Routine Wash","High Lubricity Formula Prevents Swirl Marks & Wash Scratches","Accelerates Water Sheeting for Faster Towel Drying"]'::jsonb,
  application_steps = '[{"title":"Initial Rinse","instruction":"Pre-rinse the vehicle to blast away loose grit and heavy debris."},{"title":"Mix Wash Solution","instruction":"Add 40ml of Wash & Wax Shampoo into 10L of water and agitate with hose."},{"title":"Wash with Mitt","instruction":"Wash using a plush microfiber wash mitt from the roof downwards."},{"title":"Rinse & Dry","instruction":"Rinse thoroughly and dry with a plush towel to reveal the carnauba glow."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'wash-wax-shampoo';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'wheels' LIMIT 1),
  specifications = '{"Target":"Whitewall Tyres, White Lettering, Raised Tyre Text","Active Chemistry":"Bleaching & Heavy Degreasing Surfactants","pH Level":"High Alkaline 12.0","Action Time":"60 Seconds Rapid Whitening","Rinsing":"Free-Rinsing Formula"}'::jsonb,
  highlights = '["Instantly Restores Dingy, Yellowed Whitewalls to Brilliant White","Removes Embedded Road Tar, Brake Dust & Kerb Scuffs","Formulated Specifically for Classic Cars, Hot Rods & Cruiser Tyres","Safe for White Lettering on Off-Road & All-Terrain Tyres"]'::jsonb,
  application_steps = '[{"title":"Wet Tyre","instruction":"Wet the tyre surface with clean water."},{"title":"Spray Whitewall Area","instruction":"Spray Whitewall Blast directly onto the white rubber band or lettering."},{"title":"Scrub with Stiff Brush","instruction":"Scrub briskly with a firm nylon tyre brush for 30-60 seconds."},{"title":"Rinse Clean","instruction":"Rinse thoroughly with clean water to reveal glowing, factory-bright white rubber."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'whitewall-blast';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'interior' LIMIT 1),
  specifications = '{"Base":"Ammonia-Free Alcohol Solvent Blend","Tint Safe":"100% Safe for Aftermarket Window Films","Clarity":"Optically Clear Streak-Free Formula","Anti-Fog":"Mild Anti-Fog Hydrophobic Additives","Scent":"Fresh Mountain Air"}'::jsonb,
  highlights = '["Zero-Streak Crystal Optical Clarity on All Glass & Mirrors","Ammonia-Free Formula Will Not Bubble or Discolour Window Tint","Cuts Through Smoker Film, Vinyl Off-Gas Haze & Bug Splatters","Safe for Heads-Up Display Screens, Gauges & Mirrors"]'::jsonb,
  application_steps = '[{"title":"Spray on Glass or Towel","instruction":"For interior glass, mist onto towel to prevent overspray onto dashboard."},{"title":"Wipe in Cross Pattern","instruction":"Wipe horizontal inside the vehicle and vertical outside to track any missed spots."},{"title":"Flip to Dry Towel","instruction":"Immediately flip to a dry glass waffle-weave towel to buff to a crystal finish."},{"title":"Check in Sunlight","instruction":"Inspect from multiple angles to ensure complete streak-free clarity."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'window-cleaner';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'accessories' LIMIT 1),
  specifications = '{"Material":"PVA Synthetic Chamois with Internal Mesh","Texture":"Smooth Gliding Non-Sticking Surface","Absorption":"Absorbs 10x Its Weight in Water","Packaging":"Hard Plastic Storage Tube","Resistant":"Mildew & Chemical Resistant"}'::jsonb,
  highlights = '["Super Absorbent PVA Structure Dries Panels in Seconds","Glides Over Paintwork Without Grabbing or Sticking","Leaves Paint Surface Completely Dry & Lint-Free","Machine Washable & Long-Lasting for Years of Use"]'::jsonb,
  application_steps = '[{"title":"Moisten Before Use","instruction":"Rinse with warm water and wring out thoroughly before first contact."},{"title":"Glide Over Wet Panels","instruction":"Draw the chamois smoothly across wet surfaces to suck up standing water."},{"title":"Wring Out Moisture","instruction":"Wring out whenever saturated and continue drying."},{"title":"Store Damp in Tube","instruction":"Roll up and store slightly damp in its original tube to keep it soft and ready."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'absorber-chemois';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'accessories' LIMIT 1),
  specifications = '{"Grade":"Fine / Medium Detailing Grade Clay","Weight":"100g Contaminant-Safe Bar","Target Contaminants":"Tree Sap, Overspray, Industrial Fallout, Rail Dust","Box":"Reusable Airtight Plastic Storage Case","Reusability":"Up to 10-15 Vehicles per Bar"}'::jsonb,
  highlights = '["Pulls Bonded Contaminants Off Clear Coat for Glass-Smooth Paint","Essential Preparation Step Before Waxing, Polishing or Ceramic Coating","Safe on Paint, Chrome, Glass & Clear Optical Plastics","Prevents Scratches by Removing Above-Surface Grit Before Buffing"]'::jsonb,
  application_steps = '[{"title":"Knead into Disc","instruction":"Break off a third of the clay bar and flatten it into a palm-sized disc."},{"title":"Lubricate Panel Generously","instruction":"Spray Quick Detailer or clay lubricant liberally across a 2x2 ft section."},{"title":"Glide with Light Pressure","instruction":"Glide the clay disc in back-and-forth lines until the surface feels glass-smooth."},{"title":"Fold & Knead","instruction":"Fold the clay to expose a clean face before moving to the next section."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'clay-bar';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'accessories' LIMIT 1),
  specifications = '{"Set Quantity":"5-Piece Multi-Size Precision Detailing Brush Kit","Bristle Type":"Ultra-Soft Boar Hair & Synthetic Blend","Handle Material":"Chemical-Resistant Polypropylene Handle","Metal-Free":"100% Metal-Free Collar (Zero Scratch Risk)","Hanging Hole":"Yes for Easy Drying"}'::jsonb,
  highlights = '["5 Distinct Brush Sizes for Every Crevice, Badge & Air Vent","Ultra-Soft Bristles Will Not Scratch Sensitive Piano Black or Painted Rims","Resistant to Acidic Wheel Cleaners, Degreasers & Interior Solvents","Ergonomic Handles with Easy-Hang Holes for Clean Storage"]'::jsonb,
  application_steps = '[{"title":"Select Size","instruction":"Pick the appropriate brush diameter for vents, badges, lug nuts, or grilles."},{"title":"Apply Cleaner","instruction":"Spray your chosen cleaner directly onto the bristles or target surface."},{"title":"Agitate Crevices","instruction":"Gently work bristles into seams, lug nut recesses, and intricate trim."},{"title":"Rinse Bristles","instruction":"Rinse brushes under clean water after use and hang to air dry."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'detail-brushes';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Type":"Heavy Pre-Wash Dirt Loosening Snow Foam","Foam Lance Dilution":"1:5 to 1:10 Ratio with Warm Water","pH Level":"7.5 Safe Neutral","Dwell Time":"Up to 10 Minutes Hanging Foam","Fragrance":"Sweet Candy Apple"}'::jsonb,
  highlights = '["Creates a Thick Blanket of Foam That Clings to Vertical Panels","Softens and Encapsulates Road Filth Before You Touch the Paint","Greatly Reduces Risk of Swirl Marks and Wash Scratches","Completely Safe for Waxes, Sealants, PPF & Ceramic Coatings"]'::jsonb,
  application_steps = '[{"title":"Fill Lance Bottle","instruction":"Mix 100ml of Snow Foam with 900ml of warm water in your foam cannon bottle."},{"title":"Adjust Spray Pattern","instruction":"Set lance nozzle to wide fan and adjust top dial for thickest foam density."},{"title":"Cover Vehicle","instruction":"Foam entire vehicle thoroughly from bottom to top for maximum dwell coverage."},{"title":"Pressure Rinse Off","instruction":"Wait 5-8 minutes, then pressure rinse from top to bottom before contact wash."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'snow-foam';

UPDATE public.products
SET 
  category_id = (SELECT id FROM public.categories WHERE slug = 'exterior' LIMIT 1),
  specifications = '{"Abrasive Tech":"Diminishing Micro-Abrasive Compound","Cut Level":"Medium Cut 6/10","Gloss Level":"High Polish 9/10","Application":"By Hand or Dual-Action (DA) Polisher","Residue":"Easy Wipe-Off Clean Formula"}'::jsonb,
  highlights = '["Removes Moderate Swirls, Light Scratches, Water Spots & Oxidation","Restores Rich Color Depth and Mirror Reflections","Diminishing Micro-Abrasives Polish Down to a High Gloss Finish","Safe on Clear Coats, Gel Coats, Single-Stage & Metallic Paints"]'::jsonb,
  application_steps = '[{"title":"Wash & Clay","instruction":"Ensure vehicle is thoroughly washed, clayed, and dry before polishing."},{"title":"Apply 3-4 Drops","instruction":"Place 3-4 drops on a cutting pad or dense foam hand applicator."},{"title":"Work in Crosshatch","instruction":"Work over a 2x2 ft area in overlapping passes until the compound turns clear."},{"title":"Buff Clean","instruction":"Wipe away remaining haze with a clean 400 GSM microfiber towel and inspect."}]'::jsonb,
  updated_at = NOW()
WHERE slug = 'scratch-swirl-remover';
