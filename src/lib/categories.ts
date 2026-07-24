export const CATEGORIES = [
  'Groceries',
  'Food & Drink',
  'Transport',
  'Travel',
  'Fitness',
  'Health',
  'Shopping',
  'Entertainment',
  'Rent & Housing',
  'Loans & Finance',
  'Home & Utilities',
  'Subscriptions',
  'Software & Cloud',
  'Personal Care',
  'Education',
  'Gifts',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}