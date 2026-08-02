import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMonth, shiftMonth } from '@/lib/format'

interface MonthStepperProps {
  /** The month on screen, `YYYY-MM`. */
  month: string
  /** The real calendar month — the point the stepper can't page past. */
  currentMonth: string
}

// Plain links, so stepping is a normal navigation: shareable, bookmarkable, and
// working with the back button rather than against it.
export function MonthStepper({ month, currentMonth }: MonthStepperProps) {
  const previous = shiftMonth(month, -1)
  const isCurrent = month === currentMonth
  const next = isCurrent ? null : shiftMonth(month, 1)

  // The year is noise while you're in the current one, and necessary once
  // stepping back makes "March" ambiguous.
  const label = formatMonth(
    month,
    month.slice(0, 4) === currentMonth.slice(0, 4)
      ? { month: 'long' }
      : { month: 'long', year: 'numeric' }
  )

  return (
    <div className="flex items-center gap-1">
      <Button asChild size="icon" variant="ghost" aria-label="Previous month">
        <Link href={`/dashboard?month=${previous}`}>
          <ChevronLeft size={16} />
        </Link>
      </Button>

      <span className="min-w-[8.5rem] text-center text-sm font-medium">{label}</span>

      {next ? (
        <Button asChild size="icon" variant="ghost" aria-label="Next month">
          <Link href={`/dashboard?month=${next}`}>
            <ChevronRight size={16} />
          </Link>
        </Button>
      ) : (
        <span
          aria-hidden
          className="inline-flex size-8 items-center justify-center text-muted-foreground/40"
        >
          <ChevronRight size={16} />
        </span>
      )}

      {!isCurrent && (
        <Button asChild size="sm" variant="ghost" className="ml-1 h-8 text-xs text-muted-foreground">
          <Link href="/dashboard">Today</Link>
        </Button>
      )}
    </div>
  )
}
