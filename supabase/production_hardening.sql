-- =====================================================================
-- DetailCorner Production Database Hardening & Schema Synchronization
-- =====================================================================

-- 1. Grant base table, sequence, and function permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- Grant permissions for views
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'reserved_stock') THEN
    EXECUTE 'GRANT SELECT ON public.reserved_stock TO anon, authenticated, service_role;';
  END IF;
END $$;

-- 2. Storage Setup (Buckets & Policies)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery', 'gallery', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/quicktime', 'video/webm']),
  ('products', 'products', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies: gallery
DROP POLICY IF EXISTS "Gallery items are publicly accessible" ON storage.objects;
CREATE POLICY "Gallery items are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Authenticated users can upload gallery items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated and authorized users can upload gallery items" ON storage.objects;
CREATE POLICY "Authenticated and authorized users can upload gallery items"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Authenticated and authorized users can update gallery items" ON storage.objects;
CREATE POLICY "Authenticated and authorized users can update gallery items"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Authenticated and authorized users can delete gallery items" ON storage.objects;
CREATE POLICY "Authenticated and authorized users can delete gallery items"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery');

-- Storage Policies: products
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated and authorized users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated and authorized users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Authenticated and authorized users can update product images" ON storage.objects;
CREATE POLICY "Authenticated and authorized users can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Authenticated and authorized users can delete product images" ON storage.objects;
CREATE POLICY "Authenticated and authorized users can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products');

-- 3. Row Level Security Hardening on Orders & Customer PII
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Public can view guest orders" ON public.orders;
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT USING (
  (auth.uid() IS NOT NULL AND auth.uid() = customer_id) OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can insert their own orders." ON public.orders;
CREATE POLICY "Users can insert their own orders." ON public.orders FOR INSERT WITH CHECK (
  auth.uid() = customer_id OR customer_id IS NULL
);

DROP POLICY IF EXISTS "Users can update their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins and service role can update orders." ON public.orders;
CREATE POLICY "Admins and service role can update orders." ON public.orders FOR UPDATE USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "Admins can manage orders." ON public.orders;
CREATE POLICY "Admins can manage orders." ON public.orders FOR ALL USING (
  public.is_admin()
);

-- 4. Order Items RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own order items." ON public.order_items;
CREATE POLICY "Users can view their own order items." ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
      AND ((auth.uid() IS NOT NULL AND orders.customer_id = auth.uid()) OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Users can insert order items." ON public.order_items;
CREATE POLICY "Users can insert order items." ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
      AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Admins can manage order items." ON public.order_items;
CREATE POLICY "Admins can manage order items." ON public.order_items FOR ALL USING (
  public.is_admin()
);

-- 5. Coupons RLS (Allow active coupons to be validated publicly)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active coupons are viewable by everyone." ON public.coupons;
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Active coupons are viewable by everyone." ON public.coupons FOR SELECT USING (
  active = true OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can manage coupons." ON public.coupons;
CREATE POLICY "Admins can manage coupons." ON public.coupons FOR ALL USING (
  public.is_admin()
);

-- 6. Shipping Methods RLS
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active shipping methods are viewable by everyone." ON public.shipping_methods;
CREATE POLICY "Active shipping methods are viewable by everyone." ON public.shipping_methods FOR SELECT USING (
  active = true OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can manage shipping methods." ON public.shipping_methods;
CREATE POLICY "Admins can manage shipping methods." ON public.shipping_methods FOR ALL USING (
  public.is_admin()
);

-- 7. Addresses RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (
  (auth.uid() IS NOT NULL AND auth.uid() = profile_id) OR public.is_admin()
) WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = profile_id) OR public.is_admin()
);

-- 8. Order Status History RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order history." ON public.order_status_history;
CREATE POLICY "Users can view own order history." ON public.order_status_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_history.order_id 
      AND ((auth.uid() IS NOT NULL AND orders.customer_id = auth.uid()) OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Admins can manage order history." ON public.order_status_history;
CREATE POLICY "Admins can manage order history." ON public.order_status_history FOR ALL USING (
  public.is_admin()
);

-- 9. Announcements, Gallery, Store Settings RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active announcements viewable by everyone" ON public.announcements;
CREATE POLICY "Active announcements viewable by everyone" ON public.announcements FOR SELECT USING (
  visible = true OR public.is_admin()
);
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (
  public.is_admin()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active gallery viewable by everyone" ON public.gallery;
CREATE POLICY "Active gallery viewable by everyone" ON public.gallery FOR SELECT USING (
  true
);
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (
  public.is_admin()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.store_settings;
CREATE POLICY "Settings viewable by everyone" ON public.store_settings FOR SELECT USING (
  true
);
DROP POLICY IF EXISTS "Admins can manage settings" ON public.store_settings;
CREATE POLICY "Admins can manage settings" ON public.store_settings FOR ALL USING (
  public.is_admin()
);

-- 10. Contact messages RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (
  true
);
DROP POLICY IF EXISTS "Admins can view and manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view and manage contact messages" ON public.contact_messages FOR ALL USING (
  public.is_admin()
);

-- 11. Inventory logs and Notifications RLS
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage inventory logs" ON public.inventory_logs;
CREATE POLICY "Admins can manage inventory logs" ON public.inventory_logs FOR ALL USING (
  public.is_admin()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR public.is_admin()
);

-- 12. Deploy track_order RPC Function
CREATE OR REPLACE FUNCTION public.track_order(p_order_number text, p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order json;
  v_history json;
BEGIN
  SELECT row_to_json(o) INTO v_order FROM (
    SELECT orders.*, 
      (SELECT json_agg(row_to_json(oi)) FROM public.order_items oi WHERE oi.order_id = orders.id) AS order_items
    FROM public.orders 
    WHERE TRIM(LOWER(order_number)) = TRIM(LOWER(p_order_number)) 
      AND TRIM(LOWER(email)) = TRIM(LOWER(p_email))
  ) o;
  
  IF v_order IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT json_agg(h ORDER BY created_at DESC) INTO v_history 
  FROM public.order_status_history h 
  WHERE h.order_id = (v_order->>'id')::uuid;

  RETURN json_build_object(
    'order', v_order,
    'history', COALESCE(v_history, '[]'::json)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated, service_role;
