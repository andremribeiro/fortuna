import { type Subscription } from '@/lib/types'

export function getMonthlyAmount(sub: Subscription): number {
  switch (sub.billing_cycle) {
    case 'monthly': return sub.amount
    case 'yearly': return sub.amount / 12
    case 'weekly': return (sub.amount * 52) / 12
  }
}

export function getYearlyAmount(sub: Subscription): number {
  switch (sub.billing_cycle) {
    case 'monthly': return sub.amount * 12
    case 'yearly': return sub.amount
    case 'weekly': return sub.amount * 52
  }
}

export function getTotalMonthly(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + getMonthlyAmount(s), 0)
}

export function getTotalYearly(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + getYearlyAmount(s), 0)
}

export function getByCategory(subscriptions: Subscription[]): Record<string, number> {
  return subscriptions
    .filter(s => s.active)
    .reduce((acc, s) => {
      const category = s.category ?? 'Uncategorized'
      acc[category] = (acc[category] ?? 0) + getMonthlyAmount(s)
      return acc
    }, {} as Record<string, number>)
}

export function getNextChargeDate(
  currentDate: string,
  billing_cycle: string,
  anchorDay?: number | null
): string {
  const [y, m, d] = currentDate.split('-').map(Number)
  const day = anchorDay ?? d

  if (billing_cycle === 'weekly') {
    // Date.UTC + toISOString stay in the same timezone throughout. Building a
    // local Date here instead lost a day for every user east of UTC — local
    // midnight is the previous day in UTC — so "+7 days" advanced by six and
    // weekly subscriptions drifted a day earlier every cycle.
    const date = new Date(Date.UTC(y, m - 1, d + 7))
    return date.toISOString().split('T')[0]
  }

  if (billing_cycle === 'yearly') {
    const nextYear = y + 1
    const maxDay = new Date(nextYear, m, 0).getDate()
    const clampedDay = Math.min(day, maxDay)
    return `${nextYear}-${String(m).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`
  }

  if (billing_cycle === 'monthly') {
    const nextMonth = m === 12 ? 1 : m + 1
    const nextYear = m === 12 ? y + 1 : y
    const maxDay = new Date(nextYear, nextMonth, 0).getDate()
    const clampedDay = Math.min(day, maxDay)
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`
  }

  return currentDate
}