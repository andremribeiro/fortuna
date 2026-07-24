// A category names what was bought, never how it was paid for — recurring spend
// is already identifiable via transactions.source = 'subscription', so there is
// deliberately no 'Subscriptions' category to compete with the real one.
//
// Alphabetical, because this order drives the category filter on the transactions
// page — a plain Select with no search — where predictable lookup beats any
// curated grouping. 'Other' is pinned last: it's the fallback, not a peer.
export const CATEGORIES = [
  'Banking & Loans',
  'Education',
  'Entertainment',
  'Fitness',
  'Food & Drink',
  'Gifts',
  'Groceries',
  'Health',
  'Home',
  'Insurance',
  'Personal Care',
  'Rent & Mortgage',
  'Shopping',
  'Software & Tech',
  'Transport',
  'Travel',
  'Utilities',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}