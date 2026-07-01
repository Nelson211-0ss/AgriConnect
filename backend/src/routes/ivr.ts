import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize } from '../utils';

const router = Router();

/** IVR callback — log call and return voice menu XML/text stub */
router.post(
  '/incoming',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const phone = b.From || b.phone || b.caller || '';
    const { rows } = await query(
      `INSERT INTO ivr_calls(phone, language, menu_path, status) VALUES($1,$2,$3,'ringing') RETURNING *`,
      [phone, b.language || 'en', b.menu || 'main']
    );
    res.json({
      call_id: rows[0].id,
      menu: {
        en: ['Press 1 for weather advisory', 'Press 2 for market prices', 'Press 3 for extension tips'],
        ar: ['Press 1 for weather', 'Press 2 for prices'],
      },
      voice_url: '/api/ivr/voice/advisory.mp3',
    });
  })
);

router.post(
  '/menu',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const digit = String(b.digit || b.Digits || '');
    const phone = b.From || b.phone || '';
    let message = 'Welcome to AgriConnect voice advisory.';
    if (digit === '1') {
      const w = await query(`SELECT message FROM weather_alerts ORDER BY created_at DESC LIMIT 1`);
      message = w.rows[0]?.message || 'No weather alerts at this time.';
    } else if (digit === '2') {
      const p = await query(`SELECT commodity, price, unit FROM market_prices ORDER BY date_updated DESC LIMIT 1`);
      message = p.rows[0] ? `${p.rows[0].commodity} price is ${p.rows[0].price} per ${p.rows[0].unit}.` : 'No market data.';
    } else if (digit === '3') {
      const a = await query(`SELECT title FROM advisories WHERE status='published' ORDER BY created_at DESC LIMIT 1`);
      message = a.rows[0]?.title || 'Check the AgriConnect app for extension tips.';
    }
    await query(
      `INSERT INTO ivr_calls(phone, language, menu_path, duration_sec, status) VALUES($1,$2,$3,$4,'completed')`,
      [phone, b.language || 'en', `menu:${digit}`, b.duration || 60]
    );
    res.json({ message, text_to_speech: message });
  })
);

router.use(authenticate);

router.get(
  '/calls',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM ivr_calls ORDER BY created_at DESC LIMIT 100');
    res.json(rows.rows);
  })
);

export default router;
