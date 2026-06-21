import { useRef, useState, useEffect } from 'react';
import { Shield, User, Bell, Globe, Database, Check, Camera, Loader2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody, Input, Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth, ROLE_LABELS } from '@/context/AuthContext';
import { fileToCompressedDataUrl } from '@/lib/utils';

const PERMISSIONS: Record<string, string[]> = {
  super_admin: ['Manage users & roles', 'Manage farmers & content', 'Market prices & reports', 'Full system access'],
  extension_officer: ['Register farmers', 'Publish advisories', 'Create alerts', 'Send messages'],
  farmer: ['View advisories', 'Receive alerts', 'View market prices', 'Access weather & finance'],
  buyer: ['Post buying opportunities', 'Search farmers', 'Contact cooperatives'],
};

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setName(user.name);
  }, [user?.name]);

  if (!user) return null;
  const perms = PERMISSIONS[user.role] || [];

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateProfile({ name: name.trim() });
      setMessage('Profile saved successfully.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (file: File) => {
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const avatar_url = await fileToCompressedDataUrl(file, 400, 0.8);
      await updateProfile({ avatar_url });
      setMessage('Profile photo updated.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setUploading(true);
    setError('');
    setMessage('');
    try {
      await updateProfile({ avatar_url: null });
      setMessage('Profile photo removed.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader title="Settings" subtitle="Manage your profile and platform preferences" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 dark:border-slate-700 dark:bg-slate-900">
          <CardHeader title="Profile" />
          <CardBody className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative">
                <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="lg" />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-ink dark:text-white">{user.name}</div>
                <Badge tone="green">{ROLE_LABELS[user.role]}</Badge>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Your photo is visible to super admins, extension workers, and other users on the platform.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhoto(file);
                      e.target.value = '';
                    }}
                  />
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Camera size={15} /> Upload photo
                  </Button>
                  {user.avatar_url && (
                    <Button variant="outline" size="sm" onClick={removePhoto} disabled={uploading}>
                      <Trash2 size={15} /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" defaultValue={user.email} disabled />
            </div>
            {message && <div className="rounded-md bg-forest-50 px-3 py-2 text-sm text-forest dark:bg-forest-800/30 dark:text-leaf">{message}</div>}
            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </CardBody>
        </Card>

        <Card className="dark:border-slate-700 dark:bg-slate-900">
          <CardHeader title="Role Permissions" />
          <CardBody>
            <div className="mb-3 flex items-center gap-2 text-forest dark:text-leaf">
              <Shield size={18} />
              <span className="font-medium">{ROLE_LABELS[user.role]}</span>
            </div>
            <ul className="space-y-2">
              {perms.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Check size={15} className="text-forest dark:text-leaf" /> {p}
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
            <Card key={title as string} className="p-5 dark:border-slate-700 dark:bg-slate-900">
              <I size={20} className="text-forest dark:text-leaf" />
              <div className="mt-3 font-semibold text-ink dark:text-white">{title as string}</div>
              <div className="text-sm text-slate-400">{desc as string}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
