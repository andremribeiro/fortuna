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

export function SummaryCards({ subscriptions }: { subscriptions: Subscription[] }) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const totalMonthly = getTotalMonthly(subscriptions)
  const totalYearly = getTotalYearly(subscriptions)
  const byCategory = getByCategory(subscriptions)
  const total = period === 'monthly' ? totalMonthly : totalYearly

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
            Total {period} cost
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

      {/* Category breakdown */}
      {sortedCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              By category
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