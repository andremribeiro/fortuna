'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, Receipt, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    // pb-safe belongs on the nav, not the h-16 row: padding inside a fixed
    // height just squashes the icons, where here it extends the nav so the
    // row clears the home indicator.
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 flex-1 py-2 text-muted-foreground transition-colors',
              pathname === href && 'text-foreground'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}