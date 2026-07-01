import { pool } from './db';

/** Incremental schema migrations — safe to run on every startup. */
export async function runMigrations() {
  await pool.query(`
    -- Expand user roles
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (
      'super_admin','extension_officer','digital_champion','farmer','buyer',
      'transporter','agro_dealer','financial_institution','government_officer',
      'research_institution','cooperative_manager','vsla_leader'
    ));

    -- Farmer digital profiling extensions
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS district TEXT;
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS village TEXT;
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS farm_ownership TEXT;
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS irrigation_methods TEXT[] DEFAULT '{}';
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS production_history JSONB DEFAULT '[]';
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS cooperative_member BOOLEAN DEFAULT false;
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS vsla_member BOOLEAN DEFAULT false;
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS digital_readiness TEXT DEFAULT 'medium';
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS preferred_comm_channel TEXT DEFAULT 'sms';
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE farmers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

    -- Advisory enhancements
    ALTER TABLE advisories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
    ALTER TABLE advisories ADD COLUMN IF NOT EXISTS pdf_url TEXT;
    ALTER TABLE advisories ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

    CREATE TABLE IF NOT EXISTS advisory_comments (
      id          SERIAL PRIMARY KEY,
      advisory_id INTEGER NOT NULL REFERENCES advisories(id) ON DELETE CASCADE,
      user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
      body        TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS advisory_likes (
      advisory_id INTEGER NOT NULL REFERENCES advisories(id) ON DELETE CASCADE,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (advisory_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS advisory_bookmarks (
      advisory_id INTEGER NOT NULL REFERENCES advisories(id) ON DELETE CASCADE,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (advisory_id, user_id)
    );

    -- Knowledge base
    CREATE TABLE IF NOT EXISTS kb_items (
      id          SERIAL PRIMARY KEY,
      type        TEXT NOT NULL CHECK (type IN ('faq','guide','video','audio','pdf')),
      title       TEXT NOT NULL,
      content     TEXT,
      category    TEXT,
      media_url   TEXT,
      pdf_url     TEXT,
      tags        TEXT[] DEFAULT '{}',
      views       INTEGER NOT NULL DEFAULT 0,
      status      TEXT NOT NULL DEFAULT 'published',
      author_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at  TIMESTAMPTZ
    );

    -- Cooperatives & VSLAs
    CREATE TABLE IF NOT EXISTS cooperatives (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      org_type      TEXT NOT NULL CHECK (org_type IN ('cooperative','vsla')),
      county        TEXT,
      payam         TEXT,
      village       TEXT,
      gps_lat       DOUBLE PRECISION,
      gps_lng       DOUBLE PRECISION,
      leader_name   TEXT,
      leader_phone  TEXT,
      member_count  INTEGER DEFAULT 0,
      description   TEXT,
      status        TEXT NOT NULL DEFAULT 'active',
      manager_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at    TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS cooperative_members (
      id              SERIAL PRIMARY KEY,
      cooperative_id  INTEGER NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
      farmer_id       INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
      member_name     TEXT,
      role            TEXT DEFAULT 'member',
      joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (cooperative_id, farmer_id)
    );

    CREATE TABLE IF NOT EXISTS cooperative_meetings (
      id              SERIAL PRIMARY KEY,
      cooperative_id  INTEGER NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
      title           TEXT NOT NULL,
      scheduled_at    TIMESTAMPTZ NOT NULL,
      location        TEXT,
      agenda          TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS cooperative_announcements (
      id              SERIAL PRIMARY KEY,
      cooperative_id  INTEGER NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
      title           TEXT NOT NULL,
      body            TEXT NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS cooperative_documents (
      id              SERIAL PRIMARY KEY,
      cooperative_id  INTEGER NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
      title           TEXT NOT NULL,
      file_url        TEXT,
      doc_type        TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS cooperative_loans (
      id              SERIAL PRIMARY KEY,
      cooperative_id  INTEGER NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
      member_name     TEXT,
      amount          NUMERIC(14,2) NOT NULL,
      purpose         TEXT,
      status          TEXT NOT NULL DEFAULT 'active',
      disbursed_at    TIMESTAMPTZ DEFAULT now(),
      due_at          TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS cooperative_savings (
      id              SERIAL PRIMARY KEY,
      cooperative_id  INTEGER NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
      member_name     TEXT,
      amount          NUMERIC(14,2) NOT NULL,
      transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit','withdrawal')),
      recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Buyer & supplier directory
    CREATE TABLE IF NOT EXISTS directory_entries (
      id              SERIAL PRIMARY KEY,
      entry_type      TEXT NOT NULL CHECK (entry_type IN (
        'buyer','processor','exporter','agro_dealer','input_supplier','transporter',
        'bank','microfinance','sacco','insurance'
      )),
      company_name    TEXT NOT NULL,
      contact_person  TEXT,
      email           TEXT,
      phone           TEXT,
      county          TEXT,
      location        TEXT,
      gps_lat         DOUBLE PRECISION,
      gps_lng         DOUBLE PRECISION,
      products        TEXT[] DEFAULT '{}',
      services        TEXT[] DEFAULT '{}',
      description     TEXT,
      rating          NUMERIC(3,2) DEFAULT 0,
      review_count    INTEGER DEFAULT 0,
      verified        BOOLEAN DEFAULT false,
      status          TEXT NOT NULL DEFAULT 'active',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at      TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS directory_reviews (
      id          SERIAL PRIMARY KEY,
      entry_id    INTEGER NOT NULL REFERENCES directory_entries(id) ON DELETE CASCADE,
      user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
      rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment     TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Market intelligence extensions
    CREATE TABLE IF NOT EXISTS market_demand (
      id          SERIAL PRIMARY KEY,
      commodity   TEXT NOT NULL,
      buyer_name  TEXT,
      quantity    DOUBLE PRECISION,
      unit        TEXT DEFAULT 'kg',
      county      TEXT,
      quality     TEXT,
      deadline    TIMESTAMPTZ,
      status      TEXT NOT NULL DEFAULT 'open',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS aggregation_schedules (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      location    TEXT,
      county      TEXT,
      commodity   TEXT,
      scheduled_at TIMESTAMPTZ NOT NULL,
      contact     TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS quality_standards (
      id          SERIAL PRIMARY KEY,
      commodity   TEXT NOT NULL,
      grade       TEXT,
      requirements TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Audit log enhancements
    ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS action TEXT;
    ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS entity_type TEXT;
    ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS entity_id INTEGER;
    ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS ip_address TEXT;

    CREATE TABLE IF NOT EXISTS login_attempts (
      id          SERIAL PRIMARY KEY,
      email       TEXT,
      success     BOOLEAN NOT NULL,
      ip_address  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Channel integration tables
    CREATE TABLE IF NOT EXISTS ussd_sessions (
      id          SERIAL PRIMARY KEY,
      session_id  TEXT NOT NULL,
      phone       TEXT NOT NULL,
      menu_path   TEXT,
      payload     JSONB DEFAULT '{}',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id          SERIAL PRIMARY KEY,
      direction   TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
      phone       TEXT NOT NULL,
      body        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'received',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS ivr_calls (
      id          SERIAL PRIMARY KEY,
      phone       TEXT NOT NULL,
      language    TEXT DEFAULT 'en',
      menu_path   TEXT,
      duration_sec INTEGER,
      status      TEXT NOT NULL DEFAULT 'completed',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- CMS content
    CREATE TABLE IF NOT EXISTS cms_content (
      id          SERIAL PRIMARY KEY,
      content_type TEXT NOT NULL CHECK (content_type IN ('article','video','audio','document','news','event','announcement')),
      title       TEXT NOT NULL,
      body        TEXT,
      category    TEXT,
      tags        TEXT[] DEFAULT '{}',
      media_url   TEXT,
      status      TEXT NOT NULL DEFAULT 'draft',
      scheduled_at TIMESTAMPTZ,
      author_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at  TIMESTAMPTZ
    );

    -- Financial product extensions
    ALTER TABLE financial_products ADD COLUMN IF NOT EXISTS application_url TEXT;
    ALTER TABLE financial_products ADD COLUMN IF NOT EXISTS literacy_resource TEXT;

    CREATE INDEX IF NOT EXISTS idx_farmers_deleted ON farmers(deleted_at) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_kb_type ON kb_items(type);
    CREATE INDEX IF NOT EXISTS idx_directory_type ON directory_entries(entry_type);
    CREATE INDEX IF NOT EXISTS idx_cooperatives_type ON cooperatives(org_type);
    CREATE INDEX IF NOT EXISTS idx_cms_type ON cms_content(content_type);
  `);
  console.log('[migrations] schema extensions applied');
}
