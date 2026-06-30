'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CategoryChart({ data }: { data: { category: string; amount: number }[] }) {
  if (data.length === 0) return null

  const max = data[0].amount

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Spending by category — last 6 months
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {data.map(({ category, amount }) => (
          <div key={category} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">{category}</span>
              <span className="text-sm tabular-nums">€{amount.toFixed(2)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${(amount / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}