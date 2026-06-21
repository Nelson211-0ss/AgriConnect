import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';

const router = Router();
router.use(authenticate);

// Farmers see only their listings; buyers and other roles see all farmer produce
router.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const commodity = String(req.query.commodity || '').trim();
    const county = String(req.query.county || '').trim();
    const params: unknown[] = [];
    const where: string[] = [];
    if (req.user?.role === 'farmer') {
      params.push(req.user.id);
      where.push(`farmer_id=$${params.length}`);
    }
    if (commodity) {
      params.push(commodity);
      where.push(`commodity=$${params.length}`);
    }
    if (county) {
      params.push(county);
      where.push(`county=$${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await query(
      `SELECT p.*, (SELECT count(*)::int FROM produce_interests pi WHERE pi.listing_id=p.id) AS interests
       FROM produce_listings p ${whereSql} ORDER BY created_at DESC`,
      params
    );
    res.json(rows.rows);
  })
);

// Farmer posts produce with an optional photo (image_url may be a data URL or path)
router.post(
  '/',
  authorize('super_admin', 'farmer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.commodity) return res.status(400).json({ message: 'commodity is required' });
    const { rows } = await query(
      `INSERT INTO produce_listings(farmer_id,farmer_name,commodity,quantity,unit,price,county,location,contact_info,image_url,description,status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        req.user?.id || null,
        b.farmer_name || req.user?.name || 'Farmer',
        b.commodity,
        b.quantity ? parseFloat(b.quantity) : null,
        b.unit || 'kg',
        b.price ? parseFloat(b.price) : null,
        b.county || null,
        b.location || null,
        b.contact_info || null,
        b.image_url || null,
        b.description || null,
        b.status || 'available',
      ]
    );
    res.status(201).json(rows[0]);
  })
);

// Buyer expresses interest in a farmer's produce
router.post(
  '/:id/interest',
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    const { rows } = await query(
      'INSERT INTO produce_interests(listing_id,buyer_id,buyer_name,message) VALUES($1,$2,$3,$4) RETURNING *',
      [req.params.id, req.user?.id || null, b.buyer_name || req.user?.name || 'Buyer', b.message || 'I am interested in buying this produce.']
    );
    res.status(201).json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'farmer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    // farmers may only delete their own listings; super_admin can delete any
    const owned =
      req.user?.role === 'super_admin'
        ? await query('SELECT id FROM produce_listings WHERE id=$1', [req.params.id])
        : await query('SELECT id FROM produce_listings WHERE id=$1 AND farmer_id=$2', [req.params.id, req.user?.id]);
    if (!owned.rowCount) return res.status(404).json({ message: 'Listing not found' });
    await query('DELETE FROM produce_listings WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  })
);

export default router;
