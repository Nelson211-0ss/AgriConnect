import { ReactNode } from 'react';
import {
  Sprout,
  CloudSun,
  LineChart,
  Bug,
  Store,
  Wallet,
  Home,
  Search,
  Bell,
  User,
  Signal,
  Wifi,
  BatteryFull,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Leaf,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/common';

function PhoneFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[640px] w-[310px] rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-card">
        <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
        <div className="h-full w-full overflow-hidden rounded-[1.8rem] bg-white">{children}</div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function StatusBar({ dark }: { dark?: boolean }) {
  const c = dark ? 'text-white' : 'text-slate-900';
  return (
    <div className={`flex items-center justify-between px-5 pt-2.5 text-xs font-semibold ${c}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <Signal size={13} />
        <Wifi size={13} />
        <BatteryFull size={15} />
      </div>
    </div>
  );
}

const QUICK = [
  { icon: Sprout, label: 'Crop Advice', color: 'bg-forest-50 text-forest' },
  { icon: CloudSun, label: 'Weather', color: 'bg-blue-50 text-blue-600' },
  { icon: LineChart, label: 'Market Prices', color: 'bg-amber-50 text-amber-600' },
  { icon: Bug, label: 'Pest Alerts', color: 'bg-red-50 text-red-600' },
  { icon: Store, label: 'Find Buyers', color: 'bg-purple-50 text-purple-600' },
  { icon: Wallet, label: 'Finance', color: 'bg-emerald-50 text-emerald-600' },
];

function HomeScreen() {
  return (
    <div className="flex h-full flex-col bg-mist">
      <StatusBar dark />
      <div className="rounded-b-3xl px-5 pb-5 pt-3 text-white" style={{ background: 'linear-gradient(150deg,#0B7A3E,#064a25)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Hello Farmer,</p>
            <p className="text-xl font-bold">John Deng</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <Bell size={18} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
          <CloudSun size={32} />
          <div className="flex-1">
            <p className="text-sm">Juba County · Partly Cloudy</p>
            <p className="text-2xl font-bold">31°C</p>
          </div>
          <div className="text-right text-xs opacity-80">
            <p>Humidity 64%</p>
            <p>Rain 20mm</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 font-semibold text-ink">Quick Access</p>
        <div className="grid grid-cols-3 gap-3">
          {QUICK.map((q) => (
            <div key={q.label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 shadow-soft">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${q.color}`}>
                <q.icon size={20} />
              </div>
              <span className="text-center text-[11px] font-medium text-slate-600">{q.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-forest p-4 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Leaf size={16} /> Today's Tip
          </div>
          <p className="mt-1 text-sm opacity-90">Scout your maize for Fall Armyworm early in the morning. Report any signs to your officer.</p>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink">Maize Price</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-forest">
              <TrendingUp size={13} /> +4%
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-forest">SSP 340<span className="text-sm font-normal text-slate-400">/kg</span></p>
          <p className="text-xs text-slate-400">Juba Central Market</p>
        </div>
      </div>

      <div className="flex items-center justify-around border-t border-slate-100 bg-white py-2.5">
        {[Home, Search, LineChart, User].map((Icon, i) => (
          <Icon key={i} size={22} className={i === 0 ? 'text-forest' : 'text-slate-400'} />
        ))}
      </div>
    </div>
  );
}

function CropAdviceScreen() {
  return (
    <div className="flex h-full flex-col bg-mist">
      <StatusBar dark />
      <div className="flex items-center gap-3 bg-forest px-5 pb-4 pt-3 text-white">
        <ArrowLeft size={20} />
        <span className="font-semibold">Crop Advice</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl bg-white p-4 shadow-soft">
          <p className="text-sm font-medium text-slate-500">Select Crop</p>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {['Maize', 'Sorghum', 'Cassava'].map((c, i) => (
              <span key={c} className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium ${i === 0 ? 'bg-forest text-white' : 'bg-slate-100 text-slate-500'}`}>
                {c}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">Growth Stage</p>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {['Planting', 'Vegetative', 'Flowering', 'Harvest'].map((c, i) => (
              <span key={c} className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium ${i === 1 ? 'bg-leaf text-white' : 'bg-slate-100 text-slate-500'}`}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <p className="mb-2 mt-4 font-semibold text-ink">Recommended Actions</p>
        {[
          ['Apply nitrogen top-dressing', 'At 3-4 weeks after emergence for vigorous growth.'],
          ['Weed control', 'Keep fields weed-free during this critical stage.'],
          ['Scout for pests', 'Check for Fall Armyworm in the leaf whorls.'],
        ].map(([t, d]) => (
          <div key={t} className="mb-2 flex gap-3 rounded-2xl bg-white p-3 shadow-soft">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest">
              <Check size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{t}</p>
              <p className="text-xs text-slate-500">{d}</p>
            </div>
          </div>
        ))}

        <div className="mt-3 rounded-2xl p-4 text-white" style={{ background: 'linear-gradient(120deg,#22C55E,#0B7A3E)' }}>
          <p className="text-sm font-semibold">Learning Resource</p>
          <p className="text-xs opacity-90">Watch: Climate-smart maize production (8 min)</p>
        </div>
      </div>
    </div>
  );
}

function MarketScreen() {
  const items = [
    ['Maize', 340, 4, '#0B7A3E'],
    ['Sorghum', 295, -2, '#F59E0B'],
    ['Groundnuts', 760, 6, '#22C55E'],
    ['Sesame', 980, 3, '#8B5CF6'],
    ['Cassava', 210, -1, '#3B82F6'],
  ] as const;
  return (
    <div className="flex h-full flex-col bg-mist">
      <StatusBar dark />
      <div className="flex items-center gap-3 bg-forest px-5 pb-4 pt-3 text-white">
        <ArrowLeft size={20} />
        <span className="font-semibold">Market Prices</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {items.map(([name, price, change, color]) => (
          <div key={name} className="mb-2.5 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: color }}>
              <Sprout size={22} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">{name}</p>
              <p className="text-xs text-slate-400">Juba Central Market</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-forest">SSP {price}</p>
              <p className={`text-xs font-semibold ${change >= 0 ? 'text-forest' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}
                {change}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhatsAppScreen() {
  return (
    <div className="flex h-full flex-col" style={{ background: '#ECE5DD' }}>
      <StatusBar dark />
      <div className="flex items-center gap-3 px-4 pb-3 pt-2 text-white" style={{ background: '#075E54' }}>
        <ArrowLeft size={20} />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <Leaf size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">CORWADO AgriConnect</p>
          <p className="text-[11px] opacity-80">online</p>
        </div>
        <Video size={18} />
        <Phone size={16} />
        <MoreVertical size={18} />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <div className="mx-auto w-fit rounded-lg bg-white/70 px-3 py-1 text-[11px] text-slate-500">Today</div>
        <Bubble side="in">Welcome to CORWADO AgriConnect 🌱 How can we help you today?</Bubble>
        <Bubble side="in">
          <div className="space-y-1.5">
            {['1. Crop Advice', '2. Market Prices', '3. Weather Update', '4. Pest Alert', '5. Financial Services', '6. Talk to Expert'].map((o) => (
              <div key={o} className="rounded-lg bg-forest-50 px-2.5 py-1.5 text-xs font-medium text-forest-700">{o}</div>
            ))}
          </div>
        </Bubble>
        <Bubble side="out">2</Bubble>
        <Bubble side="in">
          📊 Today's Maize price: <b>SSP 340/kg</b> at Juba Central Market (+4% this week). Reply MORE for other commodities.
        </Bubble>
        <Bubble side="out">Thank you!</Bubble>
      </div>

      <div className="flex items-center gap-2 p-2">
        <div className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-slate-400">Type a message</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: '#075E54' }}>
          <Phone size={16} />
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, children }: { side: 'in' | 'out'; children: ReactNode }) {
  return (
    <div className={`flex ${side === 'out' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${side === 'out' ? 'rounded-br-sm bg-[#DCF8C6] text-slate-800' : 'rounded-bl-sm bg-white text-slate-800'}`}
      >
        {children}
        {side === 'out' && <CheckCheck size={13} className="ml-1 inline text-blue-500" />}
      </div>
    </div>
  );
}

function SmsScreen() {
  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 pb-3 pt-2">
        <ArrowLeft size={20} className="text-forest" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-white">
          <Leaf size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">CORWADO</p>
          <p className="text-[11px] text-slate-400">Text Message</p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="mx-auto w-fit text-[11px] text-slate-400">Today 8:30 AM</div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 p-3 text-sm text-slate-700">
          ⚠️ WEATHER ALERT: Heavy rains expected in Wau County from 28–30 May. Prepare drainage channels and protect stored produce.
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 p-3 text-sm text-slate-700">
          🌽 MARKET: Maize SSP 340/kg at Juba Central Market this week. Sorghum SSP 295/kg.
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-red-50 p-3 text-sm text-red-700">
          🐛 PEST ALERT: Fall Armyworm detected in your area. Scout your maize and contact your extension officer.
        </div>
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-forest p-3 text-sm text-white">
          ADVICE
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 p-3 text-sm text-slate-700">
          Reply with crop name (MAIZE, SORGHUM, CASSAVA) for tailored advice.
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 p-3">
        <div className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-400">Text message</div>
      </div>
    </div>
  );
}

export default function MobileApp() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Mobile & Channel Experience" subtitle="How farmers access AgriConnect on any device — app, WhatsApp and SMS" />

      <div className="rounded-2xl bg-white p-6 shadow-soft md:p-10">
        <div className="grid justify-items-center gap-10 sm:grid-cols-2 xl:grid-cols-5">
          <PhoneFrame label="Farmer App · Home">
            <HomeScreen />
          </PhoneFrame>
          <PhoneFrame label="Crop Advice">
            <CropAdviceScreen />
          </PhoneFrame>
          <PhoneFrame label="Market Prices">
            <MarketScreen />
          </PhoneFrame>
          <PhoneFrame label="WhatsApp Business">
            <WhatsAppScreen />
          </PhoneFrame>
          <PhoneFrame label="SMS Alerts">
            <SmsScreen />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
