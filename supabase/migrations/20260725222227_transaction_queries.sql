-- Moves transaction filtering, counting and summing out of the app and into SQL.
--
-- The pages used to fetch every matching row and reduce over it in JS. PostgREST
-- caps a response at 1000 rows, so past that the totals, the match count and the
-- resulting page count all went quietly wrong — no error, just numbers that were
-- too small. Aggregating in Postgres has no such ceiling.
--
-- search_transactions and transaction_totals deliberately share one WHERE shape:
-- the header ("N transactions · €X total") describes exactly the rows the list
-- pages through, and the two drift apart the moment the predicates do.
--
-- All three are SECURITY INVOKER (the default), so the row level security
-- policies on the underlying tables still scope every result to auth.uid().

-- ILIKE treats % and _ as wildcards, so a search for "50%" or "a_b" would match
-- far more than the user typed. Escaping them here — rather than at the call
-- site — keeps the rows query and the totals query using identical semantics.
create or replace function public.like_contains(p_search text)
returns text
language sql
immutable
set search_path = ''
as $$
  select '%' || replace(replace(replace(p_search, '\', '\\'), '%', '\%'), '_', '\_') || '%';
$$;

create or replace function public.search_transactions(
  p_from     date default null,
  p_to       date default null,
  p_category text default null,
  p_search   text default null,
  p_limit    integer default 50,
  p_offset   integer default 0
)
returns setof public.transactions
language sql
stable
set search_path = ''
as $$
  select t.*
  from public.transactions t
  where (p_from     is null or t.date >= p_from)
    and (p_to       is null or t.date <= p_to)
    and (p_category is null or t.category = p_category)
    and (
      p_search is null
      or t.merchant    ilike public.like_contains(p_search)
      or t.description ilike public.like_contains(p_search)
    )
  -- created_at breaks ties within a day. Ordering by date alone leaves the order
  -- of same-day rows up to the planner, which can show or skip a row across a
  -- page boundary.
  order by t.date desc, t.created_at desc
  limit  greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;

create or replace function public.transaction_totals(
  p_from     date default null,
  p_to       date default null,
  p_category text default null,
  p_search   text default null
)
returns table (match_count bigint, total numeric)
language sql
stable
set search_path = ''
as $$
  select count(*)::bigint, coalesce(sum(t.amount), 0)
  from public.transactions t
  where (p_from     is null or t.date >= p_from)
    and (p_to       is null or t.date <= p_to)
    and (p_category is null or t.category = p_category)
    and (
      p_search is null
      or t.merchant    ilike public.like_contains(p_search)
      or t.description ilike public.like_contains(p_search)
    );
$$;

-- Powers the dashboard breakdown. Null categories collapse to 'Uncategorized'
-- here so the label is decided in one place rather than per caller.
create or replace function public.category_totals(
  p_from date,
  p_to   date
)
returns table (category text, amount numeric)
language sql
stable
set search_path = ''
as $$
  select coalesce(t.category, 'Uncategorized'), sum(t.amount)
  from public.transactions t
  where t.date >= p_from
    and t.date <= p_to
  group by 1
  order by 2 desc;
$$;

grant execute on function public.like_contains(text)                              to authenticated;
grant execute on function public.search_transactions(date, date, text, text, integer, integer) to authenticated;
grant execute on function public.transaction_totals(date, date, text, text)       to authenticated;
grant execute on function public.category_totals(date, date)                      to authenticated;

-- The filters above are all date-led, and every query is already narrowed to one
-- user by RLS.
create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);
