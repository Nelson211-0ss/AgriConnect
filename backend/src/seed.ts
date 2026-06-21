import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { pool, query, waitForDb } from './db';

// ---------- random helpers ----------
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickMany = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(rand(0, copy.length - 1), 1)[0]);
  return out;
};
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

// ---------- reference data ----------
const COUNTIES = [
  { name: 'Juba', lat: 4.85, lng: 31.58 },
  { name: 'Wau', lat: 7.70, lng: 27.99 },
  { name: 'Aweil', lat: 8.77, lng: 27.40 },
  { name: 'Bor', lat: 6.21, lng: 31.56 },
  { name: 'Rumbek', lat: 6.80, lng: 29.68 },
];

const PAYAMS = ['Northern', 'Southern', 'Eastern', 'Western', 'Central'];
const BOMAS = ['Boma A', 'Boma B', 'Boma C', 'Boma D', 'Boma E'];
const CROPS = ['Maize', 'Sorghum', 'Groundnuts', 'Sesame', 'Cassava', 'Millet'];
const LIVESTOCK = ['Cattle', 'Goats', 'Sheep', 'Poultry'];
const MARKET_COMMODITIES = ['Maize', 'Sorghum', 'Groundnuts', 'Sesame', 'Cassava'];

const FIRST_NAMES = ['John', 'Mary', 'Peter', 'Grace', 'James', 'Sarah', 'David', 'Rebecca', 'Michael', 'Esther', 'Daniel', 'Nyandeng', 'Deng', 'Akol', 'Achol', 'Garang', 'Nyibol', 'Manyang', 'Aluel', 'Wani', 'Yien', 'Nyakong', 'Lado', 'Poni', 'Kiden', 'Taban', 'Aja', 'Bol', 'Chol', 'Adut'];
const LAST_NAMES = ['Deng', 'Akec', 'Garang', 'Majok', 'Lado', 'Wani', 'Malong', 'Kuol', 'Ayuel', 'Bol', 'Madut', 'Riak', 'Tutu', 'Marial', 'Manyok', 'Ngor', 'Atem', 'Lual', 'Achuil', 'Mou'];

const ADVISORY_CATEGORIES = ['Crop Production', 'Livestock', 'Climate Smart Agriculture', 'Irrigation', 'Pest Control', 'Soil Management'];
const ADVISORY_TITLES: Record<string, string[]> = {
  'Crop Production': ['Optimal spacing for maize planting', 'Improving sorghum yields with certified seed', 'Best practices for groundnut harvesting'],
  Livestock: ['Vaccinating cattle against East Coast Fever', 'Improving goat nutrition in dry season', 'Poultry housing for smallholders'],
  'Climate Smart Agriculture': ['Conservation tillage for drought resilience', 'Agroforestry for soil and climate', 'Drought-tolerant crop varieties'],
  Irrigation: ['Building low-cost drip irrigation', 'Water harvesting for the dry months', 'Furrow irrigation for vegetables'],
  'Pest Control': ['Managing Fall Armyworm in maize', 'Integrated pest management basics', 'Identifying and controlling aphids'],
  'Soil Management': ['Composting for healthier soils', 'Crop rotation to restore fertility', 'Testing and correcting soil pH'],
};

const PESTS = ['Fall Armyworm', 'Desert Locust', 'Maize Stalk Borer', 'Aphids', 'Cassava Mosaic', 'Striga Weed', 'Bird Damage (Quelea)'];
const WEATHER_TYPES = ['Heavy Rain', 'Flood Warning', 'Drought Alert', 'Wind Warning'];
const SEVERITIES = ['low', 'moderate', 'high', 'critical'];

const FIN_PRODUCTS = [
  { name: 'Agri Input Loan', type: 'Loan', provider: 'Equity Bank SS', interest_rate: 12.5, min: 50, max: 2000, description: 'Short-term loan for seeds, fertilizer and tools, repayable after harvest.' },
  { name: 'Harvest Advance', type: 'Loan', provider: 'Kush Microfinance', interest_rate: 9.0, min: 100, max: 5000, description: 'Bridge financing against expected harvest sales.' },
  { name: 'Cooperative Savings', type: 'Savings', provider: 'CORWADO SACCO', interest_rate: 4.0, min: 5, max: 100000, description: 'Group savings product for farmer cooperatives with dividends.' },
  { name: 'Mobile Wallet Savings', type: 'Savings', provider: 'm-Gurush', interest_rate: 2.5, min: 1, max: 50000, description: 'Flexible mobile savings with instant access.' },
  { name: 'Weather Index Insurance', type: 'Insurance', provider: 'Pula / CORWADO', interest_rate: 0, min: 10, max: 1000, description: 'Crop insurance that pays out automatically on drought or flood triggers.' },
  { name: 'Livestock Insurance', type: 'Insurance', provider: 'CIC Africa', interest_rate: 0, min: 15, max: 1500, description: 'Protects cattle and goats against drought and disease losses.' },
];

