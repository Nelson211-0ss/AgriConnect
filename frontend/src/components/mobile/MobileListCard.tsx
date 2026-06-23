import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { itemCardMuted, itemCardShell, itemCardTitle } from './itemCardTheme';

export function MobileListCard({
  icon: Icon,
  iconBg,
  title,
  subtitle,
  right,
  onClick,
  className,
}: {
  icon: LucideIcon;
  iconBg?: string;
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border p-3 text-left',
        itemCardShell,
        onClick && 'transition active:scale-[0.99]',
        className
      )}
    >
      <div className="flex gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:h-11 sm:w-11"
          style={{ background: iconBg || 'rgba(255,255,255,0.15)' }}
        >
          <Icon size={18} className="sm:hidden" />
          <Icon size={20} className="hidden sm:block" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('line-clamp-2 font-semibold leading-snug', itemCardTitle)}>{title}</p>
            {right && (
              <div
                className={cn(
                  'shrink-0',
                  itemCardTitle,
                  '[&_.text-ink]:text-white [&_.text-content-muted]:text-white/75 [&_.inline-flex]:!bg-white/20 [&_.inline-flex]:!text-white'
                )}
              >
                {right}
              </div>
            )}
          </div>
          {subtitle && (
            <div
              className={cn(
                'mt-1 text-xs leading-relaxed',
                itemCardMuted,
                '[&_.text-content-faint]:text-white/60 [&_.text-forest]:text-leaf-light [&_.text-forest-700]:text-white [&_.text-leaf]:text-leaf-light'
              )}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </Tag>
  );
}

export function MobileChipRow({
  items,
  active,
  onSelect,
  labels,
}: {
  items: string[];
  active: string;
  onSelect: (v: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <button
          key={item || 'all'}
          type="button"
          onClick={() => onSelect(item)}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition',
            active === item
              ? 'bg-forest text-white shadow-sm'
              : 'bg-surface-muted text-content-muted dark:bg-slate-800'
          )}
        >
          {labels?.[item] ?? (item || 'All')}
        </button>
      ))}
    </div>
  );
}
