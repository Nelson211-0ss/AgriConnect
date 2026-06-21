import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Users, UserCheck, Store, UserCog, MessageSquare, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardBody, Badge, Table, Th, Td, Spinner, severityTone } from '@/components/ui';
import { StatCard, CHART_COLORS } from '@/components/common';
import { formatNumber, SSP, timeAgo } from '@/lib/utils';

interface DashboardData {
  cards: {
    totalFarmers: number;
    activeFarmers: number;
    registeredBuyers: number;
    extensionWorkers: number;
    messagesSent: number;
    countiesCovered: number;
  };
  charts: {
    farmersByCounty: { name: string; value: number }[];
    cropDistribution: { name: string; value: number }[];
    userGrowth: { month: string; farmers: number }[];
    marketActivity: { name: string; listings: number; volume: number }[];
    messageActivity: { month: string; sms: number; whatsapp: number }[];
    topAdvisories: { name: string; value: number }[];
  };
  tables: {
    recentFarmers: { id: number; full_name: string; county: string; phone: string; status: string; created_at: string }[];
    recentPestAlerts: { id: number; pest_name: string; county: string; severity: string; date_reported: string }[];
    recentTransactions: { id: number; buyer_name: string; commodity: string; quantity: number; price: number; delivery_location: string; created_at: string }[];
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;
  if (!data)
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );

  const c = data.cards;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Program overview across all counties and modules</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Farmers" value={c.totalFarmers} icon={Users} change={12} tint="forest" />
        <StatCard label="Active Farmers" value={c.activeFarmers} icon={UserCheck} change={8} tint="leaf" />
        <StatCard label="Registered Buyers" value={c.registeredBuyers} icon={Store} change={5} tint="accent" />
        <StatCard label="Extension Workers" value={c.extensionWorkers} icon={UserCog} change={3} tint="blue" />
        <StatCard label="Messages Sent" value={c.messagesSent} icon={MessageSquare} change={21} tint="purple" />
        <StatCard label="Counties Covered" value={c.countiesCovered} icon={MapPin} tint="forest" />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Farmers by County" subtitle="Distribution across coverage areas" />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.charts.farmersByCounty} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {data.charts.farmersByCounty.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatNumber(v)} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Message Activity" subtitle="SMS & WhatsApp sent over time" />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.charts.messageActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="sms" stroke="#0B7A3E" strokeWidth={3} dot={false} name="SMS" />
                <Line type="monotone" dataKey="whatsapp" stroke="#22C55E" strokeWidth={3} dot={false} name="WhatsApp" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Crop Distribution" subtitle="Most cultivated crops" />
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.charts.cropDistribution} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => formatNumber(v)} />
                <Bar dataKey="value" fill="#22C55E" radius={[0, 6, 6, 0]} name="Farmers" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Farmer Growth" subtitle="New registrations by month" />
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.charts.userGrowth}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B7A3E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0B7A3E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="farmers" stroke="#0B7A3E" strokeWidth={2.5} fill="url(#g)" name="Farmers" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top Advisory Topics" subtitle="By number of advisories" />
          <CardBody>
            <div className="space-y-3 pt-2">
              {data.charts.topAdvisories.map((t, i) => {
                const max = Math.max(...data.charts.topAdvisories.map((x) => x.value));
                return (
                  <div key={t.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600">{t.name}</span>
                      <span className="font-semibold text-ink">{t.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${(t.value / max) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader title="Recent Farmer Registrations" />
          <Table>
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/50">
                <Th>Farmer</Th>
                <Th>County</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.tables.recentFarmers.map((f) => (
                <tr key={f.id}>
                  <Td>
                    <div className="font-medium text-ink">{f.full_name}</div>
                    <div className="text-xs text-slate-400">{timeAgo(f.created_at)}</div>
                  </Td>
                  <Td>{f.county}</Td>
                  <Td>
                    <Badge tone={f.status === 'active' ? 'green' : 'gray'}>{f.status}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="Recent Pest Alerts" />
          <Table>
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/50">
                <Th>Pest</Th>
                <Th>County</Th>
                <Th>Severity</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.tables.recentPestAlerts.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <div className="font-medium text-ink">{p.pest_name}</div>
                    <div className="text-xs text-slate-400">{timeAgo(p.date_reported)}</div>
                  </Td>
                  <Td>{p.county}</Td>
                  <Td>
                    <Badge tone={severityTone(p.severity)}>{p.severity}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="Recent Market Activity" />
          <Table>
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/50">
                <Th>Buyer / Commodity</Th>
                <Th>Qty</Th>
                <Th>Price</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.tables.recentTransactions.map((t) => (
                <tr key={t.id}>
                  <Td>
                    <div className="font-medium text-ink">{t.commodity}</div>
                    <div className="text-xs text-slate-400">{t.buyer_name}</div>
                  </Td>
                  <Td>{formatNumber(t.quantity)} kg</Td>
                  <Td className="font-medium text-forest">{SSP(t.price)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
