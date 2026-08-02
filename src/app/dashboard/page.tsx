import { createClient } from '@/lib/supabase/server'
import { type Subscription, type Budget } from '@/lib/types'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'

// 'YYYY-MM' shifted by whole months, so stepping past January rolls the year.
function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month: monthParam } = await searchParams
  const supabase = await createClient()

  const now = new Date()
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`

  // Only accept a well-formed month, and never one in the future — there is
  // nothing to show there and it would let the stepper run away forever.
  const isValid = /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam ?? '')
  const selected = isValid && monthParam! <= currentMonth ? monthParam! : currentMonth

  const [selYear, selMonth] = selected.split('-').map(Number)
  const firstOfMonth = `${selected}-01`
  const lastDay = new Date(Date.UTC(selYear, selMonth, 0)).getUTCDate()
  const lastOfMonth = `${selected}-${String(lastDay).padStart(2, '0')}`

  // The yearly view follows the month you're looking at, so stepping back into
  // a previous year and switching to "This year" shows that year, not this one.
  const firstOfYear = `${selYear}-01-01`
  const lastOfYear = `${selYear}-12-31`

  const [
    { data: subscriptions, error: subError },
    { data: monthTransactions, error: monthError },
    { data: yearTransactions, error: yearError },
    { data: budgets },
  ] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('active', true).order('name'),
    supabase.from('transactions').select('amount, category').gte('date', firstOfMonth).lte('date', lastOfMonth),
    supabase.from('transactions').select('amount, category').gte('date', firstOfYear).lte('date', lastOfYear),
    supabase.from('budgets').select('category, amount'),
  ])

  // Budgets are an optional enhancement — a missing table shouldn't break the dashboard.
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

  const selDate = new Date(Date.UTC(selYear, selMonth - 1, 1))
  // Drop the year while you're in the current one; show it once stepping back
  // makes "March" ambiguous.
  const monthLabel = selDate.toLocaleDateString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
    ...(selYear === now.getUTCFullYear() ? {} : { year: 'numeric' }),
  })

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
        budgets={(budgets as Pick<Budget, 'category' | 'amount'>[]) ?? []}
        monthLabel={monthLabel}
        year={selYear}
        prevMonth={shiftMonth(selected, -1)}
        nextMonth={selected < currentMonth ? shiftMonth(selected, 1) : null}
        isCurrentMonth={selected === currentMonth}
      />
      <RecentTransactions />
    </div>
  )
}
