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
    const type = String(req.query.type || '').trim();
    const category = String(req.query.category || '').trim();
    const search = String(req.query.search || '').trim();
    const params: unknown[] = [];
    const where: string[] = ['deleted_at IS NULL', "status='published'"];
    if (type) {
      params.push(type);
      where.push(`type=$${params.length}`);
    }
    if (category) {
      params.push(category);
      where.push(`category=$${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(title ILIKE $${params.length} OR content ILIKE $${params.length})`);
    }
    const rows = await query(
      `SELECT k.*, u.name AS author_name FROM kb_items k
       LEFT JOIN users u ON u.id=k.author_id
       WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json(rows.rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('UPDATE kb_items SET views=views+1 WHERE id=$1', [req.params.id]);
    const { rows } = await query(
      `SELECT k.*, u.name AS author_name FROM kb_items k LEFT JOIN users u ON u.id=k.author_id WHERE k.id=$1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer', 'digital_champion'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.title || !b.type) return res.status(400).json({ message: 'title and type are required' });
    const { rows } = await query(
      `INSERT INTO kb_items(type,title,content,category,media_url,pdf_url,tags,status,author_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [b.type, b.title, b.content || null, b.category || null, b.media_url || null, b.pdf_url || null, toArray(b.tags), b.status || 'published', req.user?.id || null]
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
      `UPDATE kb_items SET type=COALESCE($1,type), title=COALESCE($2,title), content=$3, category=$4,
        media_url=$5, pdf_url=$6, tags=$7, status=COALESCE($8,status) WHERE id=$9 AND deleted_at IS NULL RETURNING *`,
      [b.type || null, b.title || null, b.content || null, b.category || null, b.media_url || null, b.pdf_url || null, toArray(b.tags), b.status || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('UPDATE kb_items SET deleted_at=now() WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  })
);

export default router;
