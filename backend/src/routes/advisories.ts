import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const category = String(req.query.category || '').trim();
    const search = String(req.query.search || '').trim();
    const params: unknown[] = [];
    const where: string[] = [];
    if (category) {
      params.push(category);
      where.push(`a.category=$${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`a.title ILIKE $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await query(
      `SELECT a.*, u.name AS author_name FROM advisories a
       LEFT JOIN users u ON u.id=a.author_id ${whereSql} ORDER BY a.created_at DESC`,
      params
    );
    res.json(rows.rows);
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.title || !b.category || !b.content) return res.status(400).json({ message: 'title, category and content are required' });
    const { rows } = await query(
      'INSERT INTO advisories(title,category,content,image_url,status,scheduled_at,author_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [b.title, b.category, b.content, b.image_url || null, b.status || 'published', b.scheduled_at || null, req.user?.id || null]
    );
    await query("INSERT INTO activity_log(type,description) VALUES('advisory',$1)", [`New advisory published: ${b.title}`]);
    res.status(201).json(rows[0]);
  })
);

router.put(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE advisories SET title=COALESCE($1,title), category=COALESCE($2,category), content=COALESCE($3,content),
        image_url=$4, status=COALESCE($5,status), scheduled_at=$6 WHERE id=$7 RETURNING *`,
      [b.title || null, b.category || null, b.content || null, b.image_url || null, b.status || null, b.scheduled_at || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Advisory not found' });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM advisories WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Advisory not found' });
    res.json({ success: true });
  })
);

export default router;
