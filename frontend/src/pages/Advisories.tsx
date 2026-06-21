import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Eye, Trash2, Sprout, Beef, CloudSun, Droplets, Bug, Mountain } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardBody, Input, Select, Textarea, Modal, Badge, Spinner, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { MobileShell, MobilePageHeader, MobileSearchBar, MobileToolbar, MobileContent, MobileChipRow, MobileListCard } from '@/components/mobile';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatNumber, cn } from '@/lib/utils';

interface Advisory {
  id: number;
  title: string;
  category: string;
  content: string;
  status: string;
  author_name: string;
  views: number;
  created_at: string;
  scheduled_at: string | null;
}

const CATEGORIES = ['Crop Production', 'Livestock', 'Climate Smart Agriculture', 'Irrigation', 'Pest Control', 'Soil Management'];
const CATEGORY_LABELS: Record<string, string> = {
  '': 'All',
  'Crop Production': 'Crops',
  Livestock: 'Livestock',
  'Climate Smart Agriculture': 'Climate',
  Irrigation: 'Water',
  'Pest Control': 'Pests',
  'Soil Management': 'Soil',
};
const ICONS: Record<string, typeof Sprout> = {
  'Crop Production': Sprout,
  Livestock: Beef,
  'Climate Smart Agriculture': CloudSun,
  Irrigation: Droplets,
  'Pest Control': Bug,
  'Soil Management': Mountain,
};

export default function Advisories() {
  const { user } = useAuth();
  const canEdit = user?.role === 'super_admin' || user?.role === 'extension_officer';
  const [rows, setRows] = useState<Advisory[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Advisory | null>(null);
  const [form, setForm] = useState({ title: '', category: CATEGORIES[0], content: '', status: 'published', scheduled_at: '' });
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<Advisory[]>(`/advisories?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const save = async () => {
    setError('');
    try {
      await api.post('/advisories', form);
      setOpen(false);
      setForm({ title: '', category: CATEGORIES[0], content: '', status: 'published', scheduled_at: '' });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this advisory?')) return;
    await api.del(`/advisories/${id}`);
    load();
  };

  return (
    <div className="animate-fade-in">
      <MobileShell>
        <MobilePageHeader
          title="Crop Advice"
          subtitle="Climate-smart guidance"
          action={
            canEdit && (
              <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                <Plus size={14} />
              </Button>
            )
          }
        />
        <MobileSearchBar value={search} onChange={setSearch} placeholder="Search advisories..." />
        <MobileToolbar className="border-t-0">
          <MobileChipRow
            items={['', ...CATEGORIES]}
            active={category}
            onSelect={setCategory}
            labels={CATEGORY_LABELS}
          />
        </MobileToolbar>
        <MobileContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-7 w-7" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-content-muted">No advisories found.</p>
          ) : (
            rows.map((a) => {
              const Icon = ICONS[a.category] || Sprout;
              return (
                <MobileListCard
                  key={a.id}
                  icon={Icon}
                  iconBg="#0B7A3E"
                  title={a.title}
                  subtitle={
                    <>
                      {a.category} · {formatNumber(a.views)} views
                      <span className="mt-1 block line-clamp-2">{a.content}</span>
                    </>
                  }
                  onClick={() => setView(a)}
                  right={<Badge tone={a.status === 'published' ? 'green' : 'amber'}>{a.status}</Badge>}
                />
              );
            })
          )}
        </MobileContent>
      </MobileShell>

      <div className="hidden md:block">
      <PageHeader
        title="Agricultural Advisories"
        subtitle="Climate-smart guidance for farmers across all counties"
        actions={
          canEdit && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Create Advisory
            </Button>
          )
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search advisories..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-forest focus:outline-none">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-7 w-7" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState title="No advisories found" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => {
            const Icon = ICONS[a.category] || Sprout;
            return (
              <Card key={a.id} className="flex flex-col transition hover:shadow-card">
                <CardBody className="flex flex-1 flex-col pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest">
                      <Icon size={20} />
                    </div>
                    <Badge tone={a.status === 'published' ? 'green' : 'amber'}>{a.status}</Badge>
                  </div>
                  <Badge tone="gray" className="mb-2 w-fit">{a.category}</Badge>
                  <h3 className="font-semibold text-ink">{a.title}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500">{a.content}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye size={13} /> {formatNumber(a.views)} views
                    </span>
                    <span>{formatDate(a.created_at)}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setView(a)}>
                      Read
                    </Button>
                    {canEdit && (
                      <Button variant="ghost" size="sm" onClick={() => remove(a.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Advisory" wide>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="published">Publish now</option>
              <option value="scheduled">Schedule</option>
              <option value="draft">Save as draft</option>
            </Select>
          </div>
          {form.status === 'scheduled' && (
            <Input label="Schedule for" type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
          )}
          <Textarea label="Content" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.title || !form.content}>
              Save Advisory
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!view} onClose={() => setView(null)} title={view?.title || ''} wide>
        {view && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Badge tone="green">{view.category}</Badge>
              <span className="text-sm text-slate-400">By {view.author_name || 'CORWADO'} · {formatDate(view.created_at)}</span>
            </div>
            <p className="leading-relaxed text-slate-700">{view.content}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
