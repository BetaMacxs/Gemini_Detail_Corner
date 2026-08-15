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
