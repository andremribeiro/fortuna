'use server'

import { createClient } from '@/lib/supabase/server'
import { isCategory } from '@/lib/categories'
import { isBillingCycle } from '@/lib/types'
import { getNextChargeDate } from '@/lib/subscriptions'
import { revalidatePath } from 'next/cache'

export async function addSubscription(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = (formData.get('name') as string)?.trim()
  const amount = parseFloat(formData.get('amount') as string)
  const billing_cycle = formData.get('billing_cycle') as string
  const next_charge_date = formData.get('next_charge_date') as string || null
  const category = (formData.get('category') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!name || isNaN(amount) || !billing_cycle) {
    throw new Error('Name, amount and billing cycle are required')
  }

  // The database enforces this too; checking here turns a raw constraint
  // violation into a message the dialog can show.
  if (!isBillingCycle(billing_cycle)) {
    throw new Error(`Unknown billing cycle: ${billing_cycle}`)
  }

  const billing_anchor_day = next_charge_date
    ? parseInt(next_charge_date.split('-')[2])
    : null

  if (category && !isCategory(category)) {
    throw new Error(`Unknown category: ${category}`)
  }

  const { error } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    name,
    amount,
    billing_cycle,
    next_charge_date: next_charge_date || null,
    billing_anchor_day,
    category,
    notes,
    active: true,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/subscriptions')
  revalidatePath('/dashboard')
}

export async function updateSubscription(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = (formData.get('name') as string)?.trim()
  const amount = parseFloat(formData.get('amount') as string)
  const billing_cycle = formData.get('billing_cycle') as string
  const next_charge_date = formData.get('next_charge_date') as string || null
  const category = (formData.get('category') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!name || isNaN(amount) || !billing_cycle) {
    throw new Error('Name, amount and billing cycle are required')
  }

  if (!isBillingCycle(billing_cycle)) {
    throw new Error(`Unknown billing cycle: ${billing_cycle}`)
  }

  const billing_anchor_day = next_charge_date
    ? parseInt(next_charge_date.split('-')[2])
    : null

  if (category && !isCategory(category)) {
    throw new Error(`Unknown category: ${category}`)
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({ name, amount, billing_cycle, next_charge_date, billing_anchor_day, category, notes })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/subscriptions')
  revalidatePath('/dashboard')
}

export async function setSubscriptionActive(id: string, active: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updates: { active: boolean; next_charge_date?: string } = { active }

  if (active) {
    // Resuming must not backfill the pause. materializeCharges walks every cycle
    // from next_charge_date up to today, so a subscription paused in January and
    // resumed in July would otherwise land six charges that never happened.
    // Rolling the date forward first means billing restarts from the next real
    // cycle. Dates here are UTC, matching materializeCharges.
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('next_charge_date, billing_cycle, billing_anchor_day')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (sub?.next_charge_date) {
      const today = new Date().toISOString().split('T')[0]
      let next = sub.next_charge_date

      while (next <= today) {
        const advanced = getNextChargeDate(next, sub.billing_cycle, sub.billing_anchor_day)
        if (advanced === next) break
        next = advanced
      }

      updates.next_charge_date = next
    }
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/subscriptions')
  revalidatePath('/dashboard')
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/subscriptions')
  revalidatePath('/dashboard')
}