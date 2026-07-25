import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getNextChargeDate } from '@/lib/subscriptions'
import type { Subscription } from '@/lib/types'

// Pages await this before reading transactions, so a charge that came due today
// is visible on the load that materializes it. It used to run only in the
// dashboard layout, which React renders concurrently with the page — the page's
// queries usually won first and the new charge didn't appear until the next
// navigation. cache() keeps it to one run per request no matter how many callers
// await it.
export const materializeCharges = cache(async function materializeCharges() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split('T')[0]

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('active', true)
    .eq('user_id', user.id)
    .lte('next_charge_date', today)
    .not('next_charge_date', 'is', null)

  if (!subscriptions?.length) return

  for (const sub of subscriptions as Subscription[]) {
    let chargeDate = sub.next_charge_date!

    // Loop to catch up multiple missed cycles
    while (chargeDate <= today) {
      // Insert transaction — unique index silently skips duplicates
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: sub.amount,
        date: chargeDate,
        merchant: sub.name,
        // Left null when the subscription has none — surfaces as "Uncategorized"
        // rather than inventing a classification the user never chose.
        category: sub.category,
        description: `${sub.name} — auto-charged`,
        source: 'subscription',
        subscription_id: sub.id,
      })

      // 23505 is Postgres unique violation — safe to ignore, means already inserted
      if (error && error.code !== '23505') {
        console.error('Failed to insert charge:', error)
        break
      }

      const next = getNextChargeDate(chargeDate, sub.billing_cycle, sub.billing_anchor_day)

      // Every remaining cycle advances, but an unrecognised value would return
      // the same date and spin this loop forever. Cheap insurance.
      if (next === chargeDate) break

      chargeDate = next
    }

    // Update next_charge_date to the first future date
    await supabase
      .from('subscriptions')
      .update({ next_charge_date: chargeDate })
      .eq('id', sub.id)
      .eq('user_id', user.id)
  }
})