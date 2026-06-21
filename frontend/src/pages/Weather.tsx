import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Plus, Droplets, Wind, Thermometer, CloudRain, Sun, Cloud, CloudLightning, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardHeader, CardBody, Input, Select, Textarea, Modal, Badge, Spinner, severityTone } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { formatDate, cn } from '@/lib/utils';

interface Current {
  county: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
}
interface Forecast {
  day: string;
  temp: number;
  tempMin: number;
  rainfall: number;
  humidity: number;
  condition: string;
}
interface Alert {
  id: number;
  type: string;
  county: string;
  severity: string;
  message: string;
  created_at: string;
}

const condIcon = (c: string) => {
  if (/thunder/i.test(c)) return CloudLightning;
  if (/heavy rain/i.test(c)) return CloudRain;
  if (/rain/i.test(c)) return Droplets;
  if (/cloud/i.test(c)) return Cloud;
  return Sun;
};

const ALERT_TYPES = ['Heavy Rain', 'Flood Warning', 'Drought Alert', 'Wind Warning'];
const COUNTIES = ['Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'];

function Metric({ icon, val, label }: { icon: React.ReactNode; val: string; label: string }) {
  return (
    <div className="rounded-xl bg-mist p-3">
      {icon}
      <div className="mt-1 font-semibold text-ink">{val}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

export default function Weather() {
  const { user } = useAuth();
  const canEdit = user?.role === 'super_admin' || user?.role === 'extension_officer';
  const [data, setData] = useState<{ current: Current[]; forecast: Forecast[]; alerts: Alert[] } | null>(null);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'Heavy Rain', county: 'Juba', severity: 'high', message: '' });

  const load = () => api.get<{ current: Current[]; forecast: Forecast[]; alerts: Alert[] }>('/weather').then(setData);
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    await api.post('/weather/alerts', form);
    setOpen(false);
    setForm({ type: 'Heavy Rain', county: 'Juba', severity: 'high', message: '' });
    load();
  };

  if (!data)
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );

  const cur = data.current[selected];
  const CondIcon = condIcon(cur.condition);

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        title="Weather Intelligence"
        subtitle="Localized forecasts and early warning alerts"
        actions={
          canEdit && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Issue Alert
            </Button>
          )
        }
      />

      {/* County selector */}
      <div className="flex flex-wrap gap-2">
        {data.current.map((c, i) => (
          <button
            key={c.county}
            onClick={() => setSelected(i)}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-medium',
              selected === i ? 'border-forest bg-forest text-white' : 'border-slate-200 bg-white text-slate-600'
            )}
          >
            {c.county}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Current weather hero */}
        <Card className="overflow-hidden lg:col-span-1" >
          <div className="p-6 text-white" style={{ background: 'linear-gradient(150deg,#0B7A3E,#064a25)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">{cur.county} County</div>
                <div className="text-5xl font-bold">{cur.temperature}°C</div>
                <div className="mt-1 text-sm opacity-90">{cur.condition}</div>
              </div>
              <CondIcon size={64} className="opacity-90" />
            </div>
          </div>
          <CardBody className="pt-5">
            <div className="grid grid-cols-4 gap-3 text-center">
              <Metric icon={<Thermometer size={20} className="mx-auto text-accent" />} val={`${cur.temperature}°`} label="Temp" />
              <Metric icon={<Droplets size={20} className="mx-auto text-forest" />} val={`${cur.humidity}%`} label="Humidity" />
              <Metric icon={<CloudRain size={20} className="mx-auto text-blue-500" />} val={`${cur.rainfall}mm`} label="Rainfall" />
              <Metric icon={<Wind size={20} className="mx-auto text-slate-500" />} val={`${cur.windSpeed}`} label="km/h" />
            </div>
          </CardBody>
        </Card>

        {/* Forecast charts */}
        <Card className="lg:col-span-2">
          <CardHeader title="7-Day Forecast" subtitle={`Temperature & rainfall outlook for ${cur.county}`} />
          <CardBody>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={data.forecast}>
                <defs>
                  <linearGradient id="temp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="°" />
                <Tooltip />
                <Area type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={2.5} fill="url(#temp)" name="Temp °C" />
              </AreaChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data.forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="mm" />
                <Tooltip />
                <Bar dataKey="rainfall" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Rainfall mm" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader title="Active Weather Alerts" subtitle="Early warnings issued to farmers" />
        <CardBody className="space-y-3">
          {data.alerts.length === 0 && <p className="text-sm text-slate-400">No active alerts.</p>}
          {data.alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-mist p-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', a.severity === 'critical' || a.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600')}>
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{a.type}</span>
                  <Badge tone={severityTone(a.severity)}>{a.severity}</Badge>
                  <Badge tone="gray">{a.county}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{a.message}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(a.created_at)}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Issue Weather Alert">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Alert Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {ALERT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
            <Select label="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })}>
              {COUNTIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            {['low', 'moderate', 'high', 'critical'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Textarea label="Message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.message}>
              Issue Alert
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
