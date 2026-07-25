// 'custom' was removed: it had no interval to advance by, so a custom
// subscription's next charge date never moved. See the migration that narrowed
// the matching check constraint.
export const BILLING_CYCLES = ['monthly', 'yearly', 'weekly'] as const

export type BillingCycle = (typeof BILLING_CYCLES)[number]

export function isBillingCycle(value: string): value is BillingCycle {
  return (BILLING_CYCLES as readonly string[]).includes(value)
}

export type Subscription = {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  billing_cycle: BillingCycle
  next_charge_date: string | null
  billing_anchor_day: number | null
  category: string | null
  notes: string | null
  active: boolean
  created_at: string
}

export type Budget = {
  id: string
  user_id: string
  category: string
  amount: number
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  user_id: string
  date: string
  amount: number
  merchant: string | null
  category: string | null
  description: string | null
  source: 'manual' | 'csv' | 'subscription'
  subscription_id: string | null
  created_at: string
}