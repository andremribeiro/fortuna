'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

// The system chrome — Android's navigation bar, Safari's toolbars — takes its
// colour from theme-color. Layout renders one tag per prefers-color-scheme,
// which is correct until the in-app theme disagrees with the OS setting, and
// then the bar below the nav sits in the other theme's colour and reads as a
// seam.
//
// The colour is read back off the rendered body rather than hardcoded, so it
// tracks --background instead of drifting from it the next time that token
// moves. getComputedStyle resolves to a plain rgb() string, which theme-color
// accepts everywhere — unlike the oklch() the token is authored in.
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) return

    const background = getComputedStyle(document.body).backgroundColor
    if (!background) return

    // Both tags, not just the matching one: whichever the browser picks then
    // reports the colour actually on screen.
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute('content', background))
  }, [resolvedTheme])

  return null
}
