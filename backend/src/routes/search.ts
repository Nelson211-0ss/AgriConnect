import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate } from '../utils';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) return res.json({ farmers: [], advisories: [], products: [], directory: [], cooperatives: [], market: [], knowledge: [] });

    const pattern = `%${q}%`;
    const limit = 8;

    const [farmers, advisories, produce, marketplace, directory, cooperatives, market, knowledge] = await Promise.all([
      query(
        `SELECT id, full_name AS title, county, 'farmer' AS type FROM farmers
         WHERE deleted_at IS NULL AND (full_name ILIKE $1 OR phone ILIKE $1 OR county ILIKE $1) LIMIT $2`,
        [pattern, limit]
      ),
      query(
        `SELECT id, title, category, 'advisory' AS type FROM advisories
         WHERE title ILIKE $1 OR content ILIKE $1 LIMIT $2`,
        [pattern, limit]
      ),
      query(
        `SELECT id, commodity AS title, county, 'produce' AS type FROM produce_listings
         WHERE commodity ILIKE $1 OR description ILIKE $1 LIMIT $2`,
        [pattern, limit]
      ),
      query(
        `SELECT id, commodity AS title, delivery_location AS county, 'marketplace' AS type FROM marketplace_listings
         WHERE commodity ILIKE $1 OR buyer_name ILIKE $1 LIMIT $2`,
        [pattern, limit]
      ),
      query(
        `SELECT id, company_name AS title, county, entry_type AS type FROM directory_entries
         WHERE deleted_at IS NULL AND (company_name ILIKE $1 OR products::text ILIKE $1) LIMIT $2`,
        [pattern, limit]
      ),
      query(
        `SELECT id, name AS title, county, org_type AS type FROM cooperatives
         WHERE deleted_at IS NULL AND name ILIKE $1 LIMIT $2`,
        [pattern, limit]
      ),
      query(
        `SELECT id, commodity AS title, county, 'price' AS type FROM market_prices
         WHERE commodity ILIKE $1 OR market_location ILIKE $1 ORDER BY date_updated DESC LIMIT $2`,
        [pattern, limit]
      ),
      query(
        `SELECT id, title, category, type FROM kb_items
         WHERE deleted_at IS NULL AND (title ILIKE $1 OR content ILIKE $1) LIMIT $2`,
        [pattern, limit]
      ),
    ]);

    res.json({
      farmers: farmers.rows,
      advisories: advisories.rows,
      products: [...produce.rows, ...marketplace.rows],
      directory: directory.rows,
      cooperatives: cooperatives.rows,
      market: market.rows,
      knowledge: knowledge.rows,
      query: q,
    });
  })
);

export default router;
