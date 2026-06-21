import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function MobileShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('md:hidden -mx-4 flex min-h-full flex-col bg-mist dark:bg-slate-950 sm:-mx-0', className)}>
      {children}
    </div>
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
      className="px-4 pb-4 pt-3 text-white"
      style={{ background: 'linear-gradient(150deg,#0B7A3E,#064a25)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-white/80">{subtitle}</p>}
        </div>
        {action}
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
    <div className="border-b border-line bg-surface px-4 py-3 dark:border-line dark:bg-surface-elevated">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface-muted px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none dark:border-line dark:bg-slate-800"
      />
    </div>
  );
}

export function MobileContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex-1 space-y-2.5 overflow-y-auto p-4', className)}>{children}</div>;
}
