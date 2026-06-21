import { Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2, Mail, Phone, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, Input, Select, Modal, Table, Th, Td, Badge, Spinner, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { ROLE_LABELS, useAuth } from '@/context/AuthContext';
import { formatDate, initials, cn } from '@/lib/utils';
import { DEFAULT_PASSWORD } from '@/lib/constants';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  county: string;
  status: string;
  created_at: string;
}

const COUNTIES = ['Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'];

type AccountRole = 'farmer' | 'buyer';

export default function Users() {
  const { user } = useAuth();
  const [tab, setTab] = useState<AccountRole>('farmer');
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', county: 'Juba' });
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<UserRow[]>(`/users?role=${tab}&search=${encodeURIComponent(search)}`)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const save = async () => {
    setError('');
    try {
      await api.post('/users', { ...form, role: tab });
      setOpen(false);
      setForm({ name: '', email: '', phone: '', county: 'Juba' });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(`Remove this ${tab} account?`)) return;
    await api.del(`/users/${id}`);
    load();
  };

  const label = ROLE_LABELS[tab];

  if (user?.role !== 'super_admin') return <Navigate to="/app/dashboard" replace />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Accounts"
        subtitle="Super Admin can create farmer and buyer login accounts"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Add {label}
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-3 rounded-md border border-forest-100 bg-forest-50 px-4 py-3 text-sm text-forest-800">
        <KeyRound size={18} className="shrink-0" />
        <span>
          All accounts use the default password: <strong className="font-mono">{DEFAULT_PASSWORD}</strong> (including self-registered users)
        </span>
      </div>

      <div className="mb-4 inline-flex rounded-md border border-slate-200 bg-white p-1">
        {(['farmer', 'buyer'] as AccountRole[]).map((r) => (
          <button
            key={r}
            onClick={() => {
              setTab(r);
              setSearch('');
            }}
            className={cn(
              'rounded px-4 py-2 text-sm font-medium transition',
              tab === r ? 'bg-forest text-white' : 'text-slate-600 hover:text-forest'
            )}
          >
            {ROLE_LABELS[r]}s
          </button>
        ))}
      </div>

      <Card className="mb-4 p-4">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}s...`}
            className="w-full rounded-md border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title={`No ${label.toLowerCase()} accounts yet`} hint={`Add a ${label.toLowerCase()} or they can self-register at /register`} />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>County</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-forest-50 text-sm font-semibold text-forest">
                        {initials(u.name)}
                      </div>
                      <span className="font-medium text-ink">{u.name}</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Mail size={12} /> {u.email}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Phone size={12} /> {u.phone || '—'}
                    </div>
                  </Td>
                  <Td>{u.county || '—'}</Td>
                  <Td>
                    <Badge tone={u.status === 'active' ? 'green' : 'gray'}>{u.status}</Badge>
                  </Td>
                  <Td className="text-slate-500">{formatDate(u.created_at)}</Td>
                  <Td>
                    <button onClick={() => remove(u.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`Add ${label} Account`}>
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+211 ..." />
            <Select label="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })}>
              {COUNTIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="rounded-md border border-slate-200 bg-mist px-3 py-2.5 text-sm text-slate-600">
            Default password: <span className="font-mono font-semibold text-ink">{DEFAULT_PASSWORD}</span>
          </div>
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.name || !form.email}>
              Create Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
