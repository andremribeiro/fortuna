import { type Subscription } from '@/lib/types'

export function getMonthlyAmount(sub: Subscription): number {
  switch (sub.billing_cycle) {
    case 'monthly': return sub.amount
    case 'yearly': return sub.amount / 12
    case 'weekly': return (sub.amount * 52) / 12
    default: return sub.amount
  }
}

export function getYearlyAmount(sub: Subscription): number {
  switch (sub.billing_cycle) {
    case 'monthly': return sub.amount * 12
    case 'yearly': return sub.amount
    case 'weekly': return sub.amount * 52
    default: return sub.amount * 12
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