import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetsCard } from '@/components/settings/budgets-card'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { createClient } from '@/lib/supabase/server'
import { type Budget } from '@/lib/types'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .order('category')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings.
        </p>
      </div>

      <BudgetsCard budgets={(budgets as Budget[]) ?? []} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/auth/signout" method="POST">
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
