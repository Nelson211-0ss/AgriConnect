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
    <div className="flex items-center gap-2.5 rounded-2xl bg-surface p-3 shadow-soft dark:bg-surface-elevated sm:gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:h-11 sm:w-11"
        style={{ background: color }}
      >
        <Sprout size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{commodity}</p>
        <p className="truncate text-xs text-content-muted">{market}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold leading-tight text-forest dark:text-leaf sm:text-base">
          {SSP(price)}
          <span className="text-[10px] font-normal text-content-muted sm:text-xs">/{unit}</span>
        </p>
        <p
          className={`inline-flex items-center justify-end gap-0.5 text-[11px] font-semibold sm:text-xs ${
            up ? 'text-forest dark:text-leaf' : down ? 'text-red-500' : 'text-content-muted'
          }`}
        >
          {up && <TrendingUp size={11} />}
          {down && <TrendingDown size={11} />}
          {up ? '+' : ''}
          {changePct}%
        </p>
      </div>
    </div>
  );
}
