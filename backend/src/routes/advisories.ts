import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize, AuthedRequest } from '../utils';
import { notifyFarmers } from '../services/notifyService';

const router = Router();
router.use(authenticate);

const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : typeof v === 'string' && v.trim() ? v.split(',').map((s) => s.trim()) : [];

router.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const category = String(req.query.category || '').trim();
    const search = String(req.query.search || '').trim();
    const tag = String(req.query.tag || '').trim();
    const params: unknown[] = [];
    const where: string[] = [];
    if (category) {
      params.push(category);
      where.push(`a.category=$${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(a.title ILIKE $${params.length} OR a.content ILIKE $${params.length})`);
    }
    if (tag) {
      params.push(tag);
      where.push(`$${params.length} = ANY(a.tags)`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await query(
      `SELECT a.*, u.name AS author_name,
        EXISTS(SELECT 1 FROM advisory_bookmarks b WHERE b.advisory_id=a.id AND b.user_id=$${params.length + 1}) AS bookmarked,
        EXISTS(SELECT 1 FROM advisory_likes l WHERE l.advisory_id=a.id AND l.user_id=$${params.length + 1}) AS liked
       FROM advisories a
       LEFT JOIN users u ON u.id=a.author_id ${whereSql} ORDER BY a.created_at DESC`,
      [...params, req.user?.id || 0]
    );
    res.json(rows.rows);
  })
);

router.get(
  '/bookmarks/mine',
  asyncHandler(async (req: AuthedRequest, res) => {
    const rows = await query(
      `SELECT a.* FROM advisories a
       JOIN advisory_bookmarks b ON b.advisory_id=a.id AND b.user_id=$1
       ORDER BY b.created_at DESC`,
      [req.user!.id]
    );
    res.json(rows.rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthedRequest, res) => {
    await query('UPDATE advisories SET views=views+1 WHERE id=$1', [req.params.id]);
    const { rows } = await query(
      `SELECT a.*, u.name AS author_name,
        EXISTS(SELECT 1 FROM advisory_bookmarks b WHERE b.advisory_id=a.id AND b.user_id=$2) AS bookmarked,
        EXISTS(SELECT 1 FROM advisory_likes l WHERE l.advisory_id=a.id AND l.user_id=$2) AS liked
       FROM advisories a LEFT JOIN users u ON u.id=a.author_id WHERE a.id=$1`,
      [req.params.id, req.user?.id || 0]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Advisory not found' });
    const comments = await query(
      `SELECT c.*, u.name AS author_name FROM advisory_comments c
       LEFT JOIN users u ON u.id=c.user_id WHERE c.advisory_id=$1 ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    res.json({ ...rows[0], comments: comments.rows });
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer', 'digital_champion'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.title || !b.category || !b.content) return res.status(400).json({ message: 'title, category and content are required' });
    const { rows } = await query(
      'INSERT INTO advisories(title,category,content,image_url,pdf_url,tags,status,scheduled_at,author_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [b.title, b.category, b.content, b.image_url || null, b.pdf_url || null, toArray(b.tags), b.status || 'published', b.scheduled_at || null, req.user?.id || null]
    );
    const advisory = rows[0];
    await query("INSERT INTO activity_log(type,description,user_id,action,entity_type,entity_id) VALUES('advisory',$1,$2,'create','advisory',$3)", [`New advisory published: ${b.title}`, req.user?.id || null, advisory.id]);
    if ((b.status || 'published') === 'published') {
      await notifyFarmers({
        type: 'advisory',
        title: `New advisory: ${b.title}`,
        message: String(b.content).slice(0, 240),
        severity: 'moderate',
        county: null,
        sourceId: advisory.id,
        senderId: req.user?.id,
      });
    }
    res.status(201).json(advisory);
  })
);

router.put(
  '/:id',
  authorize('super_admin', 'extension_officer', 'digital_champion'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE advisories SET title=COALESCE($1,title), category=COALESCE($2,category), content=COALESCE($3,content),
        image_url=$4, pdf_url=$5, tags=$6, status=COALESCE($7,status), scheduled_at=$8 WHERE id=$9 RETURNING *`,
      [b.title || null, b.category || null, b.content || null, b.image_url || null, b.pdf_url || null, toArray(b.tags), b.status || null, b.scheduled_at || null, req.params.id]
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

router.post(
  '/:id/comments',
  asyncHandler(async (req: AuthedRequest, res) => {
    const b = req.body || {};
    if (!b.body) return res.status(400).json({ message: 'body required' });
    const { rows } = await query(
      'INSERT INTO advisory_comments(advisory_id,user_id,body) VALUES($1,$2,$3) RETURNING *',
      [req.params.id, req.user?.id || null, b.body]
    );
    res.status(201).json(rows[0]);
  })
);

router.post(
  '/:id/like',
  asyncHandler(async (req: AuthedRequest, res) => {
    const uid = req.user!.id;
    const aid = req.params.id;
    const existing = await query('SELECT 1 FROM advisory_likes WHERE advisory_id=$1 AND user_id=$2', [aid, uid]);
    if (existing.rowCount) {
      await query('DELETE FROM advisory_likes WHERE advisory_id=$1 AND user_id=$2', [aid, uid]);
      await query('UPDATE advisories SET likes_count=GREATEST(0, likes_count-1) WHERE id=$1', [aid]);
      return res.json({ liked: false });
    }
    await query('INSERT INTO advisory_likes(advisory_id,user_id) VALUES($1,$2)', [aid, uid]);
    await query('UPDATE advisories SET likes_count=likes_count+1 WHERE id=$1', [aid]);
    res.json({ liked: true });
  })
);

router.post(
  '/:id/bookmark',
  asyncHandler(async (req: AuthedRequest, res) => {
    const uid = req.user!.id;
    const aid = req.params.id;
    const existing = await query('SELECT 1 FROM advisory_bookmarks WHERE advisory_id=$1 AND user_id=$2', [aid, uid]);
    if (existing.rowCount) {
      await query('DELETE FROM advisory_bookmarks WHERE advisory_id=$1 AND user_id=$2', [aid, uid]);
      return res.json({ bookmarked: false });
    }
    await query('INSERT INTO advisory_bookmarks(advisory_id,user_id) VALUES($1,$2)', [aid, uid]);
    res.json({ bookmarked: true });
  })
);

export default router;
