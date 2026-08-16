-- DetailCorner Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categories
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories on delete set null,
  name text not null,
  slug text not null unique,
  sku text not null unique,
  short_description text,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price >= 0),
  active boolean default true,
  featured boolean default false,
  stock_quantity integer default 0 check (stock_quantity >= 0),
  low_stock_threshold integer default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Product Variants
create table if not exists public.product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade not null,
  sku text not null unique,
  name text not null,
  size text,
  scent text,
  price numeric(10,2) not null check (price >= 0),
  stock_quantity integer default 0 check (stock_quantity >= 0),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Product Images
create table if not exists public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade not null,
  storage_path text not null,
  alt_text text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Addresses
create table if not exists public.addresses (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  is_default_billing boolean default false,
  is_default_shipping boolean default false,
  first_name text not null,
  last_name text not null,
  company text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  province text not null,
  postal_code text not null,
  country text not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Shipping Methods
create table if not exists public.shipping_methods (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Coupons
create table if not exists public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  active boolean default true,
  start_date timestamp with time zone,
  expiry_date timestamp with time zone,
  usage_limit integer,
  usage_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Orders
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null unique,
  customer_id uuid references public.profiles on delete set null,
  email text not null,
  customer_name text not null,
  phone text,
  billing_information jsonb not null,
  shipping_information jsonb not null,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  discount_amount numeric(10,2) default 0 check (discount_amount >= 0),
  shipping_amount numeric(10,2) default 0 check (shipping_amount >= 0),
  total numeric(10,2) not null check (total >= 0),
  tax_amount numeric(10,2) default 0,
  currency text default 'ZAR' not null,
  status text not null default 'PENDING_PAYMENT' check (status in ('PENDING_PAYMENT', 'PAYMENT_FAILED', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED')),
  is_pos boolean default false,
  tracking_number text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Order Items
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products on delete set null,
  variant_id uuid references public.product_variants on delete set null,
  product_name_snapshot text not null,
  sku_snapshot text not null,
  variant_snapshot text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total numeric(10,2) not null check (total >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Payments
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade not null,
  provider text not null default 'PayFast',
  provider_reference text,
  amount numeric(10,2) not null,
  currency text default 'ZAR' not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Payment Events
create table if not exists public.payment_events (
  id uuid default uuid_generate_v4() primary key,
  payment_id uuid references public.payments on delete cascade not null,
  event_type text not null,
  payload jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Order Status History
create table if not exists public.order_status_history (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade not null,
  previous_status text,
  new_status text not null,
  changed_by uuid references auth.users on delete set null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Admin Audit Log
create table if not exists public.admin_audit_log (
  id uuid default uuid_generate_v4() primary key,
  administrator_id uuid references auth.users on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  relevant_information jsonb,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Announcements
create table if not exists public.announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text,
  category text default 'PROMOTION',
  type text default 'PROMOTION' check (type in ('PROMOTION', 'NEWS', 'COMPETITION', 'ALERT')),
  image_url text,
  visible boolean default true,
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Ensure columns exist and remove old ones
do $$ 
begin
  -- Add new ones
  if not exists (select 1 from information_schema.columns where table_name='announcements' and column_name='content') then
    alter table public.announcements add column content text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='announcements' and column_name='start_date') then
    alter table public.announcements add column start_date timestamp with time zone default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_name='announcements' and column_name='end_date') then
    alter table public.announcements add column end_date timestamp with time zone;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='announcements' and column_name='type') then
    alter table public.announcements add column type text default 'PROMOTION' check (type in ('PROMOTION', 'NEWS', 'COMPETITION', 'ALERT'));
  end if;
  
  -- Remove redundant/conflicting ones
  if exists (select 1 from information_schema.columns where table_name='announcements' and column_name='date_range') then
    alter table public.announcements drop column date_range;
  end if;
end $$;

-- 16. Contact Messages
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'UNREAD' check (status in ('UNREAD', 'READ', 'ARCHIVED')),
  created_at timestamp with time zone default now()
);

-- 17. Gallery
create table if not exists public.gallery (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  url text not null,
  tags text,
  type text default 'IMAGE' check (type in ('IMAGE', 'VIDEO')),
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- 18. Store Settings
create table if not exists public.store_settings (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value text,
  description text,
  updated_at timestamp with time zone default now()
);

-- 19. Inventory Logs
create table if not exists public.inventory_logs (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade,
  variant_id uuid references public.product_variants on delete cascade,
  change_amount integer not null,
  reason text,
  reference_id text,
  created_at timestamp with time zone default now()
);

-- View for reserved stock (Pending Payment orders)
create or replace view public.reserved_stock as
select 
  oi.product_id, 
  oi.variant_id, 
  sum(oi.quantity) as quantity
from public.order_items oi
join public.orders o on o.id = oi.order_id
where o.status = 'PENDING_PAYMENT'
group by oi.product_id, oi.variant_id;

-- Indexes for performance
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists payments_order_id_idx on public.payments(order_id);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.order_status_history enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.announcements enable row level security;
alter table public.contact_messages enable row level security;
alter table public.gallery enable row level security;
alter table public.store_settings enable row level security;
alter table public.inventory_logs enable row level security;

-- Function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
declare
  is_admin boolean;
begin
  select profiles.is_admin into is_admin from public.profiles where id = auth.uid();
  return coalesce(is_admin, false);
end;
$$ language plpgsql security definer;

-- RLS Policies

-- Profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Categories
drop policy if exists "Categories are viewable by everyone." on public.categories;
create policy "Categories are viewable by everyone." on public.categories for select using (true);

drop policy if exists "Admins can manage categories." on public.categories;
create policy "Admins can manage categories." on public.categories using (public.is_admin());

-- Products
drop policy if exists "Active products are viewable by everyone." on public.products;
create policy "Active products are viewable by everyone." on public.products for select using (active = true or public.is_admin());

drop policy if exists "Admins can manage products." on public.products;
create policy "Admins can manage products." on public.products using (public.is_admin());

-- Product Variants
drop policy if exists "Active variants are viewable by everyone." on public.product_variants;
create policy "Active variants are viewable by everyone." on public.product_variants for select using (active = true or public.is_admin());

drop policy if exists "Admins can manage product variants." on public.product_variants;
create policy "Admins can manage product variants." on public.product_variants using (public.is_admin());

-- Product Images
drop policy if exists "Product images are viewable by everyone." on public.product_images;
create policy "Product images are viewable by everyone." on public.product_images for select using (true);

drop policy if exists "Admins can manage product images." on public.product_images;
create policy "Admins can manage product images." on public.product_images using (public.is_admin());

-- Addresses
drop policy if exists "Users can view their own addresses." on public.addresses;
create policy "Users can view their own addresses." on public.addresses for select using (auth.uid() = profile_id);

drop policy if exists "Users can manage their own addresses." on public.addresses;
create policy "Users can manage their own addresses." on public.addresses for all using (auth.uid() = profile_id);

-- Shipping Methods
drop policy if exists "Active shipping methods are viewable by everyone." on public.shipping_methods;
create policy "Active shipping methods are viewable by everyone." on public.shipping_methods for select using (active = true or public.is_admin());

drop policy if exists "Admins can manage shipping methods." on public.shipping_methods;
create policy "Admins can manage shipping methods." on public.shipping_methods using (public.is_admin());

-- Coupons
drop policy if exists "Admins can manage coupons." on public.coupons;
create policy "Admins can manage coupons." on public.coupons using (public.is_admin());

-- Orders
drop policy if exists "Users can view their own orders." on public.orders;
create policy "Users can view their own orders." on public.orders for select using (auth.uid() = customer_id or customer_id is null or public.is_admin());

drop policy if exists "Users can insert their own orders." on public.orders;
create policy "Users can insert their own orders." on public.orders for insert with check (auth.uid() = customer_id or customer_id is null);

drop policy if exists "Users can update their own orders." on public.orders;
create policy "Users can update their own orders." on public.orders for update using (auth.uid() = customer_id or customer_id is null or public.is_admin());

drop policy if exists "Admins can manage orders." on public.orders;
create policy "Admins can manage orders." on public.orders using (public.is_admin());

-- Order Items
drop policy if exists "Users can view their own order items." on public.order_items;
create policy "Users can view their own order items." on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.customer_id = auth.uid() or orders.customer_id is null or public.is_admin()))
);

drop policy if exists "Users can insert order items." on public.order_items;
create policy "Users can insert order items." on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.customer_id = auth.uid() or orders.customer_id is null or public.is_admin()))
);

