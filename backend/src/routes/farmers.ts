import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';

const router = Router();
router.use(authenticate);

const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : typeof v === 'string' && v.trim() ? v.split(',').map((s) => s.trim()) : [];

// List with search + pagination + filters
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const county = String(req.query.county || '').trim();

    const where: string[] = [];
    const params: unknown[] = [];
    if (search) {
      params.push(`%${search}%`);
      where.push(`(full_name ILIKE $${params.length} OR phone ILIKE $${params.length} OR payam ILIKE $${params.length})`);
    }
    if (county) {
      params.push(county);
      where.push(`county = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = await query<{ c: string }>(`SELECT count(*)::text c FROM farmers ${whereSql}`, params);
    params.push(limit, offset);
    const rows = await query(
      `SELECT * FROM farmers ${whereSql} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ data: rows.rows, total: parseInt(total.rows[0].c, 10), page, limit });
  })
);

// Map points
router.get(
  '/map',
  asyncHandler(async (_req, res) => {
    const rows = await query(
      `SELECT id, full_name, county, gps_lat AS lat, gps_lng AS lng, crop_types
       FROM farmers WHERE gps_lat IS NOT NULL LIMIT 1000`
    );
    res.json(rows.rows);
  })
);

// CSV export
router.get(
  '/export',
  asyncHandler(async (_req, res) => {
    const rows = await query<Record<string, unknown>>(
      `SELECT full_name,gender,phone,county,payam,boma,age,farm_size,
              array_to_string(crop_types,'|') AS crops,
              array_to_string(livestock_types,'|') AS livestock,
              gps_lat,gps_lng,status
       FROM farmers ORDER BY created_at DESC`
    );
    const headers = ['full_name', 'gender', 'phone', 'county', 'payam', 'boma', 'age', 'farm_size', 'crops', 'livestock', 'gps_lat', 'gps_lng', 'status'];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [headers.join(','), ...rows.rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="farmers.csv"');
    res.send(csv);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query('SELECT * FROM farmers WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Farmer not found' });
    res.json(rows[0]);
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.full_name) return res.status(400).json({ message: 'Full name is required' });
    const { rows } = await query(
      `INSERT INTO farmers(full_name,gender,phone,county,payam,boma,age,farm_size,crop_types,livestock_types,gps_lat,gps_lng,status,registered_by)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        b.full_name, b.gender || null, b.phone || null, b.county || null, b.payam || null, b.boma || null,
        b.age ? parseInt(b.age, 10) : null, b.farm_size ? parseFloat(b.farm_size) : null,
        toArray(b.crop_types), toArray(b.livestock_types),
        b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null,
        b.status || 'active', req.user?.id || null,
      ]
    );
    await query("INSERT INTO activity_log(type,description) VALUES('farmer',$1)", [
      `New farmer ${rows[0].full_name} registered in ${rows[0].county || 'Unknown'} County`,
    ]);
    res.status(201).json(rows[0]);
  })
);

router.put(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE farmers SET
        full_name=COALESCE($1,full_name), gender=$2, phone=$3, county=$4, payam=$5, boma=$6,
        age=$7, farm_size=$8, crop_types=$9, livestock_types=$10, gps_lat=$11, gps_lng=$12, status=COALESCE($13,status)
       WHERE id=$14 RETURNING *`,
      [
        b.full_name || null, b.gender || null, b.phone || null, b.county || null, b.payam || null, b.boma || null,
        b.age ? parseInt(b.age, 10) : null, b.farm_size ? parseFloat(b.farm_size) : null,
        toArray(b.crop_types), toArray(b.livestock_types),
        b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null,
        b.status || null, req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Farmer not found' });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM farmers WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Farmer not found' });
    res.json({ success: true });
  })
);

export default router;
