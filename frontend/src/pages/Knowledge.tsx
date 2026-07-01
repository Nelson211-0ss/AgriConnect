import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Video, Headphones, FileText, HelpCircle, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, Input, Select, Badge, Spinner, EmptyState, Modal } from '@/components/ui';
import { PageHeader } from '@/components/common';

interface KbItem {
  id: number;
  type: string;
  title: string;
  content: string;
  category: string;
  media_url: string;
  pdf_url: string;
  tags: string[];
  views: number;
  author_name?: string;
  created_at: string;
}

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  faq: HelpCircle,
  guide: BookOpen,
  video: Video,
  audio: Headphones,
  pdf: FileText,
};

const TYPES = ['', 'faq', 'guide', 'video', 'audio', 'pdf'];

export default function Knowledge() {
  const [rows, setRows] = useState<KbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<KbItem | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (search) params.set('search', search);
    api.get<KbItem[]>(`/knowledge?${params}`).then(setRows).finally(() => setLoading(false));
  }, [type, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openItem = async (id: number) => {
    const item = await api.get<KbItem>(`/knowledge/${id}`);
    setSelected(item);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Knowledge Base" subtitle="FAQs, guides, video tutorials, audio lessons and PDF resources" />

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Search knowledge base..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner className="h-7 w-7" /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No resources found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((item) => {
            const Icon = TYPE_ICONS[item.type] || BookOpen;
            return (
              <div key={item.id} role="button" tabIndex={0} className="cursor-pointer" onClick={() => openItem(item.id)} onKeyDown={(e) => e.key === 'Enter' && openItem(item.id)}>
                <Card className="p-5 transition hover:shadow-md">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={20} />
                    </div>
                    <Badge tone="blue">{item.type.toUpperCase()}</Badge>
                  </div>
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.content}</p>
                  <p className="mt-2 text-xs text-slate-400">{item.category} · {item.views} views</p>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.title} wide>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="blue">{selected.type.toUpperCase()}</Badge>
              {selected.category && <Badge>{selected.category}</Badge>}
            </div>
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{selected.content}</div>
            {selected.media_url && (
              <a href={selected.media_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-forest hover:underline">
                <Play size={16} /> Open media resource
              </a>
            )}
            {selected.pdf_url && (
              <a href={selected.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-forest hover:underline">
                <FileText size={16} /> Download PDF
              </a>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