drop policy if exists "Admins can manage order items." on public.order_items;
create policy "Admins can manage order items." on public.order_items using (public.is_admin());

-- Payments, Payment Events, Order Status History, Admin Audit Log
drop policy if exists "Admins can view and manage payments." on public.payments;
create policy "Admins can view and manage payments." on public.payments using (public.is_admin());

drop policy if exists "Users can insert payments for their orders." on public.payments;
create policy "Users can insert payments for their orders." on public.payments for insert with check (
  exists (select 1 from public.orders where orders.id = payments.order_id and (orders.customer_id = auth.uid() or orders.customer_id is null or public.is_admin()))
);

drop policy if exists "Admins can view payment events." on public.payment_events;
create policy "Admins can view payment events." on public.payment_events for select using (public.is_admin());

drop policy if exists "Users can view own order history." on public.order_status_history;
create policy "Users can view own order history." on public.order_status_history for select using (
  exists (select 1 from public.orders where orders.id = order_status_history.order_id and (orders.customer_id = auth.uid() or public.is_admin()))
);

drop policy if exists "Admins can manage order history." on public.order_status_history;
create policy "Admins can manage order history." on public.order_status_history using (public.is_admin());

drop policy if exists "Admins can view audit logs." on public.admin_audit_log;
create policy "Admins can view audit logs." on public.admin_audit_log for select using (public.is_admin());

