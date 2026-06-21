import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';

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
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div
        className="relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex"
        style={{ background: 'linear-gradient(150deg,#0B7A3E 0%,#064a25 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Leaf size={24} />
          </div>
          <div>
            <div className="text-lg font-bold">CORWADO AgriConnect</div>
            <div className="text-sm text-leaf-light">Digital Agriculture Platform</div>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Empowering smallholder farmers across South Sudan</h1>
          <p className="mt-4 max-w-md text-leaf-light">
            Connecting farmers, extension workers, buyers and financial services through SMS, WhatsApp and a unified web platform.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              ['1,000+', 'Farmers'],
              ['5', 'Counties'],
              ['50+', 'Officers'],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl font-bold">{n}</div>
                <div className="text-sm text-leaf-light">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/60">In partnership with the Norwegian Embassy & Ministry of Agriculture</p>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center bg-mist px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-forest">
              <Leaf size={26} />
              <span className="text-xl font-bold">CORWADO AgriConnect</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your extension platform account</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-400">Quick demo login (password123)</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  onClick={() => {
                    setEmail(d.email);
                    setPassword('password123');
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-forest hover:text-forest"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            New buyer or farmer?{' '}
            <Link to="/register" className="font-semibold text-forest hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
