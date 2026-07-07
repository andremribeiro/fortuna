'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
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
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

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
          value={search}
          onChange={(e) => updateParam('search', e.target.value)}
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