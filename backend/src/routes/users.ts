import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { config } from '../config';
import { asyncHandler, authenticate, authorize, Role } from '../utils';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const role = String(req.query.role || '').trim();
    const search = String(req.query.search || '').trim();
    const params: unknown[] = [];
    const where: string[] = [];
    if (role) {
      params.push(role);
      where.push(`role=$${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await query(
      `SELECT u.id,u.name,u.email,u.role,u.phone,u.county,u.status,u.avatar_url,u.created_at,
              (SELECT count(*)::int FROM farmers f WHERE f.registered_by=u.id) AS farmers_registered
       FROM users u ${whereSql} ORDER BY u.created_at DESC`,
      params
    );
    res.json(rows.rows);
  })
);

router.post(
  '/',
  authorize('super_admin'),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, county } = req.body || {};
    if (!name || !email || !role) return res.status(400).json({ message: 'name, email and role are required' });
    const allowed: Role[] = ['farmer', 'buyer', 'extension_officer'];
    if (!allowed.includes(role as Role)) {
      return res.status(400).json({ message: 'role must be farmer, buyer, or extension_officer' });
    }
    const existing = await query('SELECT id FROM users WHERE email=$1', [String(email).toLowerCase()]);
    if (existing.rowCount > 0) return res.status(409).json({ message: 'Email already registered' });
    const finalPassword = password || config.defaultPassword;
    const hash = await bcrypt.hash(finalPassword, 10);
    const { rows } = await query(
      'INSERT INTO users(name,email,password_hash,role,phone,county) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,email,role,phone,county,status,created_at',
      [name, String(email).toLowerCase(), hash, role, phone || null, county || null]
    );
    res.status(201).json({ ...rows[0], defaultPassword: config.defaultPassword });
  })
);

router.put(
  '/:id',
  authorize('super_admin'),
  asyncHandler(async (req, res) => {
    const { name, role, phone, county, status } = req.body || {};
    const { rows } = await query(
      `UPDATE users SET name=COALESCE($1,name), role=COALESCE($2,role), phone=$3, county=$4, status=COALESCE($5,status)
       WHERE id=$6 RETURNING id,name,email,role,phone,county,status,created_at`,
      [name || null, role || null, phone || null, county || null, status || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin'),
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM users WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true });
  })
);

export default router;
