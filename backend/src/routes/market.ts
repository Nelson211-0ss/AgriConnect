import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize } from '../utils';

const router = Router();
router.use(authenticate);

// Latest price per commodity + market
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = String(req.query.search || '').trim();
    const params: unknown[] = [];
    let whereSql = '';
    if (search) {
      params.push(`%${search}%`);
      whereSql = `WHERE commodity ILIKE $1 OR market_location ILIKE $1`;
    }
    const rows = await query(
      `SELECT DISTINCT ON (commodity, market_location) id, commodity, price, prev_price, unit, market_location, county, date_updated
       FROM market_prices ${whereSql}
       ORDER BY commodity, market_location, date_updated DESC`,
      params
    );
    res.json(rows.rows);
  })
);

// Trend for price chart: weekly avg per commodity
router.get(
  '/trends',
  asyncHandler(async (_req, res) => {
    const rows = await query(
      `SELECT to_char(date_trunc('week', date_updated),'DD Mon') AS week,
              commodity, round(avg(price))::int AS price
       FROM market_prices
       GROUP BY date_trunc('week', date_updated), commodity
       ORDER BY date_trunc('week', date_updated)`
    );
    // pivot into { week, Maize, Sorghum, ... }
    const map = new Map<string, Record<string, unknown>>();
    for (const r of rows.rows as { week: string; commodity: string; price: number }[]) {
      if (!map.has(r.week)) map.set(r.week, { week: r.week });
      map.get(r.week)![r.commodity] = r.price;
    }
    res.json(Array.from(map.values()));
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.commodity || b.price == null) return res.status(400).json({ message: 'commodity and price are required' });
    const prev = await query<{ price: string }>(
      'SELECT price FROM market_prices WHERE commodity=$1 ORDER BY date_updated DESC LIMIT 1',
      [b.commodity]
    );
    const { rows } = await query(
      'INSERT INTO market_prices(commodity,price,unit,market_location,county,prev_price) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [b.commodity, b.price, b.unit || 'kg', b.market_location || null, b.county || null, prev.rows[0]?.price || null]
    );
    res.status(201).json(rows[0]);
  })
);

export default router;
