import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Droplets, Wind, Thermometer, CloudRain, Sun, Cloud, CloudLightning, AlertTriangle, RefreshCw, Store, LineChart, BookOpen, Bug, Wallet, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardHeader, CardBody, Select, Textarea, Modal, Badge, Spinner, severityTone } from '@/components/ui';
import { PageHeader, CHART_COLORS } from '@/components/common';
import { MobileShell, MobilePageHeader, MobileToolbar, MobileSectionTitle, MobileContent, MobileChipRow, MobileListCard } from '@/components/mobile';
import { useAuth } from '@/context/AuthContext';
import { useChartTheme } from '@/lib/chartTheme';
import { formatDate, timeAgo, cn } from '@/lib/utils';

interface Current {
  county: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  observedAt: string;
  forecast: Forecast[];
}
interface Forecast {
  day: string;
  date: string;
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

interface WeatherData {
  current: Current[];
  alerts: Alert[];
  fetchedAt: string;
  source: string;
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

const FARMER_QUICK = [
  { to: '/app/marketplace', label: 'Market', icon: Store, tint: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' },
  { to: '/app/market', label: 'Prices', icon: LineChart, tint: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' },
  { to: '/app/advisories', label: 'Advice', icon: BookOpen, tint: 'bg-forest-50 text-forest dark:bg-forest-800/30 dark:text-leaf' },
  { to: '/app/pests', label: 'Pests', icon: Bug, tint: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300' },
  { to: '/app/financial', label: 'Finance', icon: Wallet, tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { to: '/app/training', label: 'Training', icon: GraduationCap, tint: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' },
];

function shortForecastLabel(entry: Forecast): string {
  if (entry.day.startsWith('Today')) return 'Today';
  if (entry.day.startsWith('Tomorrow')) return 'Tomorrow';
  const d = new Date(`${entry.date}T12:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
}

function toChartForecast(forecast: Forecast[]) {
  return forecast.map((f) => ({ ...f, label: shortForecastLabel(f) }));
}

function Metric({ icon, val, label }: { icon: React.ReactNode; val: string; label: string }) {
  return (
    <div className="rounded-xl bg-mist p-3 dark:bg-slate-800">
      {icon}
      <div className="mt-1 font-semibold text-ink">{val}</div>
      <div className="text-xs text-content-faint">{label}</div>
    </div>
  );
}

export default function Weather() {
  const { user } = useAuth();
  const chart = useChartTheme();
  const canEdit = user?.role === 'super_admin' || user?.role === 'extension_officer';
  const [data, setData] = useState<WeatherData | null>(null);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ type: 'Heavy Rain', county: 'Juba', severity: 'high', message: '' });

  const load = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const result = await api.get<WeatherData>('/weather');
      setData(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    await api.post('/weather/alerts', form);
    setOpen(false);
    setForm({ type: 'Heavy Rain', county: 'Juba', severity: 'high', message: '' });
    load(true);
  };

  if (loading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        {error}
        <Button className="mt-3" size="sm" onClick={() => load()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const cur = data.current[selected];
  const forecast = cur.forecast ?? [];
  const chartForecast = toChartForecast(forecast);
  const CondIcon = condIcon(cur.condition);
  const observedLabel = cur.observedAt
    ? new Date(cur.observedAt).toLocaleString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const firstName = user?.name.split(' ')[0];
  const mobileSubtitle =
    user?.role === 'farmer'
      ? `Hello, ${firstName} · ${cur.county} County`
      : data.fetchedAt
      ? `Updated ${timeAgo(data.fetchedAt)}`
      : 'Live forecast';

  return (
    <div className="animate-fade-in md:space-y-4">
      {/* Mobile app UI */}
      <MobileShell>
        <MobilePageHeader
          title="Weather"
          subtitle={mobileSubtitle}
          action={
            canEdit ? (
              <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                <Plus size={14} />
              </Button>
            ) : (
              <button type="button" onClick={() => load(true)} className="rounded-lg bg-white/15 p-2">
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </button>
            )
          }
        />
        <MobileToolbar>
          <MobileChipRow
            items={data.current.map((c) => c.county)}
            active={cur.county}
            onSelect={(county) => {
              const idx = data.current.findIndex((c) => c.county === county);
              if (idx >= 0) setSelected(idx);
            }}
          />
        </MobileToolbar>
        <MobileContent>
          <div className="rounded-2xl p-4 text-white shadow-soft" style={{ background: 'linear-gradient(150deg,#0B7A3E,#064a25)' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs opacity-80">{cur.county} County</p>
                <p className="text-3xl font-bold leading-none sm:text-4xl">{cur.temperature}°C</p>
                <p className="mt-1 truncate text-sm opacity-90">{cur.condition}</p>
              </div>
              <CondIcon size={44} className="shrink-0 opacity-90" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] sm:text-xs">
              <div className="rounded-xl bg-white/10 px-1 py-2">
                <p className="opacity-80">Humidity</p>
                <p className="font-semibold">{cur.humidity}%</p>
              </div>
              <div className="rounded-xl bg-white/10 px-1 py-2">
                <p className="opacity-80">Rain</p>
                <p className="font-semibold">{cur.rainfall}mm</p>
              </div>
              <div className="rounded-xl bg-white/10 px-1 py-2">
                <p className="opacity-80">Wind</p>
                <p className="font-semibold">{cur.windSpeed} km/h</p>
              </div>
            </div>
          </div>

          {user?.role === 'farmer' && (
            <div>
              <MobileSectionTitle className="mb-2">Quick Access</MobileSectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {FARMER_QUICK.map((q) => (
                  <Link
                    key={q.label}
                    to={q.to}
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface p-2.5 text-center shadow-soft dark:bg-surface-elevated"
                  >
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', q.tint)}>
                      <q.icon size={17} />
                    </div>
                    <span className="text-[10px] font-medium leading-tight text-content-muted">{q.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <MobileSectionTitle>7-Day Forecast</MobileSectionTitle>
          {chartForecast.map((day, i) => (
            <MobileListCard
              key={day.date}
              icon={condIcon(day.condition)}
              iconBg={CHART_COLORS[i % CHART_COLORS.length]}
              title={day.label}
              subtitle={
                <>
                  {day.condition} · Rain {day.rainfall}mm
                </>
              }
              right={
                <div className="text-right">
                  <p className="font-bold text-ink">{day.temp}°</p>
                  <p className="text-xs text-content-muted">Low {day.tempMin}°</p>
                </div>
              }
            />
          ))}
          {data.alerts.length > 0 && (
            <div className="space-y-2">
              <MobileSectionTitle>Active Alerts</MobileSectionTitle>
              {data.alerts.map((a) => (
                <MobileListCard
                  key={a.id}
                  icon={AlertTriangle}
                  iconBg={a.severity === 'high' || a.severity === 'critical' ? '#DC2626' : '#F59E0B'}
                  title={a.type}
                  subtitle={
                    <>
                      {a.message}
                      <span className="mt-1 block text-content-faint">{formatDate(a.created_at)}</span>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </MobileContent>
      </MobileShell>

      <div className="hidden md:block">
      <PageHeader
        title="Weather Intelligence"
        subtitle={
          data.fetchedAt
            ? `Live data from Open-Meteo · Updated ${timeAgo(data.fetchedAt)}`
            : 'Localized forecasts and early warning alerts'
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => load(true)} disabled={refreshing}>
              {refreshing ? <Spinner className="h-4 w-4" /> : <RefreshCw size={16} />}
              Refresh
            </Button>
            {canEdit && (
              <Button onClick={() => setOpen(true)}>
                <Plus size={16} /> Issue Alert
              </Button>
            )}
          </div>
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
              selected === i
                ? 'border-forest bg-forest text-white'
                : 'border-line bg-surface text-content-muted dark:border-line dark:bg-surface-elevated'
            )}
          >
            {c.county}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Current weather hero */}
        <Card className="overflow-hidden lg:col-span-1">
          <div className="p-6 text-white" style={{ background: 'linear-gradient(150deg,#0B7A3E,#064a25)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">{cur.county} County</div>
                <div className="text-5xl font-bold">{cur.temperature}°C</div>
                <div className="mt-1 text-sm opacity-90">{cur.condition}</div>
                {observedLabel && <div className="mt-2 text-xs opacity-75">Observed {observedLabel}</div>}
              </div>
              <CondIcon size={64} className="opacity-90" />
            </div>
          </div>
          <CardBody className="pt-5">
            <div className="grid grid-cols-4 gap-3 text-center">
              <Metric icon={<Thermometer size={20} className="mx-auto text-accent" />} val={`${cur.temperature}°`} label="Temp" />
              <Metric icon={<Droplets size={20} className="mx-auto text-forest" />} val={`${cur.humidity}%`} label="Humidity" />
              <Metric icon={<CloudRain size={20} className="mx-auto text-blue-500" />} val={`${cur.rainfall}mm`} label="Rainfall" />
              <Metric icon={<Wind size={20} className="mx-auto text-content-muted" />} val={`${cur.windSpeed}`} label="km/h" />
            </div>
          </CardBody>
        </Card>

        {/* Forecast charts */}
        <Card className="lg:col-span-2">
          <CardHeader title="7-Day Forecast" subtitle={`Real dates & outlook for ${cur.county} County`} />
          <CardBody>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartForecast} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="temp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: chart.tick }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={36}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: chart.tick }}
                  axisLine={false}
                  tickLine={false}
                  unit="°"
                  width={36}
                />
                <Tooltip contentStyle={chart.tooltip.contentStyle} />
                <Area type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={2.5} fill="url(#temp)" name="High °C" />
              </AreaChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartForecast} margin={{ top: 20, right: 12, left: 4, bottom: 0 }} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: chart.tick }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={36}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: chart.tick }}
                  axisLine={false}
                  tickLine={false}
                  unit="mm"
                  width={36}
                />
                <Tooltip contentStyle={chart.tooltip.contentStyle} />
                <Bar dataKey="rainfall" barSize={20} radius={[6, 6, 0, 0]} name="Rainfall mm">
                  {chartForecast.map((entry, i) => (
                    <Cell key={entry.date} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader title="Active Weather Alerts" subtitle="Early warnings issued to farmers" />
        <CardBody className="space-y-3">
          {data.alerts.length === 0 && <p className="text-sm text-content-faint">No active alerts.</p>}
          {data.alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-xl border border-line-subtle bg-mist p-4 dark:border-line">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  a.severity === 'critical' || a.severity === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'
                )}
              >
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{a.type}</span>
                  <Badge tone={severityTone(a.severity)}>{a.severity}</Badge>
                  <Badge tone="gray">{a.county}</Badge>
                </div>
                <p className="mt-1 text-sm text-content-muted">{a.message}</p>
                <p className="mt-1 text-xs text-content-faint">Issued {formatDate(a.created_at)}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
      </div>

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
