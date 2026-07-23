'use client'

import { useState } from 'react'
import { type Budget } from '@/lib/types'
import { CATEGORIES } from '@/lib/categories'
import { setBudget, deleteBudget } from '@/app/dashboard/settings/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

interface BudgetsCardProps {
  budgets: Budget[]
}

export function BudgetsCard({ budgets }: BudgetsCardProps) {
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const sorted = [...budgets].sort((a, b) => a.category.localeCompare(b.category))

  async function handleSave() {
    const value = parseFloat(amount)
    if (!category) return setError('Pick a category')
    if (isNaN(value) || value < 0) return setError('Enter a valid amount')

    setPending(true)
    setError(null)
    try {
      await setBudget(category, value)
      setCategory('')
      setAmount('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  async function handleRemove(cat: string) {
    setPending(true)
    setError(null)
    try {
      await deleteBudget(cat)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Monthly budgets
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sorted.length > 0 && (
          <div className="flex flex-col divide-y">
            {sorted.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2">
                <span className="text-sm">{b.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums">€{b.amount.toFixed(2)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => handleRemove(b.category)}
                    disabled={pending}
                    aria-label={`Remove ${b.category} budget`}
                  >
                    <X size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 sm:w-32">
            <Label htmlFor="budget-amount">Cap (€)</Label>
            <Input
              id="budget-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={pending} className="sm:mb-0">
            {pending ? 'Saving...' : 'Set'}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Setting a cap for a category you already budgeted updates it.
        </p>
      </CardContent>
    </Card>
  )
}
