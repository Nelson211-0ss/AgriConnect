import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, CloudSun, Bug, BookOpen, MessageSquare, Smartphone } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, Button, Spinner, severityTone } from '@/components/ui';
import { cn, timeAgo } from '@/lib/utils';

export interface Notification {
  id: number;
  type: 'weather' | 'pest' | 'advisory';
  title: string;
  message: string;
  severity: string;
  county: string | null;
  link: string | null;
  read_at: string | null;
  sms_sent: boolean;
  whatsapp_sent: boolean;
  created_at: string;
}

const TYPE_META = {
  weather: { icon: CloudSun, label: 'Weather' },
  pest: { icon: Bug, label: 'Pest' },
  advisory: { icon: BookOpen, label: 'Advisory' },
};

export function useNotifications(enabled = true) {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const [summary, list] = await Promise.all([
        api.get<{ unread: number }>('/notifications/summary'),
        api.get<Notification[]>('/notifications'),
      ]);
      setUnread(summary.unread);
      setItems(list);
    } catch {
      setUnread(0);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`, {});
    await refresh();
  };

  const markAllRead = async () => {
    await api.post('/notifications/read-all', {});
    await refresh();
  };

  return { unread, items, loading, refresh, markRead, markAllRead };
}

export function NotificationBell({ enabled = true }: { enabled?: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { unread, items, loading, markRead, markAllRead } = useNotifications(enabled);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const openNotification = async (n: Notification) => {
    if (!n.read_at) await markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  if (!enabled) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl p-2 text-content-muted transition hover:bg-surface-muted dark:hover:bg-slate-800"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface shadow-card dark:border-line dark:bg-surface-elevated">
          <div className="flex items-center justify-between border-b border-line-subtle px-4 py-3 dark:border-line">
            <div>
              <p className="font-semibold text-ink">Notifications</p>
              <p className="text-xs text-content-muted">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
            </div>
            {unread > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-content-muted">No notifications yet.</p>
            ) : (
              items.map((n) => {
                const meta = TYPE_META[n.type];
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openNotification(n)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-line-subtle px-4 py-3 text-left transition last:border-0 hover:bg-surface-muted dark:border-line dark:hover:bg-slate-800',
                      !n.read_at && 'bg-forest-50/50 dark:bg-forest/10'
                    )}
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mist text-forest dark:bg-slate-800 dark:text-leaf">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-ink">{n.title}</span>
                        {!n.read_at && <span className="h-2 w-2 rounded-full bg-accent" />}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-content-muted">{n.message}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge tone={severityTone(n.severity)}>{n.severity}</Badge>
                        {n.county && <Badge tone="gray">{n.county}</Badge>}
                        <span className="text-[11px] text-content-faint">{timeAgo(n.created_at)}</span>
                      </div>
                      {(n.sms_sent || n.whatsapp_sent) && (
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-content-faint">
                          {n.sms_sent && (
                            <span className="inline-flex items-center gap-0.5">
                              <MessageSquare size={10} /> SMS sent
                            </span>
                          )}
                          {n.whatsapp_sent && (
                            <span className="inline-flex items-center gap-0.5">
                              <Smartphone size={10} /> WhatsApp sent
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function FarmerAlertsBanner() {
  const navigate = useNavigate();
  const { unread, items, markRead, markAllRead } = useNotifications(true);
  const unreadItems = items.filter((n) => !n.read_at).slice(0, 3);

  if (unread === 0) return null;

  return (
    <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            You have {unread} new alert{unread === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-amber-800/80 dark:text-amber-200/70">
            Posted by extension officers and admins. SMS & WhatsApp sent to your registered number when available.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={markAllRead}>
          Dismiss all
        </Button>
      </div>
      <div className="space-y-2">
        {unreadItems.map((n) => {
          const meta = TYPE_META[n.type];
          const Icon = meta.icon;
          return (
            <button
              key={n.id}
              type="button"
              onClick={async () => {
                await markRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className="flex w-full items-start gap-3 rounded-lg border border-amber-200/80 bg-white/70 p-3 text-left transition hover:bg-white dark:border-amber-500/20 dark:bg-slate-900/50 dark:hover:bg-slate-900"
            >
              <Icon size={18} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{n.title}</p>
                <p className="line-clamp-2 text-xs text-content-muted">{n.message}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-content-faint">
                  <span>{timeAgo(n.created_at)}</span>
                  {n.sms_sent && <span>· SMS delivered</span>}
                  {n.whatsapp_sent && <span>· WhatsApp delivered</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
