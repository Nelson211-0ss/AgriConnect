import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';
import { notifyFarmers } from '../services/notifyService';

const router = Router();
router.use(authenticate);

const COUNTY_COORDS: Record<string, { lat: number; lng: number }> = {
  Juba: { lat: 4.85, lng: 31.58 },
  Wau: { lat: 7.7, lng: 27.99 },
  Aweil: { lat: 8.77, lng: 27.4 },
  Bor: { lat: 6.21, lng: 31.56 },
  Rumbek: { lat: 6.8, lng: 29.68 },
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const county = String(req.query.county || '').trim();
    const params: unknown[] = [];
    let whereSql = '';
    if (county) {
      params.push(county);
      whereSql = 'WHERE p.county=$1';
    }
    const rows = await query(
      `SELECT p.*, u.name AS reporter_name FROM pest_alerts p
       LEFT JOIN users u ON u.id=p.reported_by ${whereSql} ORDER BY p.date_reported DESC`,
      params
    );
    const withCoords = rows.rows.map((r: Record<string, unknown>) => ({
      ...r,
      lat: COUNTY_COORDS[String(r.county)]?.lat,
      lng: COUNTY_COORDS[String(r.county)]?.lng,
    }));
    res.json(withCoords);
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.pest_name || !b.county) return res.status(400).json({ message: 'pest_name and county are required' });
    const { rows } = await query(
      'INSERT INTO pest_alerts(pest_name,crop,county,severity,description,status,reported_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [b.pest_name, b.crop || null, b.county, b.severity || 'moderate', b.description || null, b.status || 'active', req.user?.id || null]
    );
    const alert = rows[0];
    await query("INSERT INTO activity_log(type,description) VALUES('pest',$1)", [
      `${b.pest_name} detected in ${b.county} County`,
    ]);
    await notifyFarmers({
      type: 'pest',
      title: `Pest alert: ${b.pest_name}`,
      message: b.description || `${b.pest_name} reported in ${b.county} County. Severity: ${b.severity || 'moderate'}.`,
      severity: b.severity || 'moderate',
      county: b.county,
      sourceId: alert.id,
      senderId: req.user?.id,
    });
    res.status(201).json(alert);
  })
);

router.put(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE pest_alerts SET pest_name=COALESCE($1,pest_name), crop=$2, county=COALESCE($3,county),
        severity=COALESCE($4,severity), description=$5, status=COALESCE($6,status) WHERE id=$7 RETURNING *`,
      [b.pest_name || null, b.crop || null, b.county || null, b.severity || null, b.description || null, b.status || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Alert not found' });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM pest_alerts WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Alert not found' });
    res.json({ success: true });
  })
);

export default router;
