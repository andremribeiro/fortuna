import { createClient } from '@/lib/supabase/server'
import { type Subscription } from '@/lib/types'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const firstOfMonth = `${year}-${month}-01`
  const lastDay = new Date(Date.UTC(year, now.getUTCMonth() + 1, 0)).getUTCDate()
  const lastOfMonth = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

  const [{ data: subscriptions, error: subError }, { data: transactions, error: txError }] =
    await Promise.all([
      supabase.from('subscriptions').select('*').eq('active', true).order('name'),
      supabase.from('transactions').select('amount').gte('date', firstOfMonth).lte('date', lastOfMonth),
    ])

  if (subError || txError) {
    return <p className="text-sm text-destructive">Failed to load dashboard.</p>
  }

  const monthlyExpenses = (transactions ?? []).reduce((sum, t) => sum + t.amount, 0)
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your finances at a glance.
        </p>
      </div>
      <SummaryCards subscriptions={subscriptions as Subscription[]} monthlyExpenses={monthlyExpenses} />
      <RecentTransactions />
    </div>
  )
}