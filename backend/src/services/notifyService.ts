import { query } from '../db';

export type AlertType = 'weather' | 'pest' | 'advisory';

export interface NotifyOptions {
  type: AlertType;
  title: string;
  message: string;
  severity?: string;
  county?: string | null;
  sourceId?: number;
  link?: string;
  senderId?: number;
}

const DEFAULT_LINKS: Record<AlertType, string> = {
  weather: '/app/weather',
  pest: '/app/pests',
  advisory: '/app/advisories',
};

async function getFarmerRecipients(county?: string | null) {
  if (county) {
    return query<{ id: number; phone: string | null; county: string | null }>(
      `SELECT id, phone, county FROM users
       WHERE role='farmer' AND status='active' AND (county=$1 OR county IS NULL)`,
      [county]
    );
  }
  return query<{ id: number; phone: string | null; county: string | null }>(
    "SELECT id, phone, county FROM users WHERE role='farmer' AND status='active'"
  );
}

async function sendMockChannel(channel: 'sms' | 'whatsapp', phone: string, body: string, senderId?: number) {
  await query(
    `INSERT INTO messages(channel, recipients_group, recipient_count, body, status, sent_at, sender_id)
     VALUES($1,$2,$3,$4,$5,$6,$7)`,
    [channel, phone, 1, body, 'sent', new Date(), senderId || null]
  );
}

/** Fan out in-app notifications and mock SMS/WhatsApp to farmer accounts. */
export async function notifyFarmers(opts: NotifyOptions): Promise<number> {
  const recipients = await getFarmerRecipients(opts.county);
  const link = opts.link || DEFAULT_LINKS[opts.type];
  const smsBody = `[AgriConnect] ${opts.title}: ${opts.message}`;

  for (const farmer of recipients.rows) {
    const hasPhone = Boolean(farmer.phone?.trim());

    if (hasPhone && farmer.phone) {
      await Promise.all([
        sendMockChannel('sms', farmer.phone, smsBody, opts.senderId),
        sendMockChannel('whatsapp', farmer.phone, smsBody, opts.senderId),
      ]);
    }

    await query(
      `INSERT INTO notifications(user_id, type, title, message, severity, county, link, source_id, sms_sent, whatsapp_sent)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        farmer.id,
        opts.type,
        opts.title,
        opts.message,
        opts.severity || 'moderate',
        opts.county || null,
        link,
        opts.sourceId || null,
        hasPhone,
        hasPhone,
      ]
    );
  }

  return recipients.rowCount;
}
