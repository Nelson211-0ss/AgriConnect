import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize } from '../utils';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const type = String(req.query.type || '').trim();
    const params: unknown[] = [];
    let whereSql = '';
    if (type) {
      params.push(type);
      whereSql = 'WHERE type=$1';
    }
    const rows = await query(`SELECT * FROM financial_products ${whereSql} ORDER BY type, name`, params);
    res.json(rows.rows);
  })
);

router.post(
  '/',
  authorize('super_admin'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.name || !b.type) return res.status(400).json({ message: 'name and type are required' });
    const { rows } = await query(
      'INSERT INTO financial_products(name,type,provider,interest_rate,min_amount,max_amount,description) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [b.name, b.type, b.provider || null, b.interest_rate || null, b.min_amount || null, b.max_amount || null, b.description || null]
    );
    res.status(201).json(rows[0]);
  })
);

export default router;