const COURSES = [
  { title: 'Climate Smart Agriculture', category: 'Climate', description: 'Practical techniques to build resilience to drought and floods.', modules: 6, duration: '4 weeks' },
  { title: 'Integrated Pest Management', category: 'Pest', description: 'Identify, prevent and control major crop pests sustainably.', modules: 5, duration: '3 weeks' },
  { title: 'Agribusiness & Market Skills', category: 'Business', description: 'Record keeping, pricing and selling to formal buyers.', modules: 7, duration: '5 weeks' },
  { title: 'Soil Health & Fertility', category: 'Soil', description: 'Composting, rotation and conservation tillage.', modules: 4, duration: '2 weeks' },
];

function phone() {
  return '+211 9' + rand(10, 99) + ' ' + rand(100, 999) + ' ' + rand(100, 999);
}

export async function runSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT');
  console.log('[seed] schema ensured');
}

export async function seed(force = false) {
  await runSchema();
  const existing = await query<{ count: string }>('SELECT count(*)::text AS count FROM users');
  if (!force && parseInt(existing.rows[0].count, 10) > 0) {
    console.log('[seed] database already seeded, skipping');
    return;
  }
  console.log('[seed] generating demo data ...');

  // Counties
  for (const c of COUNTIES) {
    await query('INSERT INTO counties(name,lat,lng) VALUES($1,$2,$3) ON CONFLICT (name) DO NOTHING', [c.name, c.lat, c.lng]);
  }

  const hash = await bcrypt.hash(config.defaultPassword, 10);

  // Core demo accounts
  const demoAccounts = [
    { name: 'CORWADO Admin', email: 'admin@corwado.org', role: 'super_admin' },
    { name: 'Grace Lado', email: 'officer@corwado.org', role: 'extension_officer' },
    { name: 'John Deng', email: 'farmer@corwado.org', role: 'farmer' },
    { name: 'Twiga Foods Ltd', email: 'buyer@corwado.org', role: 'buyer' },
  ];
  for (const a of demoAccounts) {
    await query(
      'INSERT INTO users(name,email,password_hash,role,phone,county) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO NOTHING',
      [a.name, a.email, hash, a.role, phone(), pick(COUNTIES).name]
    );
  }

  // Extension officers (50 total incl. demo)
  const officerIds: number[] = [];
  const demoOfficer = await query<{ id: number }>("SELECT id FROM users WHERE email='officer@corwado.org'");
  officerIds.push(demoOfficer.rows[0].id);
  for (let i = 0; i < 49; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const email = `officer${i + 1}@corwado.org`;
    const r = await query<{ id: number }>(
      'INSERT INTO users(name,email,password_hash,role,phone,county,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [name, email, hash, 'extension_officer', phone(), pick(COUNTIES).name, daysAgo(rand(1, 400))]
    );
    officerIds.push(r.rows[0].id);
  }

  // Buyers (100 total incl. demo)
  const buyerRows: { id: number; name: string }[] = [];
  const demoBuyer = await query<{ id: number; name: string }>("SELECT id,name FROM users WHERE email='buyer@corwado.org'");
  buyerRows.push(demoBuyer.rows[0]);
  const buyerOrgs = ['Trading Co', 'Agro Ltd', 'Foods', 'Grain Millers', 'Exporters', 'Cooperative Union', 'Commodities'];
  for (let i = 0; i < 99; i++) {
    const name = `${pick(LAST_NAMES)} ${pick(buyerOrgs)}`;
    const email = `buyer${i + 1}@corwado.org`;
    const r = await query<{ id: number }>(
      'INSERT INTO users(name,email,password_hash,role,phone,county,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [name, email, hash, 'buyer', phone(), pick(COUNTIES).name, daysAgo(rand(1, 300))]
    );
    buyerRows.push({ id: r.rows[0].id, name });
  }

  // Farmers (1000)
  console.log('[seed] inserting 1000 farmers ...');
  const farmerIds: number[] = [];
  for (let batch = 0; batch < 20; batch++) {
    const values: string[] = [];
    const params: unknown[] = [];
    let p = 1;
    for (let i = 0; i < 50; i++) {
      const county = pick(COUNTIES);
      const crops = pickMany(CROPS, rand(1, 3));
      const livestock = pickMany(LIVESTOCK, rand(0, 2));
      const lat = county.lat + (Math.random() - 0.5) * 0.6;
      const lng = county.lng + (Math.random() - 0.5) * 0.6;
      const active = Math.random() < 0.72;
      values.push(
        `($${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++})`
      );
      params.push(
        `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        pick(['Male', 'Female']),
        phone(),
        county.name,
        `${pick(PAYAMS)} Payam`,
        pick(BOMAS),
        rand(20, 65),
        Number((Math.random() * 9 + 0.5).toFixed(1)),
        crops,
        livestock,
        lat,
        lng,
        active ? 'active' : 'inactive',
        pick(officerIds)
      );
    }
    const r = await query<{ id: number }>(
      `INSERT INTO farmers(full_name,gender,phone,county,payam,boma,age,farm_size,crop_types,livestock_types,gps_lat,gps_lng,status,registered_by,created_at)
       VALUES ${values.map((v) => v.slice(0, -1) + `,now() - (random()*400 || ' days')::interval)`).join(',')}
       RETURNING id`,
      params
    );
    r.rows.forEach((row) => farmerIds.push(row.id));
  }

  // Market prices: 12 weeks of history per commodity + latest records per market
  console.log('[seed] inserting market prices ...');
  const basePrice: Record<string, number> = { Maize: 320, Sorghum: 280, Groundnuts: 750, Sesame: 980, Cassava: 210 };
  for (const commodity of MARKET_COMMODITIES) {
    let price = basePrice[commodity];
    for (let w = 12; w >= 0; w--) {
      const market = pick(COUNTIES);
      const prev = price;
      price = Math.max(50, price + rand(-25, 30));
      await query(
        'INSERT INTO market_prices(commodity,price,unit,market_location,county,prev_price,date_updated) VALUES($1,$2,$3,$4,$5,$6,$7)',
        [commodity, price, 'kg', `${market.name} Central Market`, market.name, prev, daysAgo(w * 7)]
      );
    }
  }

  // Advisories (50)
  console.log('[seed] inserting advisories ...');
  for (let i = 0; i < 50; i++) {
    const category = pick(ADVISORY_CATEGORIES);
    const title = pick(ADVISORY_TITLES[category]);
    await query(
      'INSERT INTO advisories(title,category,content,status,author_id,views,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [
        title,
        category,
        `${title}. This advisory provides smallholder farmers in South Sudan with practical, climate-smart guidance. Follow the recommended steps, consult your local CORWADO extension officer, and adapt practices to your county conditions.`,
        Math.random() < 0.85 ? 'published' : 'scheduled',
        pick(officerIds),
        rand(20, 2400),
        daysAgo(rand(1, 200)),
      ]
    );
  }

  // Pest alerts (20)
  console.log('[seed] inserting pest alerts ...');
  for (let i = 0; i < 20; i++) {
    const pest = pick(PESTS);
    const county = pick(COUNTIES).name;
    await query(
      'INSERT INTO pest_alerts(pest_name,crop,county,severity,description,status,date_reported,reported_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
      [
        pest,
        pick(CROPS),
        county,
        pick(SEVERITIES),
        `${pest} detected in ${county} County. Farmers are advised to scout fields, apply recommended controls and report new outbreaks to extension officers.`,
        Math.random() < 0.7 ? 'active' : 'resolved',
        daysAgo(rand(0, 60)),
        pick(officerIds),
      ]
    );
  }

  // Weather alerts
  for (let i = 0; i < 8; i++) {
    const type = pick(WEATHER_TYPES);
    const county = pick(COUNTIES).name;
    await query(
      'INSERT INTO weather_alerts(type,county,severity,message,valid_from,valid_to) VALUES($1,$2,$3,$4,$5,$6)',
      [
        type,
        county,
        pick(SEVERITIES),
        `${type}: expected in ${county} County. Take protective measures for crops, livestock and stored produce.`,
        daysAgo(rand(0, 2)),
        daysAgo(-rand(1, 5)),
      ]
    );
  }

  // Marketplace listings
  console.log('[seed] inserting marketplace listings ...');
  for (let i = 0; i < 40; i++) {
    const buyer = pick(buyerRows);
    await query(
      'INSERT INTO marketplace_listings(buyer_id,buyer_name,commodity,quantity,unit,price,delivery_location,contact_info,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [
        buyer.id,
        buyer.name,
        pick(MARKET_COMMODITIES),
        rand(500, 20000),
        'kg',
        rand(200, 1000),
        `${pick(COUNTIES).name} County`,
        phone(),
        Math.random() < 0.8 ? 'open' : 'closed',
        daysAgo(rand(0, 90)),
      ]
    );
  }

  // Farmer produce listings (with photos visible to buyers)
  console.log('[seed] inserting farmer produce listings ...');
  const demoFarmer = await query<{ id: number }>("SELECT id FROM users WHERE email='farmer@corwado.org'");
  const demoFarmerId = demoFarmer.rows[0]?.id || null;
  const PRODUCE_IMAGES: Record<string, string> = {
    Maize: '/produce/maize.jpg',
    Sorghum: '/produce/sorghum.jpg',
    Groundnuts: '/produce/groundnuts.jpg',
    Sesame: '/produce/sesame.jpg',
    Cassava: '/produce/cassava.jpg',
  };
  const PRODUCE_DESCS: Record<string, string> = {
    Maize: 'Freshly harvested, well-dried maize grain. Clean and ready for milling or storage.',
    Sorghum: 'Locally grown red sorghum, sun-dried and sorted. Good for flour and brewing.',
    Groundnuts: 'Quality groundnuts in shell, hand-sorted. Available in bulk bags.',
    Sesame: 'Premium white sesame seed, cleaned and graded for export-quality buyers.',
    Cassava: 'Fresh cassava tubers, recently harvested. Can supply dried chips on request.',
  };
  for (let i = 0; i < 24; i++) {
    const commodity = pick(MARKET_COMMODITIES);
    const county = pick(COUNTIES).name;
    await query(
      `INSERT INTO produce_listings(farmer_id,farmer_name,commodity,quantity,unit,price,county,location,contact_info,image_url,description,status,created_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        Math.random() < 0.25 ? demoFarmerId : null,
        `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        commodity,
        rand(100, 8000),
        'kg',
        rand(180, 950),
        county,
        `${pick(PAYAMS)} Payam, ${county} County`,
        phone(),
        PRODUCE_IMAGES[commodity],
        PRODUCE_DESCS[commodity],
        Math.random() < 0.85 ? 'available' : 'sold',
        daysAgo(rand(0, 60)),
      ]
    );
  }

  // Financial products
  for (const f of FIN_PRODUCTS) {
    await query(
      'INSERT INTO financial_products(name,type,provider,interest_rate,min_amount,max_amount,description) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [f.name, f.type, f.provider, f.interest_rate, f.min, f.max, f.description]
    );
  }

  // Messages (history)
  console.log('[seed] inserting messages ...');
  const groups = ['All Farmers', 'Wau County', 'Juba County', 'Maize Growers', 'Cooperative Leaders'];
  for (let i = 0; i < 60; i++) {
    const channel = pick(['sms', 'whatsapp']);
    await query(
      'INSERT INTO messages(channel,recipients_group,recipient_count,body,status,sent_at,sender_id,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$6)',
      [
        channel,
        pick(groups),
        rand(40, 1000),
        pick([
          'Heavy rains expected in Wau County from 28-30 May. Prepare drainage channels and protect stored produce.',
          'Maize price update: SSP 340/kg at Juba Central Market this week.',
          'Fall Armyworm alert in your area. Scout your maize and contact your extension officer.',
          'New advisory available: Conservation tillage for drought resilience.',
          'Reminder: Cooperative savings meeting this Friday at 10am.',
        ]),
        'sent',
        daysAgo(rand(0, 120)),
        pick(officerIds),
      ]
    );
  }

  // Training courses + enrollments
  console.log('[seed] inserting training courses ...');
  const courseIds: number[] = [];
  for (const c of COURSES) {
    const r = await query<{ id: number }>(
      'INSERT INTO training_courses(title,category,description,modules,duration,enrolled) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      [c.title, c.category, c.description, c.modules, c.duration, 0]
    );
    courseIds.push(r.rows[0].id);
  }
  for (let i = 0; i < 600; i++) {
    const courseId = pick(courseIds);
    const progress = rand(0, 100);
    const completed = progress >= 100;
    await query(
      'INSERT INTO training_enrollments(course_id,farmer_id,progress,completed,certificate_issued,created_at) VALUES($1,$2,$3,$4,$5,$6)',
      [courseId, pick(farmerIds), progress, completed, completed, daysAgo(rand(0, 180))]
    );
  }
  for (const id of courseIds) {
    await query('UPDATE training_courses SET enrolled=(SELECT count(*) FROM training_enrollments WHERE course_id=$1) WHERE id=$1', [id]);
  }

  // Activity log
  await query(
    `INSERT INTO activity_log(type,description,created_at)
     SELECT 'farmer', 'New farmer ' || full_name || ' registered in ' || county || ' County', created_at
     FROM farmers ORDER BY created_at DESC LIMIT 15`
  );

  console.log('[seed] done.');
}

if (require.main === module) {
  const force = process.argv.includes('--force');
  waitForDb()
    .then(() => seed(force))
    .then(() => pool.end())
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
