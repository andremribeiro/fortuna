import { formatMoney, formatMonth } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'

export interface MonthTotal {
  month: string
  total: number
}

export function SpendTrend({
  months,
  currentMonth,
}: {
  months: MonthTotal[]
  currentMonth: string
}) {
  if (months.length < 2) return null

  const max = Math.max(...months.map((m) => m.total))
  const booked = months.filter((m) => m.month > currentMonth)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monthly spend
          </CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {months.length} months
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Emphasis, not a categorical palette: the running month is the subject
            and every other column is context, so one hue plus gray says it. */}
        <div className="flex h-28 items-end gap-3 pt-5">
          {months.map((m) => {
            const isNow = m.month === currentMonth
            const isBooked = m.month > currentMonth
            return (
              <div
                key={m.month}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                title={`${formatMonth(m.month, { month: 'long', year: 'numeric' })} · ${formatMoney(m.total)}${isBooked ? ' · booked, not spent' : ''}`}
              >
                {isNow && (
                  <span className="whitespace-nowrap text-[11px] tabular-nums">
                    {formatMoney(m.total)}
                  </span>
                )}
                {isBooked && (
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    booked
                  </span>
                )}
                <div
                  className={`w-full max-w-6 rounded-t ${
                    isNow ? 'bg-foreground' : 'bg-foreground/25'
                  }`}
                  style={{ height: `${Math.max((m.total / max) * 100, 2)}%` }}
                />
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                  {formatMonth(m.month, { month: 'short' })}
                </span>
              </div>
            )
          })}
        </div>

        {booked.length > 0 && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Info size={14} className="mt-px shrink-0" />
            <span>
              {booked.length === 1
                ? `${formatMonth(booked[0].month)} is booked, not spent`
                : 'Later months are booked, not spent'}{' '}
              — transactions you have already dated in the future.
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
