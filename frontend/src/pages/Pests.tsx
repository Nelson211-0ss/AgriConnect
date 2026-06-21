import { useEffect, useState } from 'react';
import { Plus, Bug, MapPin, AlertTriangle, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardHeader, CardBody, Input, Select, Textarea, Modal, Badge, Spinner, Table, Th, Td, severityTone } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { MobileShell, MobilePageHeader, MobileContent, MobileListCard } from '@/components/mobile';
import { LeafletMap, MapPoint } from '@/components/LeafletMap';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';

interface PestAlert {
  id: number;
  pest_name: string;
  crop: string;
  county: string;
  severity: string;
  description: string;
  status: string;
  date_reported: string;
  reporter_name: string;
  lat?: number;
  lng?: number;
}

const PESTS = ['Fall Armyworm', 'Desert Locust', 'Maize Stalk Borer', 'Aphids', 'Cassava Mosaic', 'Striga Weed'];
const CROPS = ['Maize', 'Sorghum', 'Groundnuts', 'Sesame', 'Cassava', 'Millet'];
const COUNTIES = ['Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'];

const sevColor = (s: string) => (s === 'critical' || s === 'high' ? '#DC2626' : s === 'moderate' ? '#F59E0B' : '#3B82F6');

export default function Pests() {
  const { user } = useAuth();
  const canEdit = user?.role === 'super_admin' || user?.role === 'extension_officer';
  const [rows, setRows] = useState<PestAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ pest_name: 'Fall Armyworm', crop: 'Maize', county: 'Wau', severity: 'high', description: '' });

  const load = () => {
    setLoading(true);
    api
      .get<PestAlert[]>('/pests')
      .then(setRows)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    await api.post('/pests', form);
    setOpen(false);
    setForm({ pest_name: 'Fall Armyworm', crop: 'Maize', county: 'Wau', severity: 'high', description: '' });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this alert?')) return;
    await api.del(`/pests/${id}`);
    load();
  };

  const active = rows.filter((r) => r.status === 'active');
  const points: MapPoint[] = active
    .filter((r) => r.lat && r.lng)
    .map((r) => ({
      id: r.id,
      lat: r.lat!,
      lng: r.lng!,
      color: sevColor(r.severity),
      radius: r.severity === 'critical' || r.severity === 'high' ? 11 : 8,
      label: `${r.pest_name} – ${r.county}`,
      popup: (
        <div>
          <strong>{r.pest_name}</strong>
          <br />
          {r.county} County · {r.severity}
        </div>
      ),
    }));

  return (
    <div className="animate-fade-in space-y-4">
      <MobileShell>
        <MobilePageHeader
          title="Pest Alerts"
          subtitle={`${active.length} active outbreak${active.length === 1 ? '' : 's'}`}
          action={
            canEdit && (
              <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                <Plus size={14} />
              </Button>
            )
          }
        />
        <MobileContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-7 w-7" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-content-muted">No pest alerts.</p>
          ) : (
            rows.map((r) => (
              <MobileListCard
                key={r.id}
                icon={Bug}
                iconBg={sevColor(r.severity)}
                title={r.pest_name}
                subtitle={
                  <>
                    {r.crop} · {r.county} County
                    <span className="mt-1 block line-clamp-2">{r.description}</span>
                  </>
                }
                right={<Badge tone={severityTone(r.severity)}>{r.severity}</Badge>}
              />
            ))
          )}
        </MobileContent>
      </MobileShell>

      <div className="hidden md:block">
      <PageHeader
        title="Pest & Disease Alerts"
        subtitle="County-based outbreak monitoring and notifications"
        actions={
          canEdit && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Report Outbreak
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Active Alerts', active.length, 'red'],
          ['Critical', rows.filter((r) => r.severity === 'critical').length, 'red'],
          ['High', rows.filter((r) => r.severity === 'high').length, 'amber'],
          ['Resolved', rows.filter((r) => r.status === 'resolved').length, 'green'],
        ].map(([label, val]) => (
          <Card key={label as string} className="p-5">
            <div className="text-2xl font-bold text-ink">{val as number}</div>
            <div className="mt-0.5 text-sm text-slate-500">{label as string}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Outbreak Map" subtitle="Active pest outbreaks by location" />
          <CardBody>
            <LeafletMap points={points} height={360} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent Reports" />
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-7 w-7" />
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto">
              <Table>
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/50">
                    <Th>Pest</Th>
                    <Th>County</Th>
                    <Th>Severity</Th>
                    <Th>Status</Th>
                    {canEdit && <Th></Th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <Td>
                        <div className="flex items-center gap-2">
                          <Bug size={15} className="text-slate-400" />
                          <div>
                            <div className="font-medium text-ink">{r.pest_name}</div>
                            <div className="text-xs text-slate-400">{r.crop} · {formatDate(r.date_reported)}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin size={12} className="text-forest" />
                          {r.county}
                        </span>
                      </Td>
                      <Td>
                        <Badge tone={severityTone(r.severity)}>{r.severity}</Badge>
                      </Td>
                      <Td>
                        <Badge tone={r.status === 'active' ? 'red' : 'green'}>{r.status}</Badge>
                      </Td>
                      {canEdit && (
                        <Td>
                          <button onClick={() => remove(r.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={15} />
                          </button>
                        </Td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Report Pest Outbreak">
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            <AlertTriangle size={16} className="mr-1 inline" /> Reporting will notify farmers in the selected county.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Pest / Disease" value={form.pest_name} onChange={(e) => setForm({ ...form, pest_name: e.target.value })}>
              {PESTS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
            <Select label="Affected Crop" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })}>
              {CROPS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select label="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })}>
              {COUNTIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {['low', 'moderate', 'high', 'critical'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Publish Alert</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
