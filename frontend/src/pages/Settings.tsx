import { Shield, User, Bell, Globe, Database, Check } from 'lucide-react';
import { Card, CardHeader, CardBody, Input, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useAuth, ROLE_LABELS } from '@/context/AuthContext';
import { initials } from '@/lib/utils';

const PERMISSIONS: Record<string, string[]> = {
  super_admin: ['Manage users & roles', 'Manage farmers & content', 'Market prices & reports', 'Full system access'],
  extension_officer: ['Register farmers', 'Publish advisories', 'Create alerts', 'Send messages'],
  farmer: ['View advisories', 'Receive alerts', 'View market prices', 'Access weather & finance'],
  buyer: ['Post buying opportunities', 'Search farmers', 'Contact cooperatives'],
};

export default function Settings() {
  const { user } = useAuth();
  if (!user) return null;
  const perms = PERMISSIONS[user.role] || [];

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader title="Settings" subtitle="Manage your profile and platform preferences" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Profile" />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-xl font-bold text-white">
                {initials(user.name)}
              </div>
              <div>
                <div className="text-lg font-semibold text-ink">{user.name}</div>
                <Badge tone="green">{ROLE_LABELS[user.role]}</Badge>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full Name" defaultValue={user.name} />
              <Input label="Email" defaultValue={user.email} disabled />
            </div>
            <Button>Save Changes</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Role Permissions" />
          <CardBody>
            <div className="mb-3 flex items-center gap-2 text-forest">
              <Shield size={18} />
              <span className="font-medium">{ROLE_LABELS[user.role]}</span>
            </div>
            <ul className="space-y-2">
              {perms.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check size={15} className="text-forest" /> {p}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [Bell, 'Notifications', 'Email & SMS alerts enabled'],
          [Globe, 'Language', 'English (South Sudan)'],
          [Database, 'Data Sync', 'Last synced just now'],
          [User, 'Account', 'Active since 2025'],
        ].map(([Icon, title, desc]) => {
          const I = Icon as typeof Bell;
          return (
            <Card key={title as string} className="p-5">
              <I size={20} className="text-forest" />
              <div className="mt-3 font-semibold text-ink">{title as string}</div>
              <div className="text-sm text-slate-400">{desc as string}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
