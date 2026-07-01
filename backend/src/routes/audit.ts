import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize } from '../utils';

const router = Router();
router.use(authenticate);
router.use(authorize('super_admin', 'extension_officer'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const type = String(req.query.type || '').trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '30'), 10)));
    const offset = (page - 1) * limit;
    const params: unknown[] = [];
    const where: string[] = [];
    if (type) {
      params.push(type);
      where.push(`type=$${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = await query<{ c: string }>(`SELECT count(*)::text c FROM activity_log ${whereSql}`, params);
    params.push(limit, offset);
    const rows = await query(
      `SELECT a.*, u.name AS user_name, u.email AS user_email
       FROM activity_log a LEFT JOIN users u ON u.id=a.user_id
       ${whereSql} ORDER BY a.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ data: rows.rows, total: parseInt(total.rows[0].c, 10), page, limit });
  })
);

router.get(
  '/logins',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '30'), 10)));
    const offset = (page - 1) * limit;
    const total = await query<{ c: string }>('SELECT count(*)::text c FROM login_attempts');
    const rows = await query(
      'SELECT * FROM login_attempts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: rows.rows, total: parseInt(total.rows[0].c, 10), page, limit });
  })
);

export default router;
