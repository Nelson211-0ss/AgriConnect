import { useEffect, useState } from 'react';
import { Users, Bug, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardBody, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { MobileShell, MobilePageHeader, MobileContent, MobileChipRow } from '@/components/mobile';
import { LeafletMap, MapPoint } from '@/components/LeafletMap';
import { cn } from '@/lib/utils';

interface FarmerPoint {
  id: number;
  full_name: string;
  county: string;
  lat: number;
  lng: number;
  crop_types: string[];
}
interface PestPoint {
  id: number;
  pest_name: string;
  county: string;
  severity: string;
  status: string;
  lat?: number;
  lng?: number;
}

const MARKET_LOCATIONS: MapPoint[] = [
  { id: 'm1', lat: 4.85, lng: 31.58, color: '#F59E0B', radius: 10, label: 'Juba Central Market' },
  { id: 'm2', lat: 7.7, lng: 27.99, color: '#F59E0B', radius: 10, label: 'Wau Central Market' },
  { id: 'm3', lat: 8.77, lng: 27.4, color: '#F59E0B', radius: 10, label: 'Aweil Central Market' },
  { id: 'm4', lat: 6.21, lng: 31.56, color: '#F59E0B', radius: 10, label: 'Bor Central Market' },
  { id: 'm5', lat: 6.8, lng: 29.68, color: '#F59E0B', radius: 10, label: 'Rumbek Central Market' },
];

type Layer = 'farmers' | 'pests' | 'markets';

export default function MapsView() {
  const [layer, setLayer] = useState<Layer>('farmers');
  const [farmers, setFarmers] = useState<FarmerPoint[]>([]);
  const [pests, setPests] = useState<PestPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<FarmerPoint[]>('/farmers/map'), api.get<PestPoint[]>('/pests')])
      .then(([f, p]) => {
        setFarmers(f);
        setPests(p);
      })
      .finally(() => setLoading(false));
  }, []);

  let points: MapPoint[] = [];
  if (layer === 'farmers')
    points = farmers.map((f) => ({ id: f.id, lat: f.lat, lng: f.lng, color: '#0B7A3E', radius: 5, label: `${f.full_name} (${f.county})` }));
  else if (layer === 'pests')
    points = pests
      .filter((p) => p.status === 'active' && p.lat && p.lng)
      .map((p) => ({
        id: p.id,
        lat: p.lat!,
        lng: p.lng!,
        color: p.severity === 'critical' || p.severity === 'high' ? '#DC2626' : '#F59E0B',
        radius: 11,
        label: `${p.pest_name} – ${p.county}`,
      }));
  else points = MARKET_LOCATIONS;

  const layers: { key: Layer; label: string; icon: typeof Users; count: number }[] = [
    { key: 'farmers', label: 'Farmers', icon: Users, count: farmers.length },
    { key: 'pests', label: 'Pest Outbreaks', icon: Bug, count: pests.filter((p) => p.status === 'active').length },
    { key: 'markets', label: 'Markets', icon: Store, count: MARKET_LOCATIONS.length },
  ];

  const activeLayer = layers.find((l) => l.key === layer)!;

  return (
    <div className="animate-fade-in space-y-4">
      <MobileShell>
        <MobilePageHeader title="Geographic Maps" subtitle="Farmers, outbreaks & markets" />
        <div className="border-b border-line bg-surface px-4 py-3 dark:border-line dark:bg-surface-elevated">
          <MobileChipRow items={layers.map((l) => l.label)} active={activeLayer.label} onSelect={(label) => setLayer(layers.find((l) => l.label === label)!.key)} />
        </div>
        <MobileContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-soft dark:bg-surface-elevated">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white">
              <activeLayer.icon size={18} />
            </div>
            <div>
              <p className="font-semibold text-ink">{activeLayer.label}</p>
              <p className="text-xs text-content-muted">{activeLayer.count} map points</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-surface shadow-soft dark:bg-surface-elevated">
            {loading ? (
              <div className="flex h-72 items-center justify-center">
                <Spinner className="h-7 w-7" />
              </div>
            ) : (
              <LeafletMap points={points} height={288} />
            )}
          </div>
        </MobileContent>
      </MobileShell>

      <div className="hidden md:block">
        <PageHeader title="Geographic Intelligence" subtitle="Interactive maps of farmers, outbreaks and markets" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {layers.map((l) => (
            <button key={l.key} onClick={() => setLayer(l.key)} className="text-left">
              <Card className={cn('flex items-center gap-3 p-4 transition', layer === l.key ? 'ring-2 ring-forest' : 'hover:shadow-card')}>
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', layer === l.key ? 'bg-forest text-white' : 'bg-forest-50 text-forest')}>
                  <l.icon size={20} />
                </div>
                <div>
                  <div className="font-semibold text-ink">{l.label === 'Farmers' ? 'Farmer Distribution' : l.label === 'Markets' ? 'Market Locations' : l.label}</div>
                  <div className="text-sm text-slate-400">{l.count} points</div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader title="South Sudan Coverage Map" subtitle="Showing active data layer" />
          <CardBody>
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <LeafletMap points={points} height={520} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
