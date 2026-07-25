'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/lib/categories'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

function getLastMonths(count: number) {
  const months = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    months.push({ value, label })
  }
  return months
}

export function TransactionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const month = searchParams.get('month') ?? ''
  const category = searchParams.get('category') ?? ''
  const search = searchParams.get('search') ?? ''

  const hasFilters = month || category || search

  const updateParam = useCallback(
    (key: string, value: string, { replace = false } = {}) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Any filter change invalidates the current page — page 5 of an unfiltered
      // list is usually past the end of a filtered one.
      params.delete('page')
      const url = `${pathname}?${params.toString()}`
      if (replace) {
        router.replace(url)
      } else {
        router.push(url)
      }
    },
    [router, pathname, searchParams]
  )

  // Search is held locally so typing stays instant; the URL catches up after a
  // pause. Previously every keystroke pushed a route and hit the server.
  const [searchInput, setSearchInput] = useState(search)

  // Resync when the URL changes from outside this input — Clear, or back/forward.
  // Adjusting state during render is React's documented pattern for this; an
  // effect would both lag by a render and trip react-hooks/set-state-in-effect.
  const [syncedSearch, setSyncedSearch] = useState(search)
  if (search !== syncedSearch) {
    setSyncedSearch(search)
    setSearchInput(search)
  }

  useEffect(() => {
    if (searchInput === search) return
    const timer = setTimeout(() => {
      // replace, not push: one entry per pause would make Back walk through
      // every prefix of what you typed.
      updateParam('search', searchInput, { replace: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, search, updateParam])

  const clearFilters = () => {
    router.push(pathname)
  }

  const months = getLastMonths(12)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {/* Month picker */}
        <Select value={month} onValueChange={(v) => updateParam('month', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all" className="text-xs text-muted-foreground">
              All months
            </SelectItem>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select value={category} onValueChange={(v) => updateParam('category', v === '_all' ? '' : v)}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all" className="text-xs text-muted-foreground">
              All categories
            </SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-xs">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <Input
          placeholder="Search merchant..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-8 text-xs w-[180px]"
        />

        {/* Clear */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1 text-muted-foreground"
            onClick={clearFilters}
          >
            <X size={12} />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}