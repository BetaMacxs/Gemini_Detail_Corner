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
  currency text default 'ZAR' not null,
  status text not null default 'PENDING_PAYMENT' check (status in ('PENDING_PAYMENT', 'PAYMENT_FAILED', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED')),
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
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Categories
create policy "Categories are viewable by everyone." on public.categories for select using (true);
create policy "Admins can manage categories." on public.categories using (public.is_admin());

-- Products
create policy "Active products are viewable by everyone." on public.products for select using (active = true or public.is_admin());
create policy "Admins can manage products." on public.products using (public.is_admin());

-- Product Variants
create policy "Active variants are viewable by everyone." on public.product_variants for select using (active = true or public.is_admin());
create policy "Admins can manage product variants." on public.product_variants using (public.is_admin());

-- Product Images
create policy "Product images are viewable by everyone." on public.product_images for select using (true);
create policy "Admins can manage product images." on public.product_images using (public.is_admin());

-- Addresses
create policy "Users can view their own addresses." on public.addresses for select using (auth.uid() = profile_id);
create policy "Users can manage their own addresses." on public.addresses for all using (auth.uid() = profile_id);

-- Shipping Methods
create policy "Active shipping methods are viewable by everyone." on public.shipping_methods for select using (active = true or public.is_admin());
create policy "Admins can manage shipping methods." on public.shipping_methods using (public.is_admin());

-- Coupons
create policy "Admins can manage coupons." on public.coupons using (public.is_admin());

-- Orders
create policy "Users can view their own orders." on public.orders for select using (auth.uid() = customer_id or public.is_admin());
create policy "Admins can manage orders." on public.orders using (public.is_admin());

-- Order Items
create policy "Users can view their own order items." on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.customer_id = auth.uid() or public.is_admin()))
);
create policy "Admins can manage order items." on public.order_items using (public.is_admin());

-- Payments, Payment Events, Order Status History, Admin Audit Log
create policy "Admins can view and manage payments." on public.payments using (public.is_admin());
create policy "Admins can view payment events." on public.payment_events for select using (public.is_admin());
create policy "Users can view own order history." on public.order_status_history for select using (
  exists (select 1 from public.orders where orders.id = order_status_history.order_id and (orders.customer_id = auth.uid() or public.is_admin()))
);
create policy "Admins can manage order history." on public.order_status_history using (public.is_admin());
create policy "Admins can view audit logs." on public.admin_audit_log for select using (public.is_admin());


-- Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger handle_categories_updated_at before update on public.categories for each row execute procedure public.handle_updated_at();
create trigger handle_products_updated_at before update on public.products for each row execute procedure public.handle_updated_at();
create trigger handle_product_variants_updated_at before update on public.product_variants for each row execute procedure public.handle_updated_at();
create trigger handle_addresses_updated_at before update on public.addresses for each row execute procedure public.handle_updated_at();
create trigger handle_shipping_methods_updated_at before update on public.shipping_methods for each row execute procedure public.handle_updated_at();
create trigger handle_coupons_updated_at before update on public.coupons for each row execute procedure public.handle_updated_at();
create trigger handle_orders_updated_at before update on public.orders for each row execute procedure public.handle_updated_at();
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

create policy "Reviews are viewable by everyone." on public.product_reviews for select using (true);
create policy "Authenticated users can insert reviews." on public.product_reviews for insert to authenticated with check (true);
create policy "Users can update their own reviews." on public.product_reviews for update using (auth.uid() = profile_id);
create policy "Users can delete their own reviews." on public.product_reviews for delete using (auth.uid() = profile_id);
