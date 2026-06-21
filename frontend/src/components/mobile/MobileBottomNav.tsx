import { NavLink, useLocation } from 'react-router-dom';
import { CloudSun, LineChart, Store, User, BookOpen } from 'lucide-react';
import { useAuth, Role } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface TabItem {
  to: string;
  icon: typeof CloudSun;
  label: string;
  match?: string[];
}

const FARMER_TABS: TabItem[] = [
  { to: '/app/weather', icon: CloudSun, label: 'Home', match: ['/app/weather'] },
  { to: '/app/marketplace', icon: Store, label: 'Market', match: ['/app/marketplace'] },
  { to: '/app/market', icon: LineChart, label: 'Prices', match: ['/app/market'] },
  { to: '/app/advisories', icon: BookOpen, label: 'Advice', match: ['/app/advisories', '/app/pests', '/app/training', '/app/financial'] },
  { to: '/app/settings', icon: User, label: 'Profile', match: ['/app/settings'] },
];

const BUYER_TABS: TabItem[] = [
  { to: '/app/marketplace', icon: Store, label: 'Market', match: ['/app/marketplace'] },
  { to: '/app/market', icon: LineChart, label: 'Prices', match: ['/app/market'] },
  { to: '/app/settings', icon: User, label: 'Profile', match: ['/app/settings'] },
];

function tabsForRole(role?: Role | null) {
  if (role === 'buyer') return BUYER_TABS;
  if (role === 'farmer') return FARMER_TABS;
  return null;
}

export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const tabs = tabsForRole(user?.role);

  if (!tabs) return null;

  const isActive = (tab: TabItem) => {
    if (tab.match) return tab.match.some((p) => location.pathname.startsWith(p));
    return location.pathname.startsWith(tab.to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface px-2 py-2 shadow-card dark:border-line dark:bg-surface-elevated md:hidden">
      <div className={cn('mx-auto flex max-w-lg items-center justify-around', tabs.length <= 3 && 'justify-evenly')}>
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex min-w-[4rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition',
                active ? 'text-forest dark:text-leaf' : 'text-content-muted'
              )}
            >
              <tab.icon size={22} className={active ? 'text-forest dark:text-leaf' : undefined} />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