-- Announcements
drop policy if exists "Announcements are viewable by everyone" on public.announcements;
create policy "Announcements are viewable by everyone" on public.announcements for select using (true);
drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements" on public.announcements using (public.is_admin());

-- Contact Messages
drop policy if exists "Anyone can insert contact messages" on public.contact_messages;
create policy "Anyone can insert contact messages" on public.contact_messages for insert with check (true);
drop policy if exists "Admins can manage contact messages" on public.contact_messages;
create policy "Admins can manage contact messages" on public.contact_messages using (public.is_admin());

-- Gallery
drop policy if exists "Gallery is viewable by everyone" on public.gallery;
create policy "Gallery is viewable by everyone" on public.gallery for select using (true);
drop policy if exists "Admins can manage gallery" on public.gallery;
create policy "Admins can manage gallery" on public.gallery using (public.is_admin());

-- Store Settings
drop policy if exists "Settings are viewable by everyone" on public.store_settings;
create policy "Settings are viewable by everyone" on public.store_settings for select using (true);
drop policy if exists "Admins can manage settings" on public.store_settings;
create policy "Admins can manage settings" on public.store_settings using (public.is_admin());

-- Inventory Logs
drop policy if exists "Admins can view inventory logs" on public.inventory_logs;
create policy "Admins can view inventory logs" on public.inventory_logs for select using (public.is_admin());


-- Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_categories_updated_at on public.categories;
create trigger handle_categories_updated_at before update on public.categories for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_products_updated_at on public.products;
create trigger handle_products_updated_at before update on public.products for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_product_variants_updated_at on public.product_variants;
create trigger handle_product_variants_updated_at before update on public.product_variants for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_addresses_updated_at on public.addresses;
create trigger handle_addresses_updated_at before update on public.addresses for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_shipping_methods_updated_at on public.shipping_methods;
create trigger handle_shipping_methods_updated_at before update on public.shipping_methods for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_coupons_updated_at on public.coupons;
create trigger handle_coupons_updated_at before update on public.coupons for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_announcements_updated_at on public.announcements;
create trigger handle_announcements_updated_at before update on public.announcements for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_store_settings_updated_at on public.store_settings;
create trigger handle_store_settings_updated_at before update on public.store_settings for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_orders_updated_at on public.orders;
create trigger handle_orders_updated_at before update on public.orders for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_payments_updated_at on public.payments;
create trigger handle_payments_updated_at before update on public.payments for each row execute procedure public.handle_updated_at();

-- Trigger for new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, is_admin)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', false);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Default Admin Creation (Optional, you can set the first user as admin manually)
-- update public.profiles set is_admin = true where email = 'admin@example.com';

-- Product Reviews
create table if not exists public.product_reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade not null,
  profile_id uuid references public.profiles on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.product_reviews enable row level security;

drop policy if exists "Reviews are viewable by everyone." on public.product_reviews;
create policy "Reviews are viewable by everyone." on public.product_reviews for select using (true);

drop policy if exists "Authenticated users can insert reviews." on public.product_reviews;
create policy "Authenticated users can insert reviews." on public.product_reviews for insert to authenticated with check (true);

drop policy if exists "Users can update their own reviews." on public.product_reviews;
create policy "Users can update their own reviews." on public.product_reviews for update using (auth.uid() = profile_id);

drop policy if exists "Users can delete their own reviews." on public.product_reviews;
create policy "Users can delete their own reviews." on public.product_reviews for delete using (auth.uid() = profile_id);

-- Trigger to automatically track order status history
create or replace function public.handle_order_status_change()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.order_status_history (order_id, previous_status, new_status, reason)
    values (new.id, null, new.status, 'Order created');
  elsif (tg_op = 'UPDATE' and old.status is distinct from new.status) then
    insert into public.order_status_history (order_id, previous_status, new_status, reason)
    values (new.id, old.status, new.status, 'Status updated');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_order_status_changed on public.orders;
create trigger on_order_status_changed
  after insert or update on public.orders
  for each row execute procedure public.handle_order_status_change();

