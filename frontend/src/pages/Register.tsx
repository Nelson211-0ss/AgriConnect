import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Loader2, KeyRound } from 'lucide-react';
import { useAuth, Role } from '@/context/AuthContext';
import { Button, Input, Select } from '@/components/ui';
import { DEFAULT_PASSWORD, homeRoute } from '@/lib/constants';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', role: 'farmer' as Role, phone: '', county: 'Juba' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(homeRoute(user.role));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-forest">
          <Leaf size={28} />
          <span className="text-xl font-bold">CORWADO AgriConnect</span>
        </div>
        <div className="rounded-md bg-white p-8 shadow-card">
          <h2 className="text-2xl font-bold text-ink">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">Join as a farmer or buyer — Super Admin can also create accounts for you</p>

          <div className="mt-4 flex items-start gap-2 rounded-md border border-forest-100 bg-forest-50 px-3 py-2.5 text-sm text-forest-800">
            <KeyRound size={16} className="mt-0.5 shrink-0" />
            <span>
              Your login password will be: <strong className="font-mono">{DEFAULT_PASSWORD}</strong>
            </span>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input label="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Account type" value={form.role} onChange={(e) => set('role', e.target.value)}>
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
              </Select>
              <Select label="County" value={form.county} onChange={(e) => set('county', e.target.value)}>
                {['Juba', 'Wau', 'Aweil', 'Bor', 'Rumbek'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
            <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+211 ..." />
            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-forest hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
