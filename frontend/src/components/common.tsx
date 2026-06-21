import { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, LucideIcon } from 'lucide-react';
import { Card } from './ui';
import { cn, formatNumber } from '@/lib/utils';

export const CHART_COLORS = ['#0B7A3E', '#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-content-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  tint = 'forest',
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  change?: number;
  tint?: 'forest' | 'leaf' | 'accent' | 'blue' | 'purple';
}) {
  const tints: Record<string, string> = {
    forest: 'bg-forest-50 text-forest-700 dark:bg-forest/20 dark:text-leaf',
    leaf: 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-300',
    accent: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tints[tint])}>
          <Icon size={22} />
        </div>
        {typeof change === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              change >= 0
                ? 'bg-forest-50 text-forest-700 dark:bg-forest/20 dark:text-leaf'
                : 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300'
            )}
          >
            {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-ink">{typeof value === 'number' ? formatNumber(value) : value}</div>
        <div className="mt-0.5 text-sm text-content-muted">{label}</div>
      </div>
    </Card>
  );
}
