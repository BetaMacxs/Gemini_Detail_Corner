-- 1. Fix order data leakage (unauthorized users accessing data belonging to other users)
drop policy if exists "Users can view their own orders." on public.orders;
create policy "Users can view their own orders." on public.orders for select using (
  (auth.uid() = customer_id) or public.is_admin()
);

drop policy if exists "Users can update their own orders." on public.orders;
create policy "Users can update their own orders." on public.orders for update using (
  (auth.uid() = customer_id) or public.is_admin()
);

-- 2. Fix order items data leakage
drop policy if exists "Users can view their own order items." on public.order_items;
create policy "Users can view their own order items." on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.customer_id = auth.uid() or public.is_admin()))
);

-- 3. Fix order history data leakage
drop policy if exists "Users can view own order history." on public.order_status_history;
create policy "Users can view own order history." on public.order_status_history for select using (
  exists (select 1 from public.orders where orders.id = order_status_history.order_id and (orders.customer_id = auth.uid() or public.is_admin()))
);

-- 4. Fix Duplicate RLS Policies and permission denied
-- (If there were multiple policies with same name or conflicting checks, we replace them cleanly here)
drop policy if exists "Users can insert their own orders." on public.orders;
create policy "Users can insert their own orders." on public.orders for insert with check (
  auth.uid() = customer_id or customer_id is null
);

drop policy if exists "Users can insert order items." on public.order_items;
create policy "Users can insert order items." on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.customer_id = auth.uid() or orders.customer_id is null or public.is_admin()))
);

drop policy if exists "Users can insert payments for their orders." on public.payments;
create policy "Users can insert payments for their orders." on public.payments for insert with check (
  exists (select 1 from public.orders where orders.id = payments.order_id and (orders.customer_id = auth.uid() or orders.customer_id is null or public.is_admin()))
);
