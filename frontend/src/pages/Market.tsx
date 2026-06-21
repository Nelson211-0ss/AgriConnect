import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardHeader, CardBody, Input, Select, Modal, Table, Th, Td, Spinner, Badge } from '@/components/ui';
import { PageHeader, CHART_COLORS } from '@/components/common';
import { MobileShell, MobilePageHeader, MobileSearchBar, MobileContent, MobilePriceCard } from '@/components/mobile';
import { useAuth } from '@/context/AuthContext';
import { SSP, formatDate } from '@/lib/utils';

interface Price {
  id: number;
  commodity: string;
  price: number;
  prev_price: number | null;
  unit: string;
  market_location: string;
  county: string;
  date_updated: string;
}

const COMMODITIES = ['Maize', 'Sorghum', 'Groundnuts', 'Sesame', 'Cassava'];
const COUNTIES = ['Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'];

export default function Market() {
  const { user } = useAuth();
  const canEdit = user?.role === 'super_admin' || user?.role === 'extension_officer';
  const [prices, setPrices] = useState<Price[]>([]);
  const [trends, setTrends] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ commodity: 'Maize', price: '', unit: 'kg', market_location: '', county: 'Juba' });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<Price[]>(`/market?search=${encodeURIComponent(search)}`),
      api.get<Record<string, unknown>[]>('/market/trends'),
    ])
      .then(([p, t]) => {
        setPrices(p);
        setTrends(t);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const save = async () => {
    await api.post('/market', form);
    setOpen(false);
    setForm({ commodity: 'Maize', price: '', unit: 'kg', market_location: '', county: 'Juba' });
    load();
  };

  const trend = (p: Price) => {
    if (p.prev_price == null) return { dir: 'flat', pct: 0 };
    const diff = p.price - p.prev_price;
    const pct = p.prev_price ? Math.round((diff / p.prev_price) * 100) : 0;
    return { dir: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat', pct };
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Mobile app UI */}
      <MobileShell>
        <MobilePageHeader
          title="Market Prices"
          subtitle="Live commodity prices"
          action={
            canEdit && (
              <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                <Plus size={14} />
              </Button>
            )
          }
        />
        <MobileSearchBar value={search} onChange={setSearch} placeholder="Search commodities..." />
        <MobileContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-7 w-7" />
            </div>
          ) : prices.length === 0 ? (
            <p className="py-8 text-center text-sm text-content-muted">No prices found.</p>
          ) : (
            prices.map((p, i) => {
              const t = trend(p);
              return (
                <MobilePriceCard
                  key={p.id}
                  commodity={p.commodity}
                  price={p.price}
                  unit={p.unit}
                  market={p.market_location || `${p.county} Market`}
                  changePct={t.pct}
                  index={i}
                />
              );
            })
          )}
        </MobileContent>
      </MobileShell>

      {/* Desktop UI */}
      <div className="hidden md:block">
      <PageHeader
        title="Market Information System"
        subtitle="Live commodity prices and market trends"
        actions={
          canEdit && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Add Price
            </Button>
          )
        }
      />

      <Card>
        <CardHeader title="Price Trends" subtitle="Average commodity prices over the last weeks (SSP/kg)" />
        <CardBody>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-7 w-7" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                {COMMODITIES.map((c, i) => (
                  <Line key={c} type="monotone" dataKey={c} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Current Market Prices"
          action={
            <div className="relative w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
          }
        />
        <Table>
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/50">
              <Th>Commodity</Th>
              <Th>Market</Th>
              <Th>County</Th>
              <Th>Price</Th>
              <Th>Trend</Th>
              <Th>Updated</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {prices.map((p) => {
              const t = trend(p);
              return (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <Td>
                    <span className="font-medium text-ink">{p.commodity}</span>
                  </Td>
                  <Td className="text-slate-600">{p.market_location}</Td>
                  <Td>
                    <Badge tone="gray">{p.county}</Badge>
                  </Td>
                  <Td className="font-semibold text-forest">{SSP(p.price)}/{p.unit}</Td>
                  <Td>
                    <span
                      className={
                        t.dir === 'up'
                          ? 'inline-flex items-center gap-1 text-forest-700'
                          : t.dir === 'down'
                          ? 'inline-flex items-center gap-1 text-red-600'
                          : 'inline-flex items-center gap-1 text-slate-400'
                      }
                    >
                      {t.dir === 'up' ? <TrendingUp size={15} /> : t.dir === 'down' ? <TrendingDown size={15} /> : <Minus size={15} />}
                      {Math.abs(t.pct)}%
                    </span>
                  </Td>
                  <Td className="text-slate-500">{formatDate(p.date_updated)}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Market Price">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Commodity" value={form.commodity} onChange={(e) => setForm({ ...form, commodity: e.target.value })}>
              {COMMODITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Input label="Price (SSP)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Market Location" value={form.market_location} onChange={(e) => setForm({ ...form, market_location: e.target.value })} />
            <Select label="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })}>
              {COUNTIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.price}>
              Add Price
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
