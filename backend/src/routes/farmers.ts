import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';
import { logActivity } from '../services/auditService';

const router = Router();
router.use(authenticate);

const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : typeof v === 'string' && v.trim() ? v.split(',').map((s) => s.trim()) : [];

const parseJson = (v: unknown) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    try { return JSON.parse(v); } catch { return []; }
  }
  return [];
};

// List with search + pagination + filters
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const county = String(req.query.county || '').trim();

    const where: string[] = ['deleted_at IS NULL'];
    const params: unknown[] = [];
    if (search) {
      params.push(`%${search}%`);
      where.push(`(full_name ILIKE $${params.length} OR phone ILIKE $${params.length} OR payam ILIKE $${params.length} OR village ILIKE $${params.length})`);
    }
    if (county) {
      params.push(county);
      where.push(`county = $${params.length}`);
    }
    const whereSql = `WHERE ${where.join(' AND ')}`;

    const total = await query<{ c: string }>(`SELECT count(*)::text c FROM farmers ${whereSql}`, params);
    params.push(limit, offset);
    const rows = await query(
      `SELECT * FROM farmers ${whereSql} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ data: rows.rows, total: parseInt(total.rows[0].c, 10), page, limit });
  })
);

// Offline sync — batch register/update farmers
router.post(
  '/sync',
  authorize('super_admin', 'extension_officer', 'digital_champion', 'farmer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = Array.isArray(req.body?.farmers) ? req.body.farmers : [];
    const results: { id?: number; local_id?: string; status: string }[] = [];
    for (const b of items) {
      try {
        if (b.id) {
          await query(
            `UPDATE farmers SET full_name=COALESCE($1,full_name), phone=$2, county=$3, payam=$4, village=$5,
              farm_size=$6, crop_types=$7, livestock_types=$8, gps_lat=$9, gps_lng=$10 WHERE id=$11 AND deleted_at IS NULL`,
            [b.full_name || null, b.phone || null, b.county || null, b.payam || null, b.village || b.boma || null,
              b.farm_size ? parseFloat(b.farm_size) : null, toArray(b.crop_types), toArray(b.livestock_types),
              b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null, b.id]
          );
          results.push({ id: b.id, local_id: b.local_id, status: 'updated' });
        } else {
          const { rows } = await query(
            `INSERT INTO farmers(full_name,gender,phone,county,district,payam,boma,village,age,farm_size,farm_ownership,
              crop_types,livestock_types,irrigation_methods,production_history,cooperative_member,vsla_member,
              digital_readiness,preferred_comm_channel,gps_lat,gps_lng,status,registered_by,user_id)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) RETURNING id`,
            [
              b.full_name, b.gender || null, b.phone || null, b.county || null, b.district || b.county || null,
              b.payam || null, b.boma || null, b.village || null,
              b.age ? parseInt(b.age, 10) : null, b.farm_size ? parseFloat(b.farm_size) : null, b.farm_ownership || null,
              toArray(b.crop_types), toArray(b.livestock_types), toArray(b.irrigation_methods),
              JSON.stringify(parseJson(b.production_history)),
              b.cooperative_member === true, b.vsla_member === true,
              b.digital_readiness || 'medium', b.preferred_comm_channel || 'sms',
              b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null,
              b.status || 'pending', req.user?.id || null, req.user?.role === 'farmer' ? req.user.id : null,
            ]
          );
          results.push({ id: rows[0].id, local_id: b.local_id, status: 'created' });
        }
      } catch {
        results.push({ local_id: b.local_id, status: 'error' });
      }
    }
    res.json({ synced: results.length, results });
  })
);

// Map points
router.get(
  '/map',
  asyncHandler(async (req, res) => {
    const crop = String(req.query.crop || '').trim();
    const county = String(req.query.county || '').trim();
    const params: unknown[] = [];
    const where: string[] = ['gps_lat IS NOT NULL', 'deleted_at IS NULL'];
    if (county) {
      params.push(county);
      where.push(`county=$${params.length}`);
    }
    if (crop) {
      params.push(crop);
      where.push(`$${params.length} = ANY(crop_types)`);
    }
    const rows = await query(
      `SELECT id, full_name, county, gps_lat AS lat, gps_lng AS lng, crop_types, farm_size, digital_readiness
       FROM farmers WHERE ${where.join(' AND ')} LIMIT 1000`,
      params
    );
    res.json(rows.rows);
  })
);

// CSV export
router.get(
  '/export',
  asyncHandler(async (_req, res) => {
    const rows = await query<Record<string, unknown>>(
      `SELECT full_name,gender,phone,county,district,payam,boma,village,age,farm_size,farm_ownership,
              array_to_string(crop_types,'|') AS crops,
              array_to_string(livestock_types,'|') AS livestock,
              array_to_string(irrigation_methods,'|') AS irrigation,
              cooperative_member,vsla_member,digital_readiness,preferred_comm_channel,
              gps_lat,gps_lng,status
       FROM farmers WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
    const headers = ['full_name', 'gender', 'phone', 'county', 'district', 'payam', 'boma', 'village', 'age', 'farm_size', 'farm_ownership', 'crops', 'livestock', 'irrigation', 'cooperative_member', 'vsla_member', 'digital_readiness', 'preferred_comm_channel', 'gps_lat', 'gps_lng', 'status'];
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
    const { rows } = await query('SELECT * FROM farmers WHERE id=$1 AND deleted_at IS NULL', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Farmer not found' });
    res.json(rows[0]);
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer', 'digital_champion'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.full_name) return res.status(400).json({ message: 'Full name is required' });
    const { rows } = await query(
      `INSERT INTO farmers(full_name,gender,phone,county,district,payam,boma,village,age,farm_size,farm_ownership,
        crop_types,livestock_types,irrigation_methods,production_history,cooperative_member,vsla_member,
        digital_readiness,preferred_comm_channel,gps_lat,gps_lng,status,registered_by,user_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) RETURNING *`,
      [
        b.full_name, b.gender || null, b.phone || null, b.county || null, b.district || b.county || null,
        b.payam || null, b.boma || null, b.village || null,
        b.age ? parseInt(b.age, 10) : null, b.farm_size ? parseFloat(b.farm_size) : null, b.farm_ownership || null,
        toArray(b.crop_types), toArray(b.livestock_types), toArray(b.irrigation_methods),
        JSON.stringify(parseJson(b.production_history)),
        b.cooperative_member === true, b.vsla_member === true,
        b.digital_readiness || 'medium', b.preferred_comm_channel || 'sms',
        b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null,
        b.status || 'active', req.user?.id || null, b.user_id || null,
      ]
    );
    await logActivity({ type: 'farmer', description: `New farmer ${rows[0].full_name} registered in ${rows[0].county || 'Unknown'} County`, userId: req.user?.id, action: 'create', entityType: 'farmer', entityId: rows[0].id });
    res.status(201).json(rows[0]);
  })
);

