import { useEffect, useRef, useState, useCallback } from 'react';
import { Plus, MapPin, Phone, Package, Trash2, HandHeart, Sprout, ShoppingCart, ImagePlus, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardBody, Input, Select, Textarea, Modal, Badge, Spinner, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { MobileShell, MobilePageHeader, MobileToolbar, MobileContent, itemCardPanel, itemCardShell, itemCardLabel, itemCardValue, itemCardMuted, itemCardFaint, itemCardDivider } from '@/components/mobile';
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
const QUANTITY_OPTIONS = [25, 50, 100, 250, 500, 1000, 2000, 5000];

function buildCommodityCounts<T extends { commodity: string }>(rows: T[]) {
  const counts: Record<string, number> = { '': rows.length };
  COMMODITIES.forEach((c) => {
    counts[c] = rows.filter((r) => r.commodity === c).length;
  });
  return counts;
}

const COMMODITY_IMAGE: Record<string, string> = {
  Maize: '/produce/maize.jpg',
  Sorghum: '/produce/sorghum.jpg',
  Groundnuts: '/produce/groundnuts.jpg',
  Sesame: '/produce/sesame.jpg',
  Cassava: '/produce/cassava.jpg',
};

const produceImage = (l: ProduceListing) => l.image_url || COMMODITY_IMAGE[l.commodity] || COMMODITY_IMAGE.Maize;

const itemDetailsPanel = itemCardPanel;
const itemDetailsCard = itemCardShell;

export default function Marketplace() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';
  const isBuyer = user?.role === 'buyer';
  const isAdmin = user?.role === 'super_admin';
  const isMobileApp = isFarmer || isBuyer;

  const [tab, setTab] = useState<'produce' | 'demand'>(isBuyer ? 'demand' : 'produce');
  const [filter, setFilter] = useState('');
  const [listingCounts, setListingCounts] = useState<Record<string, number>>({});

  const refreshCounts = useCallback(() => {
    const endpoint = tab === 'produce' ? '/produce' : '/marketplace';
    api
      .get<{ commodity: string }[]>(endpoint)
      .then((rows) => setListingCounts(buildCommodityCounts(rows)))
      .catch(() => setListingCounts({}));
  }, [tab]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  return (
    <div className="animate-fade-in">
      {isMobileApp && (
        <MobileShell>
          <MobilePageHeader title="Marketplace" subtitle="Farmer produce & buyer demand" />
          <MarketplaceBody
            tab={tab}
            setTab={setTab}
            filter={filter}
            setFilter={setFilter}
            listingCounts={listingCounts}
            isFarmer={isFarmer}
            isBuyer={isBuyer}
            isAdmin={isAdmin}
            refreshCounts={refreshCounts}
            mobile
          />
        </MobileShell>
      )}
      <div className={cn(isMobileApp && 'hidden md:block')}>
        <PageHeader title="Marketplace" subtitle="Farmer produce for sale and buyer demand in one place" />
        <MarketplaceBody
          tab={tab}
          setTab={setTab}
          filter={filter}
          setFilter={setFilter}
          listingCounts={listingCounts}
          isFarmer={isFarmer}
          isBuyer={isBuyer}
          isAdmin={isAdmin}
          refreshCounts={refreshCounts}
        />
      </div>
    </div>
  );
}

function MarketplaceBody({
  tab,
  setTab,
  filter,
  setFilter,
  listingCounts,
  isFarmer,
  isBuyer,
  isAdmin,
  refreshCounts,
  mobile = false,
}: {
  tab: 'produce' | 'demand';
  setTab: (t: 'produce' | 'demand') => void;
  filter: string;
  setFilter: (f: string) => void;
  listingCounts: Record<string, number>;
  isFarmer: boolean;
  isBuyer: boolean;
  isAdmin: boolean;
  refreshCounts: () => void;
  mobile?: boolean;
}) {
  return (
    <>
      {mobile ? (
        <>
          <MobileToolbar>
            <div className="flex w-full gap-1 rounded-2xl bg-surface-muted p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTab('produce');
                  setFilter('');
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition sm:text-sm',
                  tab === 'produce' ? 'bg-forest text-white shadow-sm' : 'text-content-muted'
                )}
              >
                <Sprout size={15} />
                <span>Produce</span>
                {tab === 'produce' && listingCounts[''] != null && (
                  <span className="rounded-full bg-white/20 px-1.5 text-[10px]">{listingCounts['']}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('demand');
                  setFilter('');
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition sm:text-sm',
                  tab === 'demand' ? 'bg-forest text-white shadow-sm' : 'text-content-muted'
                )}
              >
                <ShoppingCart size={15} />
                <span>Demand</span>
                {tab === 'demand' && listingCounts[''] != null && (
                  <span className="rounded-full bg-white/20 px-1.5 text-[10px]">{listingCounts['']}</span>
                )}
              </button>
            </div>
            <Select
              label={tab === 'produce' ? 'Filter produce' : 'Filter demand'}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All ({listingCounts[''] ?? 0})</option>
              {COMMODITIES.map((c) => (
                <option key={c} value={c}>
                  {c} ({listingCounts[c] ?? 0})
                </option>
              ))}
            </Select>
          </MobileToolbar>
          {tab === 'produce' ? (
            <ProduceTab filter={filter} canPost={isFarmer || isAdmin} canBuy={isBuyer || isAdmin} canDelete={isFarmer || isAdmin} onUpdated={refreshCounts} mobile />
          ) : (
            <DemandTab filter={filter} canPost={isBuyer || isAdmin} canShowInterest={isFarmer} canDelete={isBuyer || isAdmin} onUpdated={refreshCounts} mobile />
          )}
        </>
      ) : (
        <>
      {/* Tab switcher */}
      <div className="mb-5 inline-flex rounded-md border border-line bg-surface p-1 dark:border-line dark:bg-surface-elevated">
        <button
          onClick={() => {
            setTab('produce');
            setFilter('');
          }}
          className={cn(
            'flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition',
            tab === 'produce' ? 'bg-forest text-white' : 'text-content-muted hover:text-forest'
          )}
        >
          <Sprout size={16} /> Farmer Produce
          {tab === 'produce' && listingCounts[''] != null && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{listingCounts['']}</span>
          )}
        </button>
        <button
          onClick={() => {
            setTab('demand');
            setFilter('');
          }}
          className={cn(
            'flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition',
            tab === 'demand' ? 'bg-forest text-white' : 'text-content-muted hover:text-forest'
          )}
        >
          <ShoppingCart size={16} /> Buyer Demand
          {tab === 'demand' && listingCounts[''] != null && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{listingCounts['']}</span>
          )}
        </button>
      </div>

      {/* Commodity filter */}
      <div className="mb-4 max-w-sm">
        <Select
          label={tab === 'produce' ? 'Filter produce' : 'Filter demand'}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All ({listingCounts[''] ?? 0})</option>
          {COMMODITIES.map((c) => (
            <option key={c} value={c}>
              {c} ({listingCounts[c] ?? 0})
            </option>
          ))}
        </Select>
      </div>

      {tab === 'produce' ? (
        <ProduceTab filter={filter} canPost={isFarmer || isAdmin} canBuy={isBuyer || isAdmin} canDelete={isFarmer || isAdmin} onUpdated={refreshCounts} />
      ) : (
        <DemandTab filter={filter} canPost={isBuyer || isAdmin} canShowInterest={isFarmer} canDelete={isBuyer || isAdmin} onUpdated={refreshCounts} />
      )}
        </>
      )}
    </>
  );
}

