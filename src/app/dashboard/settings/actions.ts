'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setBudget(category: string, amount: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (!category) throw new Error('Category is required')
  if (isNaN(amount) || amount < 0) throw new Error('Amount must be zero or more')

  const { error } = await supabase
    .from('budgets')
    .upsert(
      { user_id: user.id, category, amount, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,category' }
    )

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
}

export async function deleteBudget(category: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', user.id)
    .eq('category', category)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
}
