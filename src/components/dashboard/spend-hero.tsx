import {
  formatMoney,
  formatMonth,
  daysInMonth,
  currentMonth,
  shiftMonth,
} from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowUp, Info, Minus } from 'lucide-react'

interface SpendHeroProps {
  month: string
  total: number
  transactionCount: number
  categoryCount: number
  activeSubscriptions: number
  previousTotal: number
  previousCount: number
}

export function SpendHero({
  month,
  total,
  transactionCount,
  categoryCount,
  activeSubscriptions,
  previousTotal,
  previousCount,
}: SpendHeroProps) {
  const monthLabel = formatMonth(month)
  // Derived from the month on screen rather than the clock, so the label always
  // names the period the comparison actually used.
  const previousLabel = formatMonth(shiftMonth(month, -1))

  const isCurrentMonth = month === currentMonth()
  const days = daysInMonth(month)
  // Only the running month has a "so far" to measure; a past month is complete.
  const elapsed = isCurrentMonth ? Math.min(new Date().getDate(), days) : days
  const perDay = elapsed > 0 ? total / elapsed : 0

  const difference = total - previousTotal

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Spent in {monthLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Proportional figures, not tabular: at this size tabular digits give
            every glyph the width of a zero and the number looks gappy. */}
        <p className="text-5xl font-semibold tracking-tighter leading-none">
          {formatMoney(total)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} across{' '}
          {categoryCount} categor{categoryCount !== 1 ? 'ies' : 'y'} ·{' '}
          {activeSubscriptions} active subscription{activeSubscriptions !== 1 ? 's' : ''}
        </p>

        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {elapsed} of {days} days elapsed
            </span>
            <span className="tabular-nums">{formatMoney(perDay)} / day</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: `${(elapsed / days) * 100}%` }}
            />
          </div>
        </div>

        {/* Stated as an absolute difference, never a percentage. A percentage
            against a near-empty first month reads as "+24,000%", which is
            technically true and tells you nothing. */}
        {previousCount === 0 ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Info size={14} className="mt-px shrink-0" />
            <span>
              Nothing was recorded in {previousLabel}, so there is no comparison yet.
            </span>
          </p>
        ) : (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            {difference > 0 ? (
              <ArrowUp size={13} className="shrink-0" />
            ) : difference < 0 ? (
              <ArrowDown size={13} className="shrink-0" />
            ) : (
              <Minus size={13} className="shrink-0" />
            )}
            <span className="tabular-nums">
              {difference === 0
                ? `Same as ${previousLabel}`
                : `${formatMoney(Math.abs(difference))} ${
                    difference > 0 ? 'more' : 'less'
                  } than ${previousLabel}`}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
