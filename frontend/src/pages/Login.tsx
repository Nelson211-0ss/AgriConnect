import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';
import { DEFAULT_PASSWORD, homeRoute } from '@/lib/constants';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoginFarmerSlider, LOGIN_SLIDES } from '@/components/LoginFarmerSlider';
import { cn } from '@/lib/utils';

const DEMO = [
  { label: 'Super Admin', email: 'admin@corwado.org' },
  { label: 'Extension Officer', email: 'officer@corwado.org' },
  { label: 'Farmer', email: 'farmer@corwado.org' },
  { label: 'Buyer', email: 'buyer@corwado.org' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@corwado.org');
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const activeSlide = LOGIN_SLIDES[slideIndex];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(email, password);
      navigate(homeRoute(loggedIn.role));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh]">
      {/* Left brand panel */}
      <div className="relative hidden min-h-[100dvh] w-1/2 overflow-hidden lg:flex">
        <LoginFarmerSlider onActiveChange={setSlideIndex} />

        <div className="absolute inset-0 z-10 flex items-center justify-center px-10 py-16 text-white xl:px-12">
          <div className="w-full max-w-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Leaf size={24} />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold leading-tight">CORWADO AgriConnect</div>
                <div className="text-sm leading-snug text-leaf-light">Digital Agriculture Platform</div>
              </div>
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-snug drop-shadow-sm xl:text-[2.75rem] xl:leading-snug">
              Empowering smallholder farmers across South Sudan
            </h1>
            <p className="mt-2 text-base leading-snug text-leaf-light">
              Connecting farmers, extension workers, buyers and financial services through SMS, WhatsApp and a unified web platform.
            </p>

            <blockquote className="mt-4 border-l-2 border-leaf-light/60 pl-4 text-sm leading-snug text-white/85 transition-opacity duration-500">
              <span className="mb-0.5 block text-xs font-medium uppercase tracking-wider text-leaf-light">{activeSlide.location}</span>
              {activeSlide.caption}
            </blockquote>

            <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
              {[
                ['1,000+', 'Farmers'],
                ['5', 'Counties'],
                ['50+', 'Officers'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl font-bold leading-none sm:text-3xl">{n}</div>
                  <div className="mt-0.5 text-sm leading-snug text-leaf-light">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="absolute bottom-10 left-10 right-10 z-10 text-xs leading-relaxed text-white/60 xl:left-12 xl:right-12">
          In partnership with the Norwegian Embassy &amp; Ministry of Agriculture
        </p>
      </div>

      {/* Right form panel */}
      <div className="relative flex min-h-[100dvh] w-full flex-col bg-mist lg:w-1/2">
        <header className="flex shrink-0 justify-end px-5 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:px-10">
          <ThemeToggle />
        </header>

        <div className="flex flex-1 flex-col justify-center px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 lg:px-10 lg:pb-10 xl:px-14">
          <div className="mx-auto w-full max-w-[26rem]">
            {/* Mobile / tablet brand */}
            <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
                <Leaf size={22} />
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-base font-bold text-ink">CORWADO AgriConnect</p>
                <p className="text-xs text-content-muted">Digital Agriculture Platform</p>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft sm:p-8 dark:border-line dark:bg-surface-elevated">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-ink">Welcome back</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-content-muted">Sign in to your extension platform account</p>
              </div>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                {error && (
                  <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm leading-snug text-red-600 dark:bg-red-500/10 dark:text-red-300" role="alert">
                    {error}
                  </div>
                )}
                <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6 border-t border-line pt-6 dark:border-line">
                <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-content-faint">
                  Quick demo login
                  <span className="mt-0.5 block font-normal normal-case tracking-normal text-content-muted">Password: {DEFAULT_PASSWORD}</span>
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {DEMO.map((d) => {
                    const active = email === d.email;
                    return (
                      <button
                        key={d.email}
                        type="button"
                        onClick={() => {
                          setEmail(d.email);
                          setPassword(DEFAULT_PASSWORD);
                          setError('');
                        }}
                        className={cn(
                          'flex min-h-[2.75rem] items-center justify-center rounded-xl border px-2.5 py-2 text-center text-xs font-medium leading-tight transition sm:text-sm',
                          active
                            ? 'border-forest bg-forest-50 text-forest dark:border-leaf dark:bg-forest/20 dark:text-leaf'
                            : 'border-line bg-surface-muted text-content-muted hover:border-forest hover:text-forest dark:border-line dark:bg-slate-800 dark:hover:border-leaf dark:hover:text-leaf'
                        )}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm leading-relaxed text-content-muted">
              New buyer or farmer?{' '}
              <Link to="/register" className="font-semibold text-forest hover:underline dark:text-leaf">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
