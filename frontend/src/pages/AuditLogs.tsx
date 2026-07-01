import { useEffect, useState } from 'react';
import { Shield, LogIn } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, Table, Th, Td, Badge, Spinner, Button } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { formatDate } from '@/lib/utils';

interface AuditEntry {
  id: number;
  type: string;
  description: string;
  user_name: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: number;
  ip_address: string;
  created_at: string;
}

interface LoginEntry {
  id: number;
  email: string;
  success: boolean;
  ip_address: string;
  created_at: string;
}

export default function AuditLogs() {
  const [tab, setTab] = useState<'activity' | 'logins'>('activity');
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [logins, setLogins] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    if (tab === 'activity') {
      api.get<{ data: AuditEntry[] }>(`/audit?page=${page}`).then((r) => setActivity(r.data)).finally(() => setLoading(false));
    } else {
      api.get<{ data: LoginEntry[] }>(`/audit/logins?page=${page}`).then((r) => setLogins(r.data)).finally(() => setLoading(false));
    }
  }, [tab, page]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Audit Logs" subtitle="Track logins, updates, deletes and system activity" />

      <div className="mb-4 flex gap-2">
        <Button variant={tab === 'activity' ? 'primary' : 'outline'} onClick={() => { setTab('activity'); setPage(1); }}>
          <Shield size={16} /> Activity Log
        </Button>
        <Button variant={tab === 'logins' ? 'primary' : 'outline'} onClick={() => { setTab('logins'); setPage(1); }}>
          <LogIn size={16} /> Login Attempts
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Spinner className="h-7 w-7" /></div>
        ) : tab === 'activity' ? (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Time</Th><Th>Type</Th><Th>Action</Th><Th>Description</Th><Th>User</Th><Th>IP</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activity.map((a) => (
                <tr key={a.id}>
                  <Td className="text-slate-500">{formatDate(a.created_at)}</Td>
                  <Td><Badge>{a.type}</Badge></Td>
                  <Td>{a.action || '—'}</Td>
                  <Td className="max-w-xs truncate">{a.description}</Td>
                  <Td>{a.user_name || '—'}</Td>
                  <Td className="text-xs text-slate-400">{a.ip_address || '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <Th>Time</Th><Th>Email</Th><Th>Status</Th><Th>IP</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logins.map((l) => (
                <tr key={l.id}>
                  <Td className="text-slate-500">{formatDate(l.created_at)}</Td>
                  <Td>{l.email}</Td>
                  <Td><Badge tone={l.success ? 'green' : 'gray'}>{l.success ? 'Success' : 'Failed'}</Badge></Td>
                  <Td className="text-xs text-slate-400">{l.ip_address || '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
