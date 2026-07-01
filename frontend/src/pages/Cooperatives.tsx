import { useEffect, useState, useCallback } from 'react';
import { Plus, Users, Megaphone, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, Input, Select, Modal, Badge, Spinner, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';

interface Cooperative {
  id: number;
  name: string;
  org_type: string;
  county: string;
  payam: string;
  village: string;
  leader_name: string;
  leader_phone: string;
  member_count: number;
  description: string;
  status: string;
  created_at: string;
}

const COUNTIES = ['Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'];

export default function Cooperatives() {
  const { user } = useAuth();
  const canEdit = ['super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'].includes(user?.role || '');
  const [rows, setRows] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<Cooperative & { announcements?: { title: string; body: string }[] } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set('type', typeFilter);
    if (search) params.set('search', search);
    api.get<Cooperative[]>(`/cooperatives?${params}`).then(setRows).finally(() => setLoading(false));
  }, [typeFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openDetail = async (id: number) => {
    const data = await api.get<Cooperative & { announcements: { title: string; body: string }[] }>(`/cooperatives/${id}`);
    setDetail(data);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Cooperatives & VSLAs"
        subtitle="Group registration, membership and savings tracking"
        actions={
          canEdit && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Register Group
            </Button>
          )
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Search groups..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="cooperative">Cooperatives</option>
            <option value="vsla">VSLAs</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner className="h-7 w-7" /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No groups found" hint="Register a cooperative or VSLA to get started" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <div key={c.id} role="button" tabIndex={0} className="cursor-pointer" onClick={() => openDetail(c.id)} onKeyDown={(e) => e.key === 'Enter' && openDetail(c.id)}>
            <Card className="p-5 transition hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest">
                  {c.org_type === 'vsla' ? <Users size={20} /> : <Building2 size={20} />}
                </div>
                <Badge tone={c.org_type === 'vsla' ? 'amber' : 'green'}>{c.org_type === 'vsla' ? 'VSLA' : 'Cooperative'}</Badge>
              </div>
              <h3 className="font-semibold text-ink">{c.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{c.county} · {c.member_count} members</p>
              {c.leader_name && <p className="mt-2 text-xs text-slate-400">Leader: {c.leader_name}</p>}
            </Card>
            </div>
          ))}
        </div>
      )}

      {modalOpen && <RegisterModal onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />}
      {detail && (
        <Modal open onClose={() => setDetail(null)} title={detail.name} wide>
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><span className="text-slate-500">Type</span><p className="font-medium capitalize">{detail.org_type}</p></div>
              <div><span className="text-slate-500">Members</span><p className="font-medium">{detail.member_count}</p></div>
              <div><span className="text-slate-500">Location</span><p className="font-medium">{detail.county} · {detail.payam}</p></div>
              <div><span className="text-slate-500">Leader</span><p className="font-medium">{detail.leader_name} · {detail.leader_phone}</p></div>
            </div>
            {detail.description && <p className="text-slate-600">{detail.description}</p>}
            {detail.announcements && detail.announcements.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold"><Megaphone size={16} /> Announcements</h4>
                {detail.announcements.map((a, i) => (
                  <div key={i} className="mb-2 rounded-xl bg-mist p-3">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-slate-500">{a.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function RegisterModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', org_type: 'cooperative', county: 'Juba', payam: '', village: '', leader_name: '', leader_phone: '', member_count: '0', description: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/cooperatives', form);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Register Cooperative / VSLA">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Group Name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <Select label="Type" value={form.org_type} onChange={(e) => set('org_type', e.target.value)}>
          <option value="cooperative">Cooperative</option>
          <option value="vsla">VSLA</option>
        </Select>
        <Select label="County" value={form.county} onChange={(e) => set('county', e.target.value)}>
          {COUNTIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Input label="Payam" value={form.payam} onChange={(e) => set('payam', e.target.value)} />
        <Input label="Village" value={form.village} onChange={(e) => set('village', e.target.value)} />
        <Input label="Leader Name" value={form.leader_name} onChange={(e) => set('leader_name', e.target.value)} />
        <Input label="Leader Phone" value={form.leader_phone} onChange={(e) => set('leader_phone', e.target.value)} />
        <Input label="Member Count" type="number" value={form.member_count} onChange={(e) => set('member_count', e.target.value)} />
      </div>
      <Input label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} className="mt-4" />
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !form.name}>{saving ? <Spinner className="h-4 w-4" /> : 'Register'}</Button>
      </div>
    </Modal>
  );
}
