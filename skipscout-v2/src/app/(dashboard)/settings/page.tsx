import { getOrCreateUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function SettingsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{user.name || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="capitalize">{user.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Credits</span>
            <span>{user.credits.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Support</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Email:{' '}
            <a href="mailto:support@skipscout.com" className="text-blue-600 underline">
              support@skipscout.com
            </a>
          </p>
          <p>Phone: 509-730-5183</p>
        </CardContent>
      </Card>
    </div>
  );
}
