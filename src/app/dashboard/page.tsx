import { createClient } from '@/lib/supabase/server'
import { type Subscription } from '@/lib/types'
import { SummaryCards } from '@/components/dashboard/summary-cards'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) {
    return <p className="text-sm text-destructive">Failed to load subscriptions.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your subscriptions at a glance.
        </p>
      </div>
      <SummaryCards subscriptions={subscriptions as Subscription[]} />
    </div>
  )
}