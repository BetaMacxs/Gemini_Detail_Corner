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
