-- Spend per calendar month, for the dashboard trend.
--
-- Same reasoning as transaction_queries: the alternative is fetching a year of
-- rows and bucketing them in JS, which is both wasteful and silently wrong past
-- PostgREST's 1000-row cap. Months with no transactions are simply absent from
-- the result — a month before the account existed is "no data", not "zero
-- spent", and the caller should not have to tell those apart.
--
-- SECURITY INVOKER (the default), so RLS still scopes rows to auth.uid().

create or replace function public.monthly_totals(
  p_from date,
  p_to   date
)
returns table (month text, total numeric)
language sql
stable
set search_path = ''
as $$
  select to_char(date_trunc('month', t.date), 'YYYY-MM'), sum(t.amount)
  from public.transactions t
  where t.date >= p_from
    and t.date <= p_to
  group by 1
  order by 1;
$$;

grant execute on function public.monthly_totals(date, date) to authenticated;
