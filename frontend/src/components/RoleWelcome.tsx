import { Link } from 'react-router-dom';
import {
  Store,
  LineChart,
  BookOpen,
  CloudSun,
  Bug,
  Wallet,
  GraduationCap,
  Sprout,
  ShoppingCart,
  Settings,
} from 'lucide-react';
import { useAuth, ROLE_LABELS } from '@/context/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import { cn } from '@/lib/utils';

interface QuickLink {
  to: string;
  label: string;
  icon: typeof Store;
  highlight?: boolean;
}

const FARMER_LINKS: QuickLink[] = [
  { to: '/app/weather', label: 'Weather', icon: CloudSun, highlight: true },
  { to: '/app/marketplace', label: 'Marketplace', icon: Store },
  { to: '/app/market', label: 'Market Prices', icon: LineChart },
  { to: '/app/advisories', label: 'Advisories', icon: BookOpen },
  { to: '/app/pests', label: 'Pest Alerts', icon: Bug },
  { to: '/app/financial', label: 'Finance', icon: Wallet },
  { to: '/app/training', label: 'Training', icon: GraduationCap },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

const BUYER_LINKS: QuickLink[] = [
  { to: '/app/marketplace', label: 'Marketplace', icon: Store, highlight: true },
  { to: '/app/market', label: 'Market Prices', icon: LineChart },
  { to: '/app/marketplace', label: 'Farmer Produce', icon: Sprout },
  { to: '/app/marketplace', label: 'Post Demand', icon: ShoppingCart },
  { to: '/app/financial', label: 'Finance', icon: Wallet },
  { to: '/app/advisories', label: 'Advisories', icon: BookOpen },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function RoleWelcome() {
  const { user } = useAuth();
  if (!user || (user.role !== 'farmer' && user.role !== 'buyer')) return null;

  const roleLabel = ROLE_LABELS[user.role];
  const links = user.role === 'farmer' ? FARMER_LINKS : BUYER_LINKS;
  const firstName = user.name.split(' ')[0];

  return (
    <section className="mb-6 rounded-2xl border border-line bg-surface p-5 shadow-soft dark:border-line dark:bg-surface-elevated md:hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="xl" />
          <div>
            <p className="text-sm font-medium text-forest dark:text-leaf">Welcome back</p>
            <h2 className="text-2xl font-bold text-ink dark:text-white">
              Hello, {roleLabel} {firstName}
            </h2>
            <p className="mt-1 text-sm text-content-muted">
              {user.role === 'farmer'
                ? 'Browse market prices, sell produce, and stay ahead of weather and pest alerts.'
                : 'Find farmer produce, post buying demand, and track market prices.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-content-faint">Quick access</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-center text-xs font-medium transition',
                link.highlight
                  ? 'border-forest bg-forest text-white hover:bg-forest-700 dark:border-leaf dark:bg-leaf dark:text-forest-800'
                  : 'border-line bg-surface-muted text-content hover:border-forest hover:text-forest dark:border-line dark:bg-slate-800 dark:text-slate-300 dark:hover:border-leaf dark:hover:text-leaf'
              )}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
