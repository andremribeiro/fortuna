import { createClient } from '@/lib/supabase/server'
import { type Subscription } from '@/lib/types'
import { formatDate, formatMoney } from '@/lib/format'
import { materializeCharges } from '@/lib/materialize-charges'
import { AddSubscriptionDialog } from '@/components/subscriptions/add-subscription-dialog'
import { EditSubscriptionDialog } from '@/components/subscriptions/edit-subscription-dialog'
import { DeleteSubscriptionButton } from '@/components/subscriptions/delete-subscription-button'
import { ToggleActiveButton } from '@/components/subscriptions/toggle-active-button'

function SubscriptionRow({ sub }: { sub: Subscription }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{sub.name}</span>
        <span className="text-xs text-muted-foreground">
          {sub.category ?? 'Uncategorized'} · {sub.billing_cycle}
          {/* A paused subscription isn't billed, so showing its stale charge
              date would read as an upcoming charge that will never happen. */}
          {sub.active && sub.next_charge_date && (
            <> · next {formatDate(sub.next_charge_date, { day: 'numeric', month: 'short' })}</>
          )}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium tabular-nums mr-2">
          {formatMoney(sub.amount)}
        </span>
        <ToggleActiveButton id={sub.id} name={sub.name} active={sub.active} />
        <EditSubscriptionDialog sub={sub} />
        <DeleteSubscriptionButton id={sub.id} name={sub.name} />
      </div>
    </div>
  )
}

export default async function SubscriptionsPage() {
  // Advances next_charge_date past any cycle that has already come due, so the
  // "next" dates below are genuinely in the future.
  await materializeCharges()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('name')

  if (error) {
    return <p className="text-sm text-destructive">Failed to load subscriptions.</p>
  }

  const subscriptions = (data ?? []) as Subscription[]
  const active = subscriptions.filter((s) => s.active)
  const paused = subscriptions.filter((s) => !s.active)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            {active.length} active subscription{active.length !== 1 ? 's' : ''}
            {paused.length > 0 && <> · {paused.length} paused</>}
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
        <div className="flex flex-col gap-6">
          {active.length > 0 && (
            <div className="flex flex-col divide-y rounded-lg border">
              {active.map((sub) => (
                <SubscriptionRow key={sub.id} sub={sub} />
              ))}
            </div>
          )}

          {/* Paused subscriptions stay visible but recede: they keep their
              history and can be resumed, unlike a deleted one. */}
          {paused.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-xs font-medium text-muted-foreground px-1">
                Paused
              </h2>
              <div className="flex flex-col divide-y rounded-lg border opacity-60">
                {paused.map((sub) => (
                  <SubscriptionRow key={sub.id} sub={sub} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
