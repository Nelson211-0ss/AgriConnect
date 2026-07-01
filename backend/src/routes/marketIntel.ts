import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize } from '../utils';

const router = Router();
router.use(authenticate);

router.get(
  '/demand',
  asyncHandler(async (req, res) => {
    const commodity = String(req.query.commodity || '').trim();
    const params: unknown[] = [];
    let where = '';
    if (commodity) {
      params.push(commodity);
      where = `WHERE commodity=$1`;
    }
    const rows = await query(`SELECT * FROM market_demand ${where} ORDER BY created_at DESC`, params);
    res.json(rows.rows);
  })
);

router.post(
  '/demand',
  authorize('super_admin', 'extension_officer', 'buyer'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.commodity) return res.status(400).json({ message: 'commodity required' });
    const { rows } = await query(
      `INSERT INTO market_demand(commodity,buyer_name,quantity,unit,county,quality,deadline,status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [b.commodity, b.buyer_name || null, b.quantity || null, b.unit || 'kg', b.county || null, b.quality || null, b.deadline || null, b.status || 'open']
    );
    res.status(201).json(rows[0]);
  })
);

router.get(
  '/aggregation',
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM aggregation_schedules WHERE scheduled_at >= now() - interval \'7 days\' ORDER BY scheduled_at ASC');
    res.json(rows.rows);
  })
);

router.post(
  '/aggregation',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.title || !b.scheduled_at) return res.status(400).json({ message: 'title and scheduled_at required' });
    const { rows } = await query(
      `INSERT INTO aggregation_schedules(title,location,county,commodity,scheduled_at,contact) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [b.title, b.location || null, b.county || null, b.commodity || null, b.scheduled_at, b.contact || null]
    );
    res.status(201).json(rows[0]);
  })
);

router.get(
  '/quality',
  asyncHandler(async (req, res) => {
    const commodity = String(req.query.commodity || '').trim();
    const params: unknown[] = [];
    let where = '';
    if (commodity) {
      params.push(commodity);
      where = `WHERE commodity=$1`;
    }
    const rows = await query(`SELECT * FROM quality_standards ${where} ORDER BY commodity ASC`, params);
    res.json(rows.rows);
  })
);

router.post(
  '/quality',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.commodity || !b.requirements) return res.status(400).json({ message: 'commodity and requirements required' });
    const { rows } = await query(
      `INSERT INTO quality_standards(commodity,grade,requirements) VALUES($1,$2,$3) RETURNING *`,
      [b.commodity, b.grade || null, b.requirements]
    );
    res.status(201).json(rows[0]);
  })
);

router.get(
  '/opportunities',
  asyncHandler(async (_req, res) => {
    const [demand, aggregation, prices] = await Promise.all([
      query(`SELECT * FROM market_demand WHERE status='open' ORDER BY created_at DESC LIMIT 10`),
      query(`SELECT * FROM aggregation_schedules WHERE scheduled_at >= now() ORDER BY scheduled_at ASC LIMIT 10`),
      query(`SELECT DISTINCT ON (commodity) commodity, price, unit, county, market_location, date_updated
             FROM market_prices ORDER BY commodity, date_updated DESC`),
    ]);
    res.json({ demand: demand.rows, aggregation: aggregation.rows, latest_prices: prices.rows });
  })
);

export default router;
