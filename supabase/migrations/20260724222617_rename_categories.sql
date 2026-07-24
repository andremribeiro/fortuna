-- Reshapes the category vocabulary to match src/lib/categories.ts:
--
--   Rent & Housing   -> Rent & Mortgage   names the obligation, no longer overlaps utilities
--   Home & Utilities -> Utilities         furniture/repairs move to the new Home category
--   Loans & Finance  -> Banking & Loans
--   Software & Cloud -> Software & Tech   consumer framing for AI tools, cloud storage, paid apps
--
-- 'Subscriptions' is dropped from the list too, but no row ever used it, so there
-- is nothing to migrate. 'Insurance' and 'Home' are new and start empty.
--
-- Categories are stored as free text with no check constraint, so these renames
-- must land together with the code change or stored values fall outside the
-- allowed list and stop matching the pickers and filters.

-- One-off correction: a DIY purchase that predates the Home category. Must run
-- before the blanket Utilities rename below, which would otherwise swallow it.
update public.transactions
   set category = 'Home'
 where category = 'Home & Utilities'
   and merchant = 'Leroy Merlin';

update public.transactions  set category = 'Rent & Mortgage' where category = 'Rent & Housing';
update public.transactions  set category = 'Utilities'       where category = 'Home & Utilities';
update public.transactions  set category = 'Banking & Loans' where category = 'Loans & Finance';
update public.transactions  set category = 'Software & Tech' where category = 'Software & Cloud';

update public.subscriptions set category = 'Rent & Mortgage' where category = 'Rent & Housing';
update public.subscriptions set category = 'Utilities'       where category = 'Home & Utilities';
update public.subscriptions set category = 'Banking & Loans' where category = 'Loans & Finance';
update public.subscriptions set category = 'Software & Tech' where category = 'Software & Cloud';

-- budgets is unique (user_id, category); none of the new names exist as values
-- yet, so no rename here can collide with an existing row.
update public.budgets       set category = 'Rent & Mortgage' where category = 'Rent & Housing';
update public.budgets       set category = 'Utilities'       where category = 'Home & Utilities';
update public.budgets       set category = 'Banking & Loans' where category = 'Loans & Finance';
update public.budgets       set category = 'Software & Tech' where category = 'Software & Cloud';
