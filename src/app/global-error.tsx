'use client'

import { useEffect } from 'react'

// Last resort: this only fires when the root layout itself throws, which means
// it replaces the layout rather than rendering inside it. No ThemeProvider, and
// no guarantee globals.css is loaded — hence its own <html>/<body> and inline
// styles rather than Tailwind classes.
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '24rem' }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            Fortuna could not load
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
            Something went wrong outside the page itself. Reloading usually fixes it.
          </p>
          <button
            onClick={reset}
            style={{
              alignSelf: 'center',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              borderRadius: '0.5rem',
              border: '1px solid #ddd',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
