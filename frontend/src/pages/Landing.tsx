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
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { HeroMockups } from '@/components/HeroMockups';

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
          <Link to="/login">
            <Button>Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center overflow-x-hidden bg-gradient-to-br from-forest-50 via-white to-mist">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: `
              radial-gradient(ellipse 70% 55% at 85% 15%, rgba(34, 197, 94, 0.18), transparent),
              radial-gradient(ellipse 50% 45% at 5% 90%, rgba(11, 122, 62, 0.1), transparent),
              radial-gradient(ellipse 40% 35% at 50% 50%, rgba(209, 250, 223, 0.5), transparent)
            `,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage: 'radial-gradient(circle, #0B7A3E 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" aria-hidden />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 pb-20 lg:grid-cols-2 lg:gap-16 lg:py-20 lg:pb-24">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white/70 px-3 py-1 text-sm font-medium text-forest-700 shadow-soft backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-leaf" /> Digital extension for South Sudan
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-ink lg:text-5xl xl:text-[3.25rem]">
              Empowering Farmers With <span className="text-forest">Knowledge & Markets</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-slate-600 lg:mx-0">
              One platform for registration, advisories, market prices, and farmer outreach.
            </p>
          </div>

          <HeroMockups />
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

      <footer className="text-forest-50/80" style={{ background: '#064a25' }}>
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Leaf size={20} />
                </div>
                <span className="font-semibold">CORWADO AgriConnect</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-forest-50/70">
                A digital agricultural extension platform connecting smallholder farmers to climate-smart advice, market information, and financial services across South Sudan.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Platform</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#impact" className="hover:text-white">Impact</a></li>
                <li><a href="#partners" className="hover:text-white">Partners</a></li>
                <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Modules</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>Farmer Registry</li>
                <li>Market Prices</li>
                <li>Weather & Pest Alerts</li>
                <li>SMS & WhatsApp</li>
                <li>Training & Finance</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-leaf-light" />
                  <span>Juba, South Sudan</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0 text-leaf-light" />
                  <span>info@corwado.org</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-forest-50/50">Supported by development partners and the Ministry of Agriculture.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-forest-50/50 sm:flex-row">
            <p>© {new Date().getFullYear()} CORWADO South Sudan. All rights reserved.</p>
            <p>Digital Agricultural Extension Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
