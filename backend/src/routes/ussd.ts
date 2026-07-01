import { Router } from 'express';
import { query } from '../db';
import { asyncHandler } from '../utils';

const router = Router();

/** USSD webhook — Africa's Talking / generic USSD gateway format */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { sessionId, phoneNumber, text, serviceCode } = req.body || {};
    const session = sessionId || `ussd-${Date.now()}`;
    const phone = phoneNumber || req.body?.phone || '';
    const input = String(text || '').trim();
    const parts = input ? input.split('*') : [];
    const lastInput = parts[parts.length - 1] || '';

    await query(
      `INSERT INTO ussd_sessions(session_id, phone, menu_path, payload)
       VALUES($1,$2,$3,$4)
       ON CONFLICT DO NOTHING`,
      [session, phone, input, JSON.stringify(req.body || {})]
    ).catch(() =>
      query(
        `INSERT INTO ussd_sessions(session_id, phone, menu_path, payload) VALUES($1,$2,$3,$4)`,
        [session, phone, input, JSON.stringify(req.body || {})]
      )
    );

    let response = '';
    if (!input || input === '') {
      response = `CON AgriConnect\n1. Register Farmer\n2. Weather\n3. Market Prices\n4. Extension Tips\n0. Exit`;
    } else if (lastInput === '1') {
      response = 'CON Enter your full name:';
    } else if (lastInput === '2') {
      const weather = await query(
        `SELECT message FROM weather_alerts WHERE valid_to > now() ORDER BY created_at DESC LIMIT 1`
      );
      const msg = weather.rows[0]?.message || 'No active weather alerts.';
      response = `END Weather: ${msg.slice(0, 140)}`;
    } else if (lastInput === '3') {
      const prices = await query(
        `SELECT commodity, price, unit, county FROM market_prices ORDER BY date_updated DESC LIMIT 3`
      );
      const lines = prices.rows.map((p) => `${p.commodity}: ${p.price}/${p.unit} (${p.county})`).join('; ');
      response = `END Prices: ${lines || 'No data'}`;
    } else if (lastInput === '4') {
      const tip = await query(`SELECT title FROM advisories WHERE status='published' ORDER BY created_at DESC LIMIT 1`);
      response = `END Tip: ${tip.rows[0]?.title || 'Plant drought-tolerant varieties.'}`;
    } else if (lastInput === '0') {
      response = 'END Thank you for using AgriConnect.';
    } else if (parts.length >= 2 && parts[0] === '1') {
      const name = parts.slice(1).join(' ');
      await query(
        `INSERT INTO farmers(full_name, phone, county, status) VALUES($1,$2,$3,'pending')`,
        [name, phone, 'Juba']
      );
      response = `END Farmer ${name} registered. An officer will verify your profile.`;
    } else {
      response = 'END Invalid option. Dial again.';
    }

    res.type('text/plain').send(response);
  })
);

router.get(
  '/sessions',
  asyncHandler(async (_req, res) => {
    const rows = await query('SELECT * FROM ussd_sessions ORDER BY updated_at DESC LIMIT 50');
    res.json(rows.rows);
  })
);

export default router;
