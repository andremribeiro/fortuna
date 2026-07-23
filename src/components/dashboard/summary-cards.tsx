'use client'

import { useState } from 'react'
import { type Subscription } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CategoryDatum {
  category: string
  amount: number
}

interface SummaryCardsProps {
  subscriptions: Subscription[]
  monthlyTotal: number
  yearlyTotal: number
  monthlyCategoryData: CategoryDatum[]
  yearlyCategoryData: CategoryDatum[]
  budgets: { category: string; amount: number }[]
}

// A category row on the breakdown, optionally carrying its monthly budget cap.
interface BreakdownRow extends CategoryDatum {
  budget?: number
}

export function SummaryCards({
  subscriptions,
  monthlyTotal,
  yearlyTotal,
  monthlyCategoryData,
  yearlyCategoryData,
  budgets,
}: SummaryCardsProps) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const total = period === 'monthly' ? monthlyTotal : yearlyTotal
  const year = new Date().getFullYear()
  const month = new Date().toLocaleDateString('en-GB', { month: 'long' })

  if (monthlyTotal === 0 && yearlyTotal === 0 && subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <p className="text-2xl">💸</p>
        <p className="font-medium">No data yet</p>
        <p className="text-sm text-muted-foreground">
          Add subscriptions or transactions to see your spending.
        </p>
      </div>
    )
  }

  const budgetMap = new Map(budgets.map((b) => [b.category, b.amount]))

  // Monthly view merges budgeted categories in even when nothing was spent yet,
  // so a budget you're respecting perfectly is still visible. Yearly view stays
  // a pure spend breakdown — budgets are monthly caps.
  const monthlyRows: BreakdownRow[] = (() => {
    const rows: BreakdownRow[] = monthlyCategoryData.map((d) => ({
      ...d,
      budget: budgetMap.get(d.category),
    }))
    const seen = new Set(rows.map((r) => r.category))
    for (const [category, budget] of budgetMap) {
      if (!seen.has(category)) rows.push({ category, amount: 0, budget })
    }
    return rows.sort((a, b) => b.amount - a.amount)
  })()

  const rows: BreakdownRow[] =
    period === 'monthly'
      ? monthlyRows
      : yearlyCategoryData.map((d) => ({ ...d }))

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle */}
      <div className="flex items-center gap-1 self-end border rounded-lg p-1">
        <Button
          size="sm"
          variant={period === 'monthly' ? 'secondary' : 'ghost'}
          className="h-7 text-xs"
          onClick={() => setPeriod('monthly')}
        >
          This month
        </Button>
        <Button
          size="sm"
          variant={period === 'yearly' ? 'secondary' : 'ghost'}
          className="h-7 text-xs"
          onClick={() => setPeriod('yearly')}
        >
          This year
        </Button>
      </div>

      {/* Total card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {period === 'monthly' ? `Spent in ${month}` : `Spent in ${year}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            €{total.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {subscriptions.filter(s => s.active).length} active subscriptions
          </p>
        </CardContent>
      </Card>

      {/* Category breakdown from actual transactions */}
      {rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {period === 'monthly' ? `Spending by category — ${month}` : `Spending by category — ${year}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {rows.map(({ category, amount, budget }) => {
              const hasBudget = budget !== undefined && budget > 0
              // Budgeted rows track progress toward the cap; others show share of total.
              const ratio = hasBudget
                ? amount / budget
                : total > 0 ? amount / total : 0
              const width = Math.min(ratio, 1) * 100
              const over = hasBudget && amount > budget
              const barColor = !hasBudget
                ? 'bg-foreground'
                : over
                  ? 'bg-destructive'
                  : ratio >= 0.8
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'

              return (
                <div key={category} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{category}</span>
                    <span className="text-sm tabular-nums">
                      {hasBudget ? (
                        <>
                          <span className={over ? 'text-destructive' : undefined}>
                            €{amount.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground"> / €{budget.toFixed(2)}</span>
                        </>
                      ) : (
                        <>€{amount.toFixed(2)}</>
                      )}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  {over && (
                    <span className="text-xs text-destructive">
                      Over by €{(amount - budget).toFixed(2)}
                    </span>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
