import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { waitForDb } from './db';
import { seed } from './seed';

import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import farmersRoutes from './routes/farmers';
import usersRoutes from './routes/users';
import advisoriesRoutes from './routes/advisories';
import marketRoutes from './routes/market';
import weatherRoutes from './routes/weather';
import pestRoutes from './routes/pests';
import marketplaceRoutes from './routes/marketplace';
import produceRoutes from './routes/produce';
import financialRoutes from './routes/financial';
import messagingRoutes from './routes/messaging';
import notificationsRoutes from './routes/notifications';
import trainingRoutes from './routes/training';
import reportsRoutes from './routes/reports';
import cooperativesRoutes from './routes/cooperatives';
import knowledgeRoutes from './routes/knowledge';
import directoryRoutes from './routes/directory';
import searchRoutes from './routes/search';
import auditRoutes from './routes/audit';
import ussdRoutes from './routes/ussd';
import whatsappRoutes from './routes/whatsapp';
import ivrRoutes from './routes/ivr';
import cmsRoutes from './routes/cms';
import marketIntelRoutes from './routes/marketIntel';

const app = express();

// The platform is served over plain HTTP (local/Docker/pilot). Disable the
// HTTPS-forcing protections so browsers don't upgrade requests to https://
// (which would have nothing listening and fail with "Failed to fetch").
app.use(
  helmet({
    hsts: false,
    contentSecurityPolicy: false,
  })
);
// Actively clear any HSTS policy a browser may have cached from earlier responses.
app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=0');
  next();
});
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '8mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'agriconnect-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/farmers', farmersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/advisories', advisoriesRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/pests', pestRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/cooperatives', cooperativesRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ussd', ussdRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/market-intel', marketIntelRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

async function start() {
  await waitForDb();
  if (config.seedOnStart) {
    try {
      await seed(false);
    } catch (e) {
      console.error('[seed] failed', e);
    }
  }
  app.listen(config.port, () => {
    console.log(`[api] CORWADO AgriConnect API listening on port ${config.port}`);
  });
}

start();
