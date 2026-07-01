import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { config } from '../config';
import { asyncHandler, signToken, authenticate, AuthedRequest, Role } from '../utils';
import { logActivity } from '../services/auditService';

const router = Router();

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  phone: string | null;
  county: string | null;
  avatar_url: string | null;
}

function publicUser(row: Pick<UserRow, 'id' | 'name' | 'email' | 'role' | 'phone' | 'county' | 'avatar_url'>) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone,
    county: row.county,
    avatar_url: row.avatar_url,
  };
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const { rows } = await query<UserRow>('SELECT * FROM users WHERE email=$1', [String(email).toLowerCase()]);
    const user = rows[0];
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '');
    if (!user) {
      await query('INSERT INTO login_attempts(email,success,ip_address) VALUES($1,false,$2)', [String(email).toLowerCase(), ip]);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      await query('INSERT INTO login_attempts(email,success,ip_address) VALUES($1,false,$2)', [String(email).toLowerCase(), ip]);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    await query('INSERT INTO login_attempts(email,success,ip_address) VALUES($1,true,$2)', [String(email).toLowerCase(), ip]);
    await logActivity({ type: 'auth', description: `User login: ${user.email}`, userId: user.id, action: 'login', entityType: 'user', entityId: user.id, ipAddress: ip });
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.json({ token: signToken(payload), user: publicUser(user) });
  })
);

router.get(
  '/config',
  asyncHandler(async (_req, res) => {
    res.json({ defaultPassword: config.defaultPassword });
  })
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, role, phone, county } = req.body || {};
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const allowed: Role[] = ['farmer', 'buyer'];
    const finalRole: Role = allowed.includes(role) ? role : 'farmer';
    const existing = await query('SELECT id FROM users WHERE email=$1', [String(email).toLowerCase()]);
    if (existing.rowCount > 0) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(config.defaultPassword, 10);
    const { rows } = await query<UserRow>(
      'INSERT INTO users(name,email,password_hash,role,phone,county) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,email,role',
      [name, String(email).toLowerCase(), hash, finalRole, phone || null, county || null]
    );
    const user = rows[0];
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.status(201).json({ token: signToken(payload), user: publicUser({ ...user, avatar_url: null }), defaultPassword: config.defaultPassword });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { rows } = await query<UserRow>(
      'SELECT id, name, email, role, phone, county, avatar_url FROM users WHERE id=$1',
      [req.user!.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ user: publicUser(rows[0]) });
  })
);

router.patch(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { name, avatar_url } = req.body || {};
    if (avatar_url && typeof avatar_url === 'string' && avatar_url.length > 500_000) {
      return res.status(400).json({ message: 'Profile photo is too large' });
    }
    const sets: string[] = [];
    const params: unknown[] = [];
    if (name !== undefined) {
      params.push(String(name).trim());
      sets.push(`name=$${params.length}`);
    }
    if (avatar_url !== undefined) {
      params.push(avatar_url || null);
      sets.push(`avatar_url=$${params.length}`);
    }
    if (!sets.length) return res.status(400).json({ message: 'No fields to update' });
    params.push(req.user!.id);
    const { rows } = await query<UserRow>(
      `UPDATE users SET ${sets.join(', ')} WHERE id=$${params.length}
       RETURNING id, name, email, role, phone, county, avatar_url`,
      params
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ user: publicUser(rows[0]) });
  })
);

export default router;
