export type Subscription = {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  billing_cycle: 'monthly' | 'yearly' | 'weekly' | 'custom'
  next_charge_date: string | null
  billing_anchor_day: number | null
  category: string | null
  notes: string | null
  active: boolean
  created_at: string
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