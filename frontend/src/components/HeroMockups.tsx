import {
  LayoutDashboard,
  Users,
  LineChart,
  CloudSun,
  Bell,
  Home,
  Search,
  User,
  Signal,
  Wifi,
  BatteryFull,
  CloudSun as CloudSunIcon,
  Sprout,
  Bug,
  Leaf,
  TrendingUp,
} from 'lucide-react';

function PhoneMockup() {
  const quick = [
    { icon: Sprout, label: 'Crop Advice', color: 'bg-forest-50 text-forest' },
    { icon: CloudSunIcon, label: 'Weather', color: 'bg-blue-50 text-blue-600' },
    { icon: LineChart, label: 'Market', color: 'bg-amber-50 text-amber-600' },
    { icon: Bug, label: 'Pest Alerts', color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="relative w-[200px] shrink-0 sm:w-[220px]">
      <div className="rounded-[2rem] border-[7px] border-slate-900 bg-slate-900 shadow-card">
        <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-slate-900" />
        <div className="overflow-hidden rounded-[1.4rem] bg-white">
          <div className="flex items-center justify-between px-3.5 pt-2 text-[9px] font-semibold text-white">
            <span>9:41</span>
            <div className="flex items-center gap-0.5">
              <Signal size={9} />
              <Wifi size={9} />
              <BatteryFull size={10} />
            </div>
          </div>

          <div className="px-3.5 pb-3.5 pt-1 text-white" style={{ background: 'linear-gradient(150deg,#0B7A3E,#064a25)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] opacity-80">Hello Farmer,</p>
                <p className="text-sm font-bold">John Deng</p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <Bell size={12} />
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-white/10 p-2">
              <CloudSunIcon size={18} />
              <div>
                <p className="text-[9px]">Juba · Partly Cloudy</p>
                <p className="text-base font-bold leading-tight">31°C</p>
              </div>
            </div>
          </div>

          <div className="bg-mist px-3 py-2.5">
            <p className="mb-2 text-[10px] font-semibold text-ink">Quick Access</p>
            <div className="grid grid-cols-4 gap-1.5">
              {quick.map((q) => (
                <div key={q.label} className="flex flex-col items-center gap-1 rounded-lg bg-white p-1.5 shadow-soft">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${q.color}`}>
                    <q.icon size={12} />
                  </div>
                  <span className="text-center text-[7px] font-medium leading-tight text-slate-600">{q.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 rounded-xl bg-white p-2 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-ink">Maize Price</span>
                <span className="flex items-center gap-0.5 text-[8px] font-semibold text-forest">
                  <TrendingUp size={8} /> +4%
                </span>
              </div>
              <p className="text-sm font-bold text-forest">
                SSP 340<span className="text-[8px] font-normal text-slate-400">/kg</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-around border-t border-slate-100 bg-white py-1.5">
            {[Home, Search, LineChart, User].map((Icon, i) => (
              <Icon key={i} size={14} className={i === 0 ? 'text-forest' : 'text-slate-400'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopMockup() {
  const nav = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Users, label: 'Farmers' },
    { icon: LineChart, label: 'Market Prices' },
    { icon: CloudSun, label: 'Weather' },
  ];

  const stats = [
    { label: 'Total Farmers', value: '1,024', color: 'bg-forest-50 text-forest' },
    { label: 'Active Farmers', value: '876', color: 'bg-green-50 text-green-600' },
    { label: 'Messages Sent', value: '12.4k', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="w-full max-w-[520px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="mx-auto flex max-w-[240px] flex-1 items-center justify-center rounded-md bg-white px-3 py-0.5 text-[10px] text-slate-400">
          agriconnect.corwado.org/app/dashboard
        </div>
      </div>

      <div className="flex h-[280px] sm:h-[300px]">
        <aside className="hidden w-[130px] shrink-0 sm:block" style={{ background: 'linear-gradient(180deg,#0B7A3E,#064a25)' }}>
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-leaf text-white">
              <Leaf size={14} />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-bold text-white">AgriConnect</div>
              <div className="text-[8px] text-leaf-light">CORWADO</div>
            </div>
          </div>
          <nav className="space-y-0.5 p-2">
            {nav.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[9px] font-medium ${
                  item.active ? 'bg-white/15 text-white' : 'text-white/70'
                }`}
              >
                <item.icon size={12} />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-hidden bg-mist p-3">
          <div>
            <h2 className="text-sm font-bold text-ink">Dashboard</h2>
            <p className="text-[9px] text-slate-500">Program overview across all counties</p>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg bg-white p-2 shadow-soft">
                <div className={`mb-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md ${s.color}`}>
                  <Users size={11} />
                </div>
                <div className="text-sm font-bold text-ink">{s.value}</div>
                <div className="text-[8px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-5 gap-2">
            <div className="col-span-3 rounded-lg bg-white p-2 shadow-soft">
              <p className="text-[9px] font-semibold text-ink">Farmer Growth</p>
              <div className="mt-2 flex h-16 items-end gap-1">
                {[40, 55, 48, 70, 62, 85, 78].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-forest/80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="col-span-2 rounded-lg bg-white p-2 shadow-soft">
              <p className="text-[9px] font-semibold text-ink">By County</p>
              <div className="relative mx-auto mt-2 h-16 w-16">
                <div className="absolute inset-0 rounded-full border-[10px] border-forest" />
                <div
                  className="absolute inset-0 rounded-full border-[10px] border-leaf border-r-transparent border-b-transparent"
                  style={{ transform: 'rotate(-45deg)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-ink">5</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function HeroMockups() {
  return (
    <div className="relative mx-auto flex w-full max-w-xl items-end justify-center lg:mx-0 lg:max-w-none lg:justify-end">
      <div className="relative w-full max-w-[560px]">
        <div className="relative z-0 ml-auto w-[92%] pt-2 sm:w-[88%]">
          <DesktopMockup />
        </div>
        <div className="absolute -bottom-2 left-0 z-10 sm:-bottom-4 sm:left-2">
          <PhoneMockup />
        </div>
      </div>
    </div>
  );
}
