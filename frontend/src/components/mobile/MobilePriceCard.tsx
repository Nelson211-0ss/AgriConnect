import { Sprout, TrendingDown, TrendingUp } from 'lucide-react';
import { commodityColor } from './commodityColors';
import { SSP } from '@/lib/utils';

export function MobilePriceCard({
  commodity,
  price,
  unit,
  market,
  changePct,
  index = 0,
}: {
  commodity: string;
  price: number;
  unit: string;
  market: string;
  changePct: number;
  index?: number;
}) {
  const up = changePct > 0;
  const down = changePct < 0;
  const color = commodityColor(commodity, index);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-soft dark:bg-surface-elevated">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ background: color }}
      >
        <Sprout size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{commodity}</p>
        <p className="truncate text-xs text-content-muted">{market}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-forest dark:text-leaf">
          {SSP(price)}<span className="text-xs font-normal text-content-muted">/{unit}</span>
        </p>
        <p
          className={`inline-flex items-center justify-end gap-0.5 text-xs font-semibold ${
            up ? 'text-forest dark:text-leaf' : down ? 'text-red-500' : 'text-content-muted'
          }`}
        >
          {up && <TrendingUp size={12} />}
          {down && <TrendingDown size={12} />}
          {up ? '+' : ''}
          {changePct}%
        </p>
      </div>
    </div>
  );
}
