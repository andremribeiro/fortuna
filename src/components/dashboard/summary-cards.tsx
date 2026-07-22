'use client'

import { useState } from 'react'
import { type Subscription } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SummaryCardsProps {
  subscriptions: Subscription[]
  monthlyTotal: number
  yearlyTotal: number
  monthlyCategoryData: { category: string; amount: number }[]
  yearlyCategoryData: { category: string; amount: number }[]
}

export function SummaryCards({
  subscriptions,
  monthlyTotal,
  yearlyTotal,
  monthlyCategoryData,
  yearlyCategoryData,
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
      {(period === 'monthly' ? monthlyCategoryData : yearlyCategoryData).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {period === 'monthly' ? `Spending by category — ${month}` : `Spending by category — ${year}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(period === 'monthly' ? monthlyCategoryData : yearlyCategoryData).map(({ category, amount }) => {
              const percentage = (amount / total) * 100
              return (
                <div key={category} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{category}</span>
                    <span className="text-sm tabular-nums">€{amount.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-foreground transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}