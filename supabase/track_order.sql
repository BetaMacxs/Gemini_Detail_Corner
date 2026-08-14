create or replace function public.track_order(p_order_number text, p_email text)
returns json
language plpgsql
security definer
as $$
declare
  v_order json;
  v_history json;
begin
  select row_to_json(o) into v_order from (
    select orders.*, 
      (select json_agg(row_to_json(oi)) from public.order_items oi where oi.order_id = orders.id) as order_items
    from public.orders 
    where order_number = p_order_number and lower(email) = lower(p_email)
  ) o;
  
  if v_order is null then
    return null;
  end if;

  select json_agg(h order by created_at desc) into v_history 
  from public.order_status_history h 
  where h.order_id = (v_order->>'id')::uuid;

  return json_build_object(
    'order', v_order,
    'history', coalesce(v_history, '[]'::json)
  );
end;
$$;
