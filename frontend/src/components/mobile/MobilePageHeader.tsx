import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function MobileShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex w-full min-w-0 flex-col bg-mist dark:bg-slate-950 md:hidden', className)}>{children}</div>
  );
}

export function MobilePageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="shrink-0 rounded-b-3xl px-4 pb-4 pt-2 text-white"
      style={{ background: 'linear-gradient(150deg,#0B7A3E,#064a25)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-sm text-white/80">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function MobileSearchBar({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="shrink-0 border-b border-line bg-surface px-4 py-2.5 dark:border-line dark:bg-surface-elevated">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface-muted px-3.5 py-2 text-sm text-ink focus:border-forest focus:outline-none dark:border-line dark:bg-slate-800"
      />
    </div>
  );
}

export function MobileToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('shrink-0 space-y-2.5 border-b border-line bg-surface px-4 py-3 dark:border-line dark:bg-surface-elevated', className)}>
      {children}
    </div>
  );
}

export function MobileSectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm font-semibold text-ink', className)}>{children}</p>;
}

export function MobileContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0 flex-1 space-y-3 overflow-x-hidden px-4 pb-4 pt-3', className)}>{children}</div>
  );
}
