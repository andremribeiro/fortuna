import { createClient } from '@/lib/supabase/server'
import { type Transaction } from '@/lib/types'
import Link from 'next/link'

export async function RecentTransactions() {
  const supabase = await createClient()
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .limit(5)

  if (error || !transactions?.length) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Recent transactions</h2>
        <Link href="/dashboard/transactions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>
      <div className="flex flex-col divide-y rounded-lg border">
        {transactions.map((t: Transaction) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {t.merchant ?? t.description ?? t.category ?? 'Expense'}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.category ?? 'Uncategorized'} · {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <span className="text-sm font-medium tabular-nums">
              €{t.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}