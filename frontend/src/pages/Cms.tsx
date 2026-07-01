import { useEffect, useState, useCallback } from 'react';
import { Plus, FileEdit } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, Input, Select, Badge, Spinner, EmptyState, Modal } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';

interface CmsItem {
  id: number;
  content_type: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  status: string;
  scheduled_at: string;
  author_name?: string;
  created_at: string;
}

const CONTENT_TYPES = ['article', 'video', 'audio', 'document', 'news', 'event', 'announcement'];

export default function Cms() {
  const { user } = useAuth();
  const canEdit = ['super_admin', 'extension_officer', 'digital_champion'].includes(user?.role || '');
  const [rows, setRows] = useState<CmsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    api.get<CmsItem[]>(`/cms?${params}`).then(setRows).finally(() => setLoading(false));
  }, [status, type]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Content Management"
        subtitle="Manage articles, videos, events, announcements and publishing workflow"
        actions={canEdit && (
          <Button onClick={() => setModalOpen(true)}><Plus size={16} /> New Content</Button>
        )}
      />

      <Card className="mb-4 p-4 flex gap-3">
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </Select>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner className="h-7 w-7" /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No content yet" />
      ) : (
        <div className="space-y-3">
          {rows.map((item) => (
            <Card key={item.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <FileEdit size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.content_type} · {item.category || 'Uncategorized'} · {formatDate(item.created_at)}</p>
                </div>
              </div>
              <Badge tone={item.status === 'published' ? 'green' : item.status === 'draft' ? 'gray' : 'amber'}>{item.status}</Badge>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <CreateModal onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />
      )}
    </div>
  );
}

function CreateModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ content_type: 'article', title: '', body: '', category: '', status: 'draft', scheduled_at: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/cms', form);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Create Content" wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Type" value={form.content_type} onChange={(e) => set('content_type', e.target.value)}>
          {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </Select>
        <Input label="Title" value={form.title} onChange={(e) => set('title', e.target.value)} className="sm:col-span-2" />
        <Input label="Category" value={form.category} onChange={(e) => set('category', e.target.value)} />
        {form.status === 'scheduled' && (
          <Input label="Schedule At" type="datetime-local" value={form.scheduled_at} onChange={(e) => set('scheduled_at', e.target.value)} />
        )}
      </div>
      <textarea
        value={form.body}
        onChange={(e) => set('body', e.target.value)}
        placeholder="Content body..."
        className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-forest focus:outline-none"
        rows={6}
      />
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !form.title}>{saving ? <Spinner className="h-4 w-4" /> : 'Create'}</Button>
      </div>
    </Modal>
  );
}
