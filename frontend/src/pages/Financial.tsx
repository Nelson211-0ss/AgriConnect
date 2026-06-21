import { useEffect, useState } from 'react';
import { Banknote, PiggyBank, ShieldCheck, Percent, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardBody, Badge, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { MobileShell, MobilePageHeader, MobileContent, MobileChipRow, MobileListCard } from '@/components/mobile';
import { SSP } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  type: string;
  provider: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  description: string;
}

const TYPE_META: Record<string, { icon: typeof Banknote; tint: string; color: string }> = {
  Loan: { icon: Banknote, tint: 'bg-forest-50 text-forest', color: '#0B7A3E' },
  Savings: { icon: PiggyBank, tint: 'bg-blue-50 text-blue-600', color: '#3B82F6' },
  Insurance: { icon: ShieldCheck, tint: 'bg-amber-50 text-amber-600', color: '#F59E0B' },
};

const GROUPS = ['Loan', 'Savings', 'Insurance'];
const FILTER_CHIPS = ['', ...GROUPS];

export default function Financial() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api
      .get<Product[]>('/financial')
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const renderMobileCard = (p: Product) => {
    const Meta = TYPE_META[p.type];
    return (
      <MobileListCard
        key={p.id}
        icon={Meta.icon}
        iconBg={Meta.color}
        title={p.name}
        subtitle={
          <>
            <span>{p.provider}</span>
            <p className="mt-1 line-clamp-2">{p.description}</p>
            <p className="mt-1 font-medium text-ink">
              {SSP(p.min_amount)} – {SSP(p.max_amount)}
            </p>
          </>
        }
        right={
          p.interest_rate > 0 ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-forest-50 px-2 py-0.5 text-xs font-semibold text-forest-700 dark:bg-forest-800/30 dark:text-leaf">
              <Percent size={11} /> {p.interest_rate}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-forest dark:text-leaf">
              Apply <ArrowRight size={14} />
            </span>
          )
        }
      />
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <MobileShell>
        <MobilePageHeader title="Financial Services" subtitle="Loans, savings & insurance" />
        <div className="border-b border-line bg-surface px-4 py-3 dark:border-line dark:bg-surface-elevated">
          <MobileChipRow items={FILTER_CHIPS} active={filter} onSelect={setFilter} />
        </div>
        <MobileContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-7 w-7" />
            </div>
          ) : filter ? (
            rows.filter((r) => r.type === filter).map(renderMobileCard)
          ) : (
            GROUPS.map((g) => {
              const items = rows.filter((r) => r.type === g);
              if (!items.length) return null;
              return (
                <div key={g} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-content-muted">{g} Products</p>
                  {items.map(renderMobileCard)}
                </div>
              );
            })
          )}
        </MobileContent>
      </MobileShell>

      <div className="hidden md:block">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            <PageHeader title="Financial Services" subtitle="Loans, savings and insurance products for farmers" />

            {GROUPS.map((g) => {
              const items = rows.filter((r) => r.type === g);
              if (!items.length) return null;
              const Meta = TYPE_META[g];
              return (
                <div key={g}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${Meta.tint}`}>
                      <Meta.icon size={18} />
                    </div>
                    <h2 className="text-lg font-semibold text-ink">{g} Products</h2>
                    <Badge tone="gray">{items.length}</Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <Card key={p.id} className="transition hover:shadow-card">
                        <CardBody className="pt-5">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-ink">{p.name}</h3>
                            {p.interest_rate > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-forest-50 px-2 py-0.5 text-xs font-semibold text-forest-700">
                                <Percent size={11} /> {p.interest_rate}%
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400">{p.provider}</p>
                          <p className="mt-2 text-sm text-slate-600">{p.description}</p>
                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                            <span className="text-slate-500">
                              {SSP(p.min_amount)} – {SSP(p.max_amount)}
                            </span>
                            <span className="inline-flex items-center gap-1 font-medium text-forest">
                              Apply <ArrowRight size={14} />
                            </span>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
