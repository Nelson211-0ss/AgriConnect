import { useEffect, useState } from 'react';
import { Send, MessageSquare, Smartphone, Users, Clock, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardHeader, CardBody, Select, Textarea, Badge, Spinner, Input } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { formatNumber, timeAgo, cn } from '@/lib/utils';

interface Message {
  id: number;
  channel: string;
  recipients_group: string;
  recipient_count: number;
  body: string;
  status: string;
  sent_at: string;
  scheduled_at: string | null;
}

const GROUPS = ['All Farmers', 'Juba County', 'Wau County', 'Aweil County', 'Bor County', 'Rumbek County', 'Maize Growers', 'Cooperative Leaders'];

export default function Messaging() {
  const [tab, setTab] = useState<'sms' | 'whatsapp'>('sms');
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<{ channel: string; c: string; recipients: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [group, setGroup] = useState(GROUPS[0]);
  const [schedule, setSchedule] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<{ messages: Message[]; stats: typeof stats }>('/messaging')
      .then((res) => {
        setMessages(res.messages);
        setStats(res.stats);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await api.post('/messaging', { channel: tab, body, recipients_group: group, scheduled_at: schedule || null });
      setBody('');
      setSchedule('');
      load();
    } finally {
      setSending(false);
    }
  };

  const stat = (ch: string) => stats.find((s) => s.channel === ch);
  const filtered = messages.filter((m) => m.channel === tab);

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader title="Messaging Center" subtitle="Reach farmers via SMS and WhatsApp at scale" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['SMS Sent', stat('sms')?.c || '0', MessageSquare, 'forest'],
          ['SMS Recipients', stat('sms')?.recipients || '0', Users, 'leaf'],
          ['WhatsApp Sent', stat('whatsapp')?.c || '0', Smartphone, 'blue'],
          ['WhatsApp Reach', stat('whatsapp')?.recipients || '0', Users, 'purple'],
        ].map(([label, val, Icon, tint]) => {
          const I = Icon as typeof MessageSquare;
          const tints: Record<string, string> = { forest: 'bg-forest-50 text-forest', leaf: 'bg-green-50 text-green-600', blue: 'bg-blue-50 text-blue-600', purple: 'bg-purple-50 text-purple-600' };
          return (
            <Card key={label as string} className="p-5">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tints[tint as string])}>
                <I size={20} />
              </div>
              <div className="mt-3 text-2xl font-bold text-ink">{formatNumber(val as string)}</div>
              <div className="text-sm text-slate-500">{label as string}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Composer */}
        <Card className="lg:col-span-2">
          <CardHeader title="Compose Message" />
          <CardBody className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTab('sms')}
                className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium', tab === 'sms' ? 'border-forest bg-forest text-white' : 'border-slate-200 text-slate-600')}
              >
                <MessageSquare size={16} /> SMS
              </button>
              <button
                onClick={() => setTab('whatsapp')}
                className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium', tab === 'whatsapp' ? 'border-forest bg-forest text-white' : 'border-slate-200 text-slate-600')}
              >
                <Smartphone size={16} /> WhatsApp
              </button>
            </div>
            <Select label="Send to Group" value={group} onChange={(e) => setGroup(e.target.value)}>
              {GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
            <Textarea label="Message" rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your message to farmers..." />
            <div className="text-right text-xs text-slate-400">{body.length} characters {tab === 'sms' && `· ${Math.ceil(body.length / 160) || 1} SMS`}</div>
            <Input label="Schedule (optional)" type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
            <Button className="w-full" onClick={send} disabled={sending || !body.trim()}>
              {sending ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : (
                <>
                  <Send size={16} /> {schedule ? 'Schedule Broadcast' : 'Send Broadcast'}
                </>
              )}
            </Button>
          </CardBody>
        </Card>

        {/* History */}
        <Card className="lg:col-span-3">
          <CardHeader title="Message History" subtitle={`${tab.toUpperCase()} broadcasts`} />
          <CardBody>
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Spinner className="h-7 w-7" />
              </div>
            ) : (
              <div className="max-h-[460px] space-y-3 overflow-y-auto">
                {filtered.map((m) => (
                  <div key={m.id} className="rounded-xl border border-slate-100 bg-mist p-4">
                    <div className="mb-1.5 flex items-center justify-between">
                      <Badge tone="green">{m.recipients_group}</Badge>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        {m.status === 'scheduled' ? <Clock size={12} /> : <CheckCheck size={12} className="text-forest" />}
                        {m.status === 'scheduled' ? 'Scheduled' : timeAgo(m.sent_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{m.body}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatNumber(m.recipient_count)} recipients</p>
                  </div>
                ))}
                {filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No messages yet.</p>}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
