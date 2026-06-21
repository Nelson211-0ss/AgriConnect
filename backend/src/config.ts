import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'corwado-agriconnect-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://agriconnect:agriconnect@localhost:5432/agriconnect',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  seedOnStart: (process.env.SEED_ON_START || 'true').toLowerCase() === 'true',
  /** Shared default password for all demo and admin-created accounts */
  defaultPassword: process.env.DEFAULT_PASSWORD || 'password123',
};