router.put(
  '/:id',
  authorize('super_admin', 'extension_officer', 'digital_champion'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE farmers SET
        full_name=COALESCE($1,full_name), gender=$2, phone=$3, county=$4, district=$5, payam=$6, boma=$7, village=$8,
        age=$9, farm_size=$10, farm_ownership=$11, crop_types=$12, livestock_types=$13, irrigation_methods=$14,
        production_history=COALESCE($15, production_history),
        cooperative_member=COALESCE($16, cooperative_member), vsla_member=COALESCE($17, vsla_member),
        digital_readiness=COALESCE($18, digital_readiness),
        preferred_comm_channel=$19, gps_lat=$20, gps_lng=$21, status=COALESCE($22,status)
       WHERE id=$23 AND deleted_at IS NULL RETURNING *`,
      [
        b.full_name || null, b.gender || null, b.phone || null, b.county || null, b.district || null,
        b.payam || null, b.boma || null, b.village || null,
        b.age ? parseInt(b.age, 10) : null, b.farm_size ? parseFloat(b.farm_size) : null, b.farm_ownership || null,
        toArray(b.crop_types), toArray(b.livestock_types), toArray(b.irrigation_methods),
        JSON.stringify(parseJson(b.production_history)),
        b.cooperative_member !== undefined ? Boolean(b.cooperative_member) : null,
        b.vsla_member !== undefined ? Boolean(b.vsla_member) : null,
        b.digital_readiness || null, b.preferred_comm_channel || null,
        b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null,
        b.status || null, req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Farmer not found' });
    await logActivity({ type: 'farmer', description: `Updated farmer profile: ${rows[0].full_name}`, userId: req.user?.id, action: 'update', entityType: 'farmer', entityId: rows[0].id });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { rowCount } = await query('UPDATE farmers SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Farmer not found' });
    await logActivity({ type: 'farmer', description: `Deleted farmer #${req.params.id}`, userId: req.user?.id, action: 'delete', entityType: 'farmer', entityId: parseInt(req.params.id, 10) });
    res.json({ success: true });
  })
);

export default router;
