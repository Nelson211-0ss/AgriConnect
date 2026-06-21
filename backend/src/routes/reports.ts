import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate } from '../utils';

const router = Router();
router.use(authenticate);

router.get(
  '/:type',
  asyncHandler(async (req, res) => {
    const type = req.params.type;
    if (type === 'county') {
      const rows = await query(
        `SELECT f.county AS name,
                count(*)::int AS farmers,
                count(*) FILTER (WHERE f.status='active')::int AS active_farmers,
                round(avg(f.farm_size)::numeric,1) AS avg_farm_size,
                count(*) FILTER (WHERE f.gender='Female')::int AS female,
                count(*) FILTER (WHERE f.gender='Male')::int AS male
         FROM farmers f GROUP BY f.county ORDER BY farmers DESC`
      );
      return res.json({ title: 'County Report', columns: ['name', 'farmers', 'active_farmers', 'avg_farm_size', 'female', 'male'], rows: rows.rows });
    }
    if (type === 'crop') {
      const rows = await query(
        `SELECT unnest(crop_types) AS name, count(*)::int AS farmers,
                round(avg(farm_size)::numeric,1) AS avg_farm_size
         FROM farmers GROUP BY name ORDER BY farmers DESC`
      );
      return res.json({ title: 'Crop Report', columns: ['name', 'farmers', 'avg_farm_size'], rows: rows.rows });
    }
    if (type === 'market') {
      const rows = await query(
        `SELECT DISTINCT ON (commodity, market_location) commodity, market_location, county, price, unit, date_updated
         FROM market_prices ORDER BY commodity, market_location, date_updated DESC`
      );
      return res.json({ title: 'Market Report', columns: ['commodity', 'market_location', 'county', 'price', 'unit', 'date_updated'], rows: rows.rows });
    }
    // default: farmer report
    const rows = await query(
      `SELECT full_name, gender, county, payam, age, farm_size, status, created_at
       FROM farmers ORDER BY created_at DESC LIMIT 500`
    );
    return res.json({ title: 'Farmer Report', columns: ['full_name', 'gender', 'county', 'payam', 'age', 'farm_size', 'status', 'created_at'], rows: rows.rows });
  })
);

export default router;
