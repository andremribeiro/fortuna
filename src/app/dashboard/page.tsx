import { createClient } from '@/lib/supabase/server'
import { type Subscription, type Budget } from '@/lib/types'
import { currentMonth, monthRange } from '@/lib/format'
import { materializeCharges } from '@/lib/materialize-charges'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'

interface CategoryTotal {
  category: string
  amount: number
}

export default async function DashboardPage() {
  // Before the queries below, not alongside them: any charge that came due
  // today has to exist as a transaction to be counted in these totals.
  await materializeCharges()

  const supabase = await createClient()

  // Local, not UTC. The filters and the date pickers elsewhere in the app all
  // work in the viewer's timezone, and a UTC month boundary put the first and
  // last day of the month in the wrong bucket for anyone offset from it.
  const month = currentMonth()
  const { from: firstOfMonth, to: lastOfMonth } = monthRange(month)
  const year = Number(month.slice(0, 4))

  // Aggregated in Postgres. Summing the rows here instead meant fetching every
  // transaction of the year on every dashboard load, and quietly undercounting
  // once that exceeded PostgREST's 1000-row cap.
  const [
    { data: subscriptions, error: subError },
    { data: monthCategories, error: monthError },
    { data: yearCategories, error: yearError },
    { data: budgets },
  ] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('active', true).order('name'),
    supabase.rpc('category_totals', { p_from: firstOfMonth, p_to: lastOfMonth }),
    supabase.rpc('category_totals', { p_from: `${year}-01-01`, p_to: `${year}-12-31` }),
    supabase.from('budgets').select('category, amount'),
  ])

  // Budgets are an optional enhancement — a missing table shouldn't break the dashboard.
  if (subError || monthError || yearError) {
    return <p className="text-sm text-destructive">Failed to load dashboard.</p>
  }

  const monthlyCategoryData = (monthCategories ?? []) as CategoryTotal[]
  const yearlyCategoryData = (yearCategories ?? []) as CategoryTotal[]

  const monthlyTotal = monthlyCategoryData.reduce((sum, c) => sum + c.amount, 0)
  const yearlyTotal = yearlyCategoryData.reduce((sum, c) => sum + c.amount, 0)

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
        month={month}
        monthlyTotal={monthlyTotal}
        yearlyTotal={yearlyTotal}
        monthlyCategoryData={monthlyCategoryData}
        yearlyCategoryData={yearlyCategoryData}
        budgets={(budgets as Pick<Budget, 'category' | 'amount'>[]) ?? []}
      />
      <RecentTransactions />
    </div>
  )
}
