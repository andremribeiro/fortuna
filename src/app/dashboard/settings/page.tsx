import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings.
        </p>
      </div>

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