import { Link } from 'react-router-dom';
import {
  Leaf,
  Users,
  CloudSun,
  Bug,
  LineChart,
  MessageSquare,
  GraduationCap,
  Wallet,
  Store,
  ArrowRight,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui';

const FEATURES = [
  { icon: Users, title: 'Farmer Registry', desc: 'Digitally register and manage thousands of smallholder farmers across counties.' },
  { icon: LineChart, title: 'Market Information', desc: 'Real-time commodity prices and price trend analytics for better decisions.' },
  { icon: CloudSun, title: 'Weather Intelligence', desc: 'Localized forecasts and early warning alerts for rain, flood and drought.' },
  { icon: Bug, title: 'Pest & Disease Alerts', desc: 'County-based outbreak reporting and rapid farmer notifications.' },
  { icon: MessageSquare, title: 'SMS & WhatsApp', desc: 'Reach farmers on the channels they already use, at scale.' },
  { icon: Store, title: 'Buyer Marketplace', desc: 'Connect farmers directly with buyers and cooperatives.' },
  { icon: Wallet, title: 'Financial Services', desc: 'Access to loans, savings and agricultural insurance products.' },
  { icon: GraduationCap, title: 'Training & Extension', desc: 'Climate-smart agriculture courses with progress and certificates.' },
];

const PARTNERS = ['CORWADO South Sudan', 'Norwegian Embassy', 'Ministry of Agriculture', 'Development Partners'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 text-forest">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white">
              <Leaf size={20} />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-ink">CORWADO AgriConnect</div>
              <div className="text-[11px] text-slate-500">Digital Agriculture Platform</div>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-forest">Features</a>
            <a href="#impact" className="hover:text-forest">Impact</a>
            <a href="#partners" className="hover:text-forest">Partners</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/login">
              <Button>
                Launch Platform <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-10" style={{ background: 'radial-gradient(circle at 80% 20%, #22C55E, transparent 50%)' }} />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1 text-sm font-medium text-forest-700">
              <span className="h-2 w-2 rounded-full bg-leaf" /> Pilot-ready digital extension platform
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-ink lg:text-5xl">
              Connecting South Sudan's farmers to <span className="text-forest">knowledge, markets & finance</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              AgriConnect unifies farmer registration, climate-smart advisories, market prices, weather and pest alerts, and mobile messaging — one platform for extension at scale.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg">
                  Explore the Dashboard <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline">
                  Register as Farmer / Buyer
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
              {['SMS & WhatsApp ready', 'Works on any phone', 'Multi-county coverage'].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-forest" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['1,000+', 'Registered Farmers', 'bg-forest text-white'],
                ['5', 'Counties Covered', 'bg-white text-ink border border-slate-100'],
                ['50+', 'Extension Officers', 'bg-white text-ink border border-slate-100'],
                ['100+', 'Active Buyers', 'bg-accent text-white'],
              ].map(([n, l, c]) => (
                <div key={l} className={`rounded-2xl p-6 shadow-card ${c}`}>
                  <div className="text-3xl font-extrabold">{n}</div>
                  <div className="mt-1 text-sm opacity-90">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Smartphone size={16} className="text-forest" /> SMS Alert Preview
              </div>
              <p className="mt-2 rounded-xl bg-mist p-3 text-sm text-slate-600">
                "Heavy rains expected in Wau County from 28–30 May. Prepare drainage channels and protect stored produce."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-mist py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-ink">Everything an extension program needs</h2>
            <p className="mt-3 text-slate-600">A complete toolkit for digital agricultural extension, market access and farmer engagement.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white p-6 shadow-soft transition hover:shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest">
                  <f.icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-ink">Built for real impact in the field</h2>
            <p className="mt-4 text-slate-600">
              From the first farmer registration to the last-mile SMS alert, AgriConnect is designed for low-connectivity environments and the realities of smallholder agriculture in South Sudan.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Register farmers offline-friendly with GPS and farm data',
                'Push climate-smart advisories by crop and growth stage',
                'Trigger county-based pest and weather early warnings',
                'Link farmers to buyers, cooperatives and finance',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-forest" size={20} />
                  <span className="text-slate-700">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl p-8 text-white shadow-card" style={{ background: 'linear-gradient(150deg,#0B7A3E,#064a25)' }}>
            <h3 className="text-xl font-bold">Ready for donor presentation</h3>
            <p className="mt-2 text-leaf-light">Demonstration environment pre-loaded with realistic data across all modules.</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                ['50', 'Advisories'],
                ['20', 'Pest Alerts'],
                ['20+', 'Market Records'],
                ['600+', 'Course Enrollments'],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white/10 p-4">
                  <div className="text-2xl font-bold">{n}</div>
                  <div className="text-sm text-leaf-light">{l}</div>
                </div>
              ))}
            </div>
            <Link to="/login" className="mt-6 inline-block">
              <Button variant="accent" size="lg">
                Open Demo <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="border-t border-slate-100 bg-mist py-14">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">In partnership with</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PARTNERS.map((p) => (
              <span key={p} className="text-lg font-semibold text-slate-500">{p}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-forest-800 py-10 text-center text-sm text-forest-50/70" style={{ background: '#064a25' }}>
        <div className="flex items-center justify-center gap-2 text-white">
          <Leaf size={18} /> <span className="font-semibold">CORWADO AgriConnect</span>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} CORWADO South Sudan. Digital Agricultural Extension Platform.</p>
      </footer>
    </div>
  );
}
