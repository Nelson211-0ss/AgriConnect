import { useEffect, useRef, useState } from 'react';
import { Plus, MapPin, Phone, Package, Trash2, HandHeart, Sprout, ShoppingCart, ImagePlus, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardBody, Input, Select, Textarea, Modal, Badge, Spinner, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { RoleWelcome } from '@/components/RoleWelcome';
import { useAuth } from '@/context/AuthContext';
import { SSP, formatNumber, timeAgo, fileToCompressedDataUrl, cn } from '@/lib/utils';

interface DemandListing {
  id: number;
  buyer_name: string;
  commodity: string;
  quantity: number;
  unit: string;
  price: number;
  delivery_location: string;
  contact_info: string;
  status: string;
  created_at: string;
  interests: number;
}

interface ProduceListing {
  id: number;
  farmer_name: string;
  commodity: string;
  quantity: number;
  unit: string;
  price: number;
  county: string;
  location: string;
  contact_info: string;
  image_url: string | null;
  description: string;
  status: string;
  created_at: string;
  interests: number;
}

const COMMODITIES = ['Maize', 'Sorghum', 'Groundnuts', 'Sesame', 'Cassava'];
const COUNTIES = ['Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'];

const COMMODITY_IMAGE: Record<string, string> = {
  Maize: '/produce/maize.jpg',
  Sorghum: '/produce/sorghum.jpg',
  Groundnuts: '/produce/groundnuts.jpg',
  Sesame: '/produce/sesame.jpg',
  Cassava: '/produce/cassava.jpg',
};

const produceImage = (l: ProduceListing) => l.image_url || COMMODITY_IMAGE[l.commodity] || COMMODITY_IMAGE.Maize;

export default function Marketplace() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';
  const isBuyer = user?.role === 'buyer';
  const isAdmin = user?.role === 'super_admin';
  const showWelcome = isFarmer || isBuyer;

  const [tab, setTab] = useState<'produce' | 'demand'>(isBuyer ? 'demand' : 'produce');
  const [filter, setFilter] = useState('');

  return (
    <div className="animate-fade-in">
      {showWelcome ? (
        <RoleWelcome />
      ) : (
        <PageHeader title="Marketplace" subtitle="Farmer produce for sale and buyer demand in one place" />
      )}

      {showWelcome && (
        <h3 className="mb-4 text-lg font-semibold text-ink dark:text-white">Marketplace</h3>
      )}

      {/* Tab switcher */}
      <div className="mb-5 inline-flex rounded-md border border-slate-200 bg-white p-1">
        <button
          onClick={() => {
            setTab('produce');
            setFilter('');
          }}
          className={cn(
            'flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition',
            tab === 'produce' ? 'bg-forest text-white' : 'text-slate-600 hover:text-forest'
          )}
        >
          <Sprout size={16} /> Farmer Produce
        </button>
        <button
          onClick={() => {
            setTab('demand');
            setFilter('');
          }}
          className={cn(
            'flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition',
            tab === 'demand' ? 'bg-forest text-white' : 'text-slate-600 hover:text-forest'
          )}
        >
          <ShoppingCart size={16} /> Buyer Demand
        </button>
      </div>

      {/* Commodity filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={cn('rounded-md border px-4 py-2 text-sm font-medium', !filter ? 'border-forest bg-forest text-white' : 'border-slate-200 bg-white text-slate-600')}
        >
          All
        </button>
        {COMMODITIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn('rounded-md border px-4 py-2 text-sm font-medium', filter === c ? 'border-forest bg-forest text-white' : 'border-slate-200 bg-white text-slate-600')}
          >
            {c}
          </button>
        ))}
      </div>

      {tab === 'produce' ? (
        <ProduceTab filter={filter} canPost={isFarmer || isAdmin} canBuy={isBuyer || isAdmin} canDelete={isFarmer || isAdmin} />
      ) : (
        <DemandTab filter={filter} canPost={isBuyer || isAdmin} canShowInterest={isFarmer} canDelete={isBuyer || isAdmin} />
      )}
    </div>
  );
}

/* ----------------------------- Farmer Produce ----------------------------- */

function ProduceTab({ filter, canPost, canBuy, canDelete }: { filter: string; canPost: boolean; canBuy: boolean; canDelete: boolean }) {
  const [rows, setRows] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<ProduceListing[]>(`/produce${filter ? `?commodity=${filter}` : ''}`)
      .then(setRows)
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const showInterest = async (id: number) => {
    await api.post(`/produce/${id}/interest`, {});
    load();
  };
  const remove = async (id: number) => {
    if (!confirm('Remove this produce listing?')) return;
    await api.del(`/produce/${id}`);
    load();
  };

  return (
    <>
      {canPost && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Post Produce
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-7 w-7" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState title="No produce listed yet" hint="Farmers can post produce with photos for buyers to browse." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((l) => (
            <Card key={l.id} className="flex flex-col overflow-hidden transition hover:shadow-card">
              {/* Photo */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img src={produceImage(l)} alt={l.commodity} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute left-3 top-3">
                  <Badge tone={l.status === 'available' ? 'green' : 'gray'} className="shadow-sm">
                    {l.status === 'available' ? 'Available' : 'Sold'}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{l.commodity}</h3>
                      <p className="text-xs text-white/80">by {l.farmer_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-white">{SSP(l.price)}</div>
                      <div className="text-[11px] text-white/80">per {l.unit}</div>
                    </div>
                  </div>
                </div>
              </div>

              <CardBody className="flex flex-1 flex-col pt-4">
                {l.description && <p className="line-clamp-2 text-sm text-slate-600">{l.description}</p>}
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-medium text-ink">{formatNumber(l.quantity)} {l.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={13} className="text-forest" /> {l.location || l.county}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Phone size={13} /> {l.contact_info}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">{l.interests} interested · {timeAgo(l.created_at)}</span>
                  <div className="flex items-center gap-1">
                    {canBuy && l.status === 'available' && (
                      <Button size="sm" variant="outline" onClick={() => showInterest(l.id)}>
                        <HandHeart size={14} /> Contact
                      </Button>
                    )}
                    {canDelete && (
                      <button onClick={() => remove(l.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {open && (
        <ProduceFormModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      )}
    </>
  );
}

function ProduceFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    commodity: 'Maize',
    quantity: '',
    price: '',
    county: 'Juba',
    location: '',
    contact_info: '',
    description: '',
    image_url: '',
  });
  const [preview, setPreview] = useState('');
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setProcessing(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      set('image_url', dataUrl);
      setPreview(dataUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/produce', form);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const shownImage = preview || COMMODITY_IMAGE[form.commodity];

  return (
    <Modal open onClose={onClose} title="Post Produce for Sale" wide>
      <div className="space-y-4">
        {/* Photo uploader */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Produce Photo</span>
          <div className="flex gap-4">
            <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <img src={shownImage} alt="preview" className="h-full w-full object-cover" />
              {preview && (
                <button
                  type="button"
                  onClick={() => {
                    setPreview('');
                    set('image_url', '');
                  }}
                  className="absolute right-1 top-1 rounded bg-black/40 p-1 text-white hover:bg-black/60"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="flex flex-col justify-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={processing}>
                {processing ? <Loader2 className="animate-spin" size={14} /> : <ImagePlus size={14} />}
                {processing ? 'Processing...' : 'Upload Photo'}
              </Button>
              <p className="text-xs text-slate-400">A clear photo helps buyers. If none is uploaded, a default {form.commodity} photo is shown.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Commodity" value={form.commodity} onChange={(e) => set('commodity', e.target.value)}>
            {COMMODITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Input label="Quantity (kg)" type="number" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Asking Price (SSP/kg)" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
          <Select label="County" value={form.county} onChange={(e) => set('county', e.target.value)}>
            {COUNTIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <Input label="Location / Payam" value={form.location} onChange={(e) => set('location', e.target.value)} />
        <Input label="Contact Information" value={form.contact_info} onChange={(e) => set('contact_info', e.target.value)} placeholder="+211 ..." />
        <Textarea label="Description" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe quality, drying, packaging..." />

        {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || processing}>
            {saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Post Produce'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------- Buyer Demand ----------------------------- */

function DemandTab({ filter, canPost, canShowInterest, canDelete }: { filter: string; canPost: boolean; canShowInterest: boolean; canDelete: boolean }) {
  const [rows, setRows] = useState<DemandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ commodity: 'Maize', quantity: '', price: '', delivery_location: '', contact_info: '' });

  const load = () => {
    setLoading(true);
    api
      .get<DemandListing[]>(`/marketplace${filter ? `?commodity=${filter}` : ''}`)
      .then(setRows)
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const save = async () => {
    await api.post('/marketplace', form);
    setOpen(false);
    setForm({ commodity: 'Maize', quantity: '', price: '', delivery_location: '', contact_info: '' });
    load();
  };
  const expressInterest = async (id: number) => {
    await api.post(`/marketplace/${id}/interest`, {});
    load();
  };
  const remove = async (id: number) => {
    if (!confirm('Remove this listing?')) return;
    await api.del(`/marketplace/${id}`);
    load();
  };

  return (
    <>
      {canPost && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Post Demand
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-7 w-7" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState title="No demand posted yet" hint="Buyers can post buying opportunities here." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((l) => (
            <Card key={l.id} className="flex flex-col transition hover:shadow-card">
              <CardBody className="flex flex-1 flex-col pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <Package size={20} />
                  </div>
                  <Badge tone={l.status === 'open' ? 'green' : 'gray'}>{l.status}</Badge>
                </div>
                <h3 className="text-lg font-bold text-ink">{l.commodity}</h3>
                <p className="text-sm text-slate-500">{l.buyer_name}</p>

                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-medium text-ink">{formatNumber(l.quantity)} {l.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Offer Price</span>
                    <span className="font-semibold text-forest">{SSP(l.price)}/{l.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={13} className="text-forest" /> {l.delivery_location}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Phone size={13} /> {l.contact_info}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">{l.interests} interested · {timeAgo(l.created_at)}</span>
                  <div className="flex items-center gap-1">
                    {canShowInterest && (
                      <Button size="sm" variant="outline" onClick={() => expressInterest(l.id)}>
                        <HandHeart size={14} /> Submit Interest
                      </Button>
                    )}
                    {canDelete && (
                      <button onClick={() => remove(l.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Post Buying Opportunity">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Commodity" value={form.commodity} onChange={(e) => setForm({ ...form, commodity: e.target.value })}>
              {COMMODITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Input label="Quantity (kg)" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Offer Price (SSP/kg)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Delivery Location" value={form.delivery_location} onChange={(e) => setForm({ ...form, delivery_location: e.target.value })} />
          </div>
          <Input label="Contact Information" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} placeholder="+211 ..." />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Post Demand</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
