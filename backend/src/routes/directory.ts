import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';

const router = Router();
router.use(authenticate);

const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : typeof v === 'string' && v.trim() ? v.split(',').map((s) => s.trim()) : [];

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const entryType = String(req.query.type || '').trim();
    const search = String(req.query.search || '').trim();
    const county = String(req.query.county || '').trim();
    const params: unknown[] = [];
    const where: string[] = ['deleted_at IS NULL', "status='active'"];
    if (entryType) {
      params.push(entryType);
      where.push(`entry_type=$${params.length}`);
    }
    if (county) {
      params.push(county);
      where.push(`county=$${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(company_name ILIKE $${params.length} OR contact_person ILIKE $${params.length} OR location ILIKE $${params.length})`);
    }
    const rows = await query(
      `SELECT * FROM directory_entries WHERE ${where.join(' AND ')} ORDER BY rating DESC, company_name ASC`,
      params
    );
    res.json(rows.rows);
  })
);

router.get(
  '/map',
  asyncHandler(async (_req, res) => {
    const rows = await query(
      `SELECT id, company_name AS name, entry_type AS type, county, gps_lat AS lat, gps_lng AS lng, rating
       FROM directory_entries WHERE deleted_at IS NULL AND gps_lat IS NOT NULL`
    );
    res.json(rows.rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query('SELECT * FROM directory_entries WHERE id=$1 AND deleted_at IS NULL', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    const reviews = await query(
      `SELECT r.*, u.name AS reviewer_name FROM directory_reviews r
       LEFT JOIN users u ON u.id=r.user_id WHERE r.entry_id=$1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json({ ...rows[0], reviews: reviews.rows });
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer', 'buyer', 'agro_dealer', 'transporter', 'financial_institution'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.company_name || !b.entry_type) return res.status(400).json({ message: 'company_name and entry_type required' });
    const { rows } = await query(
      `INSERT INTO directory_entries(entry_type,company_name,contact_person,email,phone,county,location,gps_lat,gps_lng,products,services,description,verified,status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        b.entry_type, b.company_name, b.contact_person || null, b.email || null, b.phone || null,
        b.county || null, b.location || null,
        b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null,
        toArray(b.products), toArray(b.services), b.description || null,
        b.verified === true, b.status || 'active',
      ]
    );
    res.status(201).json(rows[0]);
  })
);

router.put(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE directory_entries SET
        company_name=COALESCE($1,company_name), contact_person=$2, email=$3, phone=$4,
        county=$5, location=$6, gps_lat=$7, gps_lng=$8, products=$9, services=$10,
        description=$11, verified=$12, status=COALESCE($13,status)
       WHERE id=$14 AND deleted_at IS NULL RETURNING *`,
      [
        b.company_name || null, b.contact_person || null, b.email || null, b.phone || null,
        b.county || null, b.location || null,
        b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null,
        toArray(b.products), toArray(b.services), b.description || null,
        b.verified === true, b.status || null, req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('UPDATE directory_entries SET deleted_at=now() WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  })
);

router.post(
  '/:id/reviews',
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    const rating = parseInt(String(b.rating), 10);
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'rating 1-5 required' });
    const { rows } = await query(
      `INSERT INTO directory_reviews(entry_id,user_id,rating,comment) VALUES($1,$2,$3,$4) RETURNING *`,
      [req.params.id, req.user?.id || null, rating, b.comment || null]
    );
    await query(
      `UPDATE directory_entries SET
        rating=(SELECT COALESCE(AVG(rating),0) FROM directory_reviews WHERE entry_id=$1),
        review_count=(SELECT count(*) FROM directory_reviews WHERE entry_id=$1)
       WHERE id=$1`,
      [req.params.id]
    );
    res.status(201).json(rows[0]);
  })
);

export default router;
