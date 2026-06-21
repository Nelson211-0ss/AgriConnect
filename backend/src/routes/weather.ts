import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';

const router = Router();
router.use(authenticate);

const COUNTY_COORDS: Record<string, { lat: number; lng: number }> = {
  Juba: { lat: 4.85, lng: 31.58 },
  Wau: { lat: 7.7, lng: 27.99 },
  Aweil: { lat: 8.77, lng: 27.4 },
  Bor: { lat: 6.21, lng: 31.56 },
  Rumbek: { lat: 6.8, lng: 29.68 },
};

// Mock current weather + 7 day forecast per county
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const counties = Object.keys(COUNTY_COORDS);
    const seedRand = (n: number) => Math.abs(Math.sin(n) * 10000) % 1;
    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorm'];

    const current = counties.map((c, idx) => ({
      county: c,
      ...COUNTY_COORDS[c],
      temperature: 26 + Math.round(seedRand(idx + 1) * 12),
      humidity: 45 + Math.round(seedRand(idx + 2) * 45),
      rainfall: Math.round(seedRand(idx + 3) * 60),
      windSpeed: 5 + Math.round(seedRand(idx + 4) * 25),
      condition: conditions[Math.floor(seedRand(idx + 5) * conditions.length)],
    }));

    const forecast = days.map((d, i) => ({
      day: d,
      temp: 28 + Math.round(seedRand(i + 10) * 10),
      tempMin: 20 + Math.round(seedRand(i + 11) * 5),
      rainfall: Math.round(seedRand(i + 12) * 80),
      humidity: 40 + Math.round(seedRand(i + 13) * 50),
      condition: conditions[Math.floor(seedRand(i + 14) * conditions.length)],
    }));

    const alerts = await query('SELECT * FROM weather_alerts ORDER BY created_at DESC');
    res.json({ current, forecast, alerts: alerts.rows });
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
    res.status(201).json(rows[0]);
  })
);

export default router;
