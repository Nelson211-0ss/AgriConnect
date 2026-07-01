import { query } from '../db';

export async function logActivity(opts: {
  type: string;
  description: string;
  userId?: number | null;
  action?: string;
  entityType?: string;
  entityId?: number;
  ipAddress?: string;
}) {
  await query(
    `INSERT INTO activity_log(type, description, user_id, action, entity_type, entity_id, ip_address)
     VALUES($1,$2,$3,$4,$5,$6,$7)`,
    [
      opts.type,
      opts.description,
      opts.userId ?? null,
      opts.action ?? null,
      opts.entityType ?? null,
      opts.entityId ?? null,
      opts.ipAddress ?? null,
    ]
  );
}
