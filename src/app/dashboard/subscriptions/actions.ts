'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSubscription(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const amount = parseFloat(formData.get('amount') as string)
  const billing_cycle = formData.get('billing_cycle') as string
  const next_charge_date = formData.get('next_charge_date') as string || null
  const category = formData.get('category') as string || null
  const notes = formData.get('notes') as string || null

  if (!name || isNaN(amount) || !billing_cycle) {
    throw new Error('Name, amount and billing cycle are required')
  }

  const billing_anchor_day = next_charge_date
    ? parseInt(next_charge_date.split('-')[2])
    : null

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
  revalidatePath('/dashboard/trends')
}

export async function updateSubscription(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const amount = parseFloat(formData.get('amount') as string)
  const billing_cycle = formData.get('billing_cycle') as string
  const next_charge_date = formData.get('next_charge_date') as string || null
  const category = formData.get('category') as string || null
  const notes = formData.get('notes') as string || null

  if (!name || isNaN(amount) || !billing_cycle) {
    throw new Error('Name, amount and billing cycle are required')
  }

  const billing_anchor_day = next_charge_date
    ? parseInt(next_charge_date.split('-')[2])
    : null

  const { error } = await supabase
    .from('subscriptions')
    .update({ name, amount, billing_cycle, next_charge_date, billing_anchor_day, category, notes })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/subscriptions')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/trends')
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
  revalidatePath('/dashboard/trends')
}