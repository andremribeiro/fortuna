'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const amount = parseFloat(formData.get('amount') as string)
  const date = formData.get('date') as string
  const merchant = formData.get('merchant') as string || null
  const category = formData.get('category') as string || null
  const description = formData.get('description') as string || null

  if (isNaN(amount) || !date) {
    throw new Error('Amount and date are required')
  }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    amount,
    date,
    merchant,
    category,
    description,
    source: 'manual',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/trends')
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const amount = parseFloat(formData.get('amount') as string)
  const date = formData.get('date') as string
  const merchant = formData.get('merchant') as string || null
  const category = formData.get('category') as string || null
  const description = formData.get('description') as string || null

  if (isNaN(amount) || !date) {
    throw new Error('Amount and date are required')
  }

  const { error } = await supabase
    .from('transactions')
    .update({ amount, date, merchant, category, description })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/trends')
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/trends')
}

export async function deleteTransactions(ids: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/trends')
}