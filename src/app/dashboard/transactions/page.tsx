import { createClient } from '@/lib/supabase/server'
import { type Transaction } from '@/lib/types'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog'
import { DeleteTransactionButton } from '@/components/transactions/delete-transaction-button'
import { TransactionFilters } from '@/components/transactions/transaction-filters'
import { Suspense } from 'react'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; category?: string; search?: string }>
}) {
  const { month, category, search } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (month) {
    const [year, m] = month.split('-')
    const lastDay = new Date(Number(year), Number(m), 0).getDate()
    query = query
      .gte('date', `${month}-01`)
      .lte('date', `${month}-${String(lastDay).padStart(2, '0')}`)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`merchant.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data: transactions, error } = await query

  if (error) {
    return <p className="text-sm text-destructive">Failed to load transactions.</p>
  }

  const total = (transactions ?? []).reduce((sum, t) => sum + t.amount, 0)

  // Group transactions by date
  const groups: Record<string, Transaction[]> = {}
  for (const t of transactions) {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            {(month || category || search) && (
              <span className="tabular-nums"> · €{total.toFixed(2)} total</span>
            )}
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      {/* Filters */}
      <Suspense>
        <TransactionFilters />
      </Suspense>

      {/* List */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3 rounded-lg border border-dashed">
          <p className="text-2xl">🧾</p>
          <p className="font-medium">No transactions found</p>
          <p className="text-sm text-muted-foreground">
            {month || category || search
              ? 'Try adjusting your filters.'
              : 'Click Add to log your first expense.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(groups).map(([date, group]) => {
            const [y, m, d] = date.split('-').map(Number)
            const label = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
            const dayTotal = group.reduce((sum, t) => sum + t.amount, 0)

            return (
              <div key={date} className="flex flex-col gap-1">
                {/* Date header */}
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    €{dayTotal.toFixed(2)}
                  </span>
                </div>

                {/* Transactions for this date */}
                <div className="flex flex-col divide-y rounded-lg border">
                  {group.map((t: Transaction) => (
                    <div key={t.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {t.merchant ?? t.description ?? t.category ?? 'Expense'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.category ?? 'Uncategorized'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium tabular-nums mr-2">
                          €{t.amount.toFixed(2)}
                        </span>
                        <EditTransactionDialog transaction={t} />
                        <DeleteTransactionButton id={t.id} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}