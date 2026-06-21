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
import financialRoutes from './routes/financial';
import messagingRoutes from './routes/messaging';
import trainingRoutes from './routes/training';
import reportsRoutes from './routes/reports';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '2mb' }));
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
app.use('/api/financial', financialRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/reports', reportsRoutes);

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
