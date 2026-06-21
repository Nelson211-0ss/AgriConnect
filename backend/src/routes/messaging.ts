import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const channel = String(req.query.channel || '').trim();
    const params: unknown[] = [];
    let whereSql = '';
    if (channel) {
      params.push(channel);
      whereSql = 'WHERE channel=$1';
    }
    const [rows, stats] = await Promise.all([
      query(`SELECT * FROM messages ${whereSql} ORDER BY sent_at DESC LIMIT 100`, params),
      query<{ channel: string; c: string; recipients: string }>(
        'SELECT channel, count(*)::text c, coalesce(sum(recipient_count),0)::text recipients FROM messages GROUP BY channel'
      ),
    ]);
    res.json({ messages: rows.rows, stats: stats.rows });
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.body || !b.channel) return res.status(400).json({ message: 'channel and body are required' });
    // recipient count derived from group (mock send)
    let count = 0;
    if (b.recipients_group === 'All Farmers') {
      const r = await query<{ c: string }>("SELECT count(*)::text c FROM farmers");
      count = parseInt(r.rows[0].c, 10);
    } else if (b.recipients_group && /County/.test(b.recipients_group)) {
      const county = b.recipients_group.replace(' County', '');
      const r = await query<{ c: string }>('SELECT count(*)::text c FROM farmers WHERE county=$1', [county]);
      count = parseInt(r.rows[0].c, 10);
    } else {
      count = b.recipient_count ? parseInt(b.recipient_count, 10) : 100;
    }
    const scheduled = b.scheduled_at ? new Date(b.scheduled_at) : null;
    const status = scheduled && scheduled > new Date() ? 'scheduled' : 'sent';
    const { rows } = await query(
      'INSERT INTO messages(channel,recipients_group,recipient_count,body,status,scheduled_at,sent_at,sender_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [b.channel, b.recipients_group || 'Custom', count, b.body, status, scheduled, status === 'sent' ? new Date() : null, req.user?.id || null]
    );
    res.status(201).json(rows[0]);
  })
);

export default router;
