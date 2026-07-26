'use client'

import { useState } from 'react'
import { type Transaction } from '@/lib/types'
import { formatDate, formatMoney } from '@/lib/format'
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog'
import { DeleteTransactionButton } from '@/components/transactions/delete-transaction-button'
import { deleteTransactions } from '@/app/dashboard/transactions/actions'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TransactionListProps {
  transactions: Transaction[]
}

// Whichever field is the most specific thing we know about the row.
function title(t: Transaction) {
  return t.merchant ?? t.description ?? t.category ?? 'Expense'
}

// materializeCharges stamps "<name> — auto-charged" on every charge it writes.
// That text was the only clue a row was automatic while descriptions were
// invisible; now that `source` drives a visible marker it is just noise on
// every subscription row. Matched exactly rather than by source alone, so a
// description you have since edited is never swallowed.
function describes(t: Transaction) {
  if (!t.description || t.description === title(t)) return null
  if (t.source === 'subscription' && t.description === `${t.merchant} — auto-charged`) {
    return null
  }
  return t.description
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const allIds = transactions.map(t => t.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id))
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allIds))
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleBulkDelete() {
    setLoading(true)
    try {
      await deleteTransactions(Array.from(selected))
      setSelected(new Set())
    } catch (e: unknown) {
      // The dialog has already closed by now, so the toast is the only feedback
      // left. Selection is deliberately kept so the delete can be retried.
      toast.error(e instanceof Error ? e.message : 'Failed to delete transactions')
    } finally {
      setLoading(false)
    }
  }

  // Group by date
  const groups: Record<string, Transaction[]> = {}
  for (const t of transactions) {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk action bar */}
      <div className="flex items-center justify-between h-8">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleAll}
            aria-label="Select all"
          />
          <span className="text-xs text-muted-foreground">
            {someSelected ? `${selected.size} selected` : 'Select all'}
          </span>
        </div>

        {someSelected && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs gap-1.5"
                disabled={loading}
              >
                <Trash2 size={12} />
                Delete {selected.size}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {selected.size} transaction{selected.size !== 1 ? 's' : ''}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the selected transactions. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  disabled={loading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Grouped list */}
      {Object.entries(groups).map(([date, group]) => {
        const label = formatDate(date, {
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
                {formatMoney(dayTotal)}
              </span>
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y rounded-lg border">
              {group.map((t: Transaction) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between px-4 py-3 transition-colors ${
                    selected.has(t.id) ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Checkbox
                      checked={selected.has(t.id)}
                      onCheckedChange={() => toggleOne(t.id)}
                      aria-label={`Select ${t.merchant ?? 'transaction'}`}
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">
                        {title(t)}
                      </span>
                      {/* The description used to be reachable only by opening
                          the edit dialog. It rides the category line rather
                          than adding a third row to every entry. */}
                      <span className="truncate text-xs text-muted-foreground">
                        {t.category ?? 'Uncategorized'}
                        {t.source === 'subscription' && <> · Auto</>}
                        {describes(t) && <> · {describes(t)}</>}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-sm font-medium tabular-nums mr-2">
                      {formatMoney(t.amount)}
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
  )
}