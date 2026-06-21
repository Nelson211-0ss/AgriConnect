import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';

const router = Router();
router.use(authenticate);

// Buyers see only their demands; farmers and other roles see all buyer demands
router.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const commodity = String(req.query.commodity || '').trim();
    const params: unknown[] = [];
    const where: string[] = [];
    if (req.user?.role === 'buyer') {
      params.push(req.user.id);
      where.push(`buyer_id=$${params.length}`);
    }
    if (commodity) {
      params.push(commodity);
      where.push(`commodity=$${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await query(
      `SELECT m.*, (SELECT count(*)::int FROM listing_interests li WHERE li.listing_id=m.id) AS interests
       FROM marketplace_listings m ${whereSql} ORDER BY created_at DESC`,
      params
    );
    res.json(rows.rows);
  })
);

router.post(
  '/',
  authorize('super_admin', 'buyer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.commodity) return res.status(400).json({ message: 'commodity is required' });
    const { rows } = await query(
      `INSERT INTO marketplace_listings(buyer_id,buyer_name,commodity,quantity,unit,price,delivery_location,contact_info,status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        req.user?.id || null, b.buyer_name || req.user?.name || 'Buyer', b.commodity,
        b.quantity ? parseFloat(b.quantity) : null, b.unit || 'kg', b.price ? parseFloat(b.price) : null,
        b.delivery_location || null, b.contact_info || null, b.status || 'open',
      ]
    );
    res.status(201).json(rows[0]);
  })
);

router.post(
  '/:id/interest',
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    const { rows } = await query(
      'INSERT INTO listing_interests(listing_id,farmer_id,message) VALUES($1,$2,$3) RETURNING *',
      [req.params.id, b.farmer_id || null, b.message || 'I am interested in this opportunity.']
    );
    res.status(201).json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'buyer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const owned =
      req.user?.role === 'super_admin'
        ? await query('SELECT id FROM marketplace_listings WHERE id=$1', [req.params.id])
        : await query('SELECT id FROM marketplace_listings WHERE id=$1 AND buyer_id=$2', [req.params.id, req.user?.id]);
    if (!owned.rowCount) return res.status(404).json({ message: 'Listing not found' });
    await query('DELETE FROM marketplace_listings WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  })
);

export default router;
