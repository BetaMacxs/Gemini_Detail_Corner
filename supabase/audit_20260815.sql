-- DetailCorner Database Audit & Fixes (2026-08-15)
-- Targeted changes to align with project requirements

-- 1. VAT & POS Enhancements for Orders
alter table public.orders add column if not exists tax_amount numeric(10,2) default 0;
alter table public.orders add column if not exists is_pos boolean default false;

-- 2. Announcements Table
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

-- RLS for Announcements
alter table public.announcements enable row level security;
drop policy if exists "Announcements are viewable by everyone" on public.announcements;
create policy "Announcements are viewable by everyone" on public.announcements for select using (true);
drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements" on public.announcements using (public.is_admin());

-- 3. Contact Messages Table
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'UNREAD' check (status in ('UNREAD', 'READ', 'ARCHIVED')),
  created_at timestamp with time zone default now()
);

-- RLS for Contact Messages
alter table public.contact_messages enable row level security;
drop policy if exists "Anyone can insert contact messages" on public.contact_messages;
create policy "Anyone can insert contact messages" on public.contact_messages for insert with check (true);
drop policy if exists "Admins can manage contact messages" on public.contact_messages;
create policy "Admins can manage contact messages" on public.contact_messages using (public.is_admin());

-- 4. Gallery Table
create table if not exists public.gallery (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  url text not null,
  tags text,
  type text default 'IMAGE' check (type in ('IMAGE', 'VIDEO')),
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- RLS for Gallery
alter table public.gallery enable row level security;
drop policy if exists "Gallery is viewable by everyone" on public.gallery;
create policy "Gallery is viewable by everyone" on public.gallery for select using (true);
drop policy if exists "Admins can manage gallery" on public.gallery;
create policy "Admins can manage gallery" on public.gallery using (public.is_admin());

-- 5. Store Settings Table
create table if not exists public.store_settings (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value text,
  description text,
  updated_at timestamp with time zone default now()
);

-- RLS for Store Settings
alter table public.store_settings enable row level security;
drop policy if exists "Settings are viewable by everyone" on public.store_settings;
create policy "Settings are viewable by everyone" on public.store_settings for select using (true);
drop policy if exists "Admins can manage settings" on public.store_settings;
create policy "Admins can manage settings" on public.store_settings using (public.is_admin());

-- 6. Inventory Logs for Auditing
create table if not exists public.inventory_logs (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade,
  variant_id uuid references public.product_variants on delete cascade,
  change_amount integer not null,
  reason text,
  reference_id text,
  created_at timestamp with time zone default now()
);

-- RLS for Inventory Logs
alter table public.inventory_logs enable row level security;
drop policy if exists "Admins can view inventory logs" on public.inventory_logs;
create policy "Admins can view inventory logs" on public.inventory_logs for select using (public.is_admin());

-- 7. Automatic Stock Deduction Trigger
create or replace function public.deduct_stock_on_payment()
returns trigger as $$
begin
  -- Deduct stock when status moves to PAID or PROCESSING (only once)
  if (old.status = 'PENDING_PAYMENT' and (new.status = 'PAID' or new.status = 'PROCESSING')) then
    -- Deduct for Products (if no variant)
    update public.products p
    set stock_quantity = p.stock_quantity - oi.quantity
    from public.order_items oi
    where oi.order_id = new.id 
      and oi.product_id = p.id 
      and oi.variant_id is null;

    -- Deduct for Product Variants
    update public.product_variants pv
    set stock_quantity = pv.stock_quantity - oi.quantity
    from public.order_items oi
    where oi.order_id = new.id 
      and oi.variant_id = pv.id;
      
    -- Log the changes
    insert into public.inventory_logs (product_id, variant_id, change_amount, reason, reference_id)
    select product_id, variant_id, -quantity, 'Order Paid: ' || new.order_number, new.id::text
    from public.order_items
    where order_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_order_paid_deduct_stock on public.orders;
create trigger on_order_paid_deduct_stock
  after update on public.orders
  for each row execute procedure public.deduct_stock_on_payment();

-- 8. Updated At Trigger for new tables
drop trigger if exists handle_announcements_updated_at on public.announcements;
create trigger handle_announcements_updated_at before update on public.announcements for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_store_settings_updated_at on public.store_settings;
create trigger handle_store_settings_updated_at before update on public.store_settings for each row execute procedure public.handle_updated_at();

-- 9. Storage Policy Simulation (Logical documentation)
-- Buckets: products, gallery
-- Policies:
--   - public access (read)
--   - authenticated/is_admin access (write/delete)
