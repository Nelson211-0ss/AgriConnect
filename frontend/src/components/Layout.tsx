import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  UserPlus,
  BookOpen,
  LineChart,
  CloudSun,
  Bug,
  MessageSquare,
  GraduationCap,
  FileBarChart,
  Settings,
  Store,
  Wallet,
  Map,
  Smartphone,
  Menu,
  LogOut,
  Bell,
  Search,
  Leaf,
  ChevronLeft,
} from 'lucide-react';
import { useAuth, ROLE_LABELS, Role } from '@/context/AuthContext';
import { cn, initials } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'extension_officer'] },
  { to: '/app/farmers', label: 'Farmers', icon: Users, roles: ['super_admin', 'extension_officer'] },
  { to: '/app/users', label: 'User Accounts', icon: UserPlus, roles: ['super_admin'] },
  { to: '/app/extension-workers', label: 'Extension Workers', icon: UserCog, roles: ['super_admin', 'extension_officer'] },
  { to: '/app/advisories', label: 'Advisories', icon: BookOpen },
  { to: '/app/market', label: 'Market Prices', icon: LineChart },
  { to: '/app/weather', label: 'Weather Alerts', icon: CloudSun },
  { to: '/app/pests', label: 'Pest Alerts', icon: Bug },
  { to: '/app/marketplace', label: 'Marketplace', icon: Store },
  { to: '/app/financial', label: 'Financial Services', icon: Wallet },
  { to: '/app/messaging', label: 'Messaging Center', icon: MessageSquare, roles: ['super_admin', 'extension_officer'] },
  { to: '/app/training', label: 'Training', icon: GraduationCap },
  { to: '/app/maps', label: 'Maps', icon: Map },
  { to: '/app/reports', label: 'Reports', icon: FileBarChart, roles: ['super_admin', 'extension_officer'] },
  { to: '/app/mobile', label: 'Mobile & Channels', icon: Smartphone },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV.filter((n) => !n.roles || (user && n.roles.includes(user.role)));

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center gap-2.5 px-4 h-16 border-b border-white/10', collapsed && 'justify-center px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf text-white">
          <Leaf size={20} />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="font-bold text-white">AgriConnect</div>
            <div className="text-[11px] text-leaf-light">CORWADO South Sudan</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-2',
                isActive ? 'bg-leaf text-white shadow-sm' : 'text-forest-50/80 hover:bg-white/10 hover:text-white'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={19} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={cn('border-t border-white/10 p-3', collapsed && 'px-2')}>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-forest-50/80 hover:bg-white/10 hover:text-white',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut size={19} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="box-border flex h-screen overflow-hidden bg-mist p-4 font-sans antialiased gap-4 md:gap-6 md:p-6 lg:p-8">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex shrink-0 flex-col bg-forest-800 transition-all duration-300',
          collapsed ? 'w-[76px]' : 'w-64'
        )}
        style={{ background: 'linear-gradient(180deg,#086030 0%,#064a25 100%)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64" style={{ background: 'linear-gradient(180deg,#086030 0%,#064a25 100%)' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="mb-4 flex h-16 shrink-0 items-center gap-3 border border-slate-200 bg-white px-4 md:mb-6 md:px-6">
          <button className="hidden md:inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setCollapsed((c) => !c)}>
            <ChevronLeft size={20} className={cn('transition-transform', collapsed && 'rotate-180')} />
          </button>
          <button className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="relative hidden sm:block flex-1 max-w-md">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search farmers, advisories, markets..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-forest focus:bg-white focus:outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100">
              <Bell size={19} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            </button>
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest text-sm font-semibold text-white">
                {user ? initials(user.name) : '?'}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-semibold text-ink">{user?.name}</div>
                <div className="text-[11px] text-slate-500">{user ? ROLE_LABELS[user.role] : ''}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto font-sans">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
