import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';
import { getLiveWeather } from '../services/weatherService';
import { notifyFarmers } from '../services/notifyService';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [live, alerts] = await Promise.all([
      getLiveWeather(),
      query('SELECT * FROM weather_alerts ORDER BY created_at DESC'),
    ]);

    res.json({
      current: live.current,
      forecast: live.current[0]?.forecast ?? [],
      alerts: alerts.rows,
      fetchedAt: live.fetchedAt,
      source: live.source,
    });
  })
);

router.post(
  '/alerts',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.type || !b.message) return res.status(400).json({ message: 'type and message are required' });
    const { rows } = await query(
      'INSERT INTO weather_alerts(type,county,severity,message,valid_from,valid_to) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [b.type, b.county || null, b.severity || 'moderate', b.message, b.valid_from || new Date(), b.valid_to || null]
    );
    const alert = rows[0];
    await notifyFarmers({
      type: 'weather',
      title: `${b.type} — ${b.county || 'All counties'}`,
      message: b.message,
      severity: b.severity || 'moderate',
      county: b.county || null,
      sourceId: alert.id,
      senderId: req.user?.id,
    });
    res.status(201).json(alert);
  })
);

export default router;
