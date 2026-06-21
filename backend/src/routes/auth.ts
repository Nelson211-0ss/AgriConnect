import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { config } from '../config';
import { asyncHandler, signToken, authenticate, AuthedRequest, Role } from '../utils';

const router = Router();

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  phone: string | null;
  county: string | null;
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const { rows } = await query<UserRow>('SELECT * FROM users WHERE email=$1', [String(email).toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.json({ token: signToken(payload), user: payload });
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
    return res.status(201).json({ token: signToken(payload), user: payload, defaultPassword: config.defaultPassword });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json({ user: req.user });
  })
);

export default router;
