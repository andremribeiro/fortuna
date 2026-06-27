import { createClient } from '@/lib/supabase/server'
import { type Subscription } from '@/lib/types'
import { AddSubscriptionDialog } from '@/components/subscriptions/add-subscription-dialog'
import { EditSubscriptionDialog } from '@/components/subscriptions/edit-subscription-dialog'
import { DeleteSubscriptionButton } from '@/components/subscriptions/delete-subscription-button'

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('name')

  if (error) {
    return <p className="text-sm text-destructive">Failed to load subscriptions.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddSubscriptionDialog />
      </div>

      {/* List */}
      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3 rounded-lg border border-dashed">
          <p className="text-2xl">📋</p>
          <p className="font-medium">No subscriptions yet</p>
          <p className="text-sm text-muted-foreground">
            Click Add to track your first subscription.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border">
          {subscriptions.map((sub: Subscription) => (
            <div key={sub.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{sub.name}</span>
                <span className="text-xs text-muted-foreground">
                  {sub.category ?? 'Uncategorized'} · {sub.billing_cycle}
                  {sub.next_charge_date && (
                    <> · next {new Date(sub.next_charge_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium tabular-nums mr-2">
                  €{sub.amount.toFixed(2)}
                </span>
                <EditSubscriptionDialog sub={sub} />
                <DeleteSubscriptionButton id={sub.id} name={sub.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}