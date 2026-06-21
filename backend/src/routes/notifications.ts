import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate, AuthedRequest } from '../utils';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const unreadOnly = req.query.unread === 'true';
    const params: unknown[] = [req.user!.id];
    let whereSql = 'WHERE user_id=$1';
    if (unreadOnly) whereSql += ' AND read_at IS NULL';

    const { rows } = await query(
      `SELECT * FROM notifications ${whereSql} ORDER BY created_at DESC LIMIT 50`,
      params
    );
    res.json(rows);
  })
);

router.get(
  '/summary',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { rows } = await query<{ unread: string }>(
      'SELECT count(*)::text AS unread FROM notifications WHERE user_id=$1 AND read_at IS NULL',
      [req.user!.id]
    );
    res.json({ unread: parseInt(rows[0]?.unread || '0', 10) });
  })
);

router.patch(
  '/:id/read',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { rows } = await query(
      `UPDATE notifications SET read_at=now()
       WHERE id=$1 AND user_id=$2 AND read_at IS NULL
       RETURNING *`,
      [req.params.id, req.user!.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Notification not found' });
    res.json(rows[0]);
  })
);

router.post(
  '/read-all',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { rowCount } = await query(
      'UPDATE notifications SET read_at=now() WHERE user_id=$1 AND read_at IS NULL',
      [req.user!.id]
    );
    res.json({ success: true, marked: rowCount });
  })
);

export default router;
