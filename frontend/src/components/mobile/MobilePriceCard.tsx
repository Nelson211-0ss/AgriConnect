import { Sprout, TrendingDown, TrendingUp } from 'lucide-react';
import { commodityColor } from './commodityColors';
import { itemCardMuted, itemCardShell, itemCardTitle } from './itemCardTheme';
import { SSP } from '@/lib/utils';
import { cn } from '@/lib/utils';

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
    <div className={cn('flex items-center gap-2.5 rounded-2xl border p-3 sm:gap-3', itemCardShell)}>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:h-11 sm:w-11"
        style={{ background: color }}
      >
        <Sprout size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate font-semibold', itemCardTitle)}>{commodity}</p>
        <p className={cn('truncate text-xs', itemCardMuted)}>{market}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn('text-sm font-bold leading-tight sm:text-base', itemCardTitle)}>
          {SSP(price)}
          <span className={cn('text-[10px] font-normal sm:text-xs', itemCardMuted)}>/{unit}</span>
        </p>
        <p
          className={cn(
            'inline-flex items-center justify-end gap-0.5 text-[11px] font-semibold sm:text-xs',
            up ? 'text-leaf-light' : down ? 'text-red-300' : itemCardMuted
          )}
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
