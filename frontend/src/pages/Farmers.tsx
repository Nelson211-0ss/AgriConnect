import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Download, Pencil, Trash2, MapPin, ChevronRight, Check } from 'lucide-react';
import { api, downloadCsv } from '@/lib/api';
import { Button, Card, Input, Select, Modal, Table, Th, Td, Badge, Spinner, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { formatNumber, formatDate, cn } from '@/lib/utils';

interface Farmer {
  id: number;
  full_name: string;
  gender: string;
  phone: string;
  county: string;
  payam: string;
  boma: string;
  age: number;
  farm_size: number;
  crop_types: string[];
  livestock_types: string[];
  gps_lat: number;
  gps_lng: number;
  status: string;
  created_at: string;
}

const COUNTIES = ['Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'];
const CROPS = ['Maize', 'Sorghum', 'Groundnuts', 'Sesame', 'Cassava', 'Millet'];
const LIVESTOCK = ['Cattle', 'Goats', 'Sheep', 'Poultry'];

const emptyForm = {
  full_name: '', gender: 'Male', phone: '', county: 'Juba', payam: '', boma: '',
  age: '', farm_size: '', crop_types: [] as string[], livestock_types: [] as string[],
  gps_lat: '', gps_lng: '', status: 'active',
};

export default function Farmers() {
  const { user } = useAuth();
  const canEdit = user?.role === 'super_admin' || user?.role === 'extension_officer';
  const [rows, setRows] = useState<Farmer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Farmer | null>(null);

  const limit = 12;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit), search, county });
    api
      .get<{ data: Farmer[]; total: number }>(`/farmers?${params}`)
      .then((res) => {
        setRows(res.data);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [page, search, county]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (id: number) => {
    if (!confirm('Delete this farmer?')) return;
    await api.del(`/farmers/${id}`);
    load();
  };

  const pages = Math.ceil(total / limit) || 1;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Farmer Registry"
        subtitle={`${formatNumber(total)} farmers registered across ${COUNTIES.length} counties`}
        actions={
          <>
            <Button variant="outline" onClick={() => downloadCsv('/farmers/export', 'farmers.csv')}>
              <Download size={16} /> Export CSV
            </Button>
            {canEdit && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus size={16} /> Add Farmer
              </Button>
            )}
          </>
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by name, phone or payam..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
            />
          </div>
          <select
            value={county}
            onChange={(e) => {
              setPage(1);
              setCounty(e.target.value);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-forest focus:outline-none"
          >
            <option value="">All counties</option>
            {COUNTIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No farmers found" hint="Try adjusting your search or filters" />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Farmer</Th>
                <Th>Location</Th>
                <Th>Farm Size</Th>
                <Th>Crops</Th>
                <Th>Status</Th>
                <Th>Registered</Th>
                {canEdit && <Th></Th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50">
                  <Td>
                    <div className="font-medium text-ink">{f.full_name}</div>
                    <div className="text-xs text-slate-400">{f.phone} · {f.gender}</div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin size={13} className="text-forest" /> {f.county}
                    </div>
                    <div className="text-xs text-slate-400">{f.payam}</div>
                  </Td>
                  <Td>{f.farm_size} ha</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {(f.crop_types || []).slice(0, 2).map((c) => (
                        <Badge key={c} tone="green">{c}</Badge>
                      ))}
                      {(f.crop_types || []).length > 2 && <Badge>+{f.crop_types.length - 2}</Badge>}
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={f.status === 'active' ? 'green' : 'gray'}>{f.status}</Badge>
                  </Td>
                  <Td className="text-slate-500">{formatDate(f.created_at)}</Td>
                  {canEdit && (
                    <Td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditing(f);
                            setModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-forest"
                        >
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(f.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      {modalOpen && (
        <FarmerFormModal
          farmer={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function FarmerFormModal({ farmer, onClose, onSaved }: { farmer: Farmer | null; onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    ...emptyForm,
    ...(farmer
      ? {
          full_name: farmer.full_name || '', gender: farmer.gender || 'Male', phone: farmer.phone || '',
          county: farmer.county || 'Juba', payam: farmer.payam || '', boma: farmer.boma || '',
          age: String(farmer.age ?? ''), farm_size: String(farmer.farm_size ?? ''),
          crop_types: farmer.crop_types || [], livestock_types: farmer.livestock_types || [],
          gps_lat: String(farmer.gps_lat ?? ''), gps_lng: String(farmer.gps_lng ?? ''), status: farmer.status || 'active',
        }
      : {}),
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k: 'crop_types' | 'livestock_types', v: string) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));

  const steps = ['Personal', 'Farm', 'Location', 'Review'];

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (farmer) await api.put(`/farmers/${farmer.id}`, form);
      else await api.post('/farmers', form);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={farmer ? 'Edit Farmer' : 'Register New Farmer'} wide>
      {/* Stepper */}
      <div className="mb-6 flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  step > i + 1 ? 'bg-forest text-white' : step === i + 1 ? 'bg-forest text-white' : 'bg-slate-100 text-slate-400'
                )}
              >
                {step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span className={cn('hidden text-sm font-medium sm:block', step === i + 1 ? 'text-ink' : 'text-slate-400')}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={cn('mx-3 h-0.5 flex-1', step > i + 1 ? 'bg-forest' : 'bg-slate-100')} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
          <Select label="Gender" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
            <option>Male</option>
            <option>Female</option>
          </Select>
          <Input label="Phone Number" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+211 ..." />
          <Input label="Age" type="number" value={form.age} onChange={(e) => set('age', e.target.value)} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Input label="Farm Size (hectares)" type="number" step="0.1" value={form.farm_size} onChange={(e) => set('farm_size', e.target.value)} />
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Crop Types</span>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle('crop_types', c)}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 text-sm font-medium',
                    form.crop_types.includes(c) ? 'border-forest bg-forest-50 text-forest' : 'border-slate-200 text-slate-500'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Livestock Types</span>
            <div className="flex flex-wrap gap-2">
              {LIVESTOCK.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle('livestock_types', c)}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 text-sm font-medium',
                    form.livestock_types.includes(c) ? 'border-forest bg-forest-50 text-forest' : 'border-slate-200 text-slate-500'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="County" value={form.county} onChange={(e) => set('county', e.target.value)}>
            {COUNTIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Input label="Payam" value={form.payam} onChange={(e) => set('payam', e.target.value)} />
          <Input label="Boma" value={form.boma} onChange={(e) => set('boma', e.target.value)} />
          <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Input label="GPS Latitude" value={form.gps_lat} onChange={(e) => set('gps_lat', e.target.value)} placeholder="e.g. 4.85" />
          <Input label="GPS Longitude" value={form.gps_lng} onChange={(e) => set('gps_lng', e.target.value)} placeholder="e.g. 31.58" />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3 rounded-xl bg-mist p-4 text-sm">
          {[
            ['Name', form.full_name],
            ['Gender / Age', `${form.gender}, ${form.age || '-'}`],
            ['Phone', form.phone],
            ['Farm Size', `${form.farm_size || '-'} ha`],
            ['Crops', form.crop_types.join(', ') || '-'],
            ['Livestock', form.livestock_types.join(', ') || '-'],
            ['Location', `${form.county} · ${form.payam} · ${form.boma}`],
            ['GPS', form.gps_lat && form.gps_lng ? `${form.gps_lat}, ${form.gps_lng}` : '-'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-slate-200 pb-2 last:border-0">
              <span className="text-slate-500">{k}</span>
              <span className="font-medium text-ink">{v}</span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => (step === 1 ? onClose() : setStep((s) => s - 1))}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !form.full_name}>
            Next <ChevronRight size={16} />
          </Button>
        ) : (
          <Button onClick={save} disabled={saving}>
            {saving ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : farmer ? 'Save Changes' : 'Register Farmer'}
          </Button>
        )}
      </div>
    </Modal>
  );
}
