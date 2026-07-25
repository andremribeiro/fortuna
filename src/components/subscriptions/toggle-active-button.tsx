'use client'

import { useState } from 'react'
import { setSubscriptionActive } from '@/app/dashboard/subscriptions/actions'
import { Button } from '@/components/ui/button'
import { Pause, Play } from 'lucide-react'
import { toast } from 'sonner'

export function ToggleActiveButton({
  id,
  name,
  active,
}: {
  id: string
  name: string
  active: boolean
}) {
  const [loading, setLoading] = useState(false)

  const label = active ? `Pause ${name}` : `Resume ${name}`

  async function handleClick() {
    setLoading(true)
    try {
      await setSubscriptionActive(id, !active)
      toast.success(active ? `${name} paused` : `${name} resumed`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground"
      onClick={handleClick}
      disabled={loading}
      aria-label={label}
      title={label}
    >
      {active ? <Pause size={14} /> : <Play size={14} />}
    </Button>
  )
}
