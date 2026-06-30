import { createClient } from '@/lib/supabase/server'
import { type Transaction, type Subscription } from '@/lib/types'
import { aggregateMonthlyData, aggregateByCategory, getLast6Months } from '@/lib/trends'
import { MonthlyChart } from '@/components/trends/monthly-chart'
import { CategoryChart } from '@/components/trends/category-chart'

export default async function TrendsPage() {
  const supabase = await createClient()

  const months = getLast6Months()
  const cutoff = `${months[0].year}-${String(months[0].month).padStart(2, '0')}-01`

  const [{ data: transactions, error: txError }, { data: subscriptions, error: subError }] =
    await Promise.all([
      supabase.from('transactions').select('*').gte('date', cutoff).order('date'),
      supabase.from('subscriptions').select('*').eq('active', true),
    ])

  if (txError || subError) {
    return <p className="text-sm text-destructive">Failed to load trends.</p>
  }

  const monthlyData = aggregateMonthlyData(transactions as Transaction[], subscriptions as Subscription[])
  const categoryData = aggregateByCategory(transactions as Transaction[])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trends</h1>
        <p className="text-sm text-muted-foreground">
          Your spending patterns over time.
        </p>
      </div>
      <MonthlyChart data={monthlyData} />
      <CategoryChart data={categoryData} />
    </div>
  )
}