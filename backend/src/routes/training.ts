import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, authorize } from '../utils';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const courses = await query(
      `SELECT c.*,
        (SELECT count(*)::int FROM training_enrollments e WHERE e.course_id=c.id AND e.completed) AS completions,
        (SELECT count(*)::int FROM training_enrollments e WHERE e.course_id=c.id AND e.certificate_issued) AS certificates,
        (SELECT coalesce(round(avg(progress)),0)::int FROM training_enrollments e WHERE e.course_id=c.id) AS avg_progress
       FROM training_courses c ORDER BY c.title`
    );
    const summary = await query<{ enrollments: string; completions: string; certificates: string }>(
      `SELECT count(*)::text enrollments,
              count(*) FILTER (WHERE completed)::text completions,
              count(*) FILTER (WHERE certificate_issued)::text certificates
       FROM training_enrollments`
    );
    res.json({ courses: courses.rows, summary: summary.rows[0] });
  })
);

router.post(
  '/',
  authorize('super_admin', 'extension_officer'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.title) return res.status(400).json({ message: 'title is required' });
    const { rows } = await query(
      'INSERT INTO training_courses(title,category,description,modules,duration) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [b.title, b.category || null, b.description || null, b.modules || 1, b.duration || null]
    );
    res.status(201).json(rows[0]);
  })
);

export default router;
