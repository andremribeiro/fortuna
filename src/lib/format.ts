// Dates are stored as bare `YYYY-MM-DD` — a calendar day, with no time and no
// timezone. `new Date('2026-07-25')` parses that as UTC midnight, which in any
// negative-offset timezone renders as the 24th. Every date in this app has to go
// through parseDate instead, which builds the day in local time.

export function parseDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Serializes a Date back to `YYYY-MM-DD` using its local components. */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Today as `YYYY-MM-DD` in the viewer's timezone. */
export function today(): string {
  return toISODate(new Date())
}

const LOCALE = 'en-GB'

export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  return parseDate(date).toLocaleDateString(LOCALE, options)
}

const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(amount: number): string {
  return money.format(amount)
}

/** First and last day of a `YYYY-MM` month, as `YYYY-MM-DD`. */
export function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, '0')}`,
  }
}

/** The current calendar month as `YYYY-MM`, in the viewer's timezone. */
export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
