import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';

const router = Router();

/** WhatsApp webhook — receive inbound messages (Twilio / Meta format) */
router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const phone = body.From || body.from || body.phone || '';
    const text = body.Body || body.text || body.message || '';
    if (phone && text) {
      await query(
        `INSERT INTO whatsapp_messages(direction, phone, body, status) VALUES('inbound',$1,$2,'received')`,
        [String(phone).replace('whatsapp:', ''), String(text)]
      );
      // Automated reply stub
      await query(
        `INSERT INTO whatsapp_messages(direction, phone, body, status) VALUES('outbound',$1,$2,'queued')`,
        [String(phone).replace('whatsapp:', ''), 'Thank you for contacting AgriConnect. An extension officer will respond shortly. Reply MARKET for prices or WEATHER for alerts.']
      );
    }
    res.json({ success: true });
  })
);

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM whatsapp_messages ORDER BY created_at DESC LIMIT 100');
    res.json(rows.rows);
  })
);

router.post(
  '/broadcast',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.body) return res.status(400).json({ message: 'body required' });
    const phones: string[] = Array.isArray(b.phones) ? b.phones : [];
    const inserted = [];
    for (const phone of phones.length ? phones : ['+211900000000']) {
      const { rows } = await query(
        `INSERT INTO whatsapp_messages(direction, phone, body, status) VALUES('outbound',$1,$2,'sent') RETURNING *`,
        [phone, b.body]
      );
      inserted.push(rows[0]);
    }
    res.status(201).json({ sent: inserted.length, messages: inserted });
  })
);

export default router;
