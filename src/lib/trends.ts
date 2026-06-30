import { type Transaction } from '@/lib/types'
import { type Subscription } from '@/lib/types'
import { getMonthlyAmount } from '@/lib/subscriptions'

export type MonthlyData = {
  month: string      // e.g. "Jan", "Feb"
  year: number
  expenses: number
  subscriptions: number
  total: number
}

export function getLast6Months(): { year: number; month: number; label: string }[] {
  const months = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
    })
  }

  return months
}

export function aggregateMonthlyData(
  transactions: Transaction[],
  subscriptions: Subscription[]
): MonthlyData[] {
  const months = getLast6Months()
  const subscriptionMonthly = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + getMonthlyAmount(s), 0)

  return months.map(({ year, month, label }) => {
    const monthStr = String(month).padStart(2, '0')
    const prefix = `${year}-${monthStr}`

    const expenses = transactions
      .filter(t => t.date.startsWith(prefix))
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      month: label,
      year,
      expenses: parseFloat(expenses.toFixed(2)),
      subscriptions: parseFloat(subscriptionMonthly.toFixed(2)),
      total: parseFloat((expenses + subscriptionMonthly).toFixed(2)),
    }
  })
}

export function aggregateByCategory(transactions: Transaction[]): { category: string; amount: number }[] {
  const months = getLast6Months()
  const cutoff = `${months[0].year}-${String(months[0].month).padStart(2, '0')}-01`

  const recent = transactions.filter(t => t.date >= cutoff)

  const map: Record<string, number> = {}
  for (const t of recent) {
    const cat = t.category ?? 'Uncategorized'
    map[cat] = (map[cat] ?? 0) + t.amount
  }

  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => b.amount - a.amount)
}