/* ----------------------------- Farmer Produce ----------------------------- */

function ProduceTab({
  filter,
  canPost,
  canBuy,
  canDelete,
  onUpdated,
  mobile = false,
}: {
  filter: string;
  canPost: boolean;
  canBuy: boolean;
  canDelete: boolean;
  onUpdated?: () => void;
  mobile?: boolean;
}) {
  const [rows, setRows] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<ProduceListing[]>(`/produce${filter ? `?commodity=${filter}` : ''}`)
      .then(setRows)
      .finally(() => {
        setLoading(false);
        onUpdated?.();
      });
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
      {mobile ? (
        <MobileContent>
          {canPost && (
            <Button className="w-full" onClick={() => setOpen(true)}>
              <Plus size={16} /> Post Produce
            </Button>
          )}
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-7 w-7" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-content-muted">No produce listed yet.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((l) => (
                <Card key={l.id} className="overflow-hidden shadow-soft">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted dark:bg-slate-800">
                    <img src={produceImage(l)} alt={l.commodity} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute left-2.5 top-2.5">
                      <Badge tone={l.status === 'available' ? 'green' : 'gray'} className="shadow-sm">
                        {l.status === 'available' ? 'Available' : 'Sold'}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-white">{l.commodity}</h3>
                          <p className="truncate text-xs text-white/80">by {l.farmer_name}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-bold text-white">{SSP(l.price)}</div>
                          <div className="text-[10px] text-white/80">per {l.unit}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardBody className={cn('space-y-3 pt-3', itemDetailsPanel)}>
                    {l.description && <p className={cn('line-clamp-2 text-sm', itemCardMuted)}>{l.description}</p>}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                      <span className={itemCardLabel}>Quantity</span>
                      <span className={cn('text-right', itemCardValue)}>{formatNumber(l.quantity)} {l.unit}</span>
                      <span className={itemCardLabel}>Location</span>
                      <span className={cn('truncate text-right', itemCardValue)}>{l.location || l.county}</span>
                    </div>
                    <div className={cn('flex items-center justify-between gap-2 border-t pt-3', itemCardDivider)}>
                      <span className={cn('text-[11px]', itemCardFaint)}>{l.interests} interested</span>
                      <div className="flex shrink-0 items-center gap-1">
                        {canBuy && l.status === 'available' && (
                          <Button size="sm" variant="outline" onClick={() => showInterest(l.id)}>
                            <HandHeart size={14} /> Contact
                          </Button>
                        )}
                        {canDelete && (
                          <button type="button" onClick={() => remove(l.id)} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-red-200">
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
        </MobileContent>
      ) : (
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((l) => (
            <Card key={l.id} className="flex flex-col overflow-hidden transition hover:shadow-card">
              {/* Photo */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted dark:bg-slate-800">
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

              <CardBody className={cn('flex flex-1 flex-col pt-4', itemDetailsPanel)}>
                {l.description && <p className={cn('line-clamp-2 text-sm', itemCardMuted)}>{l.description}</p>}
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className={itemCardLabel}>Quantity</span>
                    <span className={itemCardValue}>{formatNumber(l.quantity)} {l.unit}</span>
                  </div>
                  <div className={cn('flex items-center gap-1', itemCardMuted)}>
                    <MapPin size={13} className="text-leaf-light" /> {l.location || l.county}
                  </div>
                  <div className={cn('flex items-center gap-1', itemCardMuted)}>
                    <Phone size={13} /> {l.contact_info}
                  </div>
                </div>

                <div className={cn('mt-4 flex items-center justify-between border-t pt-3', itemCardDivider)}>
                  <span className={cn('text-xs', itemCardFaint)}>{l.interests} interested · {timeAgo(l.created_at)}</span>
                  <div className="flex items-center gap-1">
                    {canBuy && l.status === 'available' && (
                      <Button size="sm" variant="outline" onClick={() => showInterest(l.id)}>
                        <HandHeart size={14} /> Contact
                      </Button>
                    )}
                    {canDelete && (
                      <button onClick={() => remove(l.id)} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-red-200">
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
        </>
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
    quantity: '100',
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
          <span className="mb-1.5 block text-sm font-medium text-content">Produce Photo</span>
          <div className="flex gap-4">
            <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-md border border-line bg-surface-muted dark:border-line dark:bg-slate-800">
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
              <p className="text-xs text-content-faint">A clear photo helps buyers. If none is uploaded, a default {form.commodity} photo is shown.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Commodity" value={form.commodity} onChange={(e) => set('commodity', e.target.value)}>
            {COMMODITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select label="Quantity (kg)" value={form.quantity} onChange={(e) => set('quantity', e.target.value)}>
            <option value="">Select amount</option>
            {QUANTITY_OPTIONS.map((q) => (
              <option key={q} value={String(q)}>
                {formatNumber(q)} kg
              </option>
            ))}
          </Select>
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

        {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || processing || !form.quantity}>
            {saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Post Produce'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------- Buyer Demand ----------------------------- */

function DemandTab({
  filter,
  canPost,
  canShowInterest,
  canDelete,
  onUpdated,
  mobile = false,
}: {
  filter: string;
  canPost: boolean;
  canShowInterest: boolean;
  canDelete: boolean;
  onUpdated?: () => void;
  mobile?: boolean;
}) {
  const [rows, setRows] = useState<DemandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ commodity: 'Maize', quantity: '100', price: '', delivery_location: '', contact_info: '' });

  const load = () => {
    setLoading(true);
    api
      .get<DemandListing[]>(`/marketplace${filter ? `?commodity=${filter}` : ''}`)
      .then(setRows)
      .finally(() => {
        setLoading(false);
        onUpdated?.();
      });
  };
  useEffect(load, [filter]);

  const save = async () => {
    await api.post('/marketplace', form);
    setOpen(false);
    setForm({ commodity: 'Maize', quantity: '100', price: '', delivery_location: '', contact_info: '' });
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
      {mobile ? (
        <MobileContent>
          {canPost && (
            <Button className="w-full" onClick={() => setOpen(true)}>
              <Plus size={16} /> Post Demand
            </Button>
          )}
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-7 w-7" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-content-muted">No demand posted yet.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((l) => (
                <Card key={l.id} className={cn('overflow-hidden border', itemDetailsCard)}>
                  <CardBody className="space-y-3 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                          <Package size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className={cn('truncate font-bold', itemCardValue)}>{l.commodity}</h3>
                          <p className={cn('truncate text-xs', itemCardMuted)}>{l.buyer_name}</p>
                        </div>
                      </div>
                      <Badge tone={l.status === 'open' ? 'green' : 'gray'} className="bg-white/20 text-white">{l.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                      <span className={itemCardLabel}>Quantity</span>
                      <span className={cn('text-right', itemCardValue)}>{formatNumber(l.quantity)} {l.unit}</span>
                      <span className={itemCardLabel}>Price</span>
                      <span className={cn('text-right font-semibold text-leaf-light')}>{SSP(l.price)}/{l.unit}</span>
                      <span className={itemCardLabel}>Delivery</span>
                      <span className={cn('truncate text-right', itemCardValue)}>{l.delivery_location}</span>
                    </div>
                    <div className={cn('flex items-center justify-between gap-2 border-t pt-3', itemCardDivider)}>
                      <span className={cn('text-[11px]', itemCardFaint)}>{l.interests} interested</span>
                      <div className="flex shrink-0 items-center gap-1">
                        {canShowInterest && (
                          <Button size="sm" variant="outline" onClick={() => expressInterest(l.id)}>
                            <HandHeart size={14} /> Interest
                          </Button>
                        )}
                        {canDelete && (
                          <button type="button" onClick={() => remove(l.id)} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-red-200">
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
        </MobileContent>
      ) : (
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((l) => (
            <Card key={l.id} className={cn('flex flex-col overflow-hidden border transition hover:shadow-card', itemDetailsCard)}>
              <CardBody className="flex flex-1 flex-col pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/15 text-white">
                    <Package size={20} />
                  </div>
                  <Badge tone={l.status === 'open' ? 'green' : 'gray'} className="bg-white/20 text-white">{l.status}</Badge>
                </div>
                <h3 className={cn('text-lg font-bold', itemCardValue)}>{l.commodity}</h3>
                <p className={cn('text-sm', itemCardMuted)}>{l.buyer_name}</p>

                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className={itemCardLabel}>Quantity</span>
                    <span className={itemCardValue}>{formatNumber(l.quantity)} {l.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={itemCardLabel}>Offer Price</span>
                    <span className="font-semibold text-leaf-light">{SSP(l.price)}/{l.unit}</span>
                  </div>
                  <div className={cn('flex items-center gap-1', itemCardMuted)}>
                    <MapPin size={13} className="text-leaf-light" /> {l.delivery_location}
                  </div>
                  <div className={cn('flex items-center gap-1', itemCardMuted)}>
                    <Phone size={13} /> {l.contact_info}
                  </div>
                </div>

                <div className={cn('mt-4 flex items-center justify-between border-t pt-3', itemCardDivider)}>
                  <span className={cn('text-xs', itemCardFaint)}>{l.interests} interested · {timeAgo(l.created_at)}</span>
                  <div className="flex items-center gap-1">
                    {canShowInterest && (
                      <Button size="sm" variant="outline" onClick={() => expressInterest(l.id)}>
                        <HandHeart size={14} /> Submit Interest
                      </Button>
                    )}
                    {canDelete && (
                      <button onClick={() => remove(l.id)} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-red-200">
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
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Post Buying Opportunity">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Commodity" value={form.commodity} onChange={(e) => setForm({ ...form, commodity: e.target.value })}>
              {COMMODITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select label="Quantity (kg)" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}>
              <option value="">Select amount</option>
              {QUANTITY_OPTIONS.map((q) => (
                <option key={q} value={String(q)}>
                  {formatNumber(q)} kg
                </option>
              ))}
            </Select>
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
            <Button onClick={save} disabled={!form.quantity}>
              Post Demand
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
