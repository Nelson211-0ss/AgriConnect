import { useEffect, useState } from 'react';
import { FileText, Download, Printer, Users, Map, Sprout, LineChart } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardHeader, Table, Th, Td, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { formatDate, cn } from '@/lib/utils';

interface Report {
  title: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

const TYPES = [
  { key: 'farmer', label: 'Farmer Report', icon: Users, desc: 'Detailed farmer registry export' },
  { key: 'county', label: 'County Report', icon: Map, desc: 'Coverage and demographics by county' },
  { key: 'crop', label: 'Crop Report', icon: Sprout, desc: 'Cultivation statistics by crop' },
  { key: 'market', label: 'Market Report', icon: LineChart, desc: 'Latest commodity prices by market' },
];

const fmt = (col: string, v: unknown) => {
  if (v == null) return '-';
  if (col.includes('created_at') || col.includes('date')) return formatDate(v as string);
  if (typeof v === 'string') return v.replace(/_/g, ' ');
  return String(v);
};

export default function Reports() {
  const [type, setType] = useState('farmer');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<Report>(`/reports/${type}`)
      .then(setReport)
      .finally(() => setLoading(false));
  }, [type]);

  const exportCsv = () => {
    if (!report) return;
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      report.columns.join(','),
      ...report.rows.map((r) => report.columns.map((c) => escape(r[c])).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and export program reports"
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={16} /> Export PDF
            </Button>
            <Button onClick={exportCsv}>
              <Download size={16} /> Export Excel
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden">
        {TYPES.map((t) => (
          <button key={t.key} onClick={() => setType(t.key)} className="text-left">
            <Card className={cn('p-5 transition', type === t.key ? 'ring-2 ring-forest' : 'hover:shadow-card')}>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', type === t.key ? 'bg-forest text-white' : 'bg-forest-50 text-forest')}>
                <t.icon size={20} />
              </div>
              <h3 className="mt-3 font-semibold text-ink">{t.label}</h3>
              <p className="mt-0.5 text-xs text-slate-400">{t.desc}</p>
            </Card>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={report?.title || 'Report'} subtitle={report ? `${report.rows.length} records` : ''} action={<FileText size={18} className="text-slate-300" />} />
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : report ? (
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/50">
                  {report.columns.map((c) => (
                    <Th key={c}>{c.replace(/_/g, ' ')}</Th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {report.rows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    {report.columns.map((c) => (
                      <Td key={c} className="capitalize">{fmt(c, r[c])}</Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
