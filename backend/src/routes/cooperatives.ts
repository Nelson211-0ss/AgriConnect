import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';
import { logActivity } from '../services/auditService';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgType = String(req.query.type || '').trim();
    const search = String(req.query.search || '').trim();
    const county = String(req.query.county || '').trim();
    const params: unknown[] = [];
    const where: string[] = ['deleted_at IS NULL'];
    if (orgType) {
      params.push(orgType);
      where.push(`org_type=$${params.length}`);
    }
    if (county) {
      params.push(county);
      where.push(`county=$${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(name ILIKE $${params.length} OR leader_name ILIKE $${params.length})`);
    }
    const rows = await query(
      `SELECT * FROM cooperatives WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json(rows.rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query('SELECT * FROM cooperatives WHERE id=$1 AND deleted_at IS NULL', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    const [members, meetings, announcements, documents, loans, savings] = await Promise.all([
      query('SELECT * FROM cooperative_members WHERE cooperative_id=$1 ORDER BY joined_at DESC', [req.params.id]),
      query('SELECT * FROM cooperative_meetings WHERE cooperative_id=$1 ORDER BY scheduled_at DESC', [req.params.id]),
      query('SELECT * FROM cooperative_announcements WHERE cooperative_id=$1 ORDER BY created_at DESC LIMIT 20', [req.params.id]),
      query('SELECT * FROM cooperative_documents WHERE cooperative_id=$1 ORDER BY created_at DESC', [req.params.id]),
      query('SELECT * FROM cooperative_loans WHERE cooperative_id=$1 ORDER BY disbursed_at DESC', [req.params.id]),
      query('SELECT * FROM cooperative_savings WHERE cooperative_id=$1 ORDER BY recorded_at DESC LIMIT 50', [req.params.id]),
    ]);
    res.json({
      ...rows[0],
      members: members.rows,
      meetings: meetings.rows,
      announcements: announcements.rows,
      documents: documents.rows,
      loans: loans.rows,
      savings: savings.rows,
    });
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.name || !b.org_type) return res.status(400).json({ message: 'name and org_type are required' });
    const { rows } = await query(
      `INSERT INTO cooperatives(name,org_type,county,payam,village,gps_lat,gps_lng,leader_name,leader_phone,member_count,description,status,manager_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        b.name, b.org_type, b.county || null, b.payam || null, b.village || null,
        b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null,
        b.leader_name || null, b.leader_phone || null, b.member_count ? parseInt(b.member_count, 10) : 0,
        b.description || null, b.status || 'active', req.user?.id || null,
      ]
    );
    await logActivity({ type: 'cooperative', description: `Registered ${b.org_type}: ${b.name}`, userId: req.user?.id, action: 'create', entityType: 'cooperative', entityId: rows[0].id });
    res.status(201).json(rows[0]);
  })
);

router.put(
  '/:id',
  authorize('super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE cooperatives SET
        name=COALESCE($1,name), org_type=COALESCE($2,org_type), county=$3, payam=$4, village=$5,
        gps_lat=$6, gps_lng=$7, leader_name=$8, leader_phone=$9, member_count=$10,
        description=$11, status=COALESCE($12,status)
       WHERE id=$13 AND deleted_at IS NULL RETURNING *`,
      [
        b.name || null, b.org_type || null, b.county || null, b.payam || null, b.village || null,
        b.gps_lat ? parseFloat(b.gps_lat) : null, b.gps_lng ? parseFloat(b.gps_lng) : null,
        b.leader_name || null, b.leader_phone || null,
        b.member_count != null ? parseInt(b.member_count, 10) : null,
        b.description || null, b.status || null, req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { rowCount } = await query('UPDATE cooperatives SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Not found' });
    await logActivity({ type: 'cooperative', description: `Deleted cooperative #${req.params.id}`, userId: req.user?.id, action: 'delete', entityType: 'cooperative', entityId: parseInt(req.params.id, 10) });
    res.json({ success: true });
  })
);

// Members
router.post(
  '/:id/members',
  authorize('super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `INSERT INTO cooperative_members(cooperative_id,farmer_id,member_name,role)
       VALUES($1,$2,$3,$4) RETURNING *`,
      [req.params.id, b.farmer_id || null, b.member_name || null, b.role || 'member']
    );
    await query('UPDATE cooperatives SET member_count=(SELECT count(*) FROM cooperative_members WHERE cooperative_id=$1) WHERE id=$1', [req.params.id]);
    res.status(201).json(rows[0]);
  })
);

router.delete(
  '/:id/members/:memberId',
  authorize('super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'),
  asyncHandler(async (req, res) => {
    await query('DELETE FROM cooperative_members WHERE id=$1 AND cooperative_id=$2', [req.params.memberId, req.params.id]);
    await query('UPDATE cooperatives SET member_count=(SELECT count(*) FROM cooperative_members WHERE cooperative_id=$1) WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  })
);

// Meetings
router.post(
  '/:id/meetings',
  authorize('super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.title || !b.scheduled_at) return res.status(400).json({ message: 'title and scheduled_at required' });
    const { rows } = await query(
      `INSERT INTO cooperative_meetings(cooperative_id,title,scheduled_at,location,agenda) VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, b.title, b.scheduled_at, b.location || null, b.agenda || null]
    );
    res.status(201).json(rows[0]);
  })
);

// Announcements
router.post(
  '/:id/announcements',
  authorize('super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.title || !b.body) return res.status(400).json({ message: 'title and body required' });
    const { rows } = await query(
      `INSERT INTO cooperative_announcements(cooperative_id,title,body) VALUES($1,$2,$3) RETURNING *`,
      [req.params.id, b.title, b.body]
    );
    res.status(201).json(rows[0]);
  })
);

// Documents
router.post(
  '/:id/documents',
  authorize('super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.title) return res.status(400).json({ message: 'title required' });
    const { rows } = await query(
      `INSERT INTO cooperative_documents(cooperative_id,title,file_url,doc_type) VALUES($1,$2,$3,$4) RETURNING *`,
      [req.params.id, b.title, b.file_url || null, b.doc_type || null]
    );
    res.status(201).json(rows[0]);
  })
);

// Loans
router.post(
  '/:id/loans',
  authorize('super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.amount) return res.status(400).json({ message: 'amount required' });
    const { rows } = await query(
      `INSERT INTO cooperative_loans(cooperative_id,member_name,amount,purpose,status,due_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.id, b.member_name || null, b.amount, b.purpose || null, b.status || 'active', b.due_at || null]
    );
    res.status(201).json(rows[0]);
  })
);

// Savings
router.post(
  '/:id/savings',
  authorize('super_admin', 'extension_officer', 'cooperative_manager', 'vsla_leader'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.amount || !b.transaction_type) return res.status(400).json({ message: 'amount and transaction_type required' });
    const { rows } = await query(
      `INSERT INTO cooperative_savings(cooperative_id,member_name,amount,transaction_type) VALUES($1,$2,$3,$4) RETURNING *`,
      [req.params.id, b.member_name || null, b.amount, b.transaction_type]
    );
    res.status(201).json(rows[0]);
  })
);

export default router;
