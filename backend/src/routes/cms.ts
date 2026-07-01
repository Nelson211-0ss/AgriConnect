import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';

const router = Router();
router.use(authenticate);

const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : typeof v === 'string' && v.trim() ? v.split(',').map((s) => s.trim()) : [];

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const contentType = String(req.query.type || '').trim();
    const status = String(req.query.status || '').trim();
    const search = String(req.query.search || '').trim();
    const params: unknown[] = [];
    const where: string[] = ['deleted_at IS NULL'];
    if (contentType) {
      params.push(contentType);
      where.push(`content_type=$${params.length}`);
    }
    if (status) {
      params.push(status);
      where.push(`status=$${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`title ILIKE $${params.length}`);
    }
    const rows = await query(
      `SELECT c.*, u.name AS author_name FROM cms_content c
       LEFT JOIN users u ON u.id=c.author_id
       WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json(rows.rows);
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer', 'digital_champion'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.title || !b.content_type) return res.status(400).json({ message: 'title and content_type required' });
    const { rows } = await query(
      `INSERT INTO cms_content(content_type,title,body,category,tags,media_url,status,scheduled_at,author_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [b.content_type, b.title, b.body || null, b.category || null, toArray(b.tags), b.media_url || null, b.status || 'draft', b.scheduled_at || null, req.user?.id || null]
    );
    res.status(201).json(rows[0]);
  })
);

router.put(
  '/:id',
  authorize('super_admin', 'extension_officer', 'digital_champion'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE cms_content SET title=COALESCE($1,title), body=$2, category=$3, tags=$4, media_url=$5,
        status=COALESCE($6,status), scheduled_at=$7 WHERE id=$8 AND deleted_at IS NULL RETURNING *`,
      [b.title || null, b.body || null, b.category || null, toArray(b.tags), b.media_url || null, b.status || null, b.scheduled_at || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('UPDATE cms_content SET deleted_at=now() WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  })
);

export default router;
