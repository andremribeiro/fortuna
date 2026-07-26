'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, Receipt, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export interface Account {
  name: string | null
  email: string
  avatarUrl: string | null
}

function initials(account: Account) {
  const source = account.name ?? account.email
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Sidebar({ account }: { account: Account }) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen w-56 flex-col border-r bg-background md:flex">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold tracking-tight">Fortuna</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-4">
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

      {/* Account */}
      <div className="flex flex-col gap-1 border-t p-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar className="h-7 w-7">
            {account.avatarUrl && <AvatarImage src={account.avatarUrl} alt="" />}
            <AvatarFallback className="text-[11px]">{initials(account)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{account.name ?? account.email}</p>
            {account.name && (
              <p className="truncate text-[11px] text-muted-foreground">{account.email}</p>
            )}
          </div>
        </div>
        <form action="/auth/signout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 font-normal text-muted-foreground"
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  )
}
