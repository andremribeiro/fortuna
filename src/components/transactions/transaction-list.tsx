'use client'

import { useState } from 'react'
import { type Transaction } from '@/lib/types'
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog'
import { DeleteTransactionButton } from '@/components/transactions/delete-transaction-button'
import { deleteTransactions } from '@/app/dashboard/transactions/actions'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
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

            {/* Rows */}
            <div className="flex flex-col divide-y rounded-lg border">
              {group.map((t: Transaction) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between px-4 py-3 transition-colors ${
                    selected.has(t.id) ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selected.has(t.id)}
                      onCheckedChange={() => toggleOne(t.id)}
                      aria-label={`Select ${t.merchant ?? 'transaction'}`}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {t.merchant ?? t.description ?? t.category ?? 'Expense'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.category ?? 'Uncategorized'}
                      </span>
                    </div>
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
  )
}