'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCw } from 'lucide-react'

// Catches anything thrown while rendering a dashboard page — including the
// server actions the dialogs and list rows call. Without it, Next falls back to
// its own full-page error screen and the nav goes with it; here the sidebar and
// bottom nav survive, so the failure is contained to one page.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
      <p className="font-medium">Something went wrong</p>
      <p className="text-sm text-muted-foreground max-w-sm text-balance">
        This page failed to load. Trying again often clears it.
      </p>
      {/* In production the message is redacted to a digest, so showing it would
          be noise. Locally it's the actual error and worth reading. */}
      {process.env.NODE_ENV === 'development' && (
        <p className="text-xs text-destructive font-mono max-w-md break-words">
          {error.message}
        </p>
      )}
      <Button onClick={reset} variant="outline" size="sm" className="mt-1 gap-2">
        <RotateCw size={14} />
        Try again
      </Button>
    </div>
  )
}
