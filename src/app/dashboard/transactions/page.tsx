import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { type Transaction } from '@/lib/types'
import { formatMoney, monthRange } from '@/lib/format'
import { materializeCharges } from '@/lib/materialize-charges'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'
import { TransactionFilters } from '@/components/transactions/transaction-filters'
import { TransactionList } from '@/components/transactions/transaction-list'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

const PAGE_SIZE = 50

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; category?: string; search?: string; page?: string }>
}) {
  // Before the queries below: a charge due today should appear in this list on
  // the load that creates it, not the one after.
  await materializeCharges()

  const { month, category, search, page } = await searchParams
  const supabase = await createClient()

  const requestedPage = Math.max(1, Number(page) || 1)

  // Filtering, counting and summing all live in SQL now. Reducing over the rows
  // in JS looked fine but silently truncated at PostgREST's 1000-row response
  // cap, so both the total and the page count understated a large result set.
  // The two functions share one WHERE clause, which is what keeps the header
  // describing the same rows the list is paging through.
  const range = month ? monthRange(month) : null
  const filters = {
    p_from: range?.from ?? null,
    p_to: range?.to ?? null,
    p_category: category || null,
    p_search: search || null,
  }

  const { data: totals, error: totalsError } = await supabase
    .rpc('transaction_totals', filters)
    .single<{ match_count: number; total: number }>()

  const matchCount = totals?.match_count ?? 0
  const total = totals?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(matchCount / PAGE_SIZE))
  // Clamped against the real page count so ?page=999 lands on the last page
  // rather than an empty one.
  const currentPage = Math.min(requestedPage, pageCount)
  const offset = (currentPage - 1) * PAGE_SIZE

  const { data: transactions, error } = await supabase.rpc('search_transactions', {
    ...filters,
    p_limit: PAGE_SIZE,
    p_offset: offset,
  })

  if (error || totalsError) {
    return <p className="text-sm text-destructive">Failed to load transactions.</p>
  }

  const rows = (transactions ?? []) as Transaction[]
  const hasFilters = Boolean(month || category || search)

  // Carries the active filters across page links, so paging never silently
  // widens what you were looking at.
  const pageHref = (target: number) => {
    const params = new URLSearchParams()
    if (month) params.set('month', month)
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    if (target > 1) params.set('page', String(target))
    const qs = params.toString()
    return qs ? `/dashboard/transactions?${qs}` : '/dashboard/transactions'
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {matchCount} transaction{matchCount !== 1 ? 's' : ''}
            {hasFilters && (
              <span className="tabular-nums"> · {formatMoney(total)} total</span>
            )}
            {pageCount > 1 && (
              <span> · page {currentPage} of {pageCount}</span>
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
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3 rounded-lg border border-dashed">
          <p className="text-2xl">🧾</p>
          <p className="font-medium">No transactions found</p>
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? 'Try adjusting your filters.'
              : 'Click Add to log your first expense.'}
          </p>
        </div>
      ) : (
        <TransactionList transactions={rows} />
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          {currentPage > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(currentPage - 1)}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}

          <span className="text-xs text-muted-foreground tabular-nums">
            {offset + 1}–{offset + rows.length} of {matchCount}
          </span>

          {currentPage < pageCount ? (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(currentPage + 1)}>Next</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
