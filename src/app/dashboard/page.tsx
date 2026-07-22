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
  const firstOfYear = `${year}-01-01`

  const [
    { data: subscriptions, error: subError },
    { data: monthTransactions, error: monthError },
    { data: yearTransactions, error: yearError },
  ] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('active', true).order('name'),
    supabase.from('transactions').select('amount, category').gte('date', firstOfMonth).lte('date', lastOfMonth),
    supabase.from('transactions').select('amount, category').gte('date', firstOfYear),
  ])

  if (subError || monthError || yearError) {
    return <p className="text-sm text-destructive">Failed to load dashboard.</p>
  }

  const monthlyTotal = (monthTransactions ?? []).reduce((sum, t) => sum + t.amount, 0)
  const yearlyTotal = (yearTransactions ?? []).reduce((sum, t) => sum + t.amount, 0)

  // Category breakdown from actual transactions this month
  const monthCategoryMap: Record<string, number> = {}
  for (const t of monthTransactions ?? []) {
    const cat = t.category ?? 'Uncategorized'
    monthCategoryMap[cat] = (monthCategoryMap[cat] ?? 0) + t.amount
  }
  const monthlyCategoryData = Object.entries(monthCategoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Category breakdown from actual transactions this year
  const yearCategoryMap: Record<string, number> = {}
  for (const t of yearTransactions ?? []) {
    const cat = t.category ?? 'Uncategorized'
    yearCategoryMap[cat] = (yearCategoryMap[cat] ?? 0) + t.amount
  }
  const yearlyCategoryData = Object.entries(yearCategoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your finances at a glance.
        </p>
      </div>
      <SummaryCards
        subscriptions={subscriptions as Subscription[]}
        monthlyTotal={monthlyTotal}
        yearlyTotal={yearlyTotal}
        monthlyCategoryData={monthlyCategoryData}
        yearlyCategoryData={yearlyCategoryData}
      />
      <RecentTransactions />
    </div>
  )
}