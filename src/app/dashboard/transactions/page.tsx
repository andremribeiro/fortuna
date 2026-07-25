import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { type Transaction } from '@/lib/types'
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
  const { month, category, search, page } = await searchParams
  const supabase = await createClient()

  const requestedPage = Math.max(1, Number(page) || 1)

  // The same filters feed two queries — one page of rows, and the totals across
  // every match — so they're built in one place to stop the two drifting apart.
  const filtered = (columns: string) => {
    let query = supabase.from('transactions').select(columns)

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

    return query
  }

  // Amount-only pass so the header describes every match rather than just the
  // rows on screen. Runs before the row fetch because the page number is clamped
  // against the real page count — one extra round trip, in exchange for ?page=999
  // landing on the last page instead of an empty one.
  const { data: amounts, error: totalsError } = await filtered('amount')

  const matchCount = amounts?.length ?? 0
  // Cast through unknown: a variable column list leaves Supabase unable to infer
  // the row shape, same as the rows query below.
  const total = ((amounts ?? []) as unknown as { amount: number }[]).reduce(
    (sum, t) => sum + t.amount,
    0
  )
  const pageCount = Math.max(1, Math.ceil(matchCount / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, pageCount)
  const offset = (currentPage - 1) * PAGE_SIZE

  const { data: transactions, error } = await filtered('*')
    .order('date', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (error || totalsError) {
    return <p className="text-sm text-destructive">Failed to load transactions.</p>
  }

  const rows = (transactions ?? []) as unknown as Transaction[]
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
              <span className="tabular-nums"> · €{total.toFixed(2)} total</span>
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
