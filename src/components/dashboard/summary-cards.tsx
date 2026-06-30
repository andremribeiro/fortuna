'use client'

import { useState } from 'react'
import { type Subscription } from '@/lib/types'
import {
  getTotalMonthly,
  getTotalYearly,
  getByCategory,
} from '@/lib/subscriptions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SummaryCardsProps {
  subscriptions: Subscription[]
  monthlyExpenses: number
}

export function SummaryCards({ subscriptions, monthlyExpenses }: SummaryCardsProps) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

  if (subscriptions.length === 0 && monthlyExpenses === 0) {
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

  const totalMonthly = getTotalMonthly(subscriptions)
  const totalYearly = getTotalYearly(subscriptions)
  const byCategory = getByCategory(subscriptions)

  const subscriptionCost = period === 'monthly' ? totalMonthly : totalYearly
  const expenseCost = period === 'monthly' ? monthlyExpenses : monthlyExpenses * 12
  const total = subscriptionCost + expenseCost

  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

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
          Monthly
        </Button>
        <Button
          size="sm"
          variant={period === 'yearly' ? 'secondary' : 'ghost'}
          className="h-7 text-xs"
          onClick={() => setPeriod('yearly')}
        >
          Yearly
        </Button>
      </div>

      {/* Total cost card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total {period} outgoings
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            €{total.toFixed(2)}
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Subscriptions</span>
              <span className="tabular-nums">€{subscriptionCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Expenses</span>
              <span className="tabular-nums">€{expenseCost.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      {sortedCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subscriptions by category
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {sortedCategories.map(([category, monthlyAmount]) => {
              const amount = period === 'monthly' ? monthlyAmount : monthlyAmount * 12
              const percentage = (monthlyAmount / totalMonthly) * 100

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