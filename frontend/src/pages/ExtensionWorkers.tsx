import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, Input, Select, Modal, Table, Th, Td, Badge, Spinner, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { formatDate, initials } from '@/lib/utils';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  county: string;
  status: string;
  created_at: string;
  farmers_registered: number;
}

const COUNTIES = ['Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'];

export default function ExtensionWorkers() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin';
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'password123', role: 'extension_officer', phone: '', county: 'Juba' });
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<UserRow[]>(`/users?role=extension_officer&search=${encodeURIComponent(search)}`)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const save = async () => {
    setError('');
    try {
      await api.post('/users', form);
      setOpen(false);
      setForm({ name: '', email: '', password: 'password123', role: 'extension_officer', phone: '', county: 'Juba' });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Remove this extension worker?')) return;
    await api.del(`/users/${id}`);
    load();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Extension Workers"
        subtitle={`${rows.length} field officers supporting farmers`}
        actions={
          isAdmin && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Add Officer
            </Button>
          )
        }
      />

      <Card className="mb-4 p-4">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search officers..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No extension workers found" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Officer</Th>
                <Th>Contact</Th>
                <Th>County</Th>
                <Th>Farmers Registered</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                {isAdmin && <Th></Th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-50 text-sm font-semibold text-forest">
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
                      <Phone size={12} /> {u.phone}
                    </div>
                  </Td>
                  <Td>{u.county}</Td>
                  <Td>
                    <span className="font-semibold text-ink">{u.farmers_registered}</span>
                  </Td>
                  <Td>
                    <Badge tone={u.status === 'active' ? 'green' : 'gray'}>{u.status}</Badge>
                  </Td>
                  <Td className="text-slate-500">{formatDate(u.created_at)}</Td>
                  {isAdmin && (
                    <Td>
                      <button onClick={() => remove(u.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Extension Officer">
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Select label="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })}>
              {COUNTIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <Input label="Temporary Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.name || !form.email}>
              Add Officer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
