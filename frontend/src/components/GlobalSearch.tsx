import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SearchResults {
  farmers: { id: number; title: string; county?: string; type: string }[];
  advisories: { id: number; title: string; category?: string; type: string }[];
  products: { id: number; title: string; county?: string; type: string }[];
  directory: { id: number; title: string; county?: string; type: string }[];
  cooperatives: { id: number; title: string; county?: string; type: string }[];
  market: { id: number; title: string; county?: string; type: string }[];
  knowledge: { id: number; title: string; category?: string; type: string }[];
}

const ROUTES: Record<string, (id: number) => string> = {
  farmer: () => '/app/farmers',
  advisory: () => '/app/advisories',
  produce: () => '/app/marketplace',
  marketplace: () => '/app/marketplace',
  buyer: () => '/app/directory',
  processor: () => '/app/directory',
  exporter: () => '/app/directory',
  agro_dealer: () => '/app/directory',
  input_supplier: () => '/app/directory',
  transporter: () => '/app/directory',
  bank: () => '/app/directory',
  microfinance: () => '/app/directory',
  sacco: () => '/app/directory',
  insurance: () => '/app/directory',
  cooperative: () => '/app/cooperatives',
  vsla: () => '/app/cooperatives',
  price: () => '/app/market',
  faq: () => '/app/knowledge',
  guide: () => '/app/knowledge',
  video: () => '/app/knowledge',
  audio: () => '/app/knowledge',
  pdf: () => '/app/knowledge',
};

export function GlobalSearch({ className }: { className?: string }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(() => {
      setLoading(true);
      api
        .get<SearchResults>(`/search?q=${encodeURIComponent(q)}`)
        .then(setResults)
        .catch(() => setResults(null))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sections = results
    ? [
        { label: 'Farmers', items: results.farmers },
        { label: 'Advisories', items: results.advisories },
        { label: 'Marketplace', items: results.products },
        { label: 'Directory', items: results.directory },
        { label: 'Cooperatives', items: results.cooperatives },
        { label: 'Market Prices', items: results.market },
        { label: 'Knowledge Base', items: results.knowledge },
      ].filter((s) => s.items.length > 0)
    : [];

  const go = (item: { type: string }) => {
    const route = ROUTES[item.type]?.(0) || '/app/dashboard';
    setOpen(false);
    setQ('');
    navigate(route);
  };

  return (
    <div ref={ref} className={cn('relative flex-1 max-w-md', className)}>
      <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-faint" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search farmers, advisories, markets..."
        className="w-full rounded-xl border border-line bg-surface-muted py-2 pl-9 pr-9 text-sm text-ink transition focus:border-forest focus:bg-surface focus:outline-none dark:border-line dark:bg-slate-800"
      />
      {q && (
        <button type="button" onClick={() => { setQ(''); setResults(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-faint hover:text-ink">
          <X size={15} />
        </button>
      )}
      {open && q.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-xl border border-line bg-surface shadow-card dark:bg-surface-elevated">
          {loading && <div className="px-4 py-3 text-sm text-content-muted">Searching...</div>}
          {!loading && sections.length === 0 && <div className="px-4 py-3 text-sm text-content-muted">No results for "{q}"</div>}
          {sections.map((sec) => (
            <div key={sec.label}>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-content-muted">{sec.label}</div>
              {sec.items.map((item) => (
                <button
                  key={`${sec.label}-${item.id}`}
                  type="button"
                  onClick={() => go(item)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-surface-muted dark:hover:bg-slate-800"
                >
                  <span className="font-medium text-ink">{item.title}</span>
                  {'county' in item && item.county && <span className="text-xs text-content-muted">{item.county}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
