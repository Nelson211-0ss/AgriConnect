import { Router } from 'express';
import { query } from '../db';
import { asyncHandler, authenticate } from '../utils';

const router = Router();

router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    const [
      farmers,
      activeFarmers,
      buyers,
      officers,
      messages,
      counties,
      farmersByCounty,
      cropDist,
      userGrowth,
      marketActivity,
      recentFarmers,
      recentPests,
      recentTx,
      topAdvisories,
      messageActivity,
    ] = await Promise.all([
      query<{ c: string }>("SELECT count(*)::text c FROM farmers"),
      query<{ c: string }>("SELECT count(*)::text c FROM farmers WHERE status='active'"),
      query<{ c: string }>("SELECT count(*)::text c FROM users WHERE role='buyer'"),
      query<{ c: string }>("SELECT count(*)::text c FROM users WHERE role='extension_officer'"),
      query<{ c: string }>("SELECT count(*)::text c FROM messages"),
      query<{ c: string }>("SELECT count(*)::text c FROM counties"),
      query("SELECT county AS name, count(*)::int AS value FROM farmers GROUP BY county ORDER BY value DESC"),
      query("SELECT unnest(crop_types) AS name, count(*)::int AS value FROM farmers GROUP BY name ORDER BY value DESC"),
      query(
        `SELECT to_char(date_trunc('month', created_at),'Mon') AS month,
                count(*)::int AS farmers
         FROM farmers
         WHERE created_at > now() - interval '12 months'
         GROUP BY date_trunc('month', created_at)
         ORDER BY date_trunc('month', created_at)`
      ),
      query(
        `SELECT commodity AS name, count(*)::int AS listings, coalesce(sum(quantity),0)::int AS volume
         FROM marketplace_listings GROUP BY commodity ORDER BY listings DESC`
      ),
      query(
        `SELECT id, full_name, county, phone, status, created_at
         FROM farmers ORDER BY created_at DESC LIMIT 8`
      ),
      query(
        `SELECT id, pest_name, county, severity, date_reported
         FROM pest_alerts ORDER BY date_reported DESC LIMIT 6`
      ),
      query(
        `SELECT id, buyer_name, commodity, quantity, price, delivery_location, created_at
         FROM marketplace_listings ORDER BY created_at DESC LIMIT 6`
      ),
      query(
        `SELECT category AS name, count(*)::int AS value FROM advisories GROUP BY category ORDER BY value DESC LIMIT 6`
      ),
      query(
        `SELECT to_char(date_trunc('month', sent_at),'Mon') AS month,
                count(*) FILTER (WHERE channel='sms')::int AS sms,
                count(*) FILTER (WHERE channel='whatsapp')::int AS whatsapp
         FROM messages
         WHERE sent_at > now() - interval '12 months'
         GROUP BY date_trunc('month', sent_at)
         ORDER BY date_trunc('month', sent_at)`
      ),
    ]);

    res.json({
      cards: {
        totalFarmers: parseInt(farmers.rows[0].c, 10),
        activeFarmers: parseInt(activeFarmers.rows[0].c, 10),
        registeredBuyers: parseInt(buyers.rows[0].c, 10),
        extensionWorkers: parseInt(officers.rows[0].c, 10),
        messagesSent: parseInt(messages.rows[0].c, 10),
        countiesCovered: parseInt(counties.rows[0].c, 10),
      },
      charts: {
        farmersByCounty: farmersByCounty.rows,
        cropDistribution: cropDist.rows,
        userGrowth: userGrowth.rows,
        marketActivity: marketActivity.rows,
        messageActivity: messageActivity.rows,
        topAdvisories: topAdvisories.rows,
      },
      tables: {
        recentFarmers: recentFarmers.rows,
        recentPestAlerts: recentPests.rows,
        recentTransactions: recentTx.rows,
      },
    });
  })
);

export default router;
