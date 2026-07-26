import Link from 'next/link'
import { type Subscription } from '@/lib/types'
import { formatMoney, formatDate, today, toISODate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const WINDOW_DAYS = 30
const VISIBLE = 5

export function UpcomingCharges({ subscriptions }: { subscriptions: Subscription[] }) {
  const from = today()
  const horizon = new Date()
  horizon.setDate(horizon.getDate() + WINDOW_DAYS)
  const to = toISODate(horizon)

  // Only active subscriptions bill, and materializeCharges has already advanced
  // next_charge_date past anything that came due, so everything here is genuinely
  // ahead of the user.
  const due = subscriptions
    .filter(
      (s) => s.active && s.next_charge_date && s.next_charge_date >= from && s.next_charge_date <= to
    )
    .sort((a, b) => a.next_charge_date!.localeCompare(b.next_charge_date!))

  const total = due.reduce((sum, s) => sum + s.amount, 0)
  const shown = due.slice(0, VISIBLE)
  const rest = due.slice(VISIBLE)
  const restTotal = rest.reduce((sum, s) => sum + s.amount, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Due next
          </CardTitle>
          {due.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatMoney(total)} · {WINDOW_DAYS} days
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {due.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Nothing due in the next {WINDOW_DAYS} days.{' '}
            <Link href="/dashboard/subscriptions" className="underline underline-offset-2">
              Add a subscription
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="flex flex-col divide-y">
              {shown.map((sub) => {
                const isToday = sub.next_charge_date === from
                return (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="w-9 shrink-0 text-center text-xs font-medium leading-tight text-muted-foreground tabular-nums">
                      {formatDate(sub.next_charge_date!, { day: 'numeric' })}
                      <br />
                      {formatDate(sub.next_charge_date!, { month: 'short' })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {sub.name}
                        {isToday && (
                          <span className="ml-1.5 rounded-full bg-foreground px-1.5 py-px align-[1px] text-[10px] font-semibold uppercase tracking-wide text-background">
                            Today
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {sub.category ?? 'Uncategorized'}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums">
                      {formatMoney(sub.amount)}
                    </span>
                  </div>
                )
              })}
            </div>

            {rest.length > 0 && (
              <p className="mt-3 border-t pt-3 text-xs text-muted-foreground tabular-nums">
                + {rest.length} more before{' '}
                {formatDate(toISODate(horizon), { day: 'numeric', month: 'short' })} ·{' '}
                {formatMoney(restTotal)}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
