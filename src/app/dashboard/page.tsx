import { createClient } from '@/lib/supabase/server'
import { type Subscription, type Budget } from '@/lib/types'
import { currentMonth, monthRange, shiftMonth, formatDate, today } from '@/lib/format'
import { materializeCharges } from '@/lib/materialize-charges'
import { SpendHero } from '@/components/dashboard/spend-hero'
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown'
import { UpcomingCharges } from '@/components/dashboard/upcoming-charges'
import { SpendTrend, type MonthTotal } from '@/components/dashboard/spend-trend'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'

interface CategoryTotal {
  category: string
  amount: number
}

interface Totals {
  match_count: number
  total: number
}

// How much history the trend shows. It also reaches one month past the current
// one, because transactions can be dated forward — a booked trip belongs on the
// chart, flagged as booked rather than spent.
const TREND_MONTHS_BACK = 5
const TREND_MONTHS_AHEAD = 1

export default async function DashboardPage() {
  // Before the queries below, not alongside them: any charge that came due
  // today has to exist as a transaction to be counted in these totals.
  await materializeCharges()

  const supabase = await createClient()

  const month = currentMonth()
  const { from: firstOfMonth, to: lastOfMonth } = monthRange(month)
  const previous = shiftMonth(month, -1)
  const { from: firstOfPrevious, to: lastOfPrevious } = monthRange(previous)
  const year = month.slice(0, 4)

  const trendFrom = monthRange(shiftMonth(month, -TREND_MONTHS_BACK)).from
  const trendTo = monthRange(shiftMonth(month, TREND_MONTHS_AHEAD)).to

  const [
    { data: subscriptions, error: subError },
    { data: monthTotals, error: monthError },
    { data: previousTotals },
    { data: monthCategories, error: categoryError },
    { data: yearCategories, error: yearError },
    { data: trend },
    { data: budgets },
  ] = await Promise.all([
    supabase.from('subscriptions').select('*').order('name'),
    supabase
      .rpc('transaction_totals', { p_from: firstOfMonth, p_to: lastOfMonth })
      .single<Totals>(),
    supabase
      .rpc('transaction_totals', { p_from: firstOfPrevious, p_to: lastOfPrevious })
      .single<Totals>(),
    supabase.rpc('category_totals', { p_from: firstOfMonth, p_to: lastOfMonth }),
    supabase.rpc('category_totals', { p_from: `${year}-01-01`, p_to: `${year}-12-31` }),
    supabase.rpc('monthly_totals', { p_from: trendFrom, p_to: trendTo }),
    supabase.from('budgets').select('category, amount'),
  ])

  // Budgets and the trend are enhancements — neither failing should cost you the
  // numbers the page exists to show.
  if (subError || monthError || categoryError || yearError) {
    return <p className="text-sm text-destructive">Failed to load dashboard.</p>
  }

  const allSubscriptions = (subscriptions ?? []) as Subscription[]
  const activeSubscriptions = allSubscriptions.filter((s) => s.active)
  const monthlyCategoryData = (monthCategories ?? []) as CategoryTotal[]
  const yearlyCategoryData = (yearCategories ?? []) as CategoryTotal[]

  // A brand new account has nothing to lay out — the cards would all render as
  // zeroes and empty rails, which reads as broken rather than new.
  const isEmpty =
    allSubscriptions.length === 0 &&
    (monthTotals?.match_count ?? 0) === 0 &&
    yearlyCategoryData.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your finances at a glance.</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <p className="font-medium">Nothing to show yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add a subscription or log a transaction and this page fills in — what you
            spent, what is due next, and how the month compares.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(today(), {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <SpendHero
            month={month}
            total={monthTotals?.total ?? 0}
            transactionCount={monthTotals?.match_count ?? 0}
            categoryCount={monthlyCategoryData.length}
            activeSubscriptions={activeSubscriptions.length}
            previousTotal={previousTotals?.total ?? 0}
            previousCount={previousTotals?.match_count ?? 0}
          />
          <CategoryBreakdown
            month={month}
            monthlyCategoryData={monthlyCategoryData}
            yearlyCategoryData={yearlyCategoryData}
            budgets={(budgets as Pick<Budget, 'category' | 'amount'>[]) ?? []}
          />
          <RecentTransactions />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <UpcomingCharges subscriptions={allSubscriptions} />
          <SpendTrend months={(trend ?? []) as MonthTotal[]} currentMonth={month} />
        </div>
      </div>
    </div>
  )
}
