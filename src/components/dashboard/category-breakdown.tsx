'use client'

import { useState } from 'react'
import { formatMoney, formatMonth } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CategoryDatum {
  category: string
  amount: number
}

interface CategoryBreakdownProps {
  month: string
  monthlyCategoryData: CategoryDatum[]
  yearlyCategoryData: CategoryDatum[]
  budgets: { category: string; amount: number }[]
}

interface Row extends CategoryDatum {
  budget?: number
}

// Categories are nominal — swapping their order changes nothing — so bar length
// carries the magnitude and every bar wears the same hue. Colouring each row by
// its own value would re-encode what the length already shows.
const COLLAPSED = 8

export function CategoryBreakdown({
  month,
  monthlyCategoryData,
  yearlyCategoryData,
  budgets,
}: CategoryBreakdownProps) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [expanded, setExpanded] = useState(false)

  const budgetMap = new Map(budgets.map((b) => [b.category, b.amount]))
  const year = month.slice(0, 4)

  // Monthly view merges budgeted categories in even when nothing was spent yet,
  // so a budget you're respecting perfectly is still visible. Yearly view stays
  // a pure spend breakdown — budgets are monthly caps.
  const monthlyRows: Row[] = (() => {
    const rows: Row[] = monthlyCategoryData.map((d) => ({
      ...d,
      budget: budgetMap.get(d.category),
    }))
    const seen = new Set(rows.map((r) => r.category))
    for (const [category, budget] of budgetMap) {
      if (!seen.has(category)) rows.push({ category, amount: 0, budget })
    }
    return rows.sort((a, b) => b.amount - a.amount)
  })()

  const rows: Row[] =
    period === 'monthly' ? monthlyRows : yearlyCategoryData.map((d) => ({ ...d }))

  const total = rows.reduce((sum, r) => sum + r.amount, 0)
  const max = Math.max(...rows.map((r) => r.amount), 0)

  // A budgeted row is never folded away — the whole point of setting a cap is to
  // watch it, and a quiet category is exactly the one that drifts unnoticed.
  const pinned = rows.filter((r) => r.budget !== undefined)
  const rest = rows.filter((r) => r.budget === undefined)
  const fillCount = Math.max(COLLAPSED - pinned.length, 0)
  const visible = expanded ? rows : [...pinned, ...rest.slice(0, fillCount)]
    .sort((a, b) => b.amount - a.amount)
  const folded = rows.length - visible.length
  const foldedTotal = total - visible.reduce((sum, r) => sum + r.amount, 0)

  if (rows.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Where it went — {period === 'monthly' ? formatMonth(month) : year}
          </CardTitle>
          <div className="flex items-center gap-1 rounded-lg border p-0.5">
            <Button
              size="sm"
              variant={period === 'monthly' ? 'secondary' : 'ghost'}
              className="h-6 px-2 text-xs"
              onClick={() => setPeriod('monthly')}
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={period === 'yearly' ? 'secondary' : 'ghost'}
              className="h-6 px-2 text-xs"
              onClick={() => setPeriod('yearly')}
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {visible.map(({ category, amount, budget }) => {
            const hasBudget = budget !== undefined && budget > 0
            // Budgeted rows track progress toward the cap; others show their
            // share of the largest category, so the longest bar fills the row.
            const ratio = hasBudget ? amount / budget : max > 0 ? amount / max : 0
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
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-muted-foreground">{category}</span>
                  <span className="shrink-0 text-sm tabular-nums">
                    {hasBudget ? (
                      <>
                        <span className={over ? 'text-destructive' : undefined}>
                          {formatMoney(amount)}
                        </span>
                        <span className="text-muted-foreground"> / {formatMoney(budget)}</span>
                      </>
                    ) : (
                      formatMoney(amount)
                    )}
                  </span>
                </div>
                {/* Rounded at both ends. A squared-off start is the right call
                    for a bar rising from a drawn axis, but there is no axis
                    here — against a rounded track it just looks cut. */}
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                  />
                </div>
                {over && (
                  <span className="text-xs text-destructive">
                    Over by {formatMoney(amount - budget)}
                  </span>
                )}
              </div>
            )
          })}

          {folded > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-muted-foreground">
                  Other ({folded})
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  {formatMoney(foldedTotal)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground/25"
                  style={{ width: `${max > 0 ? Math.min(foldedTotal / max, 1) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {rows.length} categor{rows.length !== 1 ? 'ies' : 'y'} · {formatMoney(total)} total
          </span>
          {(folded > 0 || expanded) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? 'Show less' : `Show all ${rows.length}`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