-- Automatic stock deduction
create or replace function public.deduct_stock_on_payment()
returns trigger as $$
declare
  v_should_deduct boolean := false;
begin
  -- Logic: Deduct if status moves to PAID or PROCESSING for the first time
  if (TG_OP = 'INSERT') then
    if (new.status = 'PAID' or new.status = 'PROCESSING') then
      v_should_deduct := true;
    end if;
  elsif (TG_OP = 'UPDATE') then
    if (old.status = 'PENDING_PAYMENT' and (new.status = 'PAID' or new.status = 'PROCESSING')) then
      v_should_deduct := true;
    end if;
  end if;

  if (v_should_deduct) then
    -- Deduct for Products (if no variant)
    update public.products p
    set stock_quantity = p.stock_quantity - oi.quantity
    from public.order_items oi
    where oi.order_id = new.id and oi.product_id = p.id and oi.variant_id is null;

    -- Deduct for Product Variants
    update public.product_variants pv
    set stock_quantity = pv.stock_quantity - oi.quantity
    from public.order_items oi
    where oi.order_id = new.id and oi.variant_id = pv.id;
    
    -- Log the changes
    insert into public.inventory_logs (product_id, variant_id, change_amount, reason, reference_id)
    select product_id, variant_id, -quantity, 'Order ' || TG_OP || ': ' || new.order_number, new.id::text
    from public.order_items
    where order_id = new.id;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_order_paid_deduct_stock on public.orders;
create trigger on_order_paid_deduct_stock
  after insert or update on public.orders
  for each row execute procedure public.deduct_stock_on_payment();
create table if not exists public.order_sequences (
  sequence_date date primary key,
  next_value integer not null default 1
);

create or replace function public.generate_order_number()
returns text
language plpgsql
security definer
as $$
declare
  v_today date;
  v_next_val integer;
  v_order_number text;
begin
  v_today := current_date;

  insert into public.order_sequences (sequence_date, next_value)
  values (v_today, 2)
  on conflict (sequence_date) do update
  set next_value = order_sequences.next_value + 1
  returning (next_value - 1) into v_next_val;
  
  v_order_number := 'DC-' || to_char(v_today, 'YYYYMMDD') || '-' || v_next_val::text;
  return v_order_number;
end;
$$;

grant execute on function public.generate_order_number() to anon, authenticated;
grant select, insert, update on public.order_sequences to anon, authenticated;
create table if not exists public.pos_order_sequences (
  sequence_date date primary key,
  next_value integer not null default 1
);

create or replace function public.generate_pos_order_number()
returns text
language plpgsql
security definer
as $$
declare
  v_today date;
  v_next_val integer;
  v_order_number text;
begin
  v_today := current_date;

  insert into public.pos_order_sequences (sequence_date, next_value)
  values (v_today, 2)
  on conflict (sequence_date) do update
  set next_value = pos_order_sequences.next_value + 1
  returning (next_value - 1) into v_next_val;
  
  v_order_number := 'POS-' || to_char(v_today, 'YYYYMMDD') || '-' || v_next_val::text;
  return v_order_number;
end;
$$;

grant execute on function public.generate_pos_order_number() to anon, authenticated;
grant select, insert, update on public.pos_order_sequences to anon, authenticated;

-- Function for secure public order tracking
create or replace function public.track_order(p_order_number text, p_email text)
returns json as $$
declare
  v_order_id uuid;
  v_order_data json;
  v_history_data json;
begin
  -- Find the order matching both number and email (case insensitive email)
  select id into v_order_id
  from public.orders
  where (order_number = p_order_number or id::text = p_order_number)
    and lower(email) = lower(p_email)
  limit 1;

  if v_order_id is null then
    return null;
  end if;

  -- Get order details with items
  select json_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'created_at', o.created_at,
    'total', o.total,
    'tracking_number', o.tracking_number,
    'order_items', (
      select json_agg(json_build_object(
        'product_name_snapshot', oi.product_name_snapshot,
        'variant_snapshot', oi.variant_snapshot,
        'quantity', oi.quantity,
        'total', oi.total
      ))
      from public.order_items oi
      where oi.order_id = o.id
    )
  ) into v_order_data
  from public.orders o
  where o.id = v_order_id;

  -- Get status history
  select json_agg(h) into v_history_data
  from (
    select id, new_status, reason, created_at
    from public.order_status_history
    where order_id = v_order_id
    order by created_at desc
  ) h;

  return json_build_object(
    'order', v_order_data,
    'history', coalesce(v_history_data, '[]'::json)
  );
end;
$$ language plpgsql security definer;

grant execute on function public.track_order(text, text) to anon, authenticated;
