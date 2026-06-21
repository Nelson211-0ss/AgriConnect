import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        'flex w-full items-start gap-3 rounded-2xl bg-surface p-3 text-left shadow-soft dark:bg-surface-elevated',
        onClick && 'transition active:scale-[0.99]',
        className
      )}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ background: iconBg || '#0B7A3E' }}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        {subtitle && <div className="mt-0.5 text-xs text-content-muted">{subtitle}</div>}
      </div>
      {right && <div className="shrink-0 text-right">{right}</div>}
    </Tag>
  );
}

export function MobileChipRow({
  items,
  active,
  onSelect,
}: {
  items: string[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <button
          key={item || 'all'}
          type="button"
          onClick={() => onSelect(item)}
          className={cn(
            'whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition',
            active === item ? 'bg-forest text-white' : 'bg-surface text-content-muted shadow-soft dark:bg-surface-elevated'
          )}
        >
          {item || 'All'}
        </button>
      ))}
    </div>
  );
}
