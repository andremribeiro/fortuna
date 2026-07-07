'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { type MonthlyData } from '@/lib/trends'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MonthlyChart({ data }: { data: MonthlyData[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Monthly spending — last 6 months
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip
              formatter={(value) => `€${Number(value).toFixed(2)}`}
              contentStyle={{
                borderRadius: '8px',
                fontSize: '12px',
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
                color: 'var(--popover-foreground)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="subscriptions" name="Subscriptions" stackId="a" fill="hsl(var(--foreground))" opacity={0.25} radius={[0, 0, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" stackId="a" fill="hsl(var(--foreground))" opacity={0.8} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}