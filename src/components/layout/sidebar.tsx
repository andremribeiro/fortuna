'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, Receipt, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 border-r bg-background h-screen sticky top-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-semibold tracking-tight">Fortuna</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-1 p-2 pt-4">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 font-normal',
                pathname === href && 'bg-muted font-medium'
              )}
            >
              <Icon size={16} />
              {label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-2 border-t">
        <form action="/auth/signout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 font-normal text-muted-foreground"
          >
            Sign out
          </Button>
        </form>
        <ThemeToggle />
      </div>
    </aside>
  )
}