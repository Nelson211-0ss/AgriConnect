import { useEffect, useState, useCallback } from 'react';
import { Star, MapPin, Phone, Building } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, Input, Select, Badge, Spinner, EmptyState, Modal } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';

interface DirectoryEntry {
  id: number;
  entry_type: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  county: string;
  location: string;
  products: string[];
  services: string[];
  description: string;
  rating: number;
  review_count: number;
  verified: boolean;
}

const TYPES = [
  { value: '', label: 'All types' },
  { value: 'buyer', label: 'Buyers' },
  { value: 'processor', label: 'Processors' },
  { value: 'exporter', label: 'Exporters' },
  { value: 'agro_dealer', label: 'Agro-dealers' },
  { value: 'input_supplier', label: 'Input Suppliers' },
  { value: 'transporter', label: 'Transporters' },
  { value: 'bank', label: 'Banks' },
  { value: 'microfinance', label: 'Microfinance' },
  { value: 'sacco', label: 'SACCOs' },
  { value: 'insurance', label: 'Insurance' },
];

const COUNTIES = ['', 'Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'];

export default function Directory() {
  const { user } = useAuth();
  const canEdit = user?.role === 'super_admin' || user?.role === 'extension_officer';
  const [rows, setRows] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [county, setCounty] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DirectoryEntry & { reviews?: { rating: number; comment: string; reviewer_name: string }[] } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (county) params.set('county', county);
    if (search) params.set('search', search);
    api.get<DirectoryEntry[]>(`/directory?${params}`).then(setRows).finally(() => setLoading(false));
  }, [type, county, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openDetail = async (id: number) => {
    const data = await api.get<DirectoryEntry & { reviews: { rating: number; comment: string; reviewer_name: string }[] }>(`/directory/${id}`);
    setSelected(data);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Buyer & Supplier Directory" subtitle="Searchable directory of buyers, processors, agro-dealers and financial institutions" />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Select value={county} onChange={(e) => setCounty(e.target.value)}>
            {COUNTIES.map((c) => <option key={c} value={c}>{c || 'All counties'}</option>)}
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner className="h-7 w-7" /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No directory entries found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((e) => (
            <div key={e.id} role="button" tabIndex={0} className="cursor-pointer" onClick={() => openDetail(e.id)} onKeyDown={(ev) => ev.key === 'Enter' && openDetail(e.id)}>
              <Card className="p-5 transition hover:shadow-md">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Building size={20} />
                  </div>
                  <div className="flex items-center gap-1">
                    {e.verified && <Badge tone="green">Verified</Badge>}
                    <Badge>{e.entry_type.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-ink">{e.company_name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} /> {e.county}</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-amber-600">
                  <Star size={14} fill="currentColor" /> {Number(e.rating).toFixed(1)} ({e.review_count} reviews)
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.company_name} wide>
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{selected.entry_type.replace('_', ' ')}</Badge>
              {selected.verified && <Badge tone="green">Verified</Badge>}
            </div>
            {selected.description && <p className="text-slate-600">{selected.description}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {selected.contact_person && <div><span className="text-slate-500">Contact</span><p className="font-medium">{selected.contact_person}</p></div>}
              {selected.phone && <div><span className="text-slate-500">Phone</span><p className="font-medium flex items-center gap-1"><Phone size={14} /> {selected.phone}</p></div>}
              {selected.location && <div><span className="text-slate-500">Location</span><p className="font-medium">{selected.location}, {selected.county}</p></div>}
            </div>
            {(selected.products?.length > 0 || selected.services?.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {[...(selected.products || []), ...(selected.services || [])].map((p) => (
                  <Badge key={p} tone="green">{p}</Badge>
                ))}
              </div>
            )}
            {selected.reviews && selected.reviews.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold">Reviews</h4>
                {selected.reviews.map((r, i) => (
                  <div key={i} className="mb-2 rounded-xl bg-mist p-3">
                    <div className="flex items-center gap-1 text-amber-600"><Star size={14} fill="currentColor" /> {r.rating} — {r.reviewer_name}</div>
                    {r.comment && <p className="text-slate-500">{r.comment}</p>}
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
