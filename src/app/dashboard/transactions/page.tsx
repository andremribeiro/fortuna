import { createClient } from '@/lib/supabase/server'
import { type Transaction } from '@/lib/types'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog'
import { DeleteTransactionButton } from '@/components/transactions/delete-transaction-button'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    return <p className="text-sm text-destructive">Failed to load transactions.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      {/* List */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3 rounded-lg border border-dashed">
          <p className="text-2xl">🧾</p>
          <p className="font-medium">No transactions yet</p>
          <p className="text-sm text-muted-foreground">
            Click Add to log your first expense.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border">
          {transactions.map((t: Transaction) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {t.merchant ?? t.description ?? t.category ?? 'Expense'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t.category ?? 'Uncategorized'} · {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
      )}
    </div>
  )
}