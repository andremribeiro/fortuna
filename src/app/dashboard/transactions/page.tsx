import { createClient } from '@/lib/supabase/server'
import { type Transaction } from '@/lib/types'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'
import { TransactionFilters } from '@/components/transactions/transaction-filters'
import { TransactionList } from '@/components/transactions/transaction-list'
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
        <TransactionList transactions={transactions as Transaction[]} />
      )}
    </div>
  )
}