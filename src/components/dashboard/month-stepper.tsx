import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatMonth, shiftMonth } from '@/lib/format'

interface MonthStepperProps {
  /** The month on screen, `YYYY-MM`. */
  month: string
  /** The real calendar month — the point the stepper can't page past. */
  currentMonth: string
}

const FULL = { month: 'long', year: 'numeric' } as const

// Plain links, so stepping is a normal navigation: shareable, bookmarkable, and
// working with the back button rather than against it.
export function MonthStepper({ month, currentMonth }: MonthStepperProps) {
  const previous = shiftMonth(month, -1)
  const isCurrent = month === currentMonth
  const next = isCurrent ? null : shiftMonth(month, 1)

  return (
    <div className="flex items-center gap-1.5">
      {/* One bordered control rather than loose buttons — the arrows belong to
          the label they move, and the app already reads segmented pills this way. */}
      <div className="flex items-center rounded-lg border p-0.5">
        <Button
          asChild
          size="icon-sm"
          variant="ghost"
          aria-label={`Go to ${formatMonth(previous, FULL)}`}
        >
          <Link href={`/dashboard?month=${previous}`}>
            <ChevronLeft />
          </Link>
        </Button>

        <span className="min-w-[8.5rem] px-1 text-center text-sm font-medium tabular-nums">
          {formatMonth(month, FULL)}
        </span>

        {next ? (
          <Button
            asChild
            size="icon-sm"
            variant="ghost"
            aria-label={`Go to ${formatMonth(next, FULL)}`}
          >
            <Link href={`/dashboard?month=${next}`}>
              <ChevronRight />
            </Link>
          </Button>
        ) : (
          // A real disabled button, not a dimmed span: same box, same rounding,
          // and it says why it can't be pressed.
          <Button
            size="icon-sm"
            variant="ghost"
            disabled
            aria-label="Already on the current month"
          >
            <ChevronRight />
          </Button>
        )}
      </div>

      {/* Kept in the layout even on the current month, so stepping away doesn't
          shove the pill sideways. */}
      <Button
        asChild
        size="sm"
        variant="ghost"
        className={cn(
          'text-muted-foreground',
          isCurrent && 'invisible pointer-events-none'
        )}
      >
        <Link
          href="/dashboard"
          tabIndex={isCurrent ? -1 : undefined}
          aria-hidden={isCurrent || undefined}
        >
          Today
        </Link>
      </Button>
    </div>
  )
}
