import { useEffect, useState } from 'react';
import { Banknote, PiggyBank, ShieldCheck, Percent, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardBody, Badge, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/common';
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

const TYPE_META: Record<string, { icon: typeof Banknote; tint: string }> = {
  Loan: { icon: Banknote, tint: 'bg-forest-50 text-forest' },
  Savings: { icon: PiggyBank, tint: 'bg-blue-50 text-blue-600' },
  Insurance: { icon: ShieldCheck, tint: 'bg-amber-50 text-amber-600' },
};

export default function Financial() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Product[]>('/financial')
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const groups = ['Loan', 'Savings', 'Insurance'];

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Financial Services" subtitle="Loans, savings and insurance products for farmers" />

      {groups.map((g) => {
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
    </div>
  );
}
