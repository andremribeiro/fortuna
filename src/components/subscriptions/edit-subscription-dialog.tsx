'use client'

import { useRef, useState } from 'react'
import { updateSubscription } from '@/app/dashboard/subscriptions/actions'
import { type Subscription } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil } from 'lucide-react'
import { CategoryCombobox } from '@/components/ui/category-combobox'

export function EditSubscriptionDialog({ sub }: { sub: Subscription }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [category, setCategory] = useState(sub.category ?? '')

  async function handleSubmit(formData: FormData) {
    formData.set('category', category)
    setLoading(true)
    setError(null)
    try {
      await updateSubscription(sub.id, formData)
      setOpen(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit subscription</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" name="name" defaultValue={sub.name} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-amount">Amount (€)</Label>
            <Input
              id="edit-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={sub.amount}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-billing_cycle">Billing cycle</Label>
            <Select name="billing_cycle" defaultValue={sub.billing_cycle}>
              <SelectTrigger id="edit-billing_cycle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-next_charge_date">Next charge date</Label>
            <Input
              id="edit-next_charge_date"
              name="next_charge_date"
              type="date"
              defaultValue={sub.next_charge_date ?? ''}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <CategoryCombobox value={category} onChange={setCategory} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-notes">Notes</Label>
            <Input
              id="edit-notes"
              name="notes"
              defaultValue={sub.notes ?? ''}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}