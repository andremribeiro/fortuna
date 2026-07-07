import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { getNextChargeDate } from '@/lib/subscriptions'
import type { Subscription } from '@/lib/types'

export async function materializeCharges() {
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
        category: sub.category ?? 'Subscriptions',
        description: `${sub.name} — auto-charged`,
        source: 'subscription',
        subscription_id: sub.id,
      })

      // 23505 is Postgres unique violation — safe to ignore, means already inserted
      if (error && error.code !== '23505') {
        console.error('Failed to insert charge:', error)
        break
      }

      const next = getNextChargeDate(chargeDate, sub.billing_cycle)

      // Safety: if cycle doesn't advance (custom), break
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
}