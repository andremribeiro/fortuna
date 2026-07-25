-- Removes 'custom' as a billing cycle.
--
-- It was never implementable as written: getNextChargeDate has no interval to
-- advance by, so it returned the charge date unchanged. materializeCharges would
-- insert the first charge, fail to advance next_charge_date, and then re-attempt
-- that same insert on every dashboard load forever — absorbed by the unique
-- index, so it never surfaced as an error, just as a subscription permanently
-- stuck at "due".
--
-- No row has ever used it, so this narrows the constraint without touching data.
-- A real custom cycle needs an interval column to store the period; that is a
-- feature, not a repair, and it can widen this constraint again when it lands.

alter table public.subscriptions
  drop constraint if exists subscriptions_billing_cycle_check;

alter table public.subscriptions
  add constraint subscriptions_billing_cycle_check
  check (billing_cycle in ('monthly', 'yearly', 'weekly'));
