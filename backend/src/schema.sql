-- CORWADO AgriConnect database schema

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('super_admin','extension_officer','farmer','buyer')),
  phone         TEXT,
  county        TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS counties (
  id    SERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL,
  lat   DOUBLE PRECISION,
  lng   DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS farmers (
  id              SERIAL PRIMARY KEY,
  full_name       TEXT NOT NULL,
  gender          TEXT,
  phone           TEXT,
  county          TEXT,
  payam           TEXT,
  boma            TEXT,
  age             INTEGER,
  farm_size       DOUBLE PRECISION,
  crop_types      TEXT[] DEFAULT '{}',
  livestock_types TEXT[] DEFAULT '{}',
  gps_lat         DOUBLE PRECISION,
  gps_lng         DOUBLE PRECISION,
  status          TEXT NOT NULL DEFAULT 'active',
  registered_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS advisories (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  content      TEXT NOT NULL,
  image_url    TEXT,
  status       TEXT NOT NULL DEFAULT 'published',
  scheduled_at TIMESTAMPTZ,
  author_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  views        INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_prices (
  id              SERIAL PRIMARY KEY,
  commodity       TEXT NOT NULL,
  price           NUMERIC(12,2) NOT NULL,
  unit            TEXT NOT NULL DEFAULT 'kg',
  market_location TEXT,
  county          TEXT,
  prev_price      NUMERIC(12,2),
  date_updated    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weather_alerts (
  id         SERIAL PRIMARY KEY,
  type       TEXT NOT NULL,
  county     TEXT,
  severity   TEXT NOT NULL DEFAULT 'moderate',
  message    TEXT NOT NULL,
  valid_from TIMESTAMPTZ,
  valid_to   TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pest_alerts (
  id            SERIAL PRIMARY KEY,
  pest_name     TEXT NOT NULL,
  crop          TEXT,
  county        TEXT,
  severity      TEXT NOT NULL DEFAULT 'moderate',
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  date_reported TIMESTAMPTZ NOT NULL DEFAULT now(),
  reported_by   INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id                SERIAL PRIMARY KEY,
  buyer_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  buyer_name        TEXT,
  commodity         TEXT NOT NULL,
  quantity          DOUBLE PRECISION,
  unit              TEXT DEFAULT 'kg',
  price             NUMERIC(12,2),
  delivery_location TEXT,
  contact_info      TEXT,
  status            TEXT NOT NULL DEFAULT 'open',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listing_interests (
  id         SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  farmer_id  INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  message    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_products (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,
  provider      TEXT,
  interest_rate NUMERIC(6,2),
  min_amount    NUMERIC(14,2),
  max_amount    NUMERIC(14,2),
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id               SERIAL PRIMARY KEY,
  channel          TEXT NOT NULL,
  recipients_group TEXT,
  recipient_count  INTEGER DEFAULT 0,
  body             TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'sent',
  scheduled_at     TIMESTAMPTZ,
  sent_at          TIMESTAMPTZ DEFAULT now(),
  sender_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_courses (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT,
  description TEXT,
  modules     INTEGER DEFAULT 1,
  duration    TEXT,
  enrolled    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_enrollments (
  id                 SERIAL PRIMARY KEY,
  course_id          INTEGER REFERENCES training_courses(id) ON DELETE CASCADE,
  farmer_id          INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  progress           INTEGER NOT NULL DEFAULT 0,
  completed          BOOLEAN NOT NULL DEFAULT false,
  certificate_issued BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id          SERIAL PRIMARY KEY,
  type        TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_farmers_county ON farmers(county);
CREATE INDEX IF NOT EXISTS idx_farmers_created ON farmers(created_at);
CREATE INDEX IF NOT EXISTS idx_pest_county ON pest_alerts(county);
CREATE INDEX IF NOT EXISTS idx_market_commodity ON market_prices(commodity);